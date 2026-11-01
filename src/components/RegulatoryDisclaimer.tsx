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
          <strong>Regulatory Notice:</strong> Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully before investing. Calculators provide estimates using stated assumptions. TradingView supplies embedded widgets only. Check provider registration and terms before proceeding.
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
        <span className="v1-disclaimer-card__arn">CHECK PROVIDER REGISTRATION AND PRODUCT DOCUMENTS</span>
      </div>

      <div className="v1-disclaimer-card__grid">
        <div className="v1-disclaimer-card__item">
          <div className="v1-disclaimer-card__title">
            <Info size={14} />
            <strong>Educational & Data Usage</strong>
          </div>
          <p>
            Embedded market widgets are supplied by TradingView. Other figures identify their source separately. Data may be delayed or unavailable; confirm prices with the exchange or provider before acting. Information presented here does not constitute stock tips or binding financial advice.
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
            AVC Dhanam Solutions Pvt. Ltd. does not offer fixed or guaranteed return schemes. Loans are subject to lender approval and borrower eligibility. Insurance is subject to underwriting and policy conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
