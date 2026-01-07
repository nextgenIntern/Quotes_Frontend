
// for cards background rendering check for modifixcation in the line of quotes-cards c
window.paperBackgrounds = [
    "images/bg1.png",
    "images/bg2.png",
    "images/image.png",
    "images/bg4.png",
    "images/bg5.png"
];
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("RecommendedQuotesInner");

  if (!container) {
    console.warn("RecommendedQuotesInner not found");
    return;
  }

  loadRecommendedQuotes(container);
});

/* ================= LOAD POPULAR QUOTES ================= */
async function loadRecommendedQuotes(container) {
  try {
    
// console.log(API.HOME_QUOTES_RECOMMENDED)
    const res = await fetch(API.HOME_QUOTES_RECOMMENDED); // ✅ PUBLIC API
    if (!res.ok) throw new Error(`Failed (${res.status})`);

    const quotes = await res.json();
    renderRecommendedQuotes(container, quotes);

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
function renderRecommendedQuotes(container, quotes) {
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
        
        <p class="quote-text flex-grow-1 fw-bolder">“${q.text}”</p>
        <p class="quote-author mt-2 ">– ${q.author_username || "Unknown"}</p>

        <hr style="border:2px solid #000; margin:8px 0;">

        <div class="d-flex justify-content-between mt-3 icon-bar">
          <span class="material-symbols-outlined like-btn" data-id="${q.id}">
  favorite_border
  <span class="action-count">${q.likes_count || 0}</span>
</span>


          <span class="material-symbols-outlined share-btn " data-id="${q.id}">
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


function getSavedQuotes() {
  return JSON.parse(localStorage.getItem("savedQuotes")) || [];
}

function saveSavedQuotes(arr) {
  localStorage.setItem("savedQuotes", JSON.stringify(arr));
}


// This function sets up save/unsave buttons
/* ================== SETUP SAVE/UNSAVE BUTTONS ================== */
function setupSaveButtons() {
  const saveBtns = document.querySelectorAll('.save-btn');
  let savedQuotes = getSavedQuotes();

  saveBtns.forEach(btn => {
    const quoteId = btn.dataset.id;

    // 🔁 Restore saved state on page load
    if (savedQuotes.includes(quoteId)) {
      btn.classList.add("saved");
      btn.textContent = "bookmark";
    } else {
      btn.textContent = "bookmark_border";
    }

    btn.addEventListener('click', async () => {
      const isSavedNow = btn.classList.contains("saved");

      try {
        const url = isSavedNow
          ? API.UNSAVE_QUOTE(quoteId)
          : API.SAVE_QUOTE(quoteId);

        const res = await authFetch(url, { method: "POST" });
        if (!res.ok) throw new Error("Save failed");

        // 🔄 Toggle UI
        btn.classList.toggle("saved");
        btn.textContent = btn.classList.contains("saved")
          ? "bookmark"
          : "bookmark_border";

        // 💾 Store state
        if (btn.classList.contains("saved")) {
          if (!savedQuotes.includes(quoteId)) {
            savedQuotes.push(quoteId);
          }
        } else {
          savedQuotes = savedQuotes.filter(id => id !== quoteId);

          // 🗑 Remove card in Saved Quotes page
          if (document.getElementById("savedQuotesContainer")) {
            btn.closest(".col-md-3")?.remove();
          }
        }

        saveSavedQuotes(savedQuotes);

      } catch (err) {
        console.error("Save error:", err);
      }
    });
  });
}



// for like button
function getLikedQuotes() {
  return JSON.parse(localStorage.getItem("likedQuotes")) || [];
}

function saveLikedQuotes(arr) {
  localStorage.setItem("likedQuotes", JSON.stringify(arr));
}


function setupLikeButtons() {
  const likeBtns = document.querySelectorAll(".like-btn");
  let likedQuotes = getLikedQuotes();

  likeBtns.forEach(btn => {
    const quoteId = btn.dataset.id;

    // 🔁 Restore liked state after refresh
    if (likedQuotes.includes(quoteId)) {
      btn.classList.add("liked");
      btn.firstChild.textContent = "favorite";
    }

    btn.addEventListener("click", async () => {
      // ⛔ Prevent double-like
      if (likedQuotes.includes(quoteId)) {
        console.log("Already liked");
        return;
      }

      // 🔐 AUTH CHECK
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login to like quotes");
        return;
      }

      try {
        const res = await authFetch(
          API.LIKE_QUOTE(quoteId),
          { method: "POST" }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error("Like API failed:", res.status, text);
          return;
        }

        // ✅ UI UPDATE
        btn.classList.add("liked");
        btn.firstChild.textContent = "favorite";

        // ✅ COUNT UPDATE
        const countSpan = btn.querySelector(".action-count");
        if (countSpan) {
          countSpan.innerText =
            (parseInt(countSpan.innerText) || 0) + 1;
        }

        // ✅ STORE LOCALLY
        likedQuotes.push(quoteId);
        saveLikedQuotes(likedQuotes);

      } catch (err) {
        console.error("Like error:", err);
      }
    });
  });
}





