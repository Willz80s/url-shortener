const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

// In-memory store
const urlStore = {};

// ===============================
// DEBUG ENDPOINT (MUST COME FIRST)
// ===============================
app.get('/debug', (req, res) => {
  res.json(urlStore);
});

// ===============================
// Register new URLs
// ===============================
app.post('/register', (req, res) => {
  const { id, url } = req.body;

  if (!id || !url) {
    return res.status(400).json({ error: "ID and URL are required" });
  }

  urlStore[id] = url;
  console.log(`[redirect-service] Registered: ${id} → ${url}`);

  res.json({ message: "Registered successfully" });
});

// ===============================
// Redirect handler — must be LAST
// ===============================
app.get('/:id', (req, res) => {
  const id = req.params.id;

  console.log(`[redirect-service] Redirect request for ID: ${id}`);

  const url = urlStore[id];

  if (!url) {
    console.log(`[redirect-service] No match for ID: ${id}`);
    return res.status(404).send("Short URL not found");
  }

  console.log(`[redirect-service] Found URL: ${url}`);
  return res.redirect(url);
});

app.listen(PORT, () =>
  console.log(`[redirect-service] Running on port ${PORT}`)
);
