import { ApiClientError, getJson } from './apiClient';

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

export function enrichIpoDetails(ipo: IPO): IPO { return ipo; }

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

  const rawSubTotal = item.total_subscription_rate ? Number(item.total_subscription_rate) : undefined;
  const rawQib = item.qib_subscription_rate || item.qib_subscription || item.qib;
  const rawNii = item.nii_subscription_rate || item.nii_subscription || item.nii || item.hni;
  const rawRetail = item.retail_subscription_rate || item.retail_subscription || item.retail;

  const rawFresh = item.fresh_issue_size || item.fresh_issue || item.fresh_issue_cr;
  const rawOfs = item.ofs_issue_size || item.ofs_issue || item.ofs || item.ofs_cr;

  const baseIpo: IPO = {
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
    freshIssueCr: rawFresh ? Number(rawFresh) : undefined,
    ofsCr: rawOfs ? Number(rawOfs) : undefined,
    subscription: {
      total: rawSubTotal,
      qib: rawQib !== undefined ? Number(rawQib) : undefined,
      nii: rawNii !== undefined ? Number(rawNii) : undefined,
      retail: rawRetail !== undefined ? Number(rawRetail) : undefined,
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

  return enrichIpoDetails(baseIpo);
}

async function fetchFromIndianApiDirect(signal?: AbortSignal): Promise<IPO[]> {
  const rawData = await getJson<any>('/api/indianapi.php?endpoint=ipo', { signal, timeoutMs: 20000 });
  if (!rawData || !['active', 'upcoming', 'closed', 'listed', 'pre_apply'].some(key => Array.isArray(rawData[key]))) throw new Error('IPO provider unavailable.');
  return processAndCacheRaw(rawData);
}

function processAndCacheRaw(data: any): IPO[] {
  const combined = [
    ...(data.active || []).map((item: any) => ({ ...item, status: item.status || 'open' })),
    ...(data.upcoming || []).map((item: any) => ({ ...item, status: item.status || 'upcoming' })),
    ...(data.closed || []).map((item: any) => ({ ...item, status: item.status || 'closed' })),
    ...(data.listed || []).map((item: any) => ({ ...item, status: item.status || 'listed' })),
    ...(data.pre_apply || []).map((item: any) => ({ ...item, status: item.status || 'upcoming' }))
  ];

  const normalized = combined.map(normalizeIndianApiIpo);
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
    if (Array.isArray(data)) return data.map(enrichIpoDetails);
  } catch (e) {
    if (signal?.aborted) throw e;
    console.warn('Express backend /api/ipo/list unavailable, using PHP proxy or client fallback:', e);
  }

  // Static hosts use the same provider through a server-side PHP proxy.
  const master = await fetchFromIndianApiDirect(signal);
  return filterIpoList(master, params).map(enrichIpoDetails);
}

export async function fetchIpoDetail(id: string, signal?: AbortSignal): Promise<IPO> {
  try {
    const data = await getJson<IPO>(`/api/ipo/details/${encodeURIComponent(id)}`, { signal, timeoutMs: 3000 });
    if (data && data.name) return enrichIpoDetails(data);
  } catch (error) {
    if (signal?.aborted || (error instanceof ApiClientError && error.status === 404)) throw error;
  }

  const master = await fetchFromIndianApiDirect(signal);
  const detail = master.find(i => i.id === id || i.symbol?.toLowerCase() === id.toLowerCase());
  if (!detail) {
    throw new Error('IPO not found.');
  }
  return enrichIpoDetails(detail);
}

export async function fetchIpoStats(signal?: AbortSignal): Promise<IPOStats> {
  try {
    const data = await getJson<IPOStats>('/api/ipo/stats', { signal, timeoutMs: 3000 });
    if (data && typeof data.total === 'number') return data;
  } catch (error) {
    if (signal?.aborted) throw error;
  }

  const master = await fetchFromIndianApiDirect(signal);
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
