export function sipFutureValue(monthly: number, years: number, annualRate: number) {
  const months = years * 12, rate = annualRate / 1200;
  return rate === 0 ? monthly * months : monthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
}
export function goalMonthly(target: number, years: number, annualRate: number, inflation = 0) {
  const futureTarget = target * Math.pow(1 + inflation / 100, years);
  return { futureTarget, monthly: futureTarget / sipFutureValue(1, years, annualRate) };
}
export function loanEmi(principal: number, years: number, annualRate: number) {
  const months = years * 12, rate = annualRate / 1200;
  return rate === 0 ? principal / months : principal * rate / (1 - Math.pow(1 + rate, -months));
}
