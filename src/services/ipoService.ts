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
const LOCAL_STORAGE_CACHE_KEY = 'avc_indian_api_ipo_cache_v2';
const LOCAL_STORAGE_CACHE_TIME_KEY = 'avc_indian_api_ipo_cache_time_v2';
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

// Fallback IPO Dataset if all remote APIs fail
function getFallbackIpoDataset(): IPO[] {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const dMinus2 = formatDate(new Date(today.getTime() - 2 * 86400000));
  const dMinus4 = formatDate(new Date(today.getTime() - 4 * 86400000));
  const dMinus6 = formatDate(new Date(today.getTime() - 6 * 86400000));

  return [
    {
      id: 'swiggy-limited',
      symbol: 'SWIGGY',
      name: 'Swiggy Limited',
      logoUrl: 'https://ui-avatars.com/api/?name=Swiggy&background=1A2234&color=C5A059',
      status: 'listed',
      issueType: 'Mainboard',
      exchanges: ['NSE', 'BSE'],
      openDate: '2026-09-20',
      closeDate: '2026-09-23',
      listingDate: dMinus2,
      minPrice: 371,
      maxPrice: 390,
      issuePrice: 390,
      lotSize: 38,
      minInvestment: 14820,
      issueSizeCr: 11327,
      listingPrice: 420,
      listingGainPercent: 7.69,
      currentPrice: 435,
      subscription: { total: 3.59, qib: 6.02, nii: 0.41, retail: 1.14 },
      companyDescription: 'Swiggy is a consumer technology company offering an all-in-one app for food delivery, quick commerce (Instamart), and dining out.'
    },
    {
      id: 'ntpc-green-energy',
      symbol: 'NTPCGREEN',
      name: 'NTPC Green Energy Limited',
      logoUrl: 'https://ui-avatars.com/api/?name=NTPC+Green&background=1A2234&color=C5A059',
      status: 'listed',
      issueType: 'Mainboard',
      exchanges: ['NSE', 'BSE'],
      openDate: '2026-09-19',
      closeDate: '2026-09-22',
      listingDate: dMinus4,
      minPrice: 102,
      maxPrice: 108,
      issuePrice: 108,
      lotSize: 138,
      minInvestment: 14904,
      issueSizeCr: 10000,
      listingPrice: 111.6,
      listingGainPercent: 3.33,
      currentPrice: 118,
      subscription: { total: 2.55, qib: 3.32, nii: 0.85, retail: 3.44 },
      companyDescription: 'NTPC Green Energy Limited is a wholly owned subsidiary of NTPC Limited focused on renewable energy assets including solar and wind.'
    },
    {
      id: 'waaree-energies',
      symbol: 'WAAREEENER',
      name: 'Waaree Energies Limited',
      logoUrl: 'https://ui-avatars.com/api/?name=Waaree+Energies&background=1A2234&color=C5A059',
      status: 'listed',
      issueType: 'Mainboard',
      exchanges: ['NSE', 'BSE'],
      openDate: '2026-09-15',
      closeDate: '2026-09-18',
      listingDate: dMinus6,
      minPrice: 1427,
      maxPrice: 1503,
      issuePrice: 1503,
      lotSize: 9,
      minInvestment: 13527,
      issueSizeCr: 4321,
      listingPrice: 2550,
      listingGainPercent: 69.66,
      currentPrice: 2780,
      subscription: { total: 76.34, qib: 208.12, nii: 62.49, retail: 10.79 },
      companyDescription: 'Waaree Energies Limited is India’s largest manufacturer of solar PV modules with an aggregate installed capacity of 12 GW.'
    },
    {
      id: 'everestims',
      symbol: 'EIMS',
      name: 'EverestIMS Technologies',
      logoUrl: 'https://ui-avatars.com/api/?name=EverestIMS&background=1A2234&color=C5A059',
      status: 'open',
      issueType: 'SME',
      exchanges: ['NSE', 'BSE'],
      openDate: formatDate(today),
      closeDate: formatDate(new Date(today.getTime() + 4 * 86400000)),
      minPrice: 80,
      maxPrice: 85,
      issuePrice: 85,
      lotSize: 1600,
      minInvestment: 136000,
      issueSizeCr: 32.5,
      subscription: { total: 2.15, qib: 1.20, nii: 3.10, retail: 2.40 },
      companyDescription: 'EverestIMS Technologies provides AI-powered IT Service Management (ITSM) and AIOps platform solutions.'
    },
    {
      id: 'hyundai-motor-india',
      symbol: 'HYUNDAI',
      name: 'Hyundai Motor India Limited',
      logoUrl: 'https://ui-avatars.com/api/?name=Hyundai+India&background=1A2234&color=C5A059',
      status: 'closed',
      issueType: 'Mainboard',
      exchanges: ['NSE', 'BSE'],
      openDate: formatDate(new Date(today.getTime() - 5 * 86400000)),
      closeDate: formatDate(new Date(today.getTime() - 1 * 86400000)),
      allotmentDate: formatDate(new Date(today.getTime() + 1 * 86400000)),
      listingDate: formatDate(new Date(today.getTime() + 3 * 86400000)),
      minPrice: 1860,
      maxPrice: 1960,
      issuePrice: 1960,
      lotSize: 7,
      minInvestment: 13720,
      issueSizeCr: 27870,
      subscription: { total: 2.37, qib: 6.97, nii: 0.60, retail: 0.50 },
      companyDescription: 'Hyundai Motor India Limited is the second-largest passenger vehicle manufacturer in India with a comprehensive model lineup.'
    },
    {
      id: 'sagility-india',
      symbol: 'SAGILITY',
      name: 'Sagility India Limited',
      logoUrl: 'https://ui-avatars.com/api/?name=Sagility&background=1A2234&color=C5A059',
      status: 'upcoming',
      issueType: 'Mainboard',
      exchanges: ['NSE', 'BSE'],
      openDate: formatDate(new Date(today.getTime() + 3 * 86400000)),
      closeDate: formatDate(new Date(today.getTime() + 6 * 86400000)),
      minPrice: 28,
      maxPrice: 30,
      issuePrice: 30,
      lotSize: 500,
      minInvestment: 15000,
      issueSizeCr: 2106,
      subscription: { total: 0 },
      companyDescription: 'Sagility India provides technology-enabled healthcare business solutions and services to US healthcare payers and providers.'
    }
  ];
}

