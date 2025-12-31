// scripts/popular-quotes.js
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
    const res = await fetch(API.POPULAR_QUOTES); // ✅ PUBLIC API
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
           style="background-image: url('${getRandomPaper()}') !important; ">
        
        <p class="quote-text flex-grow-1">“${q.text}”</p>
        <p class="quote-author mt-2">– ${q.author_username || "Unknown"}</p>

        <hr style="border:2px solid #000; margin:8px 0;">

        <div class="d-flex justify-content-between mt-3 icon-bar">
          <span class="material-symbols-outlined like-btn" data-id="${q.id}">
            favorite_border
            <span class="action-count">${q.likes_count || 0}</span>
          </span>

          <span class="material-symbols-outlined share-btn" data-id="${q.id}">
            share
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

  setupSaveButtons();
}


// This function sets up save/unsave buttons
/* ================== SETUP SAVE/UNSAVE BUTTONS ================== */
function setupSaveButtons() {
  const saveBtns = document.querySelectorAll('.save-btn');

  saveBtns.forEach(btn => {
    const quoteId = btn.dataset.id;

    // Make sure initial state is correct
    if (btn.dataset.saved === "true") {
      btn.classList.add('saved');
    } else {
      btn.classList.remove('saved');
    }

    btn.addEventListener('click', async () => {
      const isSaved = btn.dataset.saved === "true"; // check data-saved, not class

      try {
        const url = isSaved
          ? API.UNSAVE_QUOTE(quoteId)
          : API.SAVE_QUOTE(quoteId);

        const res = await authFetch(url, { method: 'POST' });
        if (!res.ok) throw new Error('Save/Unsave failed');

        // Toggle state
        btn.dataset.saved = (!isSaved).toString();
        btn.classList.toggle('saved');

        // Update counter
        const countSpan = btn.querySelector('.action-count');
        if (countSpan) {
          let count = parseInt(countSpan.innerText) || 0;
          count = isSaved ? Math.max(0, count - 1) : count + 1;
          countSpan.innerText = count;
        }

        // Optional: remove from saved quotes page if unsaved
        if (isSaved && document.getElementById('savedQuotesContainer')) {
          btn.closest('.col-md-3')?.remove();
        }

      } catch (err) {
        console.error('Save/Unsave error:', err);
        alert('Failed to save/unsave quote');
      }
    });
  });
}


