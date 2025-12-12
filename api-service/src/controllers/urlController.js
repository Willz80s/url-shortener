const { nanoid } = require('nanoid');

// temporary in-memory store
const urlStore = {};

/**
 * POST /api/shorten
 * body: { url }
 * response: { id, shortUrl }
 */
function createShortUrl(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const id = nanoid(6);
  urlStore[id] = { url, createdAt: Date.now() };

  // note: redirect-service will use port 4000 (localhost) in dev
  const shortUrl = `${process.env.REDIRECT_SERVICE_URL || 'http://localhost:4000'}/${id}`;

  return res.json({ id, shortUrl });
}

/**
 * GET /api/url/:id
 * response: { url }
 */
function getOriginalUrl(req, res) {
  const { id } = req.params;
  const record = urlStore[id];
  if (!record) return res.status(404).json({ error: 'not found' });

  return res.json({ url: record.url });
}

module.exports = { createShortUrl, getOriginalUrl };
