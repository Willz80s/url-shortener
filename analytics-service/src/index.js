const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 6000;

app.use(cors());
app.use(bodyParser.json());

// In-memory analytics store: { shortId: [ events ] }
const analyticsStore = {};
// ===============================
// 1) TRACK CLICK EVENTS
// ===============================
app.post("/track", (req, res) => {
    const { id, userAgent, ip } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Short URL ID is required" });
    }

    if (!analyticsStore[id]) {
        analyticsStore[id] = [];
    }

    analyticsStore[id].push({
        timestamp: new Date().toISOString(),
        userAgent,
        ip
    });

    console.log(`[analytics-service] Tracked click for ID: ${id}`);
    res.json({ message: "Analytics recorded" });
});

// ===============================
// 2) GET ANALYTICS FOR SPECIFIC ID
// ===============================
app.get("/stats/:id", (req, res) => {
    const id = req.params.id;
    const stats = analyticsStore[id] || [];

    res.json({
        id,
        clicks: stats.length,
        events: stats
    });
});

// ===============================
// 3) HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
    res.send("Analytics service is running");
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`[analytics-service] Running on port ${PORT}`);
});
