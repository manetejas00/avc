import type { Config, Context } from '@netlify/functions';
import { handlePublicApi } from '../../services/publicFinancialApi.js';
import { recordApiResult } from '../../db/syncLog.js';
export default async (request: Request, context: Context) => {
  const response = await handlePublicApi(request, { env: (name: string) => Netlify.env.get(name) });
  context.waitUntil(recordApiResult('financial', response.status));
  return response;
};
export const config: Config = { path: ['/api/companies','/api/market/*','/api/stocks/*','/api/mutual-funds/*','/api/mutual-funds.php','/api/watchlist.php','/api/yahoo.php','/api/yahoo/*','/api/yahoo-news.php','/api/company-data.php','/api/crypto/*','/api/providers/status','/api/news','/api/indianapi.php','/api/marketaux.php'] };
