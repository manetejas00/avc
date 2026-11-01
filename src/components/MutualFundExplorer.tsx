import { useEffect, useRef, useState } from 'react';
import { getJson } from '../services/apiClient';
import { compareFundPeriod, returnPeriods, NavPoint, optionType, planType, validHistory } from '../utils/fundComparison';
type Fund = { meta: { scheme_code: number; scheme_name: string }; data: NavPoint[]; amfi?: { status: string; nav?: number; date?: string; source: string } };
type Scheme = { schemeCode: number; schemeName: string };
const memory = new Map<string, { expires: number; value: unknown }>();
async function load<T,>(path: string, signal?: AbortSignal): Promise<T> {
  const cached = memory.get(path);
  if (cached && cached.expires > Date.now()) return cached.value as T;
  const value = await getJson<T>(path, { signal, timeoutMs: 20000 });
  if (memory.size >= 50) memory.delete(memory.keys().next().value!);
  memory.set(path, { expires: Date.now()+300000, value });
  return value;
}
const displayDate = (time: number) => new Date(time).toLocaleDateString('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' });
export default function MutualFundExplorer() {
  const [query,setQuery] = useState(''), [results,setResults] = useState<Scheme[]>([]), [funds,setFunds] = useState<Fund[]>([]);
  const [error,setError] = useState(''), [busy,setBusy] = useState(false), [searching,setSearching] = useState(false);
  const detailRequest = useRef<AbortController | null>(null);
  useEffect(()=>()=>detailRequest.current?.abort(),[]);
  useEffect(()=>{
    const controller = new AbortController();
    setResults([]); setError('');
    if(query.trim().length<3) { setSearching(false); return; }
    setSearching(true);
    const timeout = window.setTimeout(()=>{
      void load<Scheme[]>(`/api/mutual-funds.php?q=${encodeURIComponent(query.trim())}`,controller.signal).then(data=>{
        if(!controller.signal.aborted) { if(!Array.isArray(data)) throw new Error(); setResults(data); if(!data.length) setError('No schemes found. Try another name.'); }
      }).catch(()=>{if(!controller.signal.aborted)setError('The scheme search could not be reached. Check your connection and try again.');}).finally(()=>{if(!controller.signal.aborted)setSearching(false);});
    },500);
    return ()=>{ clearTimeout(timeout); controller.abort(); };
  },[query]);
  async function select(code: number) {
    if(busy || funds.length>=3 || funds.some(f=>f.meta.scheme_code===code)) return;
    setBusy(true);setError('');
    const controller = new AbortController(); detailRequest.current=controller;
    try {
      const value = await load<Fund>(`/api/mutual-funds.php?code=${code}`,controller.signal);
      if(!value.meta?.scheme_name || !Array.isArray(value.data)) throw new Error();
      const data = validHistory(value.data); if(!data.length)throw new Error();
      setFunds(previous=>previous.length<3 ? [...previous,{...value,data}] : previous);setResults([]);setQuery('');
    } catch {if(!controller.signal.aborted)setError('This scheme’s NAV history could not be loaded. Please try the scheme again.');}
    finally {if(!controller.signal.aborted)setBusy(false);}
  }
  return <details className="service-learning"><summary>Explore and compare mutual funds</summary><div className="fund-explorer">
    <p>Source: <a href="https://www.mfapi.in/docs/" target="_blank" rel="noreferrer">MFapi.in</a>. NAV is for a valuation date, not an intraday price. Compare up to three schemes. Data is cached for up to one hour on the server.</p>
    <label htmlFor="fund-search">Search scheme name (at least 3 characters)</label><input id="fund-search" type="search" value={query} maxLength={80} onChange={e=>setQuery(e.target.value)} disabled={funds.length>=3 || busy} />
    {(busy||searching)&&<p role="status">Loading fund data…</p>}{error&&<p role="status">{error}</p>}
    {results.length>0&&<ul className="fund-search-results">{results.map(f=><li key={f.schemeCode}><button type="button" onClick={()=>void select(f.schemeCode)} disabled={busy||funds.some(x=>x.meta.scheme_code===f.schemeCode)}>{f.schemeName}</button></li>)}</ul>}
    {funds.map(f=>{
      const latest=f.data[0], check=f.amfi;
      const sameDate=check?.date && new Date(check.date+' UTC').getTime()===new Date(latest.date.split('-').reverse().join('-')+'T00:00:00Z').getTime();
      const checked=check?.status==='available' && sameDate && Math.abs(Number(latest.nav)-Number(check.nav))<0.0001;
      return <article key={f.meta.scheme_code} className="fund-card"><h4>{f.meta.scheme_name}</h4><p>{planType(f.meta.scheme_name)} plan · {optionType(f.meta.scheme_name)} option · Code {f.meta.scheme_code}</p><p className="fund-history-coverage">History available: {f.data[f.data.length-1].date} to {f.data[0].date} ({f.data.length.toLocaleString('en-IN')} NAV records).</p><p><strong>NAV ₹{Number(latest.nav).toLocaleString('en-IN',{maximumFractionDigits:5})}</strong> · {latest.date}</p><p>AMFI cross-check: {checked?'Matched NAV and date':sameDate?'NAV mismatch — verify before using':check?.status==='available'?'Different valuation date — not verified':'AMFI did not return a matching current entry — check pending'}{check?.status==='available'&&<> (AMFI ₹{check.nav}, {check.date})</>}. <a href="https://portal.amfiindia.com/spages/NAVAll.txt" target="_blank" rel="noreferrer">AMFI source</a></p><button type="button" onClick={()=>setFunds(current=>current.filter(x=>x.meta.scheme_code!==f.meta.scheme_code))}>Remove {f.meta.scheme_code}</button><details><summary>Recent NAV history</summary><table><thead><tr><th>Date</th><th>NAV (₹)</th></tr></thead><tbody>{f.data.slice(0,10).map(p=><tr key={p.date}><td>{p.date}</td><td>{p.nav}</td></tr>)}</tbody></table></details></article>;
    })}
    {funds.length>0&&<><h4>Returns over common dates</h4><p>1, 3 and 6 months and 1 year show absolute NAV changes. 3 and 5 years show annualised growth. New schemes can show shorter-period returns before they have a full year of history. Growth options only; IDCW payouts require a total-return calculation.</p>
      <div className="fund-table-wrap" tabIndex={0} aria-label="Mutual fund return comparison; scroll horizontally if needed"><table><thead><tr><th scope="col">Period</th>{funds.map(f=><th scope="col" key={f.meta.scheme_code}>{f.meta.scheme_name}</th>)}</tr></thead><tbody>
        {returnPeriods.map(period=>{
          const comparison=compareFundPeriod(funds.map(f=>({name:f.meta.scheme_name,data:f.data})),period.id);
          return <tr key={period.id}><th scope="row">{period.label}<small>{comparison.annualised?'Annualised':'Absolute NAV change'}</small>{comparison.start!==null&&comparison.end!==null&&<small>{displayDate(comparison.start)} to {displayDate(comparison.end)}</small>}</th>{funds.map((f,index)=>{const result=comparison.results[index];return <td key={f.meta.scheme_code} className={result.value===null?'fund-return-reason':'fund-return-value'}>{result.value===null?result.reason:`${result.value>=0?'+':''}${result.value.toFixed(2)}%`}</td>;})}</tr>;
        })}
      </tbody></table></div><p>Every numeric value in a row uses the same start and end dates. A younger scheme does not hide longer-period results for older eligible schemes. “Since first common NAV” starts at the earliest shared date in the available feed, not necessarily the scheme’s inception. No ranking or recommendation.</p></>}

    <p>Past returns do not predict future returns. NAV changes exclude investor taxes, exit loads and transaction charges. Direct and Regular plans have different expenses. Read the scheme documents and riskometer before investing.</p>
  </div></details>;
}
