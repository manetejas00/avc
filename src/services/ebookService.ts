export interface EBook {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  authorTitle: string;
  shortDescription: string;
  fullDescription: string;
  category: 'Stock Market' | 'Fundamental Analysis' | 'Technical Analysis' | 'Investing' | 'Portfolio Management' | 'Risk Management';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  pages: number;
  format: string;
  originalPrice: number;
  sellingPrice: number;
  discountPercent: number;
  badge?: 'Bestseller' | 'Featured' | 'Popular' | 'Advanced' | 'Hot';
  rating: number;
  reviewsCount: number;
  publishedYear: string;
  coverGradient: string;
  coverAccent: string;
  coverIcon: 'trending' | 'chart' | 'book' | 'pie' | 'shield' | 'zap';
  tableOfContents: { chapter: string; title: string; summary: string }[];
  whatYouWillLearn: string[];
  sampleExcerpt: { chapterTitle: string; content: string[] };
  tags: string[];
}

export const EBOOKS_DATA: EBook[] = [
  {
    id: 'ebook-1',
    slug: 'stock-market-beginners-playbook',
    title: 'Mastering the Stock Market: A Beginner\'s Playbook',
    subtitle: 'Step-by-step roadmap to understanding NSE/BSE, Demat accounts, key ratios, and your first investments in India.',
    author: 'Chandresh Pandey & AVC Research Desk',
    authorTitle: 'Director & Financial Strategist, AVC Dhanam',
    shortDescription: 'The complete foundational guide to navigating Indian stock exchanges, trading mechanisms, demat accounts, and market psychology.',
    fullDescription: 'Master the core mechanics of the Indian stock market without getting overwhelmed by jargon. Written specifically for retail investors in India, this handbook breaks down NSE/BSE operations, index calculation, Demat/Trading account setup, order execution types, and financial ratios. Learn how to identify quality businesses early, build an emotion-free investment plan, and avoid common beginner traps.',
    category: 'Stock Market',
    difficulty: 'Beginner',
    language: 'English',
    pages: 148,
    format: 'PDF Digital Edition',
    originalPrice: 1299,
    sellingPrice: 499,
    discountPercent: 62,
    badge: 'Bestseller',
    rating: 4.9,
    reviewsCount: 342,
    publishedYear: '2026',
    coverGradient: 'from-amber-700 via-amber-900 to-black',
    coverAccent: '#D4AF37',
    coverIcon: 'trending',
    tags: ['Stock Market', 'Beginner', 'Investing', 'NSE', 'BSE', 'Demat'],
    whatYouWillLearn: [
      'Understanding NSE, BSE, Nifty 50, and Sensex market dynamics',
      'Demat and Trading account setup with regulatory safety guidelines',
      'Order types demystified: Market, Limit, Stop-Loss, and AMO orders',
      'Core financial ratios: P/E Ratio, P/B Ratio, EPS, and Dividend Yield',
      'Avoiding the top 10 retail investor traps and penny stock scams',
      'Building a disciplined 30-day personal stock investing roadmap'
    ],
    tableOfContents: [
      { chapter: 'Chapter 1', title: 'Introduction to Indian Financial Markets', summary: 'Structure of Indian capital markets, SEBI regulations, and primary vs secondary markets.' },
      { chapter: 'Chapter 2', title: 'How Stock Exchanges Work (NSE & BSE)', summary: 'Order matching engines, trading hours, indices calculation, and settlement cycles (T+1).' },
      { chapter: 'Chapter 3', title: 'Demat Accounts & Trade Execution', summary: 'Choosing a depository participant (CDSL/NSDL), placing orders, and brokerage costs.' },
      { chapter: 'Chapter 4', title: 'Essential Stock Metrics Demystified', summary: 'Decoding P/E, P/B, Market Cap, Debt-to-Equity, ROCE, and Dividend Yield.' },
      { chapter: 'Chapter 5', title: 'Psychology of Successful Investors', summary: 'Managing fear, greed, FOMO, and emotional discipline in volatile markets.' },
      { chapter: 'Chapter 6', title: 'Your 30-Day Actionable Investment Blueprint', summary: 'Step-by-step checklist to start investing systematically with initial capital.' }
    ],
    sampleExcerpt: {
      chapterTitle: 'Chapter 1: Equities & Ownership Fundamentals',
      content: [
        'When you purchase a share of a publicly listed company on the National Stock Exchange (NSE) or Bombay Stock Exchange (BSE), you are acquiring genuine fractional ownership in that enterprise. Equity ownership grants you two fundamental rights: participation in the company\'s capital growth over time, and a proportional share of corporate profits distributed as cash dividends.',
        'Many beginners approach the stock market as a high-frequency trading arena or a short-term speculation platform. However, history demonstrates that sustainable wealth is created when investors treat stock certificates as real business ownership. Over 10 to 20-year horizons, stock price performance closely mirrors corporate earnings growth.',
        'In India, the Securities and Exchange Board of India (SEBI) enforces stringent compliance standards for listed companies, ensuring transparency, quarterly financial disclosures, and protection for retail investor funds.'
      ]
    }
  },
  {
    id: 'ebook-2',
    slug: 'fundamental-analysis-blueprint',
    title: 'The Ultimate Fundamental Analysis Blueprint',
    subtitle: 'Learn to evaluate balance sheets, cash flows, economic moats, and intrinsic valuation like a professional equity analyst.',
    author: 'Ajay Pandey & SEBI Registered Advisory Team',
    authorTitle: 'Director & Portfolio Advisory Lead, AVC Dhanam',
    shortDescription: 'Decode annual reports, balance sheets, P&L accounts, cash flows, and intrinsic valuation metrics to spot multi-bagger stocks.',
    fullDescription: 'Discover how institutional equity research analysts evaluate Indian companies before committing capital. This practical blueprint teaches you how to read corporate financial statements, spot red flags in auditor reports, measure economic moats, and calculate intrinsic stock values using Discounted Cash Flow (DCF) and Relative Valuation models.',
    category: 'Fundamental Analysis',
    difficulty: 'Intermediate',
    language: 'English',
    pages: 210,
    format: 'PDF Digital Edition',
    originalPrice: 1999,
    sellingPrice: 799,
    discountPercent: 60,
    badge: 'Featured',
    rating: 4.8,
    reviewsCount: 218,
    publishedYear: '2026',
    coverGradient: 'from-emerald-800 via-slate-900 to-black',
    coverAccent: '#10b981',
    coverIcon: 'chart',
    tags: ['Fundamental Analysis', 'Investing', 'Valuation', 'Balance Sheet', 'Financial Analysis'],
    whatYouWillLearn: [
      'Deconstructing Profit & Loss, Balance Sheets, and Cash Flow Statements',
      'Assessing Return on Capital Employed (ROCE) and Return on Equity (ROE)',
      'Detecting corporate accounting red flags, aggressive revenue, and related-party deals',
      'Measuring Economic Moats (Network effects, cost advantages, high switching costs)',
      'Calculating intrinsic valuation using DCF, P/E multiples, and EV/EBITDA',
      'Analyzing major Indian sectors: Banking & NBFC, IT, Auto, Pharma, FMCG'
    ],
    tableOfContents: [
      { chapter: 'Chapter 1', title: 'Foundations of Business Evaluation', summary: 'Differentiating great businesses from speculative stocks.' },
      { chapter: 'Chapter 2', title: 'Deconstructing the Financial Triad', summary: 'Deep dive into P&L, Balance Sheet assets/liabilities, and Operating Cash Flow.' },
      { chapter: 'Chapter 3', title: 'Forensic Accounting & Red Flag Detection', summary: 'Spotting cooked books, promoter pledged shares, and inventory inflating tricks.' },
      { chapter: 'Chapter 4', title: 'Evaluating Economic Moats in Indian Markets', summary: 'Brand moats, regulatory moats, pricing power, and distribution scale.' },
      { chapter: 'Chapter 5', title: 'Valuation Methodologies Explained', summary: 'Mastering DCF, P/E vs Growth (PEG ratio), and Sum of the Parts (SOTP).' },
      { chapter: 'Chapter 6', title: 'Real-World Case Studies of Indian Multi-baggers', summary: 'Dissecting past 100x wealth creators in the Indian stock market.' }
    ],
    sampleExcerpt: {
      chapterTitle: 'Chapter 2: The Primacy of Operating Cash Flow',
      content: [
        'Net Profit reported on an Income Statement is an accounting construct governed by accrual rules. Revenue can be booked before cash is collected, and expenses can be capitalized. However, Operating Cash Flow (OCF) represents actual bank balance inflows generated from core business operations.',
        'A company reporting rising net profits alongside stagnant or negative operating cash flow for consecutive years is a classic financial red flag. In Indian corporate history, numerous companies presented booming earnings on paper while burning cash in reality, eventually ending in liquidity crises.',
        'Always calculate the OCF/PAT ratio over a 5-year rolling period. Healthy, high-moat businesses consistently display an OCF/PAT ratio greater than 0.8 to 1.0, indicating high earnings quality.'
      ]
    }
  },
  {
    id: 'ebook-3',
    slug: 'technical-analysis-price-action',
    title: 'Technical Analysis & Price Action Trading Secrets',
    subtitle: 'Master candlestick structures, trendlines, momentum indicators, and risk-reward setups for swing and positional trading.',
    author: 'AVC Technical Research Desk',
    authorTitle: 'Quantitative & Technical Analysis Division',
    shortDescription: 'Uncover market trends, support/resistance zones, breakout patterns, RSI, MACD, and high-probability trading setups.',
    fullDescription: 'Stop trading on rumors and emotional impulses. This comprehensive technical analysis guide equips you with clean price action methodologies, candlestick confirmation patterns, chart structures (Head & Shoulders, Flags, Cup & Handle), and trend indicators. Learn how to structure low-risk, high-reward swing trades with mechanical stop-loss discipline.',
    category: 'Technical Analysis',
    difficulty: 'Intermediate',
    language: 'English',
    pages: 185,
    format: 'PDF Digital Edition',
    originalPrice: 1799,
    sellingPrice: 699,
    discountPercent: 61,
    badge: 'Bestseller',
    rating: 4.9,
    reviewsCount: 289,
    publishedYear: '2026',
    coverGradient: 'from-blue-900 via-slate-950 to-black',
    coverAccent: '#3b82f6',
    coverIcon: 'zap',
    tags: ['Technical Analysis', 'Stock Market', 'Price Action', 'Trading', 'Candlesticks'],
    whatYouWillLearn: [
      'High-probability Candlestick Patterns: Bullish Engulfing, Hammer, Morning Star',
      'Identifying major Support, Resistance, Trendlines, and Supply/Demand Zones',
      'Classic Chart Patterns: Double Bottom, Cup & Handle, Ascending Triangle',
      'Using RSI divergence, MACD crossovers, Moving Averages, and Volume spikes',
      'Structuring risk-reward ratios (1:2 and 1:3) with tight stop-loss rules',
      'Developing a mechanical daily trading checklist for Nifty & Midcap stocks'
    ],
    tableOfContents: [
      { chapter: 'Chapter 1', title: 'Philosophy of Price Action & Dow Theory', summary: 'Understanding supply/demand imbalance, market cycles, and trends.' },
      { chapter: 'Chapter 2', title: 'Mastering Japanese Candlesticks', summary: 'Single, double, and triple candlestick reversal and continuation patterns.' },
      { chapter: 'Chapter 3', title: 'Support, Resistance & Volume Confluence', summary: 'Mapping key institutional liquidity zones on daily & weekly charts.' },
      { chapter: 'Chapter 4', title: 'Essential Technical Indicators', summary: 'Exponential Moving Averages (20/50/200 EMA), RSI, MACD, and VWAP.' },
      { chapter: 'Chapter 5', title: 'Breakout & Pullback Trading Strategies', summary: 'Filtering false breakouts and entering high-probability retests.' },
      { chapter: 'Chapter 6', title: 'Position Sizing & Risk Management System', summary: 'Calculating exact lot sizes to protect equity capital.' }
    ],
    sampleExcerpt: {
      chapterTitle: 'Chapter 1: The Core Premise of Technical Analysis',
      content: [
        'Technical analysis rests on three fundamental assumptions: market action discounts everything, price moves in trends, and history tends to repeat itself. Every known fundamental fact, macroeconomic report, corporate result, and investor sentiment is instantly reflected in price action.',
        'Instead of attempting to predict news headlines, technical traders analyze price charts to identify institutional accumulation and distribution. When large institutional buyers (FIIs and DIIs) build positions in a stock, their footsteps leave distinct volume and price footprints.',
        'The primary goal of price action trading is not to predict the future with 100% certainty, but to execute trades where the potential reward significantly outweighs the quantified risk.'
      ]
    }
  },
  {
    id: 'ebook-4',
    slug: 'long-term-wealth-creation-compounding',
    title: 'Long-Term Wealth Creation & Compounding Secrets',
    subtitle: 'Strategic guide to building multi-generational wealth through equity SIPs, compounding, sector rotation, and patience.',
    author: 'Chandresh Pandey',
    authorTitle: 'Managing Director, AVC Dhanam Solutions',
    shortDescription: 'Discover how systematic investing, compounding returns, asset allocation, and disciplined long-term holding build multi-crore wealth.',
    fullDescription: 'Unlocking massive wealth in the Indian stock market does not require day trading or timing every market bottom. This book reveals the compounding framework that transforms modest monthly SIPs and equity portfolios into multi-crore wealth over 10 to 20 years. Learn how to pick long-term mega-trend winners and maintain psychological fortitude through bear markets.',
    category: 'Investing',
    difficulty: 'Beginner',
    language: 'English',
    pages: 160,
    format: 'PDF Digital Edition',
    originalPrice: 1499,
    sellingPrice: 599,
    discountPercent: 60,
    badge: 'Featured',
    rating: 4.9,
    reviewsCount: 412,
    publishedYear: '2026',
    coverGradient: 'from-amber-900 via-stone-900 to-black',
    coverAccent: '#f59e0b',
    coverIcon: 'book',
    tags: ['Investing', 'Long-Term', 'Wealth Creation', 'SIP', 'Compounding', 'Beginner'],
    whatYouWillLearn: [
      'The Mathematics of Compounding & Rule of 72 in real life',
      'Structuring Core-Satellite Portfolios (Mutual Funds + Direct Equities)',
      'Capitalizing on India\'s Economic Mega-Trends: Energy, Infra, Banking',
      'Overcoming emotional biases: Fear of market crashes & greedy FOMO',
      'Tax-efficient asset allocation and Long-Term Capital Gains (LTCG) planning',
      'Designing a 15-year retirement and financial freedom roadmap'
    ],
    tableOfContents: [
      { chapter: 'Chapter 1', title: 'The Power of Compounding in Indian Markets', summary: 'Why time in the market beats timing the market every single time.' },
      { chapter: 'Chapter 2', title: 'Designing Your Wealth Portfolio', summary: 'Core-satellite allocation model balancing stability and high growth.' },
      { chapter: 'Chapter 3', title: 'Identifying India\'s Next Growth Drivers', summary: 'Evaluating high-growth sectors for the next decade.' },
      { chapter: 'Chapter 4', title: 'Behavioral Finance & Investor Mindset', summary: 'Eliminating emotional errors during market corrections and panics.' },
      { chapter: 'Chapter 5', title: 'Rebalancing & Tax Optimization', summary: 'Periodic portfolio rebalancing without incurring unnecessary LTCG taxes.' },
      { chapter: 'Chapter 6', title: 'The 20-Year Multi-Crore Blueprint', summary: 'Practical step-by-step model for compounding wealth across life stages.' }
    ],
    sampleExcerpt: {
      chapterTitle: 'Chapter 1: The Exponential Curve of Wealth',
      content: [
        'Albert Einstein famously called compounding the eighth wonder of the world. In equity investing, compounding is non-linear. During the first 5 to 7 years of a systematic investment plan, portfolio growth may appear slow or modest because capital returns dominate interest earned.',
        'However, as you enter years 10, 15, and 20, accumulated compounding gains dwarf total principal invested. A monthly SIP of ₹15,000 compounding at 14% CAGR grows to approximately ₹20 Lakhs in 7 years, but balloons to over ₹1 Crore in 17 years.',
        'The greatest barrier to long-term wealth creation is not poor stock selection—it is the inability of investors to sit quietly during temporary 15-20% market corrections.'
      ]
    }
  },
  {
    id: 'ebook-5',
    slug: 'portfolio-risk-management-playbook',
    title: 'Portfolio & Risk Management Playbook',
    subtitle: 'Institutional risk management models, asset allocation frameworks, drawdown protection, and rebalancing methodologies.',
    author: 'AVC Wealth Advisory Desk',
    authorTitle: 'Asset Allocation & Portfolio Advisory Division',
    shortDescription: 'Protect your capital while maximizing risk-adjusted returns using institutional portfolio allocation and drawdown risk controls.',
    fullDescription: 'True investment success is not measured solely by returns, but by risk-adjusted performance and capital preservation during market downturns. This playbook teaches retail and HNI investors how to build resilient multi-asset portfolios across Equities, Fixed Income, Gold, and Cash buffers, implementing strict position sizing and drawdown stop rules.',
    category: 'Portfolio Management',
    difficulty: 'Advanced',
    language: 'English',
    pages: 172,
    format: 'PDF Digital Edition',
    originalPrice: 1899,
    sellingPrice: 749,
    discountPercent: 61,
    badge: 'Popular',
    rating: 4.8,
    reviewsCount: 175,
    publishedYear: '2026',
    coverGradient: 'from-purple-900 via-slate-950 to-black',
    coverAccent: '#a855f7',
    coverIcon: 'pie',
    tags: ['Portfolio Management', 'Risk Management', 'Asset Allocation', 'Drawdown Control', 'Investing'],
    whatYouWillLearn: [
      'Modern Portfolio Theory & Sharpe Ratio optimization for retail investors',
      'Controlling stock concentration risk (Setting 5-8% individual stock limits)',
      'Multi-asset allocation strategies: Equities, Debt Funds, Gold, and Cash',
      'Drawdown protection protocols during black swan events and bear markets',
      'Rebalancing triggers: Calendar-based vs Dynamic Band-based rebalancing',
      'Auditing your portfolio health with quarterly risk metrics'
    ],
    tableOfContents: [
      { chapter: 'Chapter 1', title: 'Principles of Risk-Adjusted Returns', summary: 'Understanding volatility, downside risk, and maximum drawdown.' },
      { chapter: 'Chapter 2', title: 'Asset Allocation Matrix', summary: 'Structuring portfolios tailored to risk tolerance, age, and horizon.' },
      { chapter: 'Chapter 3', title: 'Position Sizing & Concentration Guardrails', summary: 'Preventing single stock blowups from damaging overall portfolio net worth.' },
      { chapter: 'Chapter 4', title: 'Navigating Market Crashes & Black Swans', summary: 'Cash buffer deployment and tactical rebalancing during panics.' },
      { chapter: 'Chapter 5', title: 'Tax-Smart Portfolio Rebalancing', summary: 'Maintaining optimal asset weightings efficiently.' },
      { chapter: 'Chapter 6', title: 'Institutional Portfolio Audit Checklist', summary: 'Step-by-step template to audit stock holding quality quarterly.' }
    ],
    sampleExcerpt: {
      chapterTitle: 'Chapter 1: Defining True Investment Risk',
      content: [
        'In corporate finance textbooks, risk is frequently defined as standard deviation or price volatility. However, for a long-term investor, short-term stock price fluctuations are not real risk. True investment risk is the permanent loss of capital or the failure to achieve critical life financial goals.',
        'A single stock holding that constitutes 25% or 30% of your portfolio presents catastrophic concentration risk. If that company faces fraud, technological disruption, or regulatory penalties, your total wealth sustains irreparable damage.',
        'Enforcing maximum position limits (typically no single stock exceeding 5% to 8% of total portfolio value) guarantees that even if a stock goes to zero, your portfolio survives to compound another day.'
      ]
    }
  },
  {
    id: 'ebook-6',
    slug: 'option-trading-risk-hedging-handbook',
    title: 'Option Trading & Risk Hedging Handbook',
    subtitle: 'Professional guide to Options Greeks, Covered Calls, Defined Spreads, and Index Hedging techniques for Nifty & Bank Nifty.',
    author: 'AVC Derivative Desk',
    authorTitle: 'Derivatives & Hedging Research Desk',
    shortDescription: 'Master Option Greeks, non-directional option selling, defined-risk spreads, and portfolio insurance against sudden market crashes.',
    fullDescription: 'Derivatives can either be dangerous gambling tools or high-precision risk mitigation instruments. This guide covers option pricing, Option Greeks (Delta, Theta, Vega, Gamma), income generation strategies (Covered Calls, Bull Put Spreads), and tactical portfolio hedging using Nifty Index options.',
    category: 'Risk Management',
    difficulty: 'Advanced',
    language: 'English',
    pages: 225,
    format: 'PDF Digital Edition',
    originalPrice: 2499,
    sellingPrice: 999,
    discountPercent: 60,
    badge: 'Advanced',
    rating: 4.7,
    reviewsCount: 156,
    publishedYear: '2026',
    coverGradient: 'from-rose-950 via-slate-900 to-black',
    coverAccent: '#f43f5e',
    coverIcon: 'shield',
    tags: ['Risk Management', 'Options', 'Hedging', 'Technical Analysis', 'Trading'],
    whatYouWillLearn: [
      'Option Pricing Mechanics & Implied Volatility (IV / IV Rank)',
      'Demystifying Option Greeks: Delta, Gamma, Theta, Vega, and Rho',
      'High-probability income strategies: Covered Call and Bull Put Spreads',
      'Hedging cash equity portfolios against market crashes using Nifty Puts',
      'Strict margin management, stop-loss rules, and position sizing',
      'Building a disciplined derivative trading log & risk management discipline'
    ],
    tableOfContents: [
      { chapter: 'Chapter 1', title: 'Foundations of Options & Derivatives', summary: 'Call options, put options, strike prices, and expiry cycles in India.' },
      { chapter: 'Chapter 2', title: 'Mastering the Option Greeks', summary: 'Understanding Delta sensitivity, Theta decay, and Vega volatility shifts.' },
      { chapter: 'Chapter 3', title: 'Defined-Risk Option Income Strategies', summary: 'Credit spreads, Iron Condors, and Covered Calls.' },
      { chapter: 'Chapter 4', title: 'Hedging Cash Portfolios Against Market Downside', summary: 'Calculating exact Put contract requirements to protect equity portfolios.' },
      { chapter: 'Chapter 5', title: 'Capital Protection & Risk Discipline', summary: 'Position sizing guardrails and eliminating leverage risks.' }
    ],
    sampleExcerpt: {
      chapterTitle: 'Chapter 1: Options as Insurance Policies',
      content: [
        'At its core, an option is a financial derivative contract that grants the buyer the right, but not the obligation, to buy or sell an underlying asset at a specified strike price before a specified expiration date.',
        'Purchasing a Put option on Nifty 50 acts identically to purchasing comprehensive insurance on your car. If the market crashes by 15%, the surge in your Put option value offsets the paper losses in your cash equity portfolio.',
        'When used strategically for risk hedging rather than unhedged speculative gambling, options provide unprecedented portfolio stability during volatile market regimes.'
      ]
    }
  }
];

