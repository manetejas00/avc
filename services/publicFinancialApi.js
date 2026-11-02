import { handleNewsRequest, parsePublisherFeed } from './publisherNews.js';

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const json = (data, status = 200, ttl = 180) => Response.json(data, { status, headers: {
  'Cache-Control': status < 400 ? `public, max-age=${ttl}` : 'no-store',
  ...(status < 400 ? { 'Netlify-CDN-Cache-Control': `public, s-maxage=${ttl}` } : {}),
} });
export async function upstream(url, options = {}, fetcher = fetch) {
  const response = await fetcher(url, { ...options, signal: AbortSignal.timeout(6500), headers: { 'User-Agent': 'Mozilla/5.0 AVC-Dhanam', Accept: 'application/json', ...options.headers } });
  if (!response.ok) throw new HttpError(502, 'The data provider is temporarily unavailable. Please retry.');
  return response.json();
}
export const watchlist = ['RELIANCE.NS','TCS.NS','HDFCBANK.NS','ICICIBANK.NS','INFY.NS','ITC.NS','SBIN.NS','BHARTIARTL.NS','HINDUNILVR.NS','KOTAKBANK.NS','AXISBANK.NS','HCLTECH.NS'];
const benchmarks = ['^NSEI','^BSESN','^GSPC','^IXIC','INR=X','GC=F','CL=F'];
const number = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
export function symbolInput(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9^][A-Za-z0-9^&.=_-]{0,39}$/.test(value)) throw new HttpError(400, 'Choose a valid market symbol.');
  return value.toUpperCase();
}
export async function chart(symbol, range = '3mo', interval = '1d', fetcher = fetch) {
  symbol = symbolInput(symbol);
  if (!['1d','5d','1mo','3mo','6mo','1y','2y','5y','max'].includes(range) || !['1m','5m','15m','1h','1d','1wk','1mo'].includes(interval)) throw new HttpError(400, 'Unsupported chart period.');
  const data = await upstream(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`, {}, fetcher);
  const result = data?.chart?.result?.[0];
  if (!result?.meta || result.meta.symbol !== symbol) throw new HttpError(404, 'No data for this symbol.');
  return { data, result };
}
export function quoteFromChart(result) {
  const m = result.meta, price = number(m.regularMarketPrice), previous = number(m.chartPreviousClose ?? m.previousClose);
  if (price === null || !previous || !Number.isFinite(m.regularMarketTime)) throw new HttpError(502, 'The provider returned an undated or incomplete quote.');
  return { symbol: m.symbol, name: m.longName || m.shortName || m.symbol, price, change: price - previous, changePercent: (price / previous - 1) * 100,
    open: number(result.indicators?.quote?.[0]?.open?.[0]), high: number(m.regularMarketDayHigh), low: number(m.regularMarketDayLow), previousClose: previous,
    volume: number(m.regularMarketVolume), currency: m.currency, exchange: m.exchangeName, provider: 'Yahoo Finance', timestamp: new Date(m.regularMarketTime * 1000).toISOString() };
}
export function candlesFromChart(result) {
  const q = result.indicators?.quote?.[0];
  return (result.timestamp || []).flatMap((time, i) => !q || [q.open?.[i],q.high?.[i],q.low?.[i],q.close?.[i]].some(v => number(v) === null) ? [] : [{ timestamp: new Date(time * 1000).toISOString(), open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i], volume: number(q.volume?.[i]) }]);
}
async function quotes(symbols, fetcher) {
  const results = await Promise.allSettled(symbols.map(async symbol => quoteFromChart((await chart(symbol, '1d', '1d', fetcher)).result)));
  const valid = results.flatMap(r => r.status === 'fulfilled' ? [r.value] : []);
  if (!valid.length) throw new HttpError(502, 'Market quotes are temporarily unavailable.');
  return valid;
}
export async function companyData(symbol, exchange = 'NSE', mode = 'profile', fetcher = fetch) {
  symbol = symbolInput(symbol);
  if (!['NSE','BSE'].includes(exchange) || !['profile','dividends'].includes(mode)) throw new HttpError(400, 'Choose a valid exchange and mode.');
  const columns = mode === 'profile' ? ['name','description','exchange','currency','close','RSI','price_earnings_ttm','sector','industry','price_52_week_high','price_52_week_low','update_time','update_mode','volume'] : ['dividend_ex_date_upcoming','dividend_payment_date_upcoming','dividend_amount_upcoming','dividend_yield_upcoming','dividend_frequency_upcoming','dividend_ex_date_recent','dividend_payment_date_recent','dividend_amount_recent','dividend_yield_recent','dividend_frequency_recent'];
  const key = `${exchange}:${symbol}`;
  const data = await upstream('https://scanner.tradingview.com/india/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({symbols:{tickers:[key]},columns}) }, fetcher);
  const row = data?.data?.find(row => row.s === key);
  if (!row || row.d?.length !== columns.length) throw new HttpError(404, 'No company record for this exchange and symbol.');
  return { symbol: key, source: 'TradingView', checkedAt: new Date().toISOString(), values: Object.fromEntries(columns.map((key,i)=>[key,row.d[i]])) };
}
async function fund(url, path, fetcher) {
  const legacy = path.endsWith('.php') || path.startsWith('/api/market/');
  const query = url.searchParams.get('q');
  if (path.endsWith('/search') || query !== null) {
    if (!query || query.trim().length < 3 || query.length > 80) throw new HttpError(400, 'Enter 3–80 characters.');
    const results = await upstream(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query.trim())}`, {}, fetcher);
    if (!Array.isArray(results)) throw new HttpError(502, 'Invalid scheme search response.');
    return results.slice(0,30);
  }
  const code = path.endsWith('.php') ? url.searchParams.get('code') : path.split('/').pop();
  if (!/^\d{5,8}$/.test(code || '')) throw new HttpError(400, 'Invalid scheme code.');
  const data = await upstream(`https://api.mfapi.in/mf/${code}`, {}, fetcher);
  if (String(data?.meta?.scheme_code) !== code || !data.meta.scheme_name || !Array.isArray(data.data) || !data.data.length) throw new HttpError(404, 'Scheme not found.');
  if (legacy) {
    data.source = 'MFapi.in'; data.amfi = {status:'unavailable',source:'https://portal.amfiindia.com/spages/NAVAll.txt'};
    try {
      const response = await fetcher(data.amfi.source,{signal:AbortSignal.timeout(2500)});
      if(response.ok) for(const row of (await response.text()).split('\n')) {
        const cells=row.trim().split(';');
        if(cells[0]===code && cells.length>=6 && Number.isFinite(Number(cells.at(-2)))) { data.amfi={...data.amfi,status:'available',nav:Number(cells.at(-2)),date:cells.at(-1)};break; }
      }
    } catch { /* An unavailable AMFI cross-check must not imply verification. */ }
    return data;
  }
  const currentNav = Number(data.data[0].nav);
  const end = Date.parse(data.data[0].date.split('-').reverse().join('-'));
  const returns = years => {
    const target = new Date(end); target.setUTCFullYear(target.getUTCFullYear()-years);
    const historical = data.data.find(p => Date.parse(p.date.split('-').reverse().join('-')) <= +target);
    const nav = Number(historical?.nav);
    return nav > 0 ? (Math.pow(currentNav/nav,1/years)-1)*100 : null;
  };
  return {schemeCode:data.meta.scheme_code,schemeName:data.meta.scheme_name,fundHouse:data.meta.fund_house,schemeType:data.meta.scheme_type,schemeCategory:data.meta.scheme_category,currentNav,latestNavDate:data.data[0].date,performance:{return1Y:returns(1),return3Y:returns(3),return5Y:returns(5)},navHistory:data.data.slice(0,90).map(p=>({date:p.date,nav:Number(p.nav)}))};
}
export async function handlePublicApi(request, {fetcher = fetch, env = (_name) => undefined} = {}) {
  try {
    const url = new URL(request.url), path = decodeURIComponent(url.pathname);
    if (request.method !== 'GET') return json({error:'Method not allowed'},405);
    if (path.includes('/mutual-funds')) return json(await fund(url,path,fetcher),200,3600);
    if (path === '/api/companies') {
      return json(await upstream('https://scanner.tradingview.com/india/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({filter:[{left:'type',operation:'equal',right:'stock'},{left:'exchange',operation:'in_range',right:['BSE']}],options:{lang:'en'},symbols:{query:{types:[]},tickers:[]},columns:['name','description','exchange'],sort:{sortBy:'name',sortOrder:'asc'},range:[0,10000]}) }, fetcher),200,3600);
    }
    if (path === '/api/company-data.php') return json(await companyData(url.searchParams.get('symbol'), url.searchParams.get('exchange') || 'BSE',url.searchParams.get('mode') || 'profile',fetcher));
    if (path === '/api/watchlist.php') {
      const settled = await Promise.allSettled(watchlist.map(async symbol => ({symbol,result:(await chart(symbol,'5d','1d',fetcher)).result})));
      const data = settled.flatMap(r=>r.status==='fulfilled'?[r.value]:[]);
      if(!data.length) throw new HttpError(502,'Watchlist provider unavailable.');
      return json({source:'Yahoo Finance',watchlist,data});
    }
    if (path === '/api/yahoo.php' || path.startsWith('/api/yahoo/v8/finance/chart/')) return json((await chart(path.endsWith('.php') ? url.searchParams.get('symbol') : path.split('/').pop(),url.searchParams.get('range') || '3mo',url.searchParams.get('interval') || '1d',fetcher)).data);
    if (path === '/api/market/chart') return json(candlesFromChart((await chart(url.searchParams.get('symbol') || '^NSEI','3mo','1d',fetcher)).result).map(p=>({timestamp:p.timestamp,value:p.close})));
    if (['/api/market/overview','/api/market/indices','/api/market/dashboard'].includes(path)) {
      const all = await quotes(benchmarks,fetcher), indices=all.filter(q=>q.symbol.startsWith('^'));
      return json(path.endsWith('/dashboard') ? all : path.endsWith('/indices') ? indices : {indices,forex:all.filter(q=>q.symbol.endsWith('=X')),commodities:all.filter(q=>q.symbol.endsWith('=F')),all,timestamp:new Date().toISOString()});
    }
    if (['/api/market/gainers','/api/market/losers','/api/market/screener/stocks'].includes(path)) {
      const all=await quotes(watchlist,fetcher);
      return json(path.endsWith('/stocks') ? all : all.filter(q=>path.endsWith('/gainers') ? q.changePercent>0 : q.changePercent<0).sort((a,b)=>path.endsWith('/gainers') ? b.changePercent-a.changePercent : a.changePercent-b.changePercent).slice(0,6));
    }
    if(path==='/api/stocks/search' || path==='/api/yahoo-news.php') {
      const query=url.searchParams.get('q')?.trim();
      if(!query || query.length>80) throw new HttpError(400,'Enter a search query of up to 80 characters.');
      const data=await upstream(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=12`,{},fetcher);
      return json(path.endsWith('.php') ? data : (data.quotes || []).filter(q=>q.symbol).map(q=>({symbol:q.symbol,name:q.longname||q.shortname||q.symbol,exchange:q.exchange})));
    }
    if(path.startsWith('/api/stocks/')) {
      const [, , , raw, action] = path.split('/');
      const symbol=symbolInput(raw); const ySymbol= /[.^=]/.test(symbol) ? symbol : `${symbol}.NS`;
      if(!action) return json(quoteFromChart((await chart(ySymbol,'1d','1d',fetcher)).result));
      if(action==='history') {
        const points=Math.min(365,Math.max(1,parseInt(url.searchParams.get('points'),10)||30));
        return json(candlesFromChart((await chart(ySymbol,points>90?'2y':'6mo','1d',fetcher)).result).slice(-points));
      }
      if(action==='news') {
        const response=await fetcher(`https://news.google.com/rss/search?q=${encodeURIComponent(symbol+' stock')}&hl=en-IN&gl=IN&ceid=IN:en`,{signal:AbortSignal.timeout(5000)});
        if(!response.ok) throw new HttpError(502,'Stock news provider unavailable.');
        return json(parsePublisherFeed(await response.text(),'Google News').slice(0,Math.min(30,Math.max(1,parseInt(url.searchParams.get('limit'),10)||8))));
      }
      if(action==='fundamentals' || action==='technicals') {
        const profile=await companyData(symbol.replace(/\.(NS|BO)$/,''),symbol.endsWith('.BO')?'BSE':'NSE','profile',fetcher), v=profile.values;
        return json(action==='technicals' ? {symbol,rsi:number(v.RSI),macd:null,sma:null,ema:null,provider:profile.source,timestamp:Number.isFinite(v.update_time)?new Date(v.update_time*1000).toISOString():null} : {symbol,name:v.description,sector:v.sector,industry:v.industry,peRatio:number(v.price_earnings_ttm),fiftyTwoWeekHigh:number(v.price_52_week_high),fiftyTwoWeekLow:number(v.price_52_week_low),provider:profile.source});
      }
    }
    if(path==='/api/crypto/market-snapshot') {
      const key=env('COINGECKO_DEMO_API_KEY');
      const data=await upstream('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin&order=market_cap_desc&per_page=4&page=1&sparkline=false',{headers:key?{'x-cg-demo-api-key':key}:{}},fetcher);
      const coins=Array.isArray(data)?data.filter(c=>c.id&&number(c.current_price)!==null).map(c=>({id:c.id,name:c.name,symbol:c.symbol.toUpperCase(),image:typeof c.image==='string'&&c.image.startsWith('https://')?c.image:null,priceUsd:c.current_price,change24h:number(c.price_change_percentage_24h),marketCapUsd:number(c.market_cap),rank:number(c.market_cap_rank)})):[];
      if(!coins.length) throw new HttpError(502,'Crypto provider returned no valid records.');
      return json({coins,updatedAt:new Date().toISOString(),stale:false,provider:'CoinGecko'},200,300);
    }
    if(path==='/api/providers/status') {
      const status=name=>({configured:!!env(name),status:env(name)?'configured':'not configured'});
      return json({status:'online',timestamp:new Date().toISOString(),providers:{twelveData:status('TWELVE_DATA_API_KEY'),finnhub:status('FINNHUB_API_KEY'),alphaVantage:status('ALPHA_VANTAGE_API_KEY'),gnews:status('GNEWS_API_KEY'),newsApi:{primaryConfigured:!!env('NEWS_API_KEY'),secondaryConfigured:!!env('NEWS_API_KEY_SECONDARY'),primaryStatus:status('NEWS_API_KEY').status,secondaryStatus:status('NEWS_API_KEY_SECONDARY').status},publicFeeds:{news:'publisher RSS',markets:'Yahoo Finance',mutualFunds:'MFapi.in'}}},200,0);
    }
    if(path==='/api/news') {
      const response=await handleNewsRequest(new Request(`${url.origin}/api/news/india?${url.searchParams}`),fetcher);
      if(!response.ok) return response;
      const articles=await response.json();return json({articles,pagination:{page:1,limit:articles.length,total:articles.length,hasMore:false}});
    }
    if(path==='/api/indianapi.php' || path==='/api/marketaux.php') {
      const key=env(path.includes('indianapi')?'INDIAN_API_KEY':'MARKETAUX_API_KEY');
      if(!key) throw new HttpError(503,'This optional provider is not configured.');
      if(path.includes('indianapi')) {
        const endpoint=url.searchParams.get('endpoint')||'news';
        if(!['news','stock','market'].includes(endpoint)) throw new HttpError(400,'Unsupported provider endpoint.');
        const target=new URL(`https://stock.indianapi.in/${endpoint}`);
        if(url.searchParams.get('name')) target.searchParams.set('name',url.searchParams.get('name'));
        return json(await upstream(target,{headers:{'X-Api-Key':key}},fetcher));
      }
      const target=new URL('https://api.marketaux.com/v1/news/all');target.searchParams.set('api_token',key);target.searchParams.set('language','en');target.searchParams.set('limit','6');
      if(url.searchParams.get('search')) target.searchParams.set('search',url.searchParams.get('search').slice(0,100));
      return json(await upstream(target,{},fetcher));
    }
    return json({error:'API endpoint not found.'},404);
  } catch(error) { return json({error:error instanceof HttpError?error.message:'The data service is temporarily unavailable. Please retry.'},error instanceof HttpError?error.status:502); }
}
