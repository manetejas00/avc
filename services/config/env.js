import dotenv from 'dotenv';
import fs from 'fs';

// Load .env.production in production if available, then fallback to .env
if (process.env.NODE_ENV === 'production' && fs.existsSync('.env.production')) {
  dotenv.config({ path: '.env.production' });
}
dotenv.config();

/**
 * Mask a sensitive key for secure debugging without exposing credentials.
 * @param {string|undefined} key 
 * @returns {string}
 */
const maskKey = (key) => {
  if (!key || typeof key !== 'string') return 'not_configured';
  if (key.length <= 8) return 'configured (hidden)';
  return `configured (...${key.slice(-4)})`;
};

export const envConfig = {
  marketaux: {
    apiKey: process.env.MARKETAUX_API_KEY || process.env.VITE_MARKETAUX_API_KEY || '',
    isConfigured: Boolean(process.env.MARKETAUX_API_KEY || process.env.VITE_MARKETAUX_API_KEY)
  },
  twelveData: {
    apiKey: process.env.TWELVE_DATA_API_KEY || '',
    isConfigured: Boolean(process.env.TWELVE_DATA_API_KEY),
    // Twelve data free tier allows 8 requests/minute and 800/day
    rateLimitPerMinute: 8
  },
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY || '',
    isConfigured: Boolean(process.env.FINNHUB_API_KEY),
    // Finnhub free tier allows 60 requests/minute
    rateLimitPerMinute: 60
  },
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
    isConfigured: Boolean(process.env.ALPHA_VANTAGE_API_KEY),
    // Alpha Vantage free tier allows 5 requests/minute and 25/day (or standard free tier)
    rateLimitPerMinute: 5
  },
  newsApi: {
    primaryKey: process.env.NEWS_API_KEY || '',
    secondaryKey: process.env.NEWS_API_KEY_SECONDARY || '',
    isConfigured: Boolean(process.env.NEWS_API_KEY || process.env.NEWS_API_KEY_SECONDARY),
    // Free developer tier: 100 requests / 24 hours
    rateLimitPerHour: 20
  },
  gnews: {
    apiKey: process.env.GNEWS_API_KEY || '',
    isConfigured: Boolean(process.env.GNEWS_API_KEY)
  },
  indianApi: {
    apiKey: process.env.INDIAN_API_KEY || '',
    isConfigured: Boolean(process.env.INDIAN_API_KEY)
  }
};

/**
 * Returns a sanitized status report for all providers without exposing secret keys.
 */
export const getProviderStatus = () => ({
  twelveData: {
    configured: envConfig.twelveData.isConfigured,
    status: maskKey(envConfig.twelveData.apiKey)
  },
  finnhub: {
    configured: envConfig.finnhub.isConfigured,
    status: maskKey(envConfig.finnhub.apiKey)
  },
  alphaVantage: {
    configured: envConfig.alphaVantage.isConfigured,
    status: maskKey(envConfig.alphaVantage.apiKey)
  },
  newsApi: {
    primaryConfigured: Boolean(envConfig.newsApi.primaryKey),
    secondaryConfigured: Boolean(envConfig.newsApi.secondaryKey),
    primaryStatus: maskKey(envConfig.newsApi.primaryKey),
    secondaryStatus: maskKey(envConfig.newsApi.secondaryKey)
  },
  gnews: {
    configured: envConfig.gnews.isConfigured,
    status: maskKey(envConfig.gnews.apiKey)
  },
  marketaux: {
    configured: envConfig.marketaux.isConfigured,
    status: maskKey(envConfig.marketaux.apiKey)
  }
});
