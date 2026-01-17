// ================= API & Globals =================
const API_URL = "https://eternal-lines.com/api/quotes/";
const token = localStorage.getItem("accessToken");

const paperBackgrounds = [
    "images/bg1.png",
    "images/bg2.png",
    "images/image.png",
    "images/bg4.png",
    "images/bg5.png"
];
let allQuotes = [];
let categories = [];

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

// ================= FETCH QUOTES =================
document.addEventListener("DOMContentLoaded", fetchQuotes);

async function fetchQuotes() {
    try {
        const res = await axios.get(API_URL);
        allQuotes = res.data;

        // Extract categories
        categories = [
            ...new Set(
                allQuotes.flatMap(q => q.categories).map(c => c.name)
            )
        ];

        renderCategoryCarousels();

        // Restore like/save state
        restoreLikeSaveState();

    } catch (err) {
        console.error("Quotes API error:", err);
    }
}

// ================= RENDER CAROUSELS =================
function createCategoryCarousel(quotes, category) {
    const filtered = quotes.filter(q => q.categories.some(c => c.name === category));
    if (!filtered.length) return '';

    let slides = [];

    for (let i = 0; i < filtered.length; i += 6) {
        const chunk = filtered.slice(i, i + 6);
        let content = `<div class="row gx-1 gy-3">`;

        chunk.forEach(q => {
            content += `
            <div class="col-md-4 mb-3">
<div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
           style="background-image: url('${getRandomPaper()}') !important; cursor:pointer;"
           onclick="openQuotePage(event, '${q.slug}')">
                    <p class="quote-text flex-grow-1">“${q.text}”</p>
                    <p class="quote-author mt-2 text-end">
  — 
  <a href="author-profile.html?author=${q.author_username}" class="author-link">
    ${q.full_name || q.author_username}
  </a>
</p>
                    <hr style="border:2px solid #000; margin:8px 0;">
                    <div class="d-flex justify-content-between mt-3 icon-bar">

                        <!-- Like Button -->
                        <span class="material-symbols-outlined like-btn" data-id="${q.id}">
                            <span class="icon">favorite_border</span>
                            <span class="action-count">${q.likes_count || 0}</span>
                        </span>

                        <!-- Share Button -->
                        <span class="material-symbols-outlined share-btn" data-id="${q.id}">
                            <span class="icon-text">share</span>
                            <span class="action-count share-count">${q.share_count || 0}</span>
                        </span>

                        <!-- Save Button -->
                        <span class="material-symbols-outlined save-btn" data-id="${q.id}" data-saved="${q.saved_by_current_user}">
                            <span class="icon">${q.saved_by_current_user ? 'bookmark' : 'bookmark_border'}</span>
                            <span class="action-count save-count">${q.saved_count || 0}</span>
                        </span>

                        <!-- Comments -->
                        <a href="comments.html?quote=${q.id}">
                            <span class="material-symbols-outlined">chat_bubble</span>
                        </a>
                    </div>
                </div>
            </div>`;
        });

        content += `</div>`;
        slides.push(`<div class="carousel-item ${i === 0 ? 'active' : ''}">${content}</div>`);
    }

    return `
    <h4 class="fw-bold text-success mt-4">${category}</h4>
    <div id="carousel-${category}" class="carousel slide mb-5" data-bs-ride="carousel">
        <div class="carousel-inner">${slides.join("")}</div>
        <button class="carousel-control-prev" data-bs-target="#carousel-${category}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon bg-dark rounded-circle"></span>
        </button>
        <button class="carousel-control-next" data-bs-target="#carousel-${category}" data-bs-slide="next">
            <span class="carousel-control-next-icon bg-dark rounded-circle"></span>
        </button>
    </div>`;
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

function renderCategoryCarousels() {
    const container = document.getElementById("quotesCarouselContainer");
    container.innerHTML = "";
    categories.forEach(cat => {
        container.innerHTML += createCategoryCarousel(allQuotes, cat);
    });
}

// ================= SEARCH =================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (!query) renderCategoryCarousels();
            else searchQuotes(query);
        }, 300);
    });
});

async function searchQuotes(query) {
    try {
        const res = await axios.get(API.SEARCH_QUOTES(query));
        renderSearchResults(res.data);
    } catch (err) {
        console.error("Search API error:", err);
        const container = document.getElementById("quotesCarouselContainer");
        container.innerHTML = `<div class="text-center py-4">⚠️ No quotes found</div>`;
    }
}

function renderSearchResults(quotes) {
    const container = document.getElementById("quotesCarouselContainer");
    container.innerHTML = "";
    container.style.flexWrap = "wrap";
    container.style.justifyContent = "center";

    if (!quotes.length) {
        container.innerHTML = `<div class="text-center w-100 py-4">📭 No quotes found</div>`;
        return;
    }

    quotes.forEach(q => {
        const col = document.createElement("div");
        col.className = "col-md-3 mb-3";
        col.innerHTML = `
        <div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
             style="background-image: url('${getRandomPaper()}') !important;">
            <p class="quote-text flex-grow-1 text-danger fw-bolder">“${q.text}”</p>
            <p class="quote-author mt-2 text-end">
  — 
  <a href="author-profile.html?author=${q.author_username}" class="author-link">
    ${q.full_name || q.author_username}
  </a>
</p>

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
        </div>`;
        container.appendChild(col);
    });

    // Restore like/save state for search results
    restoreLikeSaveState();
}

// ================= RESTORE LIKE/SAVE STATE =================
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
