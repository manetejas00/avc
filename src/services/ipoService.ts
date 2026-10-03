import { getJson } from './apiClient';

export interface IPOSubscription {
  qib?: number;
  nii?: number;
  retail?: number;
  employee?: number;
  total?: number;
  updatedAt?: string;
}

export interface IPOFinancial {
  year: string;
  revenueCr?: number;
  patCr?: number;
  netWorthCr?: number;
  assetsCr?: number;
}

export interface IPORegistrar {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface IPODocuments {
  drhpUrl?: string;
  rhpUrl?: string;
  prospectusUrl?: string;
  allotmentUrl?: string;
}

export interface IPO {
  id: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  status: 'upcoming' | 'open' | 'closed' | 'listed';
  issueType: 'Mainboard' | 'SME';
  exchanges: ('NSE' | 'BSE')[];
  
  openDate: string;
  closeDate: string;
  allotmentDate?: string;
  refundDate?: string;
  dematCreditDate?: string;
  listingDate?: string;
  
  minPrice: number;
  maxPrice: number;
  issuePrice?: number;
  lotSize: number;
  minInvestment: number;
  faceValue?: number;
  
  issueSizeCr?: number;
  freshIssueCr?: number;
  ofsCr?: number;
  
  subscription?: IPOSubscription;
  
  listingPrice?: number;
  listingGainPercent?: number;
  currentPrice?: number;
  
