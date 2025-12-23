const SAVED_QUOTES_API = "http://140.245.5.153:8001/api/profile/saved/";
const token = localStorage.getItem("accessToken");

const container = document.getElementById("quotesContainer");

// 🔐 Auth check
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

// 🚀 Load saved quotes
document.addEventListener("DOMContentLoaded", loadSavedQuotes);

async function loadSavedQuotes() {
  try {
    const res = await axios.get(SAVED_QUOTES_API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const quotes = res.data || [];

    if (quotes.length === 0) {
      showEmptyState();
    } else {
      renderQuotes(quotes);
    }

  } catch (err) {
    console.error("Saved quotes load error:", err);

    if (err.response && err.response.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "login.html";
    } else {
      container.innerHTML = `
        <div class="empty-box">
          <h3>⚠️ Failed to load quotes</h3>
          <p>Please try again later</p>
        </div>
      `;
    }
  }
}

// 🧱 Render quote cards
function renderQuotes(quotes) {
  container.innerHTML = "";

  quotes.forEach(q => {
    const card = document.createElement("div");
    card.className = "quote-card";

    card.innerHTML = `
      <div class="quote-text">“${q.text}”</div>
      <div class="quote-author">– ${q.author_username || "Unknown"}</div>
    `;

    container.appendChild(card);
  });
}

// 📭 Empty UI
function showEmptyState() {
  container.innerHTML = `
    <div class="empty-box">
      <h3>📭 No saved quotes yet</h3>
      <p>Save quotes you love and they’ll appear here ✨</p>
    </div>
  `;
}
