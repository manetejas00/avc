import axios from 'axios';
import { envConfig } from '../config/env.js';
import { rateLimiter } from '../core/rateLimiter.js';
import { normalizeQuote, normalizeFundamentals, normalizeNewsArticle } from '../core/normalizer.js';

const BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubProvider {
  constructor() {
    this.name = 'finnhub';
  }

  isAvailable() {
    return envConfig.finnhub.isConfigured;
  }

  /**
   * Fetch real-time stock quote
   */
  async getQuote(symbol) {
    if (!this.isAvailable()) return null;
    if (!rateLimiter.canExecute(this.name, envConfig.finnhub.rateLimitPerMinute)) {
      console.warn('[Finnhub] Rate limit reached. Skipping request.');
      return null;
    }

    try {
      const response = await axios.get(`${BASE_URL}/quote`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: envConfig.finnhub.apiKey
        },
        timeout: 6000
      });

      const data = response.data;
      if (!data || typeof data.c !== 'number' || data.c === 0) {
        return null;
      }

      return normalizeQuote({
        symbol,
        name: symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        open: data.o,
        high: data.h,
        low: data.l,
        previousClose: data.pc,
        currency: 'USD',
        exchange: 'Finnhub',
        provider: this.name,
        timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString()
      });
    } catch (err) {
      console.warn(`[Finnhub] getQuote error for ${symbol}:`, err.message);
      return null;
    }
  }

  /**
   * Fetch company profile (fundamentals & overview)
   */
  async getCompanyProfile(symbol) {
    if (!this.isAvailable()) return null;
    if (!rateLimiter.canExecute(this.name, envConfig.finnhub.rateLimitPerMinute)) {
      return null;
    }

    try {
      const response = await axios.get(`${BASE_URL}/stock/profile2`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: envConfig.finnhub.apiKey
        },
        timeout: 6000
      });

      const data = response.data;
      if (!data || !data.name) return null;

      return normalizeFundamentals({
        symbol: data.ticker || symbol,
        name: data.name,
        description: `${data.name} is a leading company in the ${data.finnhubIndustry || 'business'} sector listed on ${data.exchange || 'markets'}.`,
        sector: data.finnhubIndustry,
        industry: data.finnhubIndustry,
        marketCap: data.marketCapitalization ? data.marketCapitalization * 1000000 : null,
        website: data.weburl,
        provider: this.name
      });
    } catch (err) {
      console.warn(`[Finnhub] getCompanyProfile error for ${symbol}:`, err.message);
      return null;
    }
  }

  /**
   * Fetch company-related news
   */
  async getCompanyNews(symbol, days = 7) {
    if (!this.isAvailable()) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.finnhub.rateLimitPerMinute)) {
      return [];
    }

    try {
      const to = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

      const response = await axios.get(`${BASE_URL}/company-news`, {
        params: {
          symbol: symbol.toUpperCase(),
          from,
          to,
          token: envConfig.finnhub.apiKey
        },
        timeout: 6000
      });

      const items = response.data;
      if (!Array.isArray(items)) return [];

      return items.slice(0, 15).map(item => normalizeNewsArticle({
        id: item.id ? String(item.id) : undefined,
        title: item.headline,
        summary: item.summary,
        url: item.url,
        image: item.image,
        source: item.source || 'Finnhub News',
        category: item.category || 'Company News',
        publishedAt: item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString(),
        provider: this.name
      }));
    } catch (err) {
      console.warn(`[Finnhub] getCompanyNews error for ${symbol}:`, err.message);
      return [];
    }
  }

  /**
   * Fetch general market financial news
   */
  async getMarketNews(category = 'general') {
    if (!this.isAvailable()) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.finnhub.rateLimitPerMinute)) {
      return [];
    }

    try {
      const response = await axios.get(`${BASE_URL}/news`, {
        params: {
          category,
          token: envConfig.finnhub.apiKey
        },
        timeout: 6000
      });

      const items = response.data;
      if (!Array.isArray(items)) return [];

      return items.slice(0, 20).map(item => normalizeNewsArticle({
        id: item.id ? String(item.id) : undefined,
        title: item.headline,
        summary: item.summary,
        url: item.url,
        image: item.image,
        source: item.source || 'Finnhub Market Pulse',
        category: item.category || 'Global Markets',
        publishedAt: item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString(),
        provider: this.name
      }));
    } catch (err) {
      console.warn('[Finnhub] getMarketNews error:', err.message);
      return [];
    }
  }

  /**
   * Symbol search
   */
  async search(query) {
    if (!this.isAvailable() || !query) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.finnhub.rateLimitPerMinute)) {
      return [];
    }

    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          q: query,
          token: envConfig.finnhub.apiKey
        },
        timeout: 6000
      });

      const results = response.data?.result;
      if (!Array.isArray(results)) return [];

      return results.map(r => ({
        symbol: r.symbol,
        name: r.description || r.symbol,
        type: r.type,
        provider: this.name
      }));
    } catch (err) {
      console.warn(`[Finnhub] search error for ${query}:`, err.message);
      return [];
    }
  }
}

export const finnhubProvider = new FinnhubProvider();
