import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { decodeHTML } from 'entities';

const text = value => decodeHTML(String(value?.['#text'] ?? value ?? '').replace(/<[^>]*>/g, '')).replace(/<[^>]*>/g, '').trim();
const httpsUrl = value => {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
};

export function parsePublisherFeed(xml, source, category = 'Indian Markets') {
  if (XMLValidator.validate(xml) !== true) return [];
  const parsed = new XMLParser({ ignoreAttributes: false, processEntities: true, trimValues: true }).parse(xml);
  const items = parsed?.rss?.channel?.item;
  return (Array.isArray(items) ? items : items ? [items] : []).flatMap(item => {
    const title = text(item.title);
    const url = httpsUrl(text(item.link));
    const date = Date.parse(text(item.pubDate));
    if (!title || !url || !Number.isFinite(date)) return [];
    const media = item['media:content'] || item['media:thumbnail'];
    const image = httpsUrl((Array.isArray(media) ? media[0] : media)?.['@_url'] ||
      (String(item.enclosure?.['@_type'] || '').startsWith('image/') ? item.enclosure?.['@_url'] : ''));
    return [{ title, summary: text(item.description) || title, url, image, source, category,
      publishedAt: new Date(date).toISOString(), provider: 'publisher_rss' }];
  });
}

export async function handleNewsRequest(request, fetcher = fetch) {
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET' } });
  const url = new URL(request.url);
  const global = url.pathname.endsWith('/global');
  const category = global ? 'Global Markets' : 'Indian Markets';
  const feeds = global ? [
    ['CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html'],
    ['BBC Business', 'https://feeds.bbci.co.uk/news/business/rss.xml'],
  ] : [
    ['BusinessLine', 'https://www.thehindubusinessline.com/markets/feeder/default.rss'],
    ['Livemint', 'https://www.livemint.com/rss/markets'],
    ['Economic Times', 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms'],
  ];
  const results = await Promise.allSettled(feeds.map(async ([source, feedUrl]) => {
    const response = await fetcher(feedUrl, { signal: AbortSignal.timeout(4000), headers: {
      Accept: 'application/rss+xml, application/xml, text/xml', 'User-Agent': 'AVC-Dhanam/1.0',
    } });
    if (!response.ok) throw new Error('Publisher feed unavailable');
    return parsePublisherFeed(await response.text(), source, category);
  }));
  const seen = new Set();
  const limit = Math.max(1, Math.min(30, Number.parseInt(url.searchParams.get('limit'), 10) || 12));
  const articles = results.flatMap(result => result.status === 'fulfilled' ? result.value : [])
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter(article => { if (seen.has(article.url)) return false; seen.add(article.url); return true; })
    .slice(0, limit);
  if (!articles.length) return Response.json({ error: 'News publishers are temporarily unavailable.' }, {
    status: 502, headers: { 'Cache-Control': 'no-store' },
  });
  const payload = url.pathname.endsWith('/live') || url.pathname.endsWith('.php') ? { data: articles } : articles;
  return Response.json(payload, { headers: {
    'Cache-Control': 'public, max-age=60', 'Netlify-CDN-Cache-Control': 'public, s-maxage=300',
  } });
}
