// scripts/categoryquotes.js

const QUOTES_API = "https://eternal-lines.com/api/quotes/";

document.addEventListener("DOMContentLoaded", loadCategoryQuotes);

async function loadCategoryQuotes() {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");

  const title = document.getElementById("categoryTitle");
  const container = document.getElementById("quotesContainer");

  if (!selectedCategory) {
    title.textContent = "No category selected";
    return;
  }

  title.textContent = `Quotes for ${selectedCategory}`;
  container.innerHTML = "<p class='text-center'>Loading quotes...</p>";

  try {
    // 1️⃣ Fetch ALL quotes
    const res = await fetch(QUOTES_API);
    if (!res.ok) throw new Error("API failed");

    const allQuotes = await res.json();

    // 2️⃣ FILTER by category
    const filteredQuotes = allQuotes.filter(q =>
      Array.isArray(q.categories) &&
      q.categories.some(c =>
        c.name.toLowerCase() === selectedCategory.toLowerCase()
      )
    );

    // 3️⃣ Render
    if (filteredQuotes.length === 0) {
      container.innerHTML = `<p class="text-center">No quotes found.</p>`;
      return;
    }

    renderQuotes(filteredQuotes);

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-danger text-center">Failed to load quotes</p>`;
  }
}

function renderQuotes(quotes) {
  const container = document.getElementById("quotesContainer");
  container.innerHTML = "";

  quotes.forEach(q => {
    const card = document.createElement("div");
    card.className = "quote-card shadow p-3 my-3 rounded";
// style="background-image: url('${getRandomPaper()}') !important;
    card.innerHTML = `
      <div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
            ">
        
        <p class="quote-text flex-grow-1 fw-bolder">“${q.text}”</p>
        <p class="quote-author mt-2 ">– ${q.author_username || "Unknown"}</p>

        <hr style="border:2px solid #000; margin:8px 0;">

        <div class="d-flex justify-content-between mt-3 icon-bar">
          <span class="material-symbols-outlined like-btn" data-id="${q.id}">
  favorite_border
  <span class="action-count">${q.likes_count || 0}</span>
</span>


          <span class="material-symbols-outlined share-btn" data-id="${q.id}">
  <span class="icon-text">share</span>
  <span class="action-count share-count">${q.share_count || 0}</span>
</span>

          <span class="material-symbols-outlined save-btn"
                data-id="${q.id}"
                data-saved="${q.saved_by_current_user}">
            ${q.saved_by_current_user ? 'bookmark' : 'bookmark_border'}
            <span class="action-count save-count">${q.saved_count || 0}</span>
          </span>

          <a href="comments.html?quote=${q.id}">
            <span class="material-symbols-outlined">chat_bubble</span>
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}
