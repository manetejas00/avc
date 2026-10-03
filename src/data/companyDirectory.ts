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

export async function fetchCompanyDirectory(signal?: AbortSignal): Promise<Company[]> {
  try {
    const response = await fetch('https://scanner.tradingview.com/india/scan', {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        filter: [{ left: 'type', operation: 'equal', right: 'stock' }, { left: 'exchange', operation: 'in_range', right: ['BSE'] }],
        options: { lang: 'en' },
        symbols: { query: { types: [] }, tickers: [] },
        columns: ['name', 'description', 'exchange'],
        sort: { sortBy: 'name', sortOrder: 'asc' },
        range: [0, 10000]
      })
    });
    if (!response.ok) throw new Error('Company directory unavailable');
    const result = (await response.json()) as { data?: Array<{ s?: string; d?: unknown[] }> };
    const listed = (result.data ?? [])
      .map((row) => {
        const [ticker, name, exchange] = row.d ?? [];
        const resolved = exchange === 'NSE' || exchange === 'BSE' ? exchange : row.s?.split(':')[0];
        return typeof ticker === 'string' && typeof name === 'string' && (resolved === 'NSE' || resolved === 'BSE')
          ? { ticker, name, exchange: resolved }
          : null;
      })
      .filter((company): company is Company => company !== null);

    return listed.length ? listed : fallbackCompanies;
  } catch {
    return fallbackCompanies;
  }
}
