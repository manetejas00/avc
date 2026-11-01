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
  lotSize?: number;
  minInvestment?: number;
  sourceUrl?: string;
  verifiedAt?: string;
  verificationNote?: string;
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

export function enrichIpoDetails(ipo: IPO): IPO {
  const result = { ...ipo };
  if (ipo.documents) result.documents = Object.fromEntries(Object.entries(ipo.documents).filter(([, url]) => typeof url === 'string' && /^https:\/\//.test(url)));
  return result;
}

export interface IPOFeed { source: string; checkedAt: string; stale: boolean; warnings: string[]; coverage: string; data: IPO[] }
export async function fetchIpoFeed(signal?: AbortSignal): Promise<IPOFeed> {
  const feed = await getJson<IPOFeed>('/api/ipos.php', { signal, timeoutMs: 25000 });
  if (!Array.isArray(feed.data) || !Number.isFinite(Date.parse(feed.checkedAt)) || feed.source !== 'NSE') throw new Error('Invalid IPO feed');
  return feed;
}
export function filterIpos(records: IPO[], params: { tab?: string; segment?: string; exchange?: string; search?: string }): IPO[] {
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const from = new Date(today+'T00:00:00Z'); from.setUTCDate(from.getUTCDate()-6);
  return records.filter(ipo => (!params.tab || params.tab==='all' || (params.tab==='listed_7days' ? ipo.status==='listed' && !!ipo.listingDate && ipo.listingDate>=from.toISOString().slice(0,10) && ipo.listingDate<=today : ipo.status===params.tab)) && (!params.segment || params.segment==='all' || ipo.issueType.toLowerCase()===params.segment.toLowerCase()) && (!params.exchange || params.exchange==='all' || ipo.exchanges.some(e=>e.toLowerCase()===params.exchange.toLowerCase())) && (!params.search || `${ipo.name} ${ipo.symbol}`.toLowerCase().includes(params.search.toLowerCase())));
}
export function ipoStats(records: IPO[]): IPOStats {
  return {total:records.length,open:records.filter(i=>i.status==='open').length,upcoming:records.filter(i=>i.status==='upcoming').length,closed:records.filter(i=>i.status==='closed').length,listed7Days:filterIpos(records,{tab:'listed_7days'}).length};
}
export async function fetchIpoList(params: Parameters<typeof filterIpos>[1], signal?: AbortSignal): Promise<IPO[]> { return filterIpos((await fetchIpoFeed(signal)).data,params); }
export async function fetchIpoDetail(id: string, signal?: AbortSignal): Promise<IPO> {
  const record=(await fetchIpoFeed(signal)).data.find(ipo=>ipo.id===id.toLowerCase()||ipo.symbol.toLowerCase()===id.toLowerCase());
  if(!record)throw new Error('This issue is not included in the current NSE feed. Check the official exchange notice.');
  return record;
}
export async function fetchIpoStats(signal?: AbortSignal): Promise<IPOStats> {return ipoStats((await fetchIpoFeed(signal)).data);}
