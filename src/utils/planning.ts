export const calculatorAssumptions = {
  sip: 'Assumes equal payments at the start of each month. Monthly rate = annual assumed return ÷ 12. Rate stays constant; actual returns vary. Taxes and charges excluded.',
  loan: 'Reducing-balance EMI with monthly payments and a constant annual rate ÷ 12. Excludes fees, insurance, prepayments and rate changes. This is not a loan offer.',
  lumpsum: 'Assumes one investment, a constant annual return and annual compounding. Taxes, fees and inflation excluded. Actual returns can be negative.',
  retirement: 'Future expense = current expense × (1 + inflation)^years. Indicative savings = 25× future annual expense. This rule of thumb does not model withdrawals, post-retirement inflation, lifespan or returns.'
};
export const sipEstimate = (payment: number, rate: number, years: number) => {
  const months = years * 12, monthly = rate / 1200;
  return monthly ? payment * Math.expm1(months * Math.log1p(monthly)) / monthly * (1 + monthly) : payment * months;
};
export const loanEmi = (principal: number, rate: number, years: number) => {
  const months = years * 12, monthly = rate / 1200;
  return monthly ? principal * monthly / (1 - (1 + monthly) ** -months) : principal / months;
};
