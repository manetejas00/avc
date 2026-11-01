import MutualFundExplorer from './MutualFundExplorer';
export default function ServiceDetails({ service }: { service: string }) {
  if (service === 'Investment & Wealth Services') return <div className="service-learning">
    <h3>Understand the choices</h3>
    <dl>
      <dt>Wealth management</dt><dd>Start with your goals, emergency savings, time horizon and existing commitments. Ask what service is available, who provides it and how they are paid.</dd>
      <dt>Stocks</dt><dd>Shares represent ownership in a company. Prices can fall sharply. Ask about demat and trading account requirements, brokerage and the registered intermediary. Avoid acting on tips.</dd>
      <dt>Mutual funds and SIPs</dt><dd>A fund pools money to invest in securities. A SIP spreads payments over time; it does not remove market risk. Check the plan, option, costs, riskometer and exit load. Complete the provider’s KYC process before investing.</dd>
      <dt>PMS and AIF</dt><dd>Portfolio Management Services and Alternative Investment Funds have specific eligibility, minimum investment and fee requirements. Capital loss, concentration and lock-in risks may apply. Confirm availability and current eligibility with the registered provider; no AVC provider relationship is asserted here.</dd>
      <dt>Pre-IPO and unlisted shares</dt><dd>These shares are not exchange-traded. Pricing, ownership checks and transfers can be difficult. An IPO or exit may never happen. Ask for provider details, eligibility and transfer restrictions before considering them.</dd>
      <dt>IPOs</dt><dd>Read the exchange notice and offer document. Allotment and listing gains are not guaranteed. A small, manually reviewed list is available on our IPO page. <a href="/ipo">View checked IPOs</a>. <a href="https://www.nseindia.com/market-data/all-upcoming-issues-ipo" target="_blank" rel="noreferrer">Check NSE notices</a>.</dd>
    </dl><MutualFundExplorer />
  </div>;
  if (service === 'Loans & Business Financing' || service === 'Business Funding') return <div className="service-learning"><h3>Document checklist</h3><dl>
    <dt>Salaried applicants</dt><dd>Identity and address proof, recent salary slips, bank statements and Form 16, as requested by the lender.</dd>
    <dt>Self-employed applicants</dt><dd>KYC, income-tax returns, bank statements and proof of profession or business.</dd>
    <dt>Businesses</dt><dd>Registration documents, financial statements, tax returns, GST records where applicable, bank statements and a business profile or project report.</dd>
  </dl><p>Document requirements and statement periods differ by lender. Ask for a written checklist. Do not upload documents here. Compare the annual percentage rate, fees, security, penalties and repayment schedule. Approval is not guaranteed.</p></div>;
  return <div className="service-learning"><h3>Your next step</h3><p>Call or WhatsApp to explain what you need. Ask for the provider’s name, eligibility, documents, charges and written terms. Confirm availability before sharing documents or making a payment.</p></div>;
}
