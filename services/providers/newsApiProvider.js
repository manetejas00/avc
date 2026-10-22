import axios from 'axios';
import { envConfig } from '../config/env.js';
import { rateLimiter } from '../core/rateLimiter.js';
import { normalizeNewsArticle } from '../core/normalizer.js';

const BASE_URL = 'https://newsapi.org/v2';

export class NewsApiProvider {
  constructor() {
    this.name = 'news_api';
    // Explicit primary / secondary strategy:
    // Primary key is the default authorized credential.
    // Secondary key is registered for secondary environments or explicit authorized delegation.
    this.primaryKey = envConfig.newsApi.primaryKey;
    this.secondaryKey = envConfig.newsApi.secondaryKey;
    this.activeKey = this.primaryKey || this.secondaryKey;
  }

  isAvailable() {
    return Boolean(this.activeKey);
  }

  /**
   * Fetch Indian financial and business news
   */
  async getIndianFinancialNews(pageSize = 15) {
    if (!this.isAvailable()) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.newsApi.rateLimitPerHour, 3600000)) {
      console.warn('[NewsAPI] Hourly rate limit reached for NewsAPI. Skipping.');
      return [];
    }

    try {
      // NewsAPI everything endpoint with focused Indian equity queries
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: 'Indian stock market OR Sensex OR NIFTY OR RBI OR SEBI',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize,
          apiKey: this.activeKey
        },
        timeout: 6000
      });

      const articles = response.data?.articles;
      if (!Array.isArray(articles)) return [];

      return articles.filter(a => a.title && a.title !== '[Removed]').map(item => normalizeNewsArticle({
        title: item.title,
        summary: item.description || item.title,
        url: item.url,
        image: item.urlToImage,
        source: item.source?.name || 'NewsAPI India',
        category: 'Indian Markets',
        publishedAt: item.publishedAt,
        provider: this.name
      }));
    } catch (err) {
      console.warn('[NewsAPI] getIndianFinancialNews error:', err.response?.data?.message || err.message);
      return [];
    }
  }

  /**
   * Fetch global economy and stock market news
   */
  async getGlobalFinancialNews(pageSize = 15) {
    if (!this.isAvailable()) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.newsApi.rateLimitPerHour, 3600000)) {
      return [];
    }

    try {
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: 'Wall Street OR Federal Reserve OR Global Economy OR Inflation OR Stock Market',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize,
          apiKey: this.activeKey
        },
        timeout: 6000
      });

      const articles = response.data?.articles;
      if (!Array.isArray(articles)) return [];

      return articles.filter(a => a.title && a.title !== '[Removed]').map(item => normalizeNewsArticle({
        title: item.title,
        summary: item.description || item.title,
        url: item.url,
        image: item.urlToImage,
        source: item.source?.name || 'Global Finance',
        category: 'Global Markets',
        publishedAt: item.publishedAt,
        provider: this.name
      }));
    } catch (err) {
      console.warn('[NewsAPI] getGlobalFinancialNews error:', err.response?.data?.message || err.message);
      return [];
    }
  }

  /**
   * Search news for a specific stock or query
   */
  async searchNews(query, pageSize = 10) {
    if (!this.isAvailable() || !query) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.newsApi.rateLimitPerHour, 3600000)) {
      return [];
    }

    try {
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'relevancy',
          pageSize,
          apiKey: this.activeKey
        },
        timeout: 6000
      });

      const articles = response.data?.articles;
      if (!Array.isArray(articles)) return [];

      return articles.filter(a => a.title && a.title !== '[Removed]').map(item => normalizeNewsArticle({
        title: item.title,
        summary: item.description || item.title,
        url: item.url,
        image: item.urlToImage,
        source: item.source?.name || 'Market News',
        category: 'Company Intelligence',
        publishedAt: item.publishedAt,
        provider: this.name
      }));
    } catch (err) {
      console.warn(`[NewsAPI] searchNews error for ${query}:`, err.response?.data?.message || err.message);
      return [];
    }
  }
}

export const newsApiProvider = new NewsApiProvider();
