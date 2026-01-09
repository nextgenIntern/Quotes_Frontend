const SAVED_QUOTES_API = "https://eternal-lines.com/api/profile/saved/";
const token = localStorage.getItem("accessToken");

// for cards background rendering check for modifixcation in the line of quotes-cards c
const paperBackgrounds = [
    "images/bg1.png",
    "images/bg2.png",
    "images/image.png",
    "images/bg4.png",
    "images/bg5.png"
];

const container = document.getElementById("quotesContainer");

// 🔐 Auth check
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}



// helper function
function getRandomPaper() {
    return paperBackgrounds[Math.floor(Math.random() * paperBackgrounds.length)];
}
// 🚀 Load saved quotes
document.addEventListener("DOMContentLoaded", loadSavedQuotes);
// ---------------- SAVED QUOTES ----------------
async function loadSavedQuotes() {
  const container = document.getElementById("savedQuotesContainer");
  container.innerHTML = ""; // Clear previous

  try {
    const res = await authFetch(SAVED_QUOTES_API, {
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
  card.className = "col-lg-3 col-md-3 col-sm-6 mb-4";

  card.innerHTML = `
    <div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
           style="background-image: url('${getRandomPaper()}') !important; cursor:pointer;"
           onclick="openQuotePage(event, '${q.slug}')">
            <p class="quote-text flex-grow-1 text-danger fw-bolder">“${q.text}”</p>
            <p class="quote-author mt-2">– ${q.full_name || q.author_username}</p>
            <hr style="border:2px solid #000; margin:8px 0;">
            <div class="d-flex justify-content-between mt-3 icon-bar">

                <!-- Like Button -->
                <span class="material-symbols-outlined like-btn" data-id="${q.id}">
                    <span class="icon">favorite_border</span>
                    <span class="action-count">${q.likes_count || 0}</span>
                </span>

                <!-- Share Button -->
                <span class="material-symbols-outlined share-btn"
      data-slug="${q.slug}">
                    <span class="icon-text">share</span>
                    <span class="action-count share-count">${q.share_count || 0}</span>
                </span>

                <!-- Save Button -->
                <span class="material-symbols-outlined save-btn" data-id="${q.id}" data-saved="${q.saved_by_current_user}">
                    <span class="icon">${q.saved_by_current_user ? 'bookmark' : 'bookmark_border'}</span>
                    <span class="action-count">${q.saved_count || 0}</span>
                </span>

                <a href="comments.html?quote=${q.id}">
                    <span class="material-symbols-outlined">chat_bubble</span>
                </a>
            </div>
        </div>
  `;

  container.appendChild(card);
});




  } catch (err) {
    console.error("Saved quotes load error:", err);
    container.innerHTML = `
      <div class="empty-box">
        ⚠️ Failed to load saved quotes
      </div>
    `;
  }

  restoreLikeSaveState()
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


// ================= Helper Functions =================
function getRandomPaper() {
    return paperBackgrounds[Math.floor(Math.random() * paperBackgrounds.length)];
}

function getLikedQuotes() {
    return JSON.parse(localStorage.getItem("likedQuotes")) || [];
}

function saveLikedQuotes(arr) {
    localStorage.setItem("likedQuotes", JSON.stringify(arr));
}

function getSavedQuotes() {
    return JSON.parse(localStorage.getItem("savedQuotes")) || [];
}

function saveSavedQuotes(arr) {
    localStorage.setItem("savedQuotes", JSON.stringify(arr));
}
function restoreLikeSaveState() {
    const likedQuotes = getLikedQuotes();
    const savedQuotes = getSavedQuotes();

    document.querySelectorAll(".like-btn").forEach(btn => {
        const quoteId = btn.dataset.id;
        if (likedQuotes.includes(quoteId)) {
            btn.classList.add("liked");
            const icon = btn.querySelector(".icon");
            if (icon) icon.textContent = "favorite";
        }
    });

    document.querySelectorAll(".save-btn").forEach(btn => {
        const quoteId = btn.dataset.id;
        const isSaved = savedQuotes.includes(quoteId) || btn.dataset.saved === "true";
        if (isSaved) {
            btn.classList.add("saved");
            const icon = btn.querySelector(".icon");
            if (icon) icon.textContent = "bookmark";
        }
    });
}

// ================= CLICK HANDLER =================
const pendingRequests = new Set();

document.addEventListener("click", async (e) => {
    // ---------------- SAVE ----------------
    const saveBtn = e.target.closest(".save-btn");
    if (saveBtn) {
        const quoteId = saveBtn.dataset.id;
        if (pendingRequests.has(`save-${quoteId}`)) return;
        pendingRequests.add(`save-${quoteId}`);

        let savedQuotes = getSavedQuotes();
        const isSaved = saveBtn.classList.contains("saved");

        try {
            const res = await authFetch(
                isSaved ? API.UNSAVE_QUOTE(quoteId) : API.SAVE_QUOTE(quoteId),
                { method: "POST" }
            );
            if (!res.ok) throw new Error("Save failed");

            saveBtn.classList.toggle("saved");
            const icon = saveBtn.querySelector(".icon");
            if (icon) icon.textContent = saveBtn.classList.contains("saved") ? "bookmark" : "bookmark_border";

            if (saveBtn.classList.contains("saved")) {
                if (!savedQuotes.includes(quoteId)) savedQuotes.push(quoteId);
            } else {
                savedQuotes = savedQuotes.filter(id => id !== quoteId);
            }
            saveSavedQuotes(savedQuotes);

        } catch (err) {
            console.error("Save error:", err);
        } finally {
            pendingRequests.delete(`save-${quoteId}`);
        }
        return;
    }

    // ---------------- LIKE ----------------
    const likeBtn = e.target.closest(".like-btn");
    if (likeBtn) {
        const quoteId = likeBtn.dataset.id;
        if (pendingRequests.has(`like-${quoteId}`)) return;
        pendingRequests.add(`like-${quoteId}`);

        let likedQuotes = getLikedQuotes();
        if (likedQuotes.includes(quoteId)) {
            pendingRequests.delete(`like-${quoteId}`);
            return;
        }

        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Please login to like quotes");
            pendingRequests.delete(`like-${quoteId}`);
            return;
        }

        try {
            const res = await authFetch(API.LIKE_QUOTE(quoteId), { method: "POST" });
            if (!res.ok) throw new Error("Like failed");

            likeBtn.classList.add("liked");
            const icon = likeBtn.querySelector(".icon");
            if (icon) icon.textContent = "favorite";

            const countSpan = likeBtn.querySelector(".action-count");
            if (countSpan) countSpan.innerText = (parseInt(countSpan.innerText) || 0) + 1;

            likedQuotes.push(quoteId);
            saveLikedQuotes(likedQuotes);

        } catch (err) {
            console.error("Like error:", err);
        } finally {
            pendingRequests.delete(`like-${quoteId}`);
        }
    }
});



// 📭 Empty UI
function showEmptyState() {
  container.innerHTML = `
    <div class="empty-box">
      <h3> No saved quotes yet</h3>
      <p>Save quotes you love and they’ll appear here ✨</p>
    </div>
  `;
}


