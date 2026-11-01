
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

// Manually checked against the NSE notice and SEBI-filed abridged RHP.
export const IPO_VERIFIED_AT = '2026-11-01T17:28:33Z';
export const reviewedIpos: IPO[] = [{
  id: 'bcssl', symbol: 'BCSSL', name: 'Bombay Coated and Special Steels Limited',
  status: 'open', issueType: 'Mainboard', exchanges: ['NSE', 'BSE'],
  openDate: '2026-10-29', closeDate: '2026-11-02', minPrice: 78, maxPrice: 82,
  sourceUrl: 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo', verifiedAt: IPO_VERIFIED_AT,
  verificationNote: 'Dates and issuer checked against the NSE notice and SEBI-filed abridged RHP. Price band is from the NSE notice. This is a manually reviewed subset, not a live or complete IPO feed. Lot size, subscriptions and listing date are not published here without separate verification.',
  companyDescription: 'A steel processing company that converts steel coils into processed products for industrial customers. Read the offer documents for business details and risks.',
  documents: {
    rhpUrl: 'https://www.sebi.gov.in/filings/public-issues/oct-2026/bombay-coated-and-special-steels-limited-rhp_105447.html',
    prospectusUrl: 'https://www.sebi.gov.in/sebi_data/commondocs/oct-2026/BOMBAY%20COATED%20AND%20SPECIAL%20STEELS%20LIMITED%20_Abridged%20Prospectus_p.pdf'
  }
}];
function reviewedRecords(signal?: AbortSignal): IPO[] {
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  return reviewedIpos.map(ipo=>({...ipo,status:today<ipo.openDate?'upcoming':today<=ipo.closeDate?'open':'closed'}));
}
export async function fetchIpoList(params: { tab?: string; segment?: string; exchange?: string; search?: string }, signal?: AbortSignal): Promise<IPO[]> {
  return reviewedRecords(signal).filter(ipo=>(!params.tab||params.tab==='all'||(params.tab!=='listed_7days'&&ipo.status===params.tab))&&(!params.segment||params.segment==='all'||ipo.issueType.toLowerCase()===params.segment.toLowerCase())&&(!params.exchange||params.exchange==='all'||ipo.exchanges.some(exchange=>exchange.toLowerCase()===params.exchange.toLowerCase()))&&(!params.search||`${ipo.name} ${ipo.symbol}`.toLowerCase().includes(params.search.toLowerCase())));
}
export async function fetchIpoDetail(id: string, signal?: AbortSignal): Promise<IPO> {
  const record=reviewedRecords(signal).find(ipo=>ipo.id===id.toLowerCase()||ipo.symbol.toLowerCase()===id.toLowerCase());
  if(!record)throw new Error('This IPO is not in the manually reviewed list. Check the official exchange notice.');
  return record;
}
export async function fetchIpoStats(signal?: AbortSignal): Promise<IPOStats> {
  const records=reviewedRecords(signal);
  return {total:records.length,open:records.filter(i=>i.status==='open').length,upcoming:records.filter(i=>i.status==='upcoming').length,closed:records.filter(i=>i.status==='closed').length,listed7Days:0};
}
