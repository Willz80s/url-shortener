const shortenBtn = document.getElementById("shortenBtn");
const copyBtn = document.getElementById("copyBtn");

const longUrlInput = document.getElementById("longUrl");
const shortUrlEl = document.getElementById("shortUrl");
const resultBox = document.getElementById("result");
const copyMsg = document.getElementById("copyMsg");

let currentId = null;
let statsInterval = null;

// ===============================
// Shorten URL
// ===============================
shortenBtn.addEventListener("click", async () => {
  const longUrl = longUrlInput.value.trim();

  if (!longUrl) {
    alert("Please enter a URL");
    return;
  }

  shortenBtn.disabled = true;
  shortenBtn.textContent = "Shortening...";

  try {
    const response = await fetch("http://localhost:3001/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: longUrl })
    });

    const data = await response.json();

    if (!data.shortUrl || !data.id) {
      throw new Error("Invalid response");
    }

    shortUrlEl.textContent = data.shortUrl;
    resultBox.classList.remove("hidden");
    currentId = data.id;

    // Fetch stats immediately
    fetchStats();

    // Start auto-refresh (every 5s)
    if (statsInterval) clearInterval(statsInterval);
    statsInterval = setInterval(fetchStats, 5000);

  } catch (err) {
    alert("Failed to shorten URL");
    console.error(err);
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = "Shorten URL";
  }
});

// ===============================
// Fetch analytics stats
// ===============================
async function fetchStats() {
  if (!currentId) return;

  try {
    const res = await fetch(
      `http://localhost:3001/api/stats/${currentId}`
    );
    const stats = await res.json();
    showStats(stats.clicks);
  } catch (err) {
    console.error("Failed to fetch stats");
  }
}

// ===============================
// Display analytics
// ===============================
function showStats(clicks) {
  let statsEl = document.getElementById("stats");

  if (!statsEl) {
    statsEl = document.createElement("p");
    statsEl.id = "stats";
    statsEl.style.marginTop = "10px";
    statsEl.style.opacity = "0.9";
    resultBox.appendChild(statsEl);
  }

  statsEl.textContent = `Total clicks: ${clicks}`;
}

// ===============================
// Copy shortened URL
// ===============================
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shortUrlEl.textContent);
    copyMsg.textContent = "Copied!";
    setTimeout(() => (copyMsg.textContent = ""), 1500);
  } catch {
    alert("Copy failed");
  }
});

// ===============================
// Cleanup on page unload
// ===============================
window.addEventListener("beforeunload", () => {
  if (statsInterval) clearInterval(statsInterval);
});
