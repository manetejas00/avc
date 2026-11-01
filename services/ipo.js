import express from 'express';
// No dated official list has been verified. Do not serve provider guesses or old cache entries.
export const createIpoRouter = (_db) => {
  const router = express.Router();
  router.use((_req, res) => res.status(503).json({ error: 'Data unavailable. Official IPO notices and offer documents have not been verified.' }));
  return router;
};
