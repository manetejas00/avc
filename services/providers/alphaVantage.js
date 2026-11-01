import axios from 'axios';
import { envConfig } from '../config/env.js';
import { rateLimiter } from '../core/rateLimiter.js';
import { normalizeQuote, normalizeCandle, normalizeTechnicals, normalizeFundamentals } from '../core/normalizer.js';

const BASE_URL = 'https://www.alphavantage.co/query';

export class AlphaVantageProvider {
  constructor() {
    this.name = 'alpha_vantage';
  }

  isAvailable() {
    return envConfig.alphaVantage.isConfigured;
  }

  /**
   * Fetch global quote
   */
  async getQuote(symbol) {
    if (!this.isAvailable()) return null;
    if (!rateLimiter.canExecute(this.name, envConfig.alphaVantage.rateLimitPerMinute)) {
      console.warn('[AlphaVantage] Rate limit reached. Skipping request.');
      return null;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: envConfig.alphaVantage.apiKey
        },
        timeout: 7000
      });

      const quote = response.data?.['Global Quote'];
      if (!quote || !quote['05. price']) return null;

      return normalizeQuote({
        symbol: quote['01. symbol'] || symbol,
        name: quote['01. symbol'] || symbol,
        price: quote['05. price'],
        change: quote['09. change'],
        changePercent: (quote['10. change percent'] || '').replace('%', ''),
        open: quote['02. open'],
        high: quote['03. high'],
        low: quote['04. low'],
        previousClose: quote['08. previous close'],
        volume: quote['06. volume'],
        currency: 'USD',
        provider: this.name,
        timestamp: quote['07. latest trading day'] || new Date().toISOString()
      });
    } catch (err) {
      console.warn(`[AlphaVantage] getQuote error for ${symbol}:`, err.message);
      return null;
    }
  }

  /**
   * Fetch daily historical price series
   */
  async getDailyHistory(symbol) {
    if (!this.isAvailable()) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.alphaVantage.rateLimitPerMinute)) {
      return [];
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol.toUpperCase(),
          outputsize: 'compact',
          apikey: envConfig.alphaVantage.apiKey
        },
        timeout: 8000
      });

      const series = response.data?.['Time Series (Daily)'];
      if (!series) return [];

      return Object.entries(series)
        .slice(0, 30)
        .map(([date, values]) => normalizeCandle({
          timestamp: date,
          open: values['1. open'],
          high: values['2. high'],
          low: values['3. low'],
          close: values['4. close'],
          volume: values['5. volume']
        }))
        .reverse();
    } catch (err) {
      console.warn(`[AlphaVantage] getDailyHistory error for ${symbol}:`, err.message);
      return [];
    }
  }

  /**
   * Fetch RSI technical indicator
   */
  async getRSI(symbol, timePeriod = 14) {
    if (!this.isAvailable()) return null;
    if (!rateLimiter.canExecute(this.name, envConfig.alphaVantage.rateLimitPerMinute)) {
      return null;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'RSI',
          symbol: symbol.toUpperCase(),
          interval: 'daily',
          time_period: timePeriod,
          series_type: 'close',
          apikey: envConfig.alphaVantage.apiKey
        },
        timeout: 7000
      });

      const data = response.data?.['Technical Analysis: RSI'];
      if (!data) return null;

      const dates = Object.keys(data);
      if (!dates.length) return null;

      const latestDate = dates[0];
      return normalizeTechnicals({
        symbol,
        rsi: data[latestDate]?.RSI,
        provider: this.name,
        timestamp: latestDate
      });
    } catch (err) {
      console.warn(`[AlphaVantage] getRSI error for ${symbol}:`, err.message);
      return null;
    }
  }

  /**
   * Fetch company fundamental overview
   */
  async getCompanyOverview(symbol) {
    if (!this.isAvailable()) return null;
    if (!rateLimiter.canExecute(this.name, envConfig.alphaVantage.rateLimitPerMinute)) {
      return null;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol.toUpperCase(),
          apikey: envConfig.alphaVantage.apiKey
        },
        timeout: 7000
      });

      const data = response.data;
      if (!data || !data.Symbol) return null;

      return normalizeFundamentals({
        symbol: data.Symbol,
        name: data.Name,
        description: data.Description,
        sector: data.Sector,
        industry: data.Industry,
        marketCap: data.MarketCapitalization,
        peRatio: data.PERatio,
        pbRatio: data.PriceToBookRatio,
        eps: data.EPS,
        dividendYield: data.DividendYield,
        fiftyTwoWeekHigh: data['52WeekHigh'],
        fiftyTwoWeekLow: data['52WeekLow'],
        provider: this.name
      });
    } catch (err) {
      console.warn(`[AlphaVantage] getCompanyOverview error for ${symbol}:`, err.message);
      return null;
    }
  }
}

export const alphaVantageProvider = new AlphaVantageProvider();
