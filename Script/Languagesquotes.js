/* ================== API ================== */

const paperBackgrounds = [
    "images/bg1.png",
    "images/bg2.png",
    "images/image.png",
    "images/bg4.png",
    "images/bg5.png"
];

/* ================== DOM ================== */
const languagesContainer = document.getElementById("languagesContainer");
const quotesContainer = document.getElementById("quotesContainer");
const quotesTitle = document.getElementById("quotesTitle");

/* ================== LOAD LANGUAGES ================== */
async function loadLanguages() {
  try {
    const res = await fetch(API.LANGUAGES_API);
    const languages = await res.json();

    renderLanguages(languages);
  } catch (err) {
    console.error("Language load error:", err);
  }
}

/* ================== RENDER LANGUAGES ================== */
function renderLanguages(languages) {
  languagesContainer.innerHTML = languages.map(lang => `
    <div class="language-btn" data-id="${lang.id}" data-name="${lang.name}">
      ${lang.name}
    </div>
  `).join("");

  attachLanguageHandlers();
}

/* ================== CLICK HANDLERS ================== */
function attachLanguageHandlers() {
  document.querySelectorAll(".language-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".language-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      const id = btn.dataset.id;
      const name = btn.dataset.name;

      fetchLanguageQuotes(id, name);
    });
  });
}

/* ================== FETCH QUOTES ================== */
async function fetchLanguageQuotes(languageId, languageName) {
  quotesTitle.textContent = `Quotes in ${languageName}`;
  quotesContainer.innerHTML = `<div class="text-center text-muted">Loading quotes...</div>`;

  try {
    const res = await fetch(API.QUOTES_API(languageId));
    const quotes = await res.json();

    renderQuotes(quotes);
  } catch (err) {
    console.error("Quotes load error:", err);
    quotesContainer.innerHTML = `<div class="text-danger text-center">Failed to load quotes</div>`;
  }
}


// helper function
function getRandomPaper() {
    return paperBackgrounds[Math.floor(Math.random() * paperBackgrounds.length)];
}

/* ================== RENDER QUOTES ================== */
function renderQuotes(quotes) {
  if (!quotes.length) {
    quotesContainer.innerHTML = `
      <div class="text-center text-muted">
        No quotes available for this language
      </div>
    `;
    return;
  }

  quotesContainer.innerHTML = quotes.map(q => `
    <div class="col-md-4">
       <div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
             style="background-image: url('${getRandomPaper()}') !important;">
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
                <span class="material-symbols-outlined share-btn" data-id="${q.id}">
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
    </div>
  `).join("");

  // Restore like/save state for search results
    restoreLikeSaveState();
}

/* ================== INIT ================== */
loadLanguages();




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