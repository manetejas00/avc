import axios from 'axios';
import { envConfig } from '../config/env.js';
import { normalizeNewsArticle } from '../core/normalizer.js';

/**
 * GNews Optional Provider
 * Requires GNEWS_API_KEY. When configured, queries https://gnews.io/api/v4/
 */
export class GNewsProvider {
  constructor() {
    this.name = 'gnews';
  }

  isAvailable() {
    return Boolean(envConfig.gnews.apiKey);
  }

  async getFinancialNews(query = 'Indian Stock Market', max = 10) {
    if (!this.isAvailable()) {
      return { available: false, error: 'GNEWS_API_KEY is not configured', articles: [] };
    }

    try {
      const response = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: query,
          lang: 'en',
          max,
          apikey: envConfig.gnews.apiKey
        },
        timeout: 6000
      });

      const articles = response.data?.articles;
      if (!Array.isArray(articles)) return { available: true, articles: [] };

      return {
        available: true,
        articles: articles.map(item => normalizeNewsArticle({
          title: item.title,
          summary: item.description,
          url: item.url,
          image: item.image,
          source: item.source?.name || 'GNews',
          category: 'Markets',
          publishedAt: item.publishedAt,
          provider: this.name
        }))
      };
    } catch (err) {
      return { available: true, error: err.message, articles: [] };
    }
  }
}

/**
 * Tej Bazaar Optional Provider
 * Integration adapter for https://github.com/tejhq/tej-bazaar (Indian financial market data microservice).
 */
export class TejBazaarProvider {
  constructor() {
    this.name = 'tej_bazaar';
    this.baseUrl = process.env.TEJ_BAZAAR_URL || 'http://localhost:8080';
  }

  isAvailable() {
    return Boolean(process.env.TEJ_BAZAAR_URL);
  }

  async getHealth() {
    if (!this.isAvailable()) {
      return { available: false, status: 'unconfigured', message: 'TEJ_BAZAAR_URL environment variable is not configured.' };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 3000 });
      return { available: true, status: 'healthy', data: response.data };
    } catch (err) {
      return { available: false, status: 'unreachable', error: err.message };
    }
  }
}

export const gnewsProvider = new GNewsProvider();
export const tejBazaarProvider = new TejBazaarProvider();