export const ALL_CATEGORIES = [
  'All',
  'Beginner',
  'Investing',
  'Stock Market',
  'Fundamental Analysis',
  'Technical Analysis',
  'Portfolio Management',
  'Risk Management'
] as const;

export type FilterCategory = typeof ALL_CATEGORIES[number];

export function getEBooks(params?: {
  search?: string;
  category?: FilterCategory;
  difficulty?: 'All' | 'Beginner' | 'Intermediate' | 'Advanced';
}): EBook[] {
  let list = [...EBOOKS_DATA];

  if (!params) return list;

  const { search, category, difficulty } = params;

  if (category && category !== 'All') {
    const catLower = category.toLowerCase();
    if (catLower === 'beginner') {
      list = list.filter(b => b.difficulty.toLowerCase() === 'beginner' || b.tags.some(t => t.toLowerCase() === 'beginner'));
    } else if (catLower === 'investing') {
      list = list.filter(b => b.category === 'Investing' || b.tags.some(t => t.toLowerCase() === 'investing'));
    } else if (catLower === 'stock market') {
      list = list.filter(b => b.category === 'Stock Market' || b.tags.some(t => t.toLowerCase() === 'stock market'));
    } else if (catLower === 'fundamental analysis') {
      list = list.filter(b => b.category === 'Fundamental Analysis' || b.tags.some(t => t.toLowerCase() === 'fundamental analysis'));
    } else if (catLower === 'technical analysis') {
      list = list.filter(b => b.category === 'Technical Analysis' || b.tags.some(t => t.toLowerCase() === 'technical analysis'));
    } else if (catLower === 'portfolio management') {
      list = list.filter(b => b.category === 'Portfolio Management' || b.tags.some(t => t.toLowerCase() === 'portfolio management'));
    } else if (catLower === 'risk management') {
      list = list.filter(b => b.category === 'Risk Management' || b.tags.some(t => t.toLowerCase() === 'risk management'));
    }
  }

  if (difficulty && difficulty !== 'All') {
    list = list.filter(b => b.difficulty === difficulty);
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    list = list.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.subtitle.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.shortDescription.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getEBookBySlug(slug: string): EBook | undefined {
  return EBOOKS_DATA.find(b => b.slug === slug || b.id === slug);
}

export function getFeaturedEBooks(count: number = 4): EBook[] {
  return EBOOKS_DATA.slice(0, count);
}

export function getRelatedEBooks(currentSlug: string, count: number = 3): EBook[] {
  const current = getEBookBySlug(currentSlug);
  if (!current) return EBOOKS_DATA.slice(0, count);

  return EBOOKS_DATA
    .filter(b => b.slug !== currentSlug)
    .sort((a, b) => {
      if (a.category === current.category) return -1;
      if (b.category === current.category) return 1;
      return 0;
    })
    .slice(0, count);
}
