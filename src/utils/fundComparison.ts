export type NavPoint = { date: string; nav: string };
export const navDate = (date: string): number => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date);
  if (!match) return NaN;
  const time = Date.UTC(+match[3], +match[2] - 1, +match[1]);
  const d = new Date(time);
  return d.getUTCDate() === +match[1] && d.getUTCMonth() === +match[2] - 1 ? time : NaN;
};
export const validHistory = (data: NavPoint[]) => data.filter(p => Number.isFinite(navDate(p.date)) && Number(p.nav) > 0 && Number.isFinite(Number(p.nav))).sort((a,b) => navDate(b.date)-navDate(a.date));
export const planType = (name: string) => /\bdirect\b/i.test(name) ? 'Direct' : /\bregular\b/i.test(name) ? 'Regular' : 'Not stated';
export const optionType = (name: string) => /idcw|dividend|income distribution/i.test(name) ? 'IDCW' : /growth/i.test(name) ? 'Growth' : 'Not stated';
// All schemes share exactly the same start and end valuation dates for each period.
export function compareNav(histories: NavPoint[][], years: number) {
  if (!histories.length || histories.some(h => !h.length)) return null;
  const maps = histories.map(history => new Map(validHistory(history).map(p => [navDate(p.date), Number(p.nav)])));
  const common = [...maps[0].keys()].filter(t => maps.every(m => m.has(t))).sort((a,b)=>b-a);
  if (!common.length) return null;
  const end = common[0], target = new Date(end);
  target.setUTCFullYear(target.getUTCFullYear()-years);
  const start = common.find(t=>t<=target.getTime());
  if (start === undefined || target.getTime()-start>7*86400000) return null;
  const elapsed = (end-start)/(365.25*86400000);
  return { start, end, values: maps.map(m=> years===1 ? (m.get(end)!/m.get(start)!-1)*100 : (Math.pow(m.get(end)!/m.get(start)!,1/elapsed)-1)*100) };
}

export type ReturnFund = { name: string; data: NavPoint[] };
export type ReturnPeriod = '1m' | '3m' | '6m' | '1y' | '3y' | '5y' | 'since';
export const returnPeriods: Array<{id: ReturnPeriod; label: string}> = [
  {id:'1m',label:'1 month'}, {id:'3m',label:'3 months'}, {id:'6m',label:'6 months'},
  {id:'1y',label:'1 year'}, {id:'3y',label:'3 years'}, {id:'5y',label:'5 years'}, {id:'since',label:'Since first common NAV'}
];
const shortDate = (time: number) => new Date(time).toLocaleDateString('en-IN',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'});
export function compareFundPeriod(funds: ReturnFund[], period: ReturnPeriod) {
  const histories = funds.map(f=>validHistory(f.data));
  const maps = histories.map(h=>new Map(h.map(p=>[navDate(p.date),Number(p.nav)])));
  const results: Array<{value: number | null; reason: string}> = funds.map((f,i)=>({value:null,reason:!histories[i].length?'The NAV feed returned no usable history.':optionType(f.name)==='IDCW'?'IDCW payouts are needed for a total-return calculation.':optionType(f.name)!=='Growth'?'The provider has not identified this as a Growth option.':''}));
  const growth = funds.map((_,i)=>i).filter(i=>!results[i].reason && maps[i].size>0);
  const annualised = period==='3y'||period==='5y';
  if(!growth.length) return {start:null,end:null,annualised,results};
  const endDates = [...maps[growth[0]].keys()].filter(t=>growth.every(i=>maps[i].has(t))).sort((a,b)=>b-a);
  const end = endDates[0];
  if(end===undefined){growth.forEach(i=>results[i].reason='No common valuation date across these schemes.');return{start:null,end:null,annualised,results};}
  const target = new Date(end);
  if(period.endsWith('m')) {
    const day=target.getUTCDate();target.setUTCDate(1);target.setUTCMonth(target.getUTCMonth()-Number(period[0]));
    const finalDay=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(day,finalDay));
  } else if(period!=='since') {
    const month=target.getUTCMonth();target.setUTCFullYear(target.getUTCFullYear()-Number(period[0]));
    if(target.getUTCMonth()!==month) target.setUTCDate(0);
  }
  const eligible=growth.filter(i=>{
    if(period==='since')return true;
    const oldest=navDate(histories[i][histories[i].length-1].date);
    if(oldest>target.getTime()){results[i].reason=`Less than ${period.endsWith('y')?period[0]+' year'+(period[0]==='1'?'':'s'):period[0]+' month'+(period[0]==='1'?'':'s')} of history. First available NAV: ${shortDate(oldest)}.`;return false;}
    return true;
  });
  if(!eligible.length)return{start:null,end,annualised,results};
  const candidates=[...maps[eligible[0]].keys()].filter(t=>t<end&&eligible.every(i=>maps[i].has(t))).sort((a,b)=>b-a);
  const start=period==='since'?candidates[candidates.length-1]:candidates.find(t=>t<=target.getTime()&&target.getTime()-t<=7*86400000);
  if(start===undefined){eligible.forEach(i=>results[i].reason=period==='since'?'At least two common NAV dates are needed.':'No shared NAV within 7 days of this period’s starting date.');return{start:null,end,annualised,results};}
  const years=(end-start)/(365.25*86400000);
  eligible.forEach(i=>{const ratio=maps[i].get(end)!/maps[i].get(start)!;results[i]={value:(annualised?Math.pow(ratio,1/years)-1:ratio-1)*100,reason:''};});
  return{start,end,annualised,results};
}
