import express from 'express';
import axios from 'axios';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

/**
 * Creates express router for IPO data with Indian API integration,
 * 24-hour strict daily caching ("one request a day"),
 * live market price enrichment via Yahoo Finance,
 * and SQLite persistence.
 */
export const createIpoRouter = (db) => {
  const router = express.Router();

  // Helper to read cache
  const getCachedData = (key) => {
    try {
      const row = db.prepare('SELECT * FROM market_cache WHERE key = ?').get(key);
      if (row && new Date(row.expires_at) > new Date()) {
        return JSON.parse(row.data);
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }
    return null;
  };

  // Helper to set cache with custom TTL
  const setCachedData = (key, data, ttlSeconds) => {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
      db.prepare(`
        INSERT INTO market_cache (key, data, expires_at) 
        VALUES (?, ?, ?) 
        ON CONFLICT(key) DO UPDATE SET 
          data = excluded.data, 
          expires_at = excluded.expires_at, 
          updated_at = CURRENT_TIMESTAMP
      `).run(key, JSON.stringify(data), expiresAt);
    } catch (e) {
      console.error('Cache write error:', e);
    }
  };

  // Helper to log sync status
  const logApiSync = (provider, status, message = '') => {
    try {
      db.prepare('INSERT INTO api_sync_logs (provider, status, message) VALUES (?, ?, ?)').run(provider, status, message);
    } catch (e) {
      console.error('Log sync error:', e);
    }
  };

  // Standardized Data Normalizer for Indian API items
  const normalizeIndianApiIpo = (item) => {
    const symbol = item.symbol || '';
    const name = item.name || 'IPO Company';
    const id = symbol ? symbol.toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const rawStatus = (item.status || 'open').toLowerCase();
    const status = rawStatus === 'active' ? 'open' : rawStatus;

    const minP = Number(item.min_price || 0);
    const maxP = Number(item.max_price || minP);
    const issueP = item.issue_price ? Number(item.issue_price) : (maxP || minP);
    const lot = Number(item.lot_size || item.min_bid_quantity || 0);

    const issueType = item.is_sme ? 'SME' : 'Mainboard';

    const openD = item.bidding_start_date || '';
    const closeD = item.bidding_end_date || '';
    const allotmentD = item.allotment_date || '';
    const refundD = item.refund_date || '';
    const dematD = item.demat_credit_date || '';
    const listingD = item.listing_date || '';

    return {
      id,
      symbol,
      name,
      logoUrl: item.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A2234&color=C5A059`,
      status, // upcoming | open | closed | listed
      issueType, // Mainboard | SME
      exchanges: ['NSE', 'BSE'],
      openDate: openD,
      closeDate: closeD,
      allotmentDate: allotmentD,
      refundDate: refundD,
      dematCreditDate: dematD,
      listingDate: listingD,
      minPrice: minP,
      maxPrice: maxP,
      issuePrice: issueP > 0 ? issueP : undefined,
      lotSize: lot,
      minInvestment: lot * (maxP || minP),
      faceValue: item.face_value ? Number(item.face_value) : undefined,
      issueSizeCr: item.issue_size ? Number(item.issue_size) : undefined,
      freshIssueCr: item.fresh_issue_size ? Number(item.fresh_issue_size) : undefined,
      ofsCr: item.ofs_size ? Number(item.ofs_size) : undefined,
      subscription: {
        qib: item.qib_subscription ? Number(item.qib_subscription) : undefined,
        nii: item.nii_subscription ? Number(item.nii_subscription) : undefined,
        retail: item.retail_subscription ? Number(item.retail_subscription) : undefined,
        employee: item.employee_subscription ? Number(item.employee_subscription) : undefined,
        total: item.total_subscription_rate ? Number(item.total_subscription_rate) : undefined,
        updatedAt: new Date().toISOString()
      },
      listingPrice: item.listing_price ? Number(item.listing_price) : undefined,
      listingGainPercent: item.listing_gains !== null && item.listing_gains !== undefined 
        ? Number(Number(item.listing_gains).toFixed(2)) 
        : ((item.listing_price && issueP) ? Number((((item.listing_price - issueP) / issueP) * 100).toFixed(2)) : undefined),
      currentPrice: item.current_price ? Number(item.current_price) : undefined,
      companyDescription: item.additional_text || item.description || undefined,
      financials: item.financials,
      registrar: item.registrar_name ? { name: item.registrar_name } : (item.registrar ? { name: item.registrar.name } : undefined),
      leadManagers: item.lead_managers || (item.lead_manager ? [item.lead_manager] : undefined),
      documents: {
        drhpUrl: item.document_url || item.drhp_url,
        rhpUrl: item.document_url || item.rhp_url
      }
    };
  };

  // Indian API Fetcher with 24-Hour Cache ("one request a day")
  const fetchFromIndianApi = async () => {
    const cacheKey = 'indian_api_master_ipo';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Serving Indian API IPO data from 24-hour daily cache');
      return cachedData;
    }

    const apiKey = process.env.INDIAN_API_KEY || 'sk-live-LBoaUhnmhsSPCe3J6kof1SQGTGJgWqQoYq87VL3l';
    const endpoints = ['https://stock.indianapi.in/ipo', 'https://dev.indianapi.in/ipo'];

    for (const endpoint of endpoints) {
      try {
        console.log(`Executing once-per-day fetch from Indian API (${endpoint})...`);
        const response = await axios.get(endpoint, {
          headers: {
            'Accept': 'application/json',
            'x-api-key': apiKey
          },
          timeout: 10000
        });

        if (response.data && typeof response.data === 'object') {
          const rawActive = response.data.active || [];
          const rawUpcoming = response.data.upcoming || [];
          const rawClosed = response.data.closed || [];
          const rawListed = response.data.listed || [];
          const rawPreApply = response.data.pre_apply || [];

          const combined = [...rawActive, ...rawUpcoming, ...rawClosed, ...rawListed, ...rawPreApply];
          const normalized = combined.map(normalizeIndianApiIpo);

          // Strictly cache for 24 hours (86,400 seconds = 1 day)
          setCachedData(cacheKey, normalized, 24 * 60 * 60);
          logApiSync('indian_api', 'success', `Fetched ${normalized.length} IPO records (cached for 24h)`);
          return normalized;
        }
      } catch (error) {
        logApiSync('indian_api', 'error', `Indian API fetch failed (${endpoint}): ${error.message}`);
      }
    }
    return null;
  };

  // Fallback dataset in case of complete offline / failure
  const getFallbackDataset = () => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    const dMinus2 = formatDate(new Date(today.getTime() - 2 * 86400000));
    const dMinus5 = formatDate(new Date(today.getTime() - 5 * 86400000));

    return [
      {
        id: 'waaree-energies',
        symbol: 'WAAREE.NS',
        name: 'Waaree Energies Limited',
        logoUrl: 'https://ui-avatars.com/api/?name=Waaree+Energies&background=0D111A&color=C5A059',
        status: 'listed',
        issueType: 'Mainboard',
        exchanges: ['NSE', 'BSE'],
        openDate: '2026-09-20',
        closeDate: '2026-09-23',
        listingDate: dMinus2,
        minPrice: 1427,
        maxPrice: 1503,
        issuePrice: 1503,
        lotSize: 9,
        minInvestment: 13527,
        listingPrice: 2550,
        listingGainPercent: 69.66,
        companyDescription: 'Waaree Energies Limited is India’s largest manufacturer of solar PV modules.'
      },
      {
        id: 'everestims',
        symbol: 'EIMS',
        name: 'EverestIMS Technologies',
        logoUrl: 'https://ui-avatars.com/api/?name=EverestIMS&background=0D111A&color=C5A059',
        status: 'open',
        issueType: 'SME',
        exchanges: ['NSE', 'BSE'],
        openDate: '2026-09-29',
        closeDate: '2026-10-05',
        minPrice: 80,
        maxPrice: 85,
        issuePrice: 85,
        lotSize: 1600,
        minInvestment: 136000,
        subscription: { total: 1.66 }
      }
    ];
  };

  // Master aggregator
  const getAllIpos = async () => {
    const cacheKey = 'all_ipos_master';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    let ipos = await fetchFromIndianApi();

    if (!ipos || ipos.length === 0) {
      ipos = getFallbackDataset();
    }

    // Enrich listed IPOs with live CMP via Yahoo Finance
    const listedSymbols = ipos
      .filter(i => i.status === 'listed' && i.symbol)
      .map(i => i.symbol.includes('.') ? i.symbol : `${i.symbol}.NS`);

    if (listedSymbols.length > 0) {
      try {
        const quotes = await yahooFinance.quote(listedSymbols.slice(0, 30));
        const quoteArray = Array.isArray(quotes) ? quotes : [quotes];
        const quoteMap = new Map();
        quoteArray.forEach(q => {
          if (q && q.symbol) {
            const rawSymbol = q.symbol.replace(/\.NS$/, '').toUpperCase();
            quoteMap.set(rawSymbol, q.regularMarketPrice);
          }
        });

        ipos = ipos.map(ipo => {
          if (ipo.symbol && quoteMap.has(ipo.symbol.toUpperCase())) {
            const cmp = quoteMap.get(ipo.symbol.toUpperCase());
            return { ...ipo, currentPrice: cmp };
          }
          return ipo;
        });
      } catch (err) {
        console.warn('CMP enrichment warning:', err.message);
      }
    }

    // Cache the master dataset for 24 hours (86,400 seconds) to ensure strictly ONE request a day
    setCachedData(cacheKey, ipos, 24 * 60 * 60);
    return ipos;
  };

  // --- Routes ---

  // 1. Get List of IPOs
  router.get('/list', async (req, res) => {
    const { tab = 'all', segment = 'all', exchange = 'all', search = '' } = req.query;

    try {
      const masterList = await getAllIpos();
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Filter by tab
      let filtered = masterList.filter(ipo => {
        const listDate = ipo.listingDate ? new Date(ipo.listingDate) : null;
        const openDate = ipo.openDate ? new Date(ipo.openDate) : null;
        const closeDate = ipo.closeDate ? new Date(ipo.closeDate) : null;

        if (tab === 'upcoming') {
          if (ipo.status === 'upcoming') return true;
          if (openDate && openDate > today && ipo.status !== 'listed') return true;
          return false;
        }

        if (tab === 'open') {
          if (ipo.status === 'open') return true;
          if (openDate && closeDate && openDate <= today && closeDate >= today && ipo.status !== 'listed') return true;
          return false;
        }

        if (tab === 'closed') {
          if (ipo.status === 'closed') return true;
          if (closeDate && closeDate < today && (!listDate || listDate > today) && ipo.status !== 'listed') return true;
          return false;
        }

        if (tab === 'listed_7days') {
          // Listed in last 7 calendar days: today - 7 days <= listing_date <= today
          if (!listDate) return false;
          return listDate >= sevenDaysAgo && listDate <= today;
        }

        return true; // 'all'
      });

      // Filter by segment (Mainboard vs SME)
      if (segment !== 'all') {
        filtered = filtered.filter(i => i.issueType.toLowerCase() === segment.toLowerCase());
      }

      // Filter by exchange (NSE vs BSE)
      if (exchange !== 'all') {
        filtered = filtered.filter(i => 
          Array.isArray(i.exchanges) && i.exchanges.some(e => e.toLowerCase() === exchange.toLowerCase())
        );
      }

      // Search by company name or symbol
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(i => 
          i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q)
        );
      }

      res.json(filtered);
    } catch (error) {
      console.error('IPO list error:', error);
      res.status(500).json({ error: 'Failed to fetch IPO data' });
    }
  });

  // 2. Get Single IPO Details
  router.get('/details/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const masterList = await getAllIpos();
      const detail = masterList.find(i => i.id === id || i.symbol?.toLowerCase() === id.toLowerCase());

      if (!detail) {
        return res.status(404).json({ error: 'IPO not found' });
      }

      // Enrich CMP if listed
      if (detail.status === 'listed' && detail.symbol && !detail.currentPrice) {
        try {
          const sym = detail.symbol.includes('.') ? detail.symbol : `${detail.symbol}.NS`;
          const quote = await yahooFinance.quote(sym);
          if (quote && quote.regularMarketPrice) {
            detail.currentPrice = quote.regularMarketPrice;
          }
        } catch (e) {
          // ignore
        }
      }

      res.json(detail);
    } catch (error) {
      console.error('IPO detail error:', error);
      res.status(500).json({ error: 'Failed to fetch IPO detail' });
    }
  });

  // 3. Get IPO Summary Stats
  router.get('/stats', async (req, res) => {
    try {
      const masterList = await getAllIpos();
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const stats = {
        upcoming: 0,
        open: 0,
        closed: 0,
        listed7Days: 0,
        total: masterList.length
      };

      masterList.forEach(ipo => {
        const listDate = ipo.listingDate ? new Date(ipo.listingDate) : null;
        const openDate = ipo.openDate ? new Date(ipo.openDate) : null;
        const closeDate = ipo.closeDate ? new Date(ipo.closeDate) : null;

        if (ipo.status === 'upcoming' || (openDate && openDate > today && ipo.status !== 'listed')) {
          stats.upcoming++;
        }
        if (ipo.status === 'open' || (openDate && closeDate && openDate <= today && closeDate >= today && ipo.status !== 'listed')) {
          stats.open++;
        }
        if (ipo.status === 'closed' || (closeDate && closeDate < today && (!listDate || listDate > today) && ipo.status !== 'listed')) {
          stats.closed++;
        }
        if (listDate && listDate >= sevenDaysAgo && listDate <= today) {
          stats.listed7Days++;
        }
      });

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch IPO stats' });
    }
  });

  return router;
};
