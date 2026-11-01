export type NavPoint = { date: string; nav: string };
export type Fund = { meta: { scheme_code: number; scheme_name: string; fund_house: string; scheme_category: string }; data: NavPoint[] };
export function navTime(value: string) {
  const [day, month, year] = value.split('-').map(Number);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  return year >= 1990 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? time : NaN;
}
export function validNavs(fund: Fund) {
  return fund.data.filter(point => Number.isFinite(navTime(point.date)) && Number(point.nav) > 0 && Number.isFinite(Number(point.nav))).sort((a, b) => navTime(b.date) - navTime(a.date));
}
export function planLabels(name: string) {
  return { plan: /\bdirect\b/i.test(name) ? 'Direct' : /\bregular\b/i.test(name) ? 'Regular' : 'Plan not specified', option: /idcw|dividend/i.test(name) ? 'IDCW / Dividend' : /\bgrowth\b/i.test(name) ? 'Growth' : 'Option not specified' };
}
export function commonNavDate(funds: Fund[]) {
  if (!funds.length) return null;
  const sets = funds.slice(1).map(fund => new Set(validNavs(fund).map(point => point.date)));
  return validNavs(funds[0]).find(point => sets.every(set => set.has(point.date)))?.date ?? null;
}
export function fundReturn(fund: Fund, years: number, asOf: string) {
  if (planLabels(fund.meta.scheme_name).option !== 'Growth') return null;
  const points = validNavs(fund), end = points.find(point => point.date === asOf);
  if (!end) return null;
  const target = new Date(navTime(asOf)); target.setUTCFullYear(target.getUTCFullYear() - years);
  const start = points.find(point => navTime(point.date) <= target.getTime());
  if (!start || target.getTime() - navTime(start.date) > 7 * 86400000) return null;
  const elapsedYears = (navTime(asOf) - navTime(start.date)) / (365.25 * 86400000);
  const ratio = Number(end.nav) / Number(start.nav);
  return { value: (years === 1 ? ratio - 1 : Math.pow(ratio, 1 / elapsedYears) - 1) * 100, start: start.date, end: asOf };
}
