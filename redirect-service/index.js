const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json()); // needed for POST /register

// In-memory store for ID → URL
const urlStore = {};

// ===============================
// 1) Register new shortened URLs
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
// 2) Handle redirect requests
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
  console.log(`[redirect-service] Redirecting user → ${url}`);

  return res.redirect(url);
});

// ===============================
// 3) Start server
// ===============================
app.listen(PORT, () =>
  console.log(`[redirect-service] Running on port ${PORT}`)
);
