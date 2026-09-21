import axios from 'axios';
import cron from 'node-cron';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { invalidateNewsCache } from './newsApi.js';

// Noozra is listed in public-apis/public-apis as a keyless HTTPS news API.
const DEFAULT_FEEDS = ['https://noozra.com/api/articles?category=business'];
const MARKETAUX_ENDPOINT = 'https://api.marketaux.com/v1/news/all';
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const normaliseUrl = (value) => {
  try {
    const url = new URL(value);
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => url.searchParams.delete(key));
    return url.toString().replace(/\/$/, '');
  } catch { return ''; }
};
const normaliseText = (value = '') => value.replace(/\s+/g, ' ').trim().toLowerCase();

const classifyWithoutAi = (text) => {
  const input = text.toLowerCase();
  if (/tech|ai |software|chip|digital/.test(input)) return 'Technology';
  if (/economy|gdp|inflation|employment|trade/.test(input)) return 'Economy';
  if (/bank|rbi|finance|loan|interest rate/.test(input)) return 'Finance';
  return 'Markets';
};

const enrichArticle = async (article) => {
  const fallback = {
    title: article.title.trim(),
    summary: (article.description || article.content || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    category: article.feedCategory || classifyWithoutAi(`${article.title} ${article.description || ''}`),
    tags: []
  };
  if (!process.env.GEMINI_API_KEY) return fallback;
  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    const prompt = `Return JSON only with title, summary, category, tags. Rewrite only from this source material; do not add facts. Title max 110 characters, summary max 300 characters, category must be Markets, Technology, Finance, or Economy, tags max 4.\nTITLE: ${article.title}\nDESCRIPTION: ${article.description || ''}\nCONTENT: ${(article.content || '').slice(0, 3000)}`;
    const response = await model.generateContent(prompt);
    const raw = response.response.text().replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(raw);
    return { ...fallback, title: typeof parsed.title === 'string' ? parsed.title.slice(0, 110) : fallback.title, summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 300) : fallback.summary, category: ['Markets', 'Technology', 'Finance', 'Economy'].includes(parsed.category) ? parsed.category : fallback.category, tags: Array.isArray(parsed.tags) ? parsed.tags.filter(tag => typeof tag === 'string').slice(0, 4) : [] };
  } catch (error) {
    console.warn('Gemini enrichment skipped:', error.message);
    return fallback;
  }
};

const configuredFeeds = () => {
  const marketAuxKey = process.env.MARKETAUX_API_KEY?.trim();
  if (marketAuxKey) {
    const params = new URLSearchParams({
      api_token: marketAuxKey,
      language: 'en',
      limit: '30',
      entity_types: 'equity,index,etf,currency,cryptocurrency',
      must_have_entities: 'true'
    });
    return [{ url: `${MARKETAUX_ENDPOINT}?${params.toString()}`, category: 'Markets', provider: 'marketaux' }];
  }
  const namedFeeds = [
    ['NEWS_API_BUSINESS_IN', 'Markets'], ['NEWS_API_BUSINESS_US', 'Markets']
  ].map(([key, category]) => ({ url: process.env[key]?.trim(), category })).filter(feed => feed.url);
  const generalFeeds = (process.env.NEWS_API_URLS || '').split(',').map(url => url.trim()).filter(Boolean).map(url => ({ url, category: '' }));
  const feeds = [...namedFeeds, ...generalFeeds];
  return feeds.length ? [...new Map(feeds.map(feed => [feed.url, feed])).values()] : DEFAULT_FEEDS.map(url => ({ url, category: 'Finance', provider: 'noozra' }));
};
const extractArticles = (payload) => Array.isArray(payload) ? payload : (payload?.articles || payload?.results || payload?.data?.articles || payload?.data || []);

export const syncNews = async (db) => {
  const metrics = { fetched: 0, inserted: 0, duplicates: 0, failed: 0 };
  try {
    let feeds = configuredFeeds();
    let results = await Promise.allSettled(feeds.map(feed => axios.get(feed.url, { timeout: 15000 })));
    const receivedArticles = results.some(result => result.status === 'fulfilled' && extractArticles(result.value.data).length > 0);
    if (feeds[0]?.provider === 'marketaux' && !receivedArticles) {
      feeds = DEFAULT_FEEDS.map(url => ({ url, category: 'Finance', provider: 'noozra' }));
      results = await Promise.allSettled(feeds.map(feed => axios.get(feed.url, { timeout: 15000 })));
      db.prepare('INSERT INTO api_sync_logs (provider, status, message) VALUES (?, ?, ?)').run('marketaux', 'fallback', 'No valid market news returned; switched to Noozra.');
    }
    const articles = results.flatMap((result, index) => result.status === 'fulfilled' ? extractArticles(result.value.data).map(article => ({ ...article, feedCategory: feeds[index].category, title: article.title || article.headline || '', description: article.description || article.summary || article.excerpt || '', provider: feeds[index].provider || 'configured_feed' })) : []);
    metrics.fetched = articles.length;
    metrics.failed += results.filter(result => result.status === 'rejected').length;
    const insert = db.prepare(`INSERT OR IGNORE INTO news (original_title, title, summary, category, tags, source, source_url, image_url, published_at, url_hash, title_hash, image_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const article of articles) {
        const url = normaliseUrl(article.url || article.link || '');
        const originalTitle = (article.title || '').trim();
        if (!url || !originalTitle) { metrics.failed++; continue; }
        const urlHash = hash(url);
        const titleHash = hash(normaliseText(originalTitle));
        const image = normaliseUrl(article.urlToImage || article.image || article.image_url || '');
        const imageHash = image ? hash(image) : null;
        const exists = db.prepare('SELECT id FROM news WHERE url_hash = ? OR title_hash = ? OR (? IS NOT NULL AND image_hash = ?)').get(urlHash, titleHash, imageHash, imageHash);
        if (exists) { metrics.duplicates++; continue; }
        const enriched = await enrichArticle(article);
        const result = insert.run(originalTitle, enriched.title, enriched.summary, enriched.category, JSON.stringify(enriched.tags), article.source?.name || article.source || article.news_site || 'News source', url, image || null, article.publishedAt || article.published_at || null, urlHash, titleHash, imageHash);
        metrics.inserted += result.changes;
    }
    if (metrics.inserted) invalidateNewsCache(db);
    db.prepare('INSERT INTO api_sync_logs (provider, status, message) VALUES (?, ?, ?)').run(feeds[0]?.provider || 'news_scheduler', 'success', JSON.stringify(metrics));
  } catch (error) {
    db.prepare('INSERT INTO api_sync_logs (provider, status, message) VALUES (?, ?, ?)').run('news_scheduler', 'error', error.message);
    console.error('News sync failed:', error);
  }
  console.log('News sync:', metrics);
  return metrics;
};

export const startNewsScheduler = (db) => {
  syncNews(db);
  // MarketAux free accounts allow 100 requests per day. The default is 12/day.
  const schedule = process.env.MARKET_NEWS_SYNC_CRON || '0 */2 * * *';
  cron.schedule(schedule, () => syncNews(db));
  console.log(`News scheduler started (${schedule}).`);
};
