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
