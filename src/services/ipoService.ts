
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

export function enrichIpoDetails(ipo: IPO): IPO {
  const result = { ...ipo };
  if (ipo.documents) result.documents = Object.fromEntries(Object.entries(ipo.documents).filter(([, url]) => typeof url === 'string' && /^https:\/\//.test(url)));
  return result;
}

export async function fetchIpoList(_params: { tab?: string; segment?: string; exchange?: string; search?: string }, signal?: AbortSignal): Promise<IPO[]> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  throw new Error('Data unavailable. No IPO list verified against official exchange notices is currently published.');
}
export async function fetchIpoDetail(_id: string, signal?: AbortSignal): Promise<IPO> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  throw new Error('Data unavailable. This IPO has no verified official source on this website.');
}
export async function fetchIpoStats(signal?: AbortSignal): Promise<IPOStats> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  throw new Error('Data unavailable. Verified IPO statistics are not published.');
}
