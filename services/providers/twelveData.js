import axios from 'axios';
import { envConfig } from '../config/env.js';
import { rateLimiter } from '../core/rateLimiter.js';
import { normalizeQuote, normalizeCandle, normalizeTechnicals } from '../core/normalizer.js';

const BASE_URL = 'https://api.twelvedata.com';

export class TwelveDataProvider {
  constructor() {
    this.name = 'twelve_data';
  }

  isAvailable() {
    return envConfig.twelveData.isConfigured;
  }

  /**
   * Fetch quote for a symbol or currency pair
   */
  async getQuote(symbol) {
    if (!this.isAvailable()) return null;
    if (!rateLimiter.canExecute(this.name, envConfig.twelveData.rateLimitPerMinute)) {
      console.warn('[TwelveData] Rate limit reached. Skipping request.');
      return null;
    }

    try {
      const formattedSymbol = symbol.includes('/') ? symbol : symbol.toUpperCase();
      const response = await axios.get(`${BASE_URL}/quote`, {
        params: {
          symbol: formattedSymbol,
          apikey: envConfig.twelveData.apiKey
        },
        timeout: 6000
      });

      const data = response.data;
      if (!data || data.status === 'error' || data.code) {
        return null;
      }

      return normalizeQuote({
        symbol: data.symbol || symbol,
        name: data.name || data.symbol || symbol,
        price: data.close || data.price,
        change: data.change,
        changePercent: data.percent_change,
        open: data.open,
        high: data.high,
        low: data.low,
        previousClose: data.previous_close,
        volume: data.volume,
        currency: data.currency || 'USD',
        exchange: data.exchange || 'TwelveData',
        provider: this.name,
        timestamp: data.datetime || new Date().toISOString()
      });
    } catch (err) {
      console.warn(`[TwelveData] getQuote error for ${symbol}:`, err.message);
      return null;
    }
  }

  /**
   * Fetch historical candles / OHLC time series
   */
  async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
    if (!this.isAvailable()) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.twelveData.rateLimitPerMinute)) {
      return [];
    }

    try {
      const response = await axios.get(`${BASE_URL}/time_series`, {
        params: {
          symbol,
          interval,
          outputsize,
          apikey: envConfig.twelveData.apiKey
        },
        timeout: 7000
      });

      const values = response.data?.values;
      if (!Array.isArray(values)) return [];

      return values.map(item => normalizeCandle({
        timestamp: item.datetime,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      })).reverse(); // chronological order
    } catch (err) {
      console.warn(`[TwelveData] getTimeSeries error for ${symbol}:`, err.message);
      return [];
    }
  }

  /**
   * Fetch technical indicator (RSI, MACD, etc.)
   */
  async getIndicator(symbol, indicator = 'rsi', timePeriod = 14) {
    if (!this.isAvailable()) return null;
    if (!rateLimiter.canExecute(this.name, envConfig.twelveData.rateLimitPerMinute)) {
      return null;
    }

    try {
      const response = await axios.get(`${BASE_URL}/${indicator}`, {
        params: {
          symbol,
          interval: '1day',
          time_period: timePeriod,
          outputsize: 5,
          apikey: envConfig.twelveData.apiKey
        },
        timeout: 6000
      });

      const values = response.data?.values;
      if (!Array.isArray(values) || !values.length) return null;

      const latest = values[0];
      return normalizeTechnicals({
        symbol,
        rsi: latest.rsi,
        provider: this.name,
        timestamp: latest.datetime
      });
    } catch (err) {
      console.warn(`[TwelveData] getIndicator error for ${symbol}:`, err.message);
      return null;
    }
  }

  /**
   * Search stock symbols across global markets
   */
  async search(query) {
    if (!this.isAvailable() || !query) return [];
    if (!rateLimiter.canExecute(this.name, envConfig.twelveData.rateLimitPerMinute)) {
      return [];
    }

    try {
      const response = await axios.get(`${BASE_URL}/symbol_search`, {
        params: {
          symbol: query,
          outputsize: 15,
          apikey: envConfig.twelveData.apiKey
        },
        timeout: 6000
      });

      const data = response.data?.data;
      if (!Array.isArray(data)) return [];

      return data.map(item => ({
        symbol: item.symbol,
        name: item.instrument_name || item.symbol,
        exchange: item.exchange,
        country: item.country,
        type: item.instrument_type
      }));
    } catch (err) {
      console.warn(`[TwelveData] search error for ${query}:`, err.message);
      return [];
    }
  }
}

export const twelveDataProvider = new TwelveDataProvider();
