const { nanoid } = require('nanoid');

// temporary in-memory store
const urlStore = {};

/**
 * POST /api/shorten
 * body: { url }
 * response: { id, shortUrl }
 */
app.post('/api/shorten', async (req, res) => {
  const url = req.body.url || req.body.longUrl;   // ✅ FIX HERE

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Generate short ID
  const id = generateId();

  // Save locally (until DB)
  urlStore[id] = url;

  console.log(`[api-service] New short URL created: ${id} → ${url}`);

  // Register with redirect-service
  try {
    await axios.post('http://localhost:4000/register', { id, url });
    console.log(`[api-service] Successfully registered with redirect-service`);
  } catch (err) {
    console.error(`[api-service] Failed to register with redirect-service`, err.message);
  }

  res.json({
    id,
    shortUrl: `http://localhost:4000/${id}`
  });
});

  // note: redirect-service will use port 4000 (localhost) in dev
  const shortUrl = `${process.env.REDIRECT_SERVICE_URL || 'http://localhost:4000'}/${id}`;

  return res.json({ id, shortUrl });
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
