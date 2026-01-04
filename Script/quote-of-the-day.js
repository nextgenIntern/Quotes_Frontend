// scripts/quote-of-the-day.js

if (!window.API || !API.QUOTES_TOP5) {
  console.error("❌ API config not loaded");
}

document.addEventListener("DOMContentLoaded", loadQuoteCarousel);

async function loadQuoteCarousel() {
  try {
    // ✅ Public API
    const res = await fetch(API.QUOTES_TOP5);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const quotes = await res.json();

    // Filter English quotes
    const englishQuotes = quotes.filter(q =>
      q?.language?.code?.toLowerCase() === "english"
    );

    if (!englishQuotes.length) {
      renderFallbackSlide();
      return;
    }

    renderCarouselSlides(englishQuotes);

  } catch (err) {
    console.error("❌ Quote carousel error:", err);
    renderFallbackSlide();
  }
}

// ---------------- RENDER CAROUSEL ----------------
function renderCarouselSlides(quotes) {
  const container = document.getElementById("quoteCarouselInner");
  if (!container) return;

  container.innerHTML = "";

  quotes.forEach((q, index) => {
    const slide = document.createElement("div");
    slide.className = `carousel-item ${index === 0 ? "active" : ""}`;

    slide.innerHTML = `
      <div class="px-3">
        <p class="lead fst-italic mb-2 text-white">
          “${q.text}”
        </p>
<h5 class="fw-semibold fst-italic" style="color:#e07a5f;">
          – ${q.author_username || "Unknown"}
        </h5>
      </div>
    `;

    container.appendChild(slide);
  });
}

// ---------------- FALLBACK ----------------
function renderFallbackSlide() {
  const container = document.getElementById("quoteCarouselInner");
  if (!container) return;

  container.innerHTML = `
    <div class="carousel-item active">
      <div class="px-3">
        <p class="lead fst-italic text-white">
          “The only limit to our realization of tomorrow is our doubts of today.”
        </p>
        <h5 class="fw-semibold" style="color:#ffeb3b;">
          – Franklin D. Roosevelt
        </h5>
      </div>
    </div>
  `;
}
