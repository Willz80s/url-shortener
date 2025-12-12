// ===============================
// analytics-service/index.js
// Analytics Tracking Service
// ===============================

const express = require('express');
const cors = require('cors');

// Initialize app
const app = express();

// Load environment variables
require('dotenv').config();
const PORT = process.env.PORT || 3003;

// In-memory analytics store
let events = {};

// Middleware
app.use(cors());
app.use(express.json());

// -------------------------------
// Logging middleware
// -------------------------------
app.use((req, res, next) => {
  console.log(`[analytics-service] ${req.method} ${req.url}`);
  next();
});

// -------------------------------
// Route: Track Click Event
// POST /track
// -------------------------------
app.post('/track', (req, res) => {
  const { id, userAgent, referrer } = req.body;

  console.log(`[analytics-service] Tracking event for: ${id}`);

  if (!events[id]) {
    events[id] = [];
  }

  events[id].push({
    id,
    userAgent,
    referrer,
    timestamp: Date.now()
  });

  return res.json({ success: true });
});

// -------------------------------
// Route: Stats for an ID
// GET /stats/:id
// -------------------------------
app.get('/stats/:id', (req, res) => {
  const { id } = req.params;

  console.log(`[analytics-service] Fetching stats for: ${id}`);

  return res.json({
    id,
    count: events[id] ? events[id].length : 0,
    events: events[id] || []
  });
});

// -------------------------------
// Start Server
// -------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[analytics-service] Running on port ${PORT}`);
});
