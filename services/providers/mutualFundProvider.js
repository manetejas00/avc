import axios from 'axios';

const MF_BASE_URL = 'https://api.mfapi.in/mf';

export class MutualFundProvider {
  constructor() {
    this.name = 'mfapi';
  }

  /**
   * Search mutual fund schemes
   */
  async searchSchemes(query, allSchemes = null) {
    if (!query) return [];

    try {
      let schemes = allSchemes;
      if (!schemes || !Array.isArray(schemes)) {
        const response = await axios.get(MF_BASE_URL, { timeout: 8000 });
        schemes = response.data;
      }

      if (!Array.isArray(schemes)) return [];

      const q = query.toLowerCase();
      return schemes
        .filter(s => s.schemeName && s.schemeName.toLowerCase().includes(q))
        .slice(0, 25)
        .map(s => ({
          schemeCode: s.schemeCode,
          schemeName: s.schemeName
        }));
    } catch (err) {
      console.warn('[MutualFundProvider] searchSchemes error:', err.message);
      return [];
    }
  }

  /**
   * Get scheme details with NAV history and performance calculations
   */
  async getSchemeDetails(schemeCode) {
    try {
      const response = await axios.get(`${MF_BASE_URL}/${schemeCode}`, { timeout: 8000 });
      const data = response.data;

      if (!data || !data.meta) return null;

      const navData = Array.isArray(data.data) ? data.data : [];
      const currentNav = navData[0] ? Number.parseFloat(navData[0].nav) : null;

      // Calendar-based periods; NAV-only performance is meaningful here only for Growth.
      const dateValue = date => { const [day, month, year] = date.split('-').map(Number); return Date.UTC(year, month - 1, day); };
      const isGrowth = /\bgrowth\b/i.test(data.meta.scheme_name) && !/idcw|dividend/i.test(data.meta.scheme_name);
      const datedReturn = years => {
        if (!isGrowth || !currentNav || !navData[0]?.date) return null;
        const endTime = dateValue(navData[0].date), target = new Date(endTime);
        target.setUTCFullYear(target.getUTCFullYear() - years);
        const start = navData.find(point => dateValue(point.date) <= target.getTime() && Number(point.nav) > 0);
        if (!start || target.getTime() - dateValue(start.date) > 7 * 86400000) return null;
        const ratio = currentNav / Number(start.nav), actualYears = (endTime - dateValue(start.date)) / (365.25 * 86400000);
        return (years === 1 ? ratio - 1 : Math.pow(ratio, 1 / actualYears) - 1) * 100;
      };
      const return1Y = datedReturn(1), return3Y = datedReturn(3), return5Y = datedReturn(5);

      return {
        schemeCode: data.meta.scheme_code,
        schemeName: data.meta.scheme_name,
        fundHouse: data.meta.fund_house,
        schemeType: data.meta.scheme_type,
        schemeCategory: data.meta.scheme_category,
        currentNav,
        source: 'MFapi.in',
        returnMethod: '1Y absolute; 3Y/5Y actual-day CAGR; anniversary NAV on/before target within 7 days; Growth only',
        latestNavDate: navData[0]?.date || null,
        performance: {
          return1Y: return1Y !== null ? Number(return1Y.toFixed(2)) : null,
          return3Y: return3Y !== null ? Number(return3Y.toFixed(2)) : null,
          return5Y: return5Y !== null ? Number(return5Y.toFixed(2)) : null
        },
        navHistory: navData.slice(0, 90).map(item => ({
          date: item.date,
          nav: Number.parseFloat(item.nav)
        }))
      };
    } catch (err) {
      console.warn(`[MutualFundProvider] getSchemeDetails error for ${schemeCode}:`, err.message);
      return null;
    }
  }
}

export const mutualFundProvider = new MutualFundProvider();