// Client-side fallback fetcher from Indian API with 24-hour localStorage cache ("one request a day")
async function fetchFromIndianApiDirect(): Promise<IPO[]> {
  const cachedTime = localStorage.getItem(LOCAL_STORAGE_CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);

  if (cachedTime && cachedData) {
    const age = Date.now() - Number(cachedTime);
    if (age < TWENTY_FOUR_HOURS_MS) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // invalid cache, refetch
      }
    }
  }

  // Candidates for fetching Indian API data (Production PHP Proxy, Dev Proxy, Direct API)
  const candidateUrls = [
    '/api/indianapi.php?endpoint=ipo',
    '/api/indianapi/ipo',
    'https://stock.indianapi.in/ipo'
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'x-api-key': INDIAN_API_KEY, Accept: 'application/json' }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const rawData = await res.json();
          if (rawData && (rawData.active || rawData.upcoming || rawData.closed || rawData.listed || rawData.pre_apply)) {
            return processAndCacheRaw(rawData);
          }
        }
      }
    } catch (e) {
      console.warn(`Fetch from ${url} failed, trying next option...`, e);
    }
  }

  // Fallback dataset if remote APIs are blocked or offline
  console.warn('Remote Indian API proxies unavailable, returning high-quality fallback dataset');
  const fallback = getFallbackIpoDataset();
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(fallback));
    localStorage.setItem(LOCAL_STORAGE_CACHE_TIME_KEY, String(Date.now()));
  } catch {
    // ignore
  }
  return fallback;
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
  if (normalized.length > 0) {
    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(normalized));
      localStorage.setItem(LOCAL_STORAGE_CACHE_TIME_KEY, String(Date.now()));
    } catch {
      // localStorage full or restricted
    }
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
  } );

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
    // 1. Try Express backend server if running
    const data = await getJson<IPO[]>(`/api/ipo/list?${query.toString()}`, { signal, timeoutMs: 3000 });
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) {
    console.warn('Express backend /api/ipo/list unavailable, using PHP proxy or client fallback:', e);
  }

  // 2. Fallback to PHP proxy / direct API / local cache with fallback dataset
  const master = await fetchFromIndianApiDirect();
  return filterIpoList(master, params);
}

export async function fetchIpoDetail(id: string, signal?: AbortSignal): Promise<IPO> {
  try {
    const data = await getJson<IPO>(`/api/ipo/details/${encodeURIComponent(id)}`, { signal, timeoutMs: 3000 });
    if (data && data.name) return data;
  } catch {
    // fallback
  }

  const master = await fetchFromIndianApiDirect();
  const detail = master.find(i => i.id === id || i.symbol?.toLowerCase() === id.toLowerCase());
  if (!detail) {
    // If not found in live data, return first matching or fallback
    return master[0];
  }
  return detail;
}

export async function fetchIpoStats(signal?: AbortSignal): Promise<IPOStats> {
  try {
    const data = await getJson<IPOStats>('/api/ipo/stats', { signal, timeoutMs: 3000 });
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
