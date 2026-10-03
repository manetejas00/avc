import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Use root-relative bundles so a static-host fallback at a deep URL never
    // attempts to load JavaScript from paths such as /api/market/assets/...
    base: '/',
    plugins: [react()],
    // Keep the Vite preview connected to the existing Express market API.
    server: {
      proxy: {
        '/api/marketaux': {
          target: 'https://api.marketaux.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/marketaux/, '')
        },
        '/api/yahoo': {
          target: 'https://query1.finance.yahoo.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/yahoo/, '')
        },
        '/api': 'http://127.0.0.1:3000'
      }
    },
    // This intentionally makes the Marketaux token available to browser code,
    // as requested for the static deployment.
    define: {
      'import.meta.env.VITE_MARKETAUX_API_KEY': JSON.stringify(env.VITE_MARKETAUX_API_KEY || env.MARKETAUX_API_KEY || '')
    }
  };
})
