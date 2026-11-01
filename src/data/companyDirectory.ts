export type Company = { ticker: string; name: string; exchange: 'NSE' | 'BSE' };

export const fallbackCompanies: Company[] = [
  ['RELIANCE', 'Reliance Industries Limited'],
  ['TCS', 'Tata Consultancy Services Limited'],
  ['TATASTEEL', 'Tata Steel Limited'],
  ['TATAMOTORS', 'Tata Motors Limited'],
  ['TATAPOWER', 'Tata Power Company Limited'],
  ['TITAN', 'Titan Company Limited'],
  ['HDFCBANK', 'HDFC Bank Limited'],
  ['ICICIBANK', 'ICICI Bank Limited'],
  ['SBIN', 'State Bank of India'],
  ['BHARTIARTL', 'Bharti Airtel Limited'],
  ['INFY', 'Infosys Limited'],
  ['HCLTECH', 'HCL Technologies Limited'],
  ['ITC', 'ITC Limited'],
  ['SUNPHARMA', 'Sun Pharmaceutical Industries Limited'],
  ['BAJFINANCE', 'Bajaj Finance Limited'],
  ['ADANIENT', 'Adani Enterprises Limited'],
  ['WIPRO', 'Wipro Limited'],
  ['LT', 'Larsen & Toubro Limited'],
  ['AXISBANK', 'Axis Bank Limited'],
  ['KOTAKBANK', 'Kotak Mahindra Bank Limited'],
  ['MARUTI', 'Maruti Suzuki India Limited'],
  ['ULTRACEMCO', 'UltraTech Cement Limited'],
  ['NTPC', 'NTPC Limited'],
  ['ONGC', 'Oil & Natural Gas Corporation Limited'],
  ['POWERGRID', 'Power Grid Corporation of India Limited'],
  ['COALINDIA', 'Coal India Limited'],
  ['ASIANPAINT', 'Asian Paints Limited'],
  ['NESTLEIND', 'Nestle India Limited'],
  ['JSWSTEEL', 'JSW Steel Limited'],
  ['M&M', 'Mahindra & Mahindra Limited'],
  ['BAJAJ-AUTO', 'Bajaj Auto Limited']
].map(([ticker, name]) => ({ ticker, name, exchange: 'BSE' as const }));

/** A small starter list, not a live or exhaustive exchange directory. */
export async function fetchCompanyDirectory(_signal?: AbortSignal): Promise<Company[]> {
  return fallbackCompanies;
}
