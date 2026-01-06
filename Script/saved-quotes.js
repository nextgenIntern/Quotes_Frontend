const SAVED_QUOTES_API = "https://eternal-lines.com/api/profile/saved/";
const token = localStorage.getItem("accessToken");

const container = document.getElementById("quotesContainer");

// 🔐 Auth check
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

// 🚀 Load saved quotes
document.addEventListener("DOMContentLoaded", loadSavedQuotes);
// ---------------- SAVED QUOTES ----------------
async function loadSavedQuotes() {
  const container = document.getElementById("savedQuotesContainer");
  container.innerHTML = ""; // Clear previous

  try {
    const res = await authFetch("http://eternal-lines.com/api/profile/saved/", {
      method: "GET"
    });

    if (!res.ok) throw new Error("Failed to load saved quotes");

    const quotes = await res.json();

    if (!quotes || quotes.length === 0) {
      container.innerHTML = `
        <div class="empty-box ">
          No saved quotes yet 
        </div>
      `;
      return;
    }

    // Render square cards
    quotes.forEach(q => {
      const card = document.createElement("div");
      card.className = "col-md-3 mb-3";
      card.innerHTML = `
        <div class="quote-card shadow rounded border">
          <p class="quote-text">“${q.text}”</p>
          <p class="quote-author">- ${q.author_username || "Unknown"}</p>
          <div class="d-flex justify-content-between mt-3 icon-bar">
            <span class="material-symbols-outlined like-btn" data-id="${q.id}" title="Like">
              favorite_border
              <span class="action-count like-count">${q.likes || q.likes_count || 0}</span>
            </span>
            <span class="material-symbols-outlined dislike-btn" data-id="${q.id}" title="Dislike">
              thumb_down_off_alt
              <span class="action-count dislike-count">${q.dislikes || 0}</span>
            </span>
            <span class="material-symbols-outlined share-btn" data-id="${q.id}" title="Share">
              share
              <span class="action-count share-count">${q.shares || q.share_count || 0}</span>
            </span>
             <span class="material-symbols-outlined save-btn" data-id="${q.id}" title="Save">
  bookmark
  <span class="action-count save-count">${q.saved || 0}</span>
</span>
            <a href="comments.html?quote=${q.id}">
              <span class="material-symbols-outlined comment-btn" title="Comments">
                chat_bubble
              </span>
            </a>
          </div>
        </div>
      `;
      container.appendChild(card);
      setupSaveButtons();
    });


  } catch (err) {
    console.error("Saved quotes load error:", err);
    container.innerHTML = `
      <div class="empty-box">
        ⚠️ Failed to load saved quotes
      </div>
    `;
  }
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
