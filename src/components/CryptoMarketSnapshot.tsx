import { RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getCryptoSnapshot, type CryptoSnapshot } from '../services/cryptoService';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const compactCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });

export default function CryptoMarketSnapshot() {
  const [snapshot, setSnapshot] = useState<CryptoSnapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const load = useCallback(async (signal?: AbortSignal) => {
    setStatus('loading');
    try {
      setSnapshot(await getCryptoSnapshot(signal));
      setStatus('success');
    } catch (error) {
      if (signal?.aborted) return;
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return <section id="crypto" className="bg-background py-section-mobile md:py-section">
    <div className="container-custom">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow mb-4">Market intelligence</p><h2 className="mb-2">Crypto Market Snapshot</h2><p className="max-w-2xl text-text-muted">A focused view of major digital assets alongside the broader market.</p></div>
        <button type="button" onClick={() => void load()} disabled={status === 'loading'} className="btn-secondary inline-flex items-center justify-center gap-2 !px-5 !py-3 text-sm disabled:opacity-60"><RefreshCw size={16} className={status === 'loading' ? 'animate-spin' : ''} />Refresh</button>
      </div>
      {status === 'loading' && !snapshot ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-card border border-white/5 bg-surface" />)}</div> : null}
      {status === 'error' && !snapshot ? <div className="rounded-card border border-white/10 bg-surface p-8 text-center"><p className="text-text-muted">Unable to load crypto market information right now.</p><button type="button" onClick={() => void load()} className="mt-4 text-sm font-semibold text-gold-secondary hover:underline">Try again</button></div> : null}
      {snapshot ? <><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{snapshot.coins.map((coin) => {
        const positive = (coin.change24h ?? 0) >= 0;
        return <article key={coin.id} className="card-premium p-5"><div className="mb-6 flex items-center gap-3">{coin.image ? <img src={coin.image} alt="" width="40" height="40" loading="lazy" className="h-10 w-10 rounded-full bg-surface-elevated" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-primary/15 text-sm font-bold text-gold-secondary">{coin.symbol.slice(0, 1)}</div>}<div><h3 className="font-semibold text-text">{coin.name}</h3><p className="text-xs font-medium uppercase tracking-wide text-text-muted">{coin.symbol}{coin.rank ? ` · #${coin.rank}` : ''}</p></div></div><p className="text-2xl font-semibold text-text">{currency.format(coin.priceUsd)}</p><div className="mt-3 flex items-center justify-between text-sm"><span className={positive ? 'inline-flex items-center gap-1 font-semibold text-green-primary' : 'inline-flex items-center gap-1 font-semibold text-red-400'}>{positive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}{coin.change24h === null ? '—' : `${Math.abs(coin.change24h).toFixed(2)}%`}</span><span className="text-xs text-text-muted">24h</span></div><p className="mt-5 border-t border-white/5 pt-4 text-xs text-text-muted">Market cap {coin.marketCapUsd === null ? '—' : compactCurrency.format(coin.marketCapUsd)}</p></article>;
      })}</div><p className="mt-5 text-center text-xs text-text-muted">{snapshot.stale ? 'Showing the most recently cached data.' : `Updated ${new Date(snapshot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`} Data from {snapshot.provider}. For informational purposes only; not investment advice.</p></> : null}
    </div>
  </section>;
}
