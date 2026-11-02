import type { Config } from '@netlify/functions';
import { handleNewsRequest } from '../../services/publisherNews.js';

export default async (request: Request) => handleNewsRequest(request);

export const config: Config = {
  path: ['/api/news/live', '/api/news/india', '/api/news/global', '/api/news/latest', '/api/news.php'],
};
