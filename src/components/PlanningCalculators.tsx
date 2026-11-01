import { useState } from 'react';
import { goalMonthly, loanEmi, sipFutureValue } from '../utils/planning';
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function PlanningCalculators() {
  const [kind, setKind] = useState('goal');
  const [amount, setAmount] = useState(1000000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(8);
  const [inflation, setInflation] = useState(5);
  const goal = goalMonthly(amount, years, rate, inflation);
  const result = kind === 'goal' ? goal.monthly : kind === 'sip' ? sipFutureValue(amount, years, rate) : loanEmi(amount, years, rate);
  return <section id="calculators" className="care-section">
    <p className="care-kicker">PLAN WITH ASSUMPTIONS YOU CONTROL</p><h2>Put a number to your next goal.</h2>
    <div className="care-tabs" role="group" aria-label="Calculator type">{[['goal', 'Goal planner'], ['sip', 'SIP estimate'], ['loan', 'Loan EMI']].map(([id, label]) => <button key={id} aria-pressed={kind === id} onClick={() => { setKind(id); setAmount(id === 'sip' ? 5000 : 1000000); }}>{label}</button>)}</div>
    <div className="care-calculator care-grid two"><div className="care-fields">
      <label>{kind === 'goal' ? 'Goal cost today (₹)' : kind === 'sip' ? 'Monthly investment (₹)' : 'Loan amount (₹)'}<input type="number" min="1" max="1000000000" value={amount} onChange={e => setAmount(Math.max(1, Math.min(1000000000, Number(e.target.value) || 1)))} /></label>
      <label>Time in years<input type="number" min="1" max="40" value={years} onChange={e => setYears(Math.max(1, Math.min(40, Number(e.target.value) || 1)))} /></label>
      <label>{kind === 'loan' ? 'Annual interest rate (%)' : 'Assumed annual return (%)'}<input type="number" min="0" max="30" step="0.5" value={rate} onChange={e => setRate(Math.max(0, Math.min(30, Number(e.target.value) || 0)))} /></label>
      {kind === 'goal' && <label>Assumed annual inflation (%)<input type="number" min="0" max="15" step="0.5" value={inflation} onChange={e => setInflation(Math.max(0, Math.min(15, Number(e.target.value) || 0)))} /></label>}
    </div><div className="care-result" aria-live="polite"><p>{kind === 'goal' ? 'Estimated monthly investment' : kind === 'sip' ? 'Estimated future value' : 'Estimated monthly EMI'}</p><strong>{money(result)}</strong><p>{kind === 'goal' ? `Inflation-adjusted goal: ${money(goal.futureTarget)}` : kind === 'sip' ? `Total contributions: ${money(amount * years * 12)}` : `Estimated total interest: ${money(result * years * 12 - amount)}`}</p><small>{kind === 'loan' ? 'Monthly reducing-balance estimate. Fees, insurance, floating-rate changes and lender rounding are excluded.' : 'Monthly compounding with contributions at the start of each month. Actual returns vary; taxes, fees and inflation outside the goal adjustment are excluded. This is an estimate, not a promise.'}</small></div></div>
  </section>;
}
