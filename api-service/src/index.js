const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const crypto = require("crypto");

const PORT = process.env.PORT || 3001;
const app = express();

// Enable CORS
app.use(cors());

// Allow frontend to send JSON
app.use(bodyParser.json());

// ===============================
// Helpers
// ===============================

// Generate a random 6-character ID
function generateId() {
  return crypto.randomBytes(4).toString("hex").slice(0, 6);
}

// Local store (temporary until DB)
const urlStore = {};

// ===============================
// 1) Create Short URL Endpoint
// ===============================
app.post("/api/shorten", async (req, res) => {
  let { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // 🔥 FIX: Auto-add https:// if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // Create ID
  const id = generateId();

  // Store locally
  urlStore[id] = url;

  console.log(`[api-service] New short URL created: ${id} → ${url}`);

  // Notify redirect-service
  try {
    await axios.post("http://localhost:4000/register", { id, url });
    console.log(`[api-service] Successfully registered with redirect-service`);
  } catch (err) {
    console.error(
      `[api-service] Failed to register with redirect-service`,
      err.message
    );
  }

  // Response to UI
  res.json({
    id,
    shortUrl: `http://localhost:4000/${id}`,
  });
});

// ===============================
// 2) Debug: Retrieve all mappings
// ===============================
app.get("/api/debug", (req, res) => {
  res.json(urlStore);
});

// ===============================
// Start server
// ===============================
app.listen(PORT, () => {
  console.log(`[api-service] Running on port ${PORT}`);
});