  companyDescription?: string;
  financials?: IPOFinancial[];
  registrar?: IPORegistrar;
  leadManagers?: string[];
  documents?: IPODocuments;
}

export interface IPOStats {
  upcoming: number;
  open: number;
  closed: number;
  listed7Days: number;
  total: number;
}

const INDIAN_API_KEY = 'sk-live-LBoaUhnmhsSPCe3J6kof1SQGTGJgWqQoYq87VL3l';
const LOCAL_STORAGE_CACHE_KEY = 'avc_indian_api_ipo_cache_v1';
const LOCAL_STORAGE_CACHE_TIME_KEY = 'avc_indian_api_ipo_cache_time_v1';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Client-side Normalizer for Indian API
function normalizeIndianApiIpo(item: any): IPO {
  const symbol = item.symbol || '';
  const name = item.name || 'IPO Company';
  const id = symbol ? symbol.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const rawStatus = (item.status || 'open').toLowerCase();
  const status: 'upcoming' | 'open' | 'closed' | 'listed' = rawStatus === 'active' ? 'open' : (rawStatus as any);

  const minP = Number(item.min_price || 0);
  const maxP = Number(item.max_price || minP);
  const issueP = item.issue_price ? Number(item.issue_price) : (maxP || minP);
  const lot = Number(item.lot_size || item.min_bid_quantity || 0);

  const issueType: 'Mainboard' | 'SME' = item.is_sme ? 'SME' : 'Mainboard';

  return {
    id,
    symbol,
    name,
    logoUrl: item.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A2234&color=C5A059`,
    status,
    issueType,
    exchanges: ['NSE', 'BSE'],
    openDate: item.bidding_start_date || '',
    closeDate: item.bidding_end_date || '',
    allotmentDate: item.allotment_date || '',
    refundDate: item.refund_date || '',
    dematCreditDate: item.demat_credit_date || '',
    listingDate: item.listing_date || '',
    minPrice: minP,
    maxPrice: maxP,
    issuePrice: issueP > 0 ? issueP : undefined,
    lotSize: lot,
    minInvestment: lot * (maxP || minP),
    faceValue: item.face_value ? Number(item.face_value) : undefined,
    issueSizeCr: item.issue_size ? Number(item.issue_size) : undefined,
    subscription: {
      total: item.total_subscription_rate ? Number(item.total_subscription_rate) : undefined,
      updatedAt: new Date().toISOString()
    },
    listingPrice: item.listing_price ? Number(item.listing_price) : undefined,
    listingGainPercent: item.listing_gains !== null && item.listing_gains !== undefined
      ? Number(Number(item.listing_gains).toFixed(2))
      : ((item.listing_price && issueP) ? Number((((item.listing_price - issueP) / issueP) * 100).toFixed(2)) : undefined),
    companyDescription: item.additional_text || item.description || undefined,
    documents: {
      drhpUrl: item.document_url || undefined,
      rhpUrl: item.document_url || undefined
    }
  };
}

// Client-side fallback fetcher from Indian API with 24-hour localStorage cache ("one request a day")
async function fetchFromIndianApiDirect(): Promise<IPO[]> {
  const cachedTime = localStorage.getItem(LOCAL_STORAGE_CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);

  if (cachedTime && cachedData) {
    const age = Date.now() - Number(cachedTime);
    if (age < TWENTY_FOUR_HOURS_MS) {
      try {
        return JSON.parse(cachedData);
      } catch {
        // invalid cache, refetch
      }
    }
  }

  // Fetch from proxy endpoint or direct API
  const url = '/api/indianapi/ipo';
  const res = await fetch(url, {
    headers: { 'x-api-key': INDIAN_API_KEY, Accept: 'application/json' }
  });

  if (!res.ok) {
    // Try direct endpoint if proxy fails
    const directRes = await fetch('https://stock.indianapi.in/ipo', {
      headers: { 'x-api-key': INDIAN_API_KEY, Accept: 'application/json' }
    });
    if (!directRes.ok) throw new Error('Indian API returned non-OK status');
    const raw = await directRes.json();
    return processAndCacheRaw(raw);
  }

  const rawData = await res.json();
  return processAndCacheRaw(rawData);
}

function processAndCacheRaw(data: any): IPO[] {
  const combined = [
    ...(data.active || []),
    ...(data.upcoming || []),
    ...(data.closed || []),
    ...(data.listed || []),
    ...(data.pre_apply || [])
  ];

  const normalized = combined.map(normalizeIndianApiIpo);
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(normalized));
    localStorage.setItem(LOCAL_STORAGE_CACHE_TIME_KEY, String(Date.now()));
  } catch {
    // localStorage full or restricted
  }
  return normalized;
}

// Filter helper
function filterIpoList(ipos: IPO[], params: {
  tab?: 'upcoming' | 'open' | 'closed' | 'listed_7days' | 'all';
  segment?: 'all' | 'mainboard' | 'sme';
  exchange?: 'all' | 'nse' | 'bse';
  search?: string;
}): IPO[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  let filtered = ipos.filter(ipo => {
    const listDate = ipo.listingDate ? new Date(ipo.listingDate) : null;
    const openDate = ipo.openDate ? new Date(ipo.openDate) : null;
    const closeDate = ipo.closeDate ? new Date(ipo.closeDate) : null;

    if (params.tab === 'upcoming') {
      if (ipo.status === 'upcoming') return true;
      if (openDate && openDate > today && ipo.status !== 'listed') return true;
      return false;
    }

    if (params.tab === 'open') {
      if (ipo.status === 'open') return true;
      if (openDate && closeDate && openDate <= today && closeDate >= today && ipo.status !== 'listed') return true;
      return false;
    }

    if (params.tab === 'closed') {
      if (ipo.status === 'closed') return true;
      if (closeDate && closeDate < today && (!listDate || listDate > today) && ipo.status !== 'listed') return true;
      return false;
    }

    if (params.tab === 'listed_7days') {
      if (!listDate) return false;
      return listDate >= sevenDaysAgo && listDate <= today;
    }

    return true;
  });

  if (params.segment && params.segment !== 'all') {
    filtered = filtered.filter(i => i.issueType.toLowerCase() === params.segment?.toLowerCase());
  }

  if (params.exchange && params.exchange !== 'all') {
    filtered = filtered.filter(i =>
      Array.isArray(i.exchanges) && i.exchanges.some(e => e.toLowerCase() === params.exchange?.toLowerCase())
    );
  }

  if (params.search && params.search.trim() !== '') {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export async function fetchIpoList(params: {
  tab?: 'upcoming' | 'open' | 'closed' | 'listed_7days' | 'all';
  segment?: 'all' | 'mainboard' | 'sme';
  exchange?: 'all' | 'nse' | 'bse';
  search?: string;
}, signal?: AbortSignal): Promise<IPO[]> {
  const query = new URLSearchParams();
  if (params.tab) query.append('tab', params.tab);
  if (params.segment) query.append('segment', params.segment);
  if (params.exchange) query.append('exchange', params.exchange);
  if (params.search) query.append('search', params.search);

  try {
    // 1. Try Express backend server
    const data = await getJson<IPO[]>(`/api/ipo/list?${query.toString()}`, { signal, timeoutMs: 5000 });
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) {
    console.warn('Express backend /api/ipo/list unavailable, falling back to Indian API proxy:', e);
  }

  // 2. Fallback to client-side Indian API fetcher with 24-hour cache
  const master = await fetchFromIndianApiDirect();
  return filterIpoList(master, params);
}

export async function fetchIpoDetail(id: string, signal?: AbortSignal): Promise<IPO> {
  try {
    const data = await getJson<IPO>(`/api/ipo/details/${encodeURIComponent(id)}`, { signal, timeoutMs: 5000 });
    if (data && data.name) return data;
  } catch {
    // fallback
  }

  const master = await fetchFromIndianApiDirect();
  const detail = master.find(i => i.id === id || i.symbol?.toLowerCase() === id.toLowerCase());
  if (!detail) throw new Error('IPO not found');
  return detail;
}

export async function fetchIpoStats(signal?: AbortSignal): Promise<IPOStats> {
  try {
    const data = await getJson<IPOStats>('/api/ipo/stats', { signal, timeoutMs: 5000 });
    if (data && typeof data.total === 'number') return data;
  } catch {
    // fallback
  }

  const master = await fetchFromIndianApiDirect();
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const stats = { upcoming: 0, open: 0, closed: 0, listed7Days: 0, total: master.length };
  master.forEach(ipo => {
    const listDate = ipo.listingDate ? new Date(ipo.listingDate) : null;
    const openDate = ipo.openDate ? new Date(ipo.openDate) : null;
    const closeDate = ipo.closeDate ? new Date(ipo.closeDate) : null;

    if (ipo.status === 'upcoming' || (openDate && openDate > today && ipo.status !== 'listed')) stats.upcoming++;
    if (ipo.status === 'open' || (openDate && closeDate && openDate <= today && closeDate >= today && ipo.status !== 'listed')) stats.open++;
    if (ipo.status === 'closed' || (closeDate && closeDate < today && (!listDate || listDate > today) && ipo.status !== 'listed')) stats.closed++;
    if (listDate && listDate >= sevenDaysAgo && listDate <= today) stats.listed7Days++;
  });

  return stats;
}
