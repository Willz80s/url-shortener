const apiURL = "http://localhost:3001/api/shorten";

document.getElementById("shortenBtn").addEventListener("click", async () => {
    const input = document.getElementById("longUrl");
    const longUrl = input.value.trim();

    const btn = document.getElementById("shortenBtn");
    const btnText = btn.querySelector(".btn-text");
    const loader = btn.querySelector(".loader");

    const resultBox = document.getElementById("result");
    const output = document.getElementById("shortUrl");
    const copyMsg = document.getElementById("copyMsg");

    // Reset UI
    resultBox.classList.add("hidden");
    copyMsg.textContent = "";

    if (!longUrl) {
        showError("Please enter a URL");
        return;
    }

    // Start loading
    btnText.classList.add("hidden");
    loader.classList.remove("hidden");

    try {
        const response = await fetch(apiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: longUrl })
        });

        const data = await response.json();

        if (data.shortUrl) {
            output.textContent = data.shortUrl;
            resultBox.classList.remove("hidden");

            // Auto-open in new tab
            // window.open(data.shortUrl, "_blank");
        } else {
            showError("Server did not return a short URL.");
        }
    } catch (error) {
        showError("Unable to reach backend. Check if api-service is running.");
        console.error(error);
    }

    // Stop loading
    btnText.classList.remove("hidden");
    loader.classList.add("hidden");
});

document.getElementById("copyBtn").addEventListener("click", async () => {
    const text = document.getElementById("shortUrl").textContent;
    const msg = document.getElementById("copyMsg");

    try {
        await navigator.clipboard.writeText(text);
        msg.textContent = "Copied!";
        setTimeout(() => (msg.textContent = ""), 1500);
    } catch (err) {
        msg.textContent = "Failed to copy";
    }
});

function showError(msg) {
    const old = document.querySelector(".error-msg");
    if (old) old.remove();

    const div = document.createElement("div");
    div.className = "error-msg";
    div.textContent = msg;

    document.querySelector(".container").appendChild(div);

    setTimeout(() => div.remove(), 3000);
}
