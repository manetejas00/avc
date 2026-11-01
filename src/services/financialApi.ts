import { getJson } from './apiClient';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
  volume?: number | null;
  currency?: string;
  exchange?: string;
  provider?: string;
  timestamp?: string;
}

export interface MarketOverviewData {
  indices: StockQuote[];
  forex: StockQuote[];
  commodities: StockQuote[];
  all: StockQuote[];
  timestamp: string;
  cached?: boolean;
}

export interface StockCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockTechnicals {
  symbol: string;
  rsi: number | null;
  macd?: {
    macd: number | null;
    signal: number | null;
    histogram: number | null;
  } | null;
  sma?: number | null;
  ema?: number | null;
  provider?: string;
  timestamp?: string;
}

export interface StockFundamentals {
  symbol: string;
  name: string;
  description?: string;
  sector?: string;
  industry?: string;
  marketCap?: number | null;
  peRatio?: number | null;
  pbRatio?: number | null;
  eps?: number | null;
  dividendYield?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  website?: string;
  provider?: string;
}

export interface FinancialNewsItem {
  id?: string;
  title: string;
  summary: string;
  url: string;
  image: string;
  source: string;
  category: string;
  publishedAt: string;
  provider?: string;
}

export interface MutualFundSchemeResult {
  schemeCode: number;
  schemeName: string;
}

export interface MutualFundDetail {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  currentNav: number | null;
  latestNavDate: string | null;
  performance: {
    return1Y: number | null;
    return3Y: number | null;
    return5Y: number | null;
  };
  navHistory: Array<{ date: string; nav: number }>;
}

export interface ProviderStatusReport {
  status: string;
  timestamp: string;
  providers: {
    twelveData: { configured: boolean; status: string };
    finnhub: { configured: boolean; status: string };
    alphaVantage: { configured: boolean; status: string };
    newsApi: {
      primaryConfigured: boolean;
      secondaryConfigured: boolean;
      primaryStatus: string;
      secondaryStatus: string;
    };
    gnews: { configured: boolean; status: string };
  };
}

// --- API Service Methods ---

export async function getMarketOverview(signal?: AbortSignal): Promise<MarketOverviewData> {
  return getJson<MarketOverviewData>('/api/market/overview', { signal, timeoutMs: 10000 });
}

export async function getMarketIndices(signal?: AbortSignal): Promise<StockQuote[]> {
  return getJson<StockQuote[]>('/api/market/indices', { signal, timeoutMs: 8000 });
}

export async function getTopGainers(signal?: AbortSignal): Promise<StockQuote[]> {
  return getJson<StockQuote[]>('/api/market/gainers', { signal, timeoutMs: 8000 });
}

export async function getTopLosers(signal?: AbortSignal): Promise<StockQuote[]> {
  return getJson<StockQuote[]>('/api/market/losers', { signal, timeoutMs: 8000 });
}

export async function getStockQuote(symbol: string, signal?: AbortSignal): Promise<StockQuote> {
  return getJson<StockQuote>(`/api/stocks/${encodeURIComponent(symbol)}`, { signal, timeoutMs: 8000 });
}

export async function getStockHistory(symbol: string, points = 30, signal?: AbortSignal): Promise<StockCandle[]> {
  return getJson<StockCandle[]>(`/api/stocks/${encodeURIComponent(symbol)}/history?points=${points}`, { signal, timeoutMs: 10000 });
}

export async function getStockTechnicals(symbol: string, signal?: AbortSignal): Promise<StockTechnicals> {
  return getJson<StockTechnicals>(`/api/stocks/${encodeURIComponent(symbol)}/technicals`, { signal, timeoutMs: 8000 });
}

export async function getStockFundamentals(symbol: string, signal?: AbortSignal): Promise<StockFundamentals> {
  return getJson<StockFundamentals>(`/api/stocks/${encodeURIComponent(symbol)}/fundamentals`, { signal, timeoutMs: 8000 });
}

export async function getStockNews(symbol: string, limit = 8, signal?: AbortSignal): Promise<FinancialNewsItem[]> {
  return getJson<FinancialNewsItem[]>(`/api/stocks/${encodeURIComponent(symbol)}/news?limit=${limit}`, { signal, timeoutMs: 8000 });
}

export async function searchStocks(query: string, signal?: AbortSignal): Promise<Array<{ symbol: string; name: string; exchange?: string }>> {
  return getJson<Array<{ symbol: string; name: string; exchange?: string }>>(`/api/stocks/search?q=${encodeURIComponent(query)}`, { signal, timeoutMs: 6000 });
}

export async function getFinancialNews(scope: 'india' | 'global' | 'latest' = 'india', limit = 12, signal?: AbortSignal): Promise<FinancialNewsItem[]> {
  return getJson<FinancialNewsItem[]>(`/api/news/${scope}?limit=${limit}`, { signal, timeoutMs: 8000 });
}

export async function searchMutualFunds(query: string, signal?: AbortSignal): Promise<MutualFundSchemeResult[]> {
  return getJson<MutualFundSchemeResult[]>(`/api/mutual-funds/search?q=${encodeURIComponent(query)}`, { signal, timeoutMs: 8000 });
}

export async function getMutualFundDetails(schemeCode: number | string, signal?: AbortSignal): Promise<MutualFundDetail> {
  return getJson<MutualFundDetail>(`/api/mutual-funds/${encodeURIComponent(schemeCode)}`, { signal, timeoutMs: 8000 });
}

export async function getProviderStatus(signal?: AbortSignal): Promise<ProviderStatusReport> {
  return getJson<ProviderStatusReport>('/api/providers/status', { signal, timeoutMs: 5000 });
}
