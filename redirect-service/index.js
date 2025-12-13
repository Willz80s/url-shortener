const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 4000;

app.use(express.json());

// In-memory store for ID → URL
const urlStore = {};

// ===============================
// DEBUG ENDPOINT (must be first)
// ===============================
app.get("/debug", (req, res) => {
  res.json(urlStore);
});

// ===============================
// Register new shortened URLs
// ===============================
app.post("/register", (req, res) => {
  const { id, url } = req.body;

  if (!id || !url) {
    return res.status(400).json({ error: "ID and URL are required" });
  }

  urlStore[id] = url;
  console.log(`[redirect-service] Registered: ${id} → ${url}`);

  res.json({ message: "Registered successfully" });
});

// ===============================
// Handle redirect requests
// ===============================
app.get("/:id", async (req, res) => {
  const id = req.params.id;
  const url = urlStore[id];

  console.log(`[redirect-service] Redirect request for ID: ${id}`);

  if (!url) {
    console.log(`[redirect-service] No match for ID: ${id}`);
    return res.status(404).send("Short URL not found");
  }

  // 🔥 SEND ANALYTICS (NON-BLOCKING)
  try {
    await axios.post("http://localhost:6000/track", {
      id,
      userAgent: req.headers["user-agent"],
      ip: req.ip
    });
    console.log(`[redirect-service] Analytics sent for ID: ${id}`);
  } catch (err) {
    console.error(
      `[redirect-service] Analytics failed:`,
      err.message
    );
    // ❗ DO NOT FAIL REDIRECT
  }

  console.log(`[redirect-service] Redirecting → ${url}`);
  return res.redirect(url);
});

// ===============================
// Start server
// ===============================
app.listen(PORT, () =>
  console.log(`[redirect-service] Running on port ${PORT}`)
);
