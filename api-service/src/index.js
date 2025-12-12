const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3001;
const app = express();
const axios = require("axios");       
const crypto = require("crypto");      
// ✅ ENABLE CORS FOR ALL ORIGINS
app.use(cors());

// Allows frontend to send JSON
app.use(bodyParser.json());
// ===============================
// Helpers
// ===============================

// Generate a random 6-character ID
function generateId() {
  return crypto.randomBytes(4).toString('hex').slice(0, 6);
}

// In-memory store for id → url  (temporary until DB is added)
const urlStore = {};

// ===============================
// 1) Create Short URL Endpoint
// ===============================
app.post('/api/shorten', async (req, res) => {
  const { url } = req.body;

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

// ===============================
// 2) Debug: Retrieve all mappings
// ===============================
app.get('/api/debug', (req, res) => {
  res.json(urlStore);
});

// ===============================
// Start server
// ===============================
app.listen(PORT, () => {
  console.log(`[api-service] Running on port ${PORT}`);
});
