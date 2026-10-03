import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';

type DisclaimerProps = {
  variant?: 'default' | 'compact' | 'screener';
};

export default function RegulatoryDisclaimer({ variant = 'default' }: DisclaimerProps) {
  if (variant === 'compact') {
    return (
      <div className="v1-disclaimer-compact">
        <AlertTriangle size={15} className="v1-disclaimer-compact__icon" />
        <span>
          <strong>Regulatory Notice:</strong> Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully before investing. Financial calculations & market data are powered by TradingView for educational reference. AMFI-registered Distributor (ARN-184920) & Motilal Oswal Sub-Broker Franchise (8+ Yrs).
        </span>
      </div>
    );
  }

  return (
    <div className="v1-disclaimer-card" role="region" aria-label="Regulatory and research disclaimer">
      <div className="v1-disclaimer-card__header">
        <div className="v1-disclaimer-card__badge">
          <ShieldCheck size={16} />
          <span>REGULATORY NOTICE & EDUCATIONAL DISCLAIMER</span>
        </div>
        <span className="v1-disclaimer-card__arn">AMFI ARN-184920 · MOTILAL OSWAL SUB-BROKER FRANCHISE</span>
      </div>

      <div className="v1-disclaimer-card__grid">
        <div className="v1-disclaimer-card__item">
          <div className="v1-disclaimer-card__title">
            <Info size={14} />
            <strong>Educational & Data Usage</strong>
          </div>
          <p>
            Stock market data, price charts, financial indicators, and company metrics are supplied by TradingView for research purposes. Information presented here does not constitute stock tips or binding financial advice.
          </p>
        </div>

        <div className="v1-disclaimer-card__item">
          <div className="v1-disclaimer-card__title">
            <AlertTriangle size={14} />
            <strong>Market Risk Warning</strong>
          </div>
          <p>
            Mutual Funds, equity investments, and security trades are subject to market risks. Past performance does not guarantee future results. Clients are advised to evaluate scheme prospectuses and risk horizons carefully.
          </p>
        </div>

        <div className="v1-disclaimer-card__item">
          <div className="v1-disclaimer-card__title">
            <ShieldCheck size={14} />
            <strong>No Guaranteed Returns</strong>
          </div>
          <p>
            AVC Dhanam Solutions Pvt. Ltd. does not offer fixed or guaranteed return schemes. Financing facilities are subject to lender approvals across our 210+ Bank & NBFC partner network based on borrower eligibility.
          </p>
        </div>
      </div>
    </div>
  );
}
