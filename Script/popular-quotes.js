// scripts/popular-quotes.js


// for cards background rendering check for modifixcation in the line of quotes-cards c
const paperBackgrounds = [
    "images/bg1.png",
    "images/bg2.png",
    "images/image.png",
    "images/bg4.png",
    "images/bg5.png"
];
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("popularQuotesInner");

  if (!container) {
    console.warn("popularQuotesInner not found");
    return;
  }

  loadPopularQuotes(container);
});

/* ================= LOAD POPULAR QUOTES ================= */
async function loadPopularQuotes(container) {
  try {
    const res = await fetch(API.HOME_QUOTES_LATEST); // ✅ PUBLIC API
    if (!res.ok) throw new Error(`Failed (${res.status})`);

    const quotes = await res.json();
    renderPopularQuotes(container, quotes);

  } catch (err) {
    console.error("Popular Quotes error:", err);
    container.innerHTML = `
      <div class="text-center py-4">
        ⚠️ Failed to load popular quotes
      </div>
    `;
  }
}

// helper function
function getRandomPaper() {
    return paperBackgrounds[Math.floor(Math.random() * paperBackgrounds.length)];
}
/* ================= RENDER CAROUSEL ================= */
function renderPopularQuotes(container, quotes) {
  container.innerHTML = "";

  if (!Array.isArray(quotes) || quotes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        📭 No popular quotes available
      </div>
    `;
    return;
  }

  quotes.forEach(q => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-4 col-sm-6 mb-4";

    col.innerHTML = `
      <div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
           style="background-image: url('${getRandomPaper()}') !important; cursor:pointer;"
           onclick="openQuotePage(event, '${q.slug}')">
        
        <p class="quote-text flex-grow-1 fw-bolder  ">“${q.text}”</p>
<p class="quote-author mt-2 text-end">
  — 
  <a href="author-profile.html?author=${q.author_username}" class="author-link">
    ${q.full_name || q.author_username}
  </a>
</p>

        <hr style="border:2px solid #000; margin:8px 0;">

        <div class="d-flex justify-content-between mt-3 icon-bar">
          <span class="material-symbols-outlined like-btn" data-id="${q.id}">
  favorite_border
  <span class="action-count">${q.likes_count || 0}</span>
</span>


          <span class="material-symbols-outlined share-btn"
      data-slug="${q.slug}">
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

    container.appendChild(col);
  });

  setupLikeButtons()
  setupSaveButtons();
 
}

function openQuotePage(event, slug) {
  // Prevent clicks from buttons/icons inside the card
  if (
    event.target.closest(".like-btn") ||
    event.target.closest(".save-btn") ||
    event.target.closest(".share-btn") ||
    event.target.closest("a")
  ) {
    return;
  }

  window.location.href = `/quote/${slug}`;
}













