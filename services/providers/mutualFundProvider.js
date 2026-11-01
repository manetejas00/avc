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

      // Calculate performance: 1Y, 3Y, 5Y return if historical points exist
      let return1Y = null;
      let return3Y = null;
      let return5Y = null;

      if (currentNav && navData.length > 20) {
        // Approximate trading days: ~250 trading days/year
        if (navData.length >= 250) {
          const nav1Y = Number.parseFloat(navData[249]?.nav);
          if (nav1Y > 0) return1Y = ((currentNav - nav1Y) / nav1Y) * 100;
        }
        if (navData.length >= 750) {
          const nav3Y = Number.parseFloat(navData[749]?.nav);
          if (nav3Y > 0) return3Y = (Math.pow(currentNav / nav3Y, 1 / 3) - 1) * 100;
        }
        if (navData.length >= 1250) {
          const nav5Y = Number.parseFloat(navData[1249]?.nav);
          if (nav5Y > 0) return5Y = (Math.pow(currentNav / nav5Y, 1 / 5) - 1) * 100;
        }
      }

      return {
        schemeCode: data.meta.scheme_code,
        schemeName: data.meta.scheme_name,
        fundHouse: data.meta.fund_house,
        schemeType: data.meta.scheme_type,
        schemeCategory: data.meta.scheme_category,
        currentNav,
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
