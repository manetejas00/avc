import type { Config } from '@netlify/functions';
import { handleIpoRequest } from '../../services/ipoFeed.js';
export default async (request: Request) => handleIpoRequest(request);
export const config: Config = { path: ['/api/ipos.php','/api/ipo','/api/ipo/'] };
