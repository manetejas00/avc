import { HttpError, json, upstream } from './publicFinancialApi.js';

export function isoIssueDate(value) {
  if(typeof value!=='string'||!/^\d{2}-[a-z]{3}-\d{4}$/i.test(value)) return null;
  const date=new Date(value+' 00:00:00 GMT');
  return Number.isFinite(+date)?date.toISOString().slice(0,10):null;
}
export function normalizeIssue(row, checkedAt, today) {
  const symbol=row.symbol, name=row.companyName||row.company, series=String(row.series||row.securityType||'').toUpperCase();
  if(!/^[A-Z0-9&._-]{1,30}$/.test(symbol||'')||typeof name!=='string'||!['EQ','SME'].includes(series)) return null;
  const openDate=isoIssueDate(row.issueStartDate||row.ipoStartDate), closeDate=isoIssueDate(row.issueEndDate||row.ipoEndDate), listingDate=isoIssueDate(row.listingDate);
  if(!openDate||!closeDate||openDate>closeDate) return null;
  const prices=String(row.priceBand||row.priceRange||row.issuePrice||'').replaceAll(',','').match(/\d+(?:\.\d+)?/g)||[];
  const min=Number(prices[0]), max=Number(prices[1]||prices[0]);
  const record={id:symbol.toLowerCase(),symbol,name,issueType:series==='SME'?'SME':'Mainboard',exchanges:row.isBse?['NSE','BSE']:['NSE'],openDate,closeDate,minPrice:min>0&&max>=min?min:0,maxPrice:max>=min&&min>0?max:0,
    status:listingDate&&listingDate<=today?'listed':today<openDate?'upcoming':today<=closeDate?'open':'closed',
    sourceUrl:`https://www.nseindia.com/market-data/issue-information?symbol=${encodeURIComponent(symbol)}`,verifiedAt:checkedAt,
    verificationNote:'Source: NSE public issue feeds. Missing terms are not estimated. Check the exchange issue notice before applying.'};
  if(listingDate)record.listingDate=listingDate;
  if(Number.isInteger(Number(row.lotSize))&&Number(row.lotSize)>0)record.lotSize=Number(row.lotSize);
  return record;
}
export async function handleIpoRequest(request, fetcher=fetch) {
  try {
    if(request.method!=='GET')return json({error:'Method not allowed'},405);
    const checkedAt=new Date().toISOString(),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const feeds=[['past','public-past-issues'],['upcoming','all-upcoming-issues?category=ipo'],['current','ipo-current-issue']];
    const results=await Promise.allSettled(feeds.map(async ([,path])=>{
      const data=await upstream('https://www.nseindia.com/api/'+path,{},fetcher);
      if(!Array.isArray(data))throw new Error('Invalid NSE response');return data;
    }));
    if(results.every(r=>r.status==='rejected'))throw new HttpError(503,'The official NSE IPO feed is temporarily unreachable. Please retry.');
    const cutoff=new Date(Date.now()-90*86400000).toISOString().slice(0,10), records=new Map(),warnings=[];
    results.forEach((result,index)=>{
      if(result.status==='rejected'){warnings.push(feeds[index][0]+' feed is temporarily unreachable');return;}
      for(const row of result.value){const record=normalizeIssue(row,checkedAt,today);if(record&&(index!==0||record.closeDate>=cutoff))records.set(record.symbol,{...records.get(record.symbol),...record});}
    });
    const data=[...records.values()].sort((a,b)=>b.openDate.localeCompare(a.openDate));
    const active=data.filter(r=>['open','upcoming'].includes(r.status)).slice(0,12);
    await Promise.allSettled(active.map(async record=>{
      const detail=await upstream(`https://www.nseindia.com/api/ipo-detail?symbol=${encodeURIComponent(record.symbol)}`,{},fetcher);
      if(detail?.issueInfo?.symbol!==record.symbol)return;
      for(const item of detail.issueInfo.dataList||[]){
        if(typeof item.value!=='string')continue;
        const lot=item.title==='Bid Lot'&&item.value.match(/^([\d,]+)\s+(?:Equity\s+)?Shares/i);
        if(lot)record.lotSize=Number(lot[1].replaceAll(',',''));
        const band=item.title==='Price Range'&&item.value.match(/(?:Rs\.?|₹)\s*([\d,.]+)\s*(?:\/-)?\s*to\s*(?:Rs\.?|₹)\s*([\d,.]+)/i);
        if(band){record.minPrice=Number(band[1].replaceAll(',',''));record.maxPrice=Number(band[2].replaceAll(',',''));}
        if(item.title==='Red Herring Prospectus'&&/^https:\/\/(?:nsearchives|archives)\.nseindia\.com\/[^\s<>]+$/.test(item.value))record.documents={rhpUrl:item.value};
        if(item.title==='Name of the Registrar')record.registrar={name:item.value.replace(/<[^>]*>/g,'')};
      }
    }));
    return json({source:'NSE',checkedAt,stale:false,warnings,coverage:'Current/upcoming issues and past issues closed within 90 days, as returned by NSE. Not all BSE-only issues are covered.',data},200,300);
  }catch(error){return json({error:error instanceof HttpError?error.message:'IPO data is temporarily unavailable.'},error instanceof HttpError?error.status:502);}
}
