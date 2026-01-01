const API_URL = "http://140.245.5.153:8001/api/quotes/";
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

document.addEventListener("DOMContentLoaded", fetchQuotes);

// ---------------- FETCH QUOTES ----------------
async function fetchQuotes() {
    try {
        const res = await axios.get(API_URL);
        allQuotes = res.data;

        categories = [
            ...new Set(
                allQuotes.flatMap(q => q.categories).map(c => c.name)
            )
        ];

        renderCategoryCarousels();
    } catch (err) {
        console.error("Quotes API error:", err);
    }
}

// helper function
function getRandomPaper() {
    return paperBackgrounds[Math.floor(Math.random() * paperBackgrounds.length)];
}

// ---------------- CREATE CAROUSEL ----------------
function createCategoryCarousel(quotes, category) {
    const filtered = quotes.filter(q =>
        q.categories.some(c => c.name === category)
    );

    if (!filtered.length) return '';

    let slides = [];

    for (let i = 0; i < filtered.length; i += 4) {
        const chunk = filtered.slice(i, i + 4);
        

        let content = `<div class="row justify-content-center">`;

        chunk.forEach(q => {
            content += `
          <div class="col-md-3 mb-3">
                    <div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
            style="background-image: url('${getRandomPaper()}') !important;">
        
        <p class="quote-text flex-grow-1">“${q.text}”</p>
        <p class="quote-author mt-2">– ${q.author_username || "Unknown"}</p>

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
                </div>`;
        });

        content += `</div>`;

        slides.push(`
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          ${content}
        </div>`);
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

// ---------------- RENDER ----------------
function renderCategoryCarousels() {
    const container = document.getElementById("quotesCarouselContainer");
    container.innerHTML = "";

    categories.forEach(cat => {
        container.innerHTML += createCategoryCarousel(allQuotes, cat);
    });
}

// ---------------- ACTION HANDLERS ----------------
// document.addEventListener("click", async e => {
//     const btn = e.target.closest(".like-btn, .save-btn, .share-btn");
//     if (!btn) return;

//     const quoteId = btn.dataset.id;
//     if (!token) return alert("Please login first");

//     const headers = { headers: { Authorization: `Bearer ${token}` } };

//     // LIKE / UNLIKE
//     if (btn.classList.contains("like-btn")) {
//         const liked = btn.classList.contains("active-like");
//         const url = liked
//             ? `${API_URL}${quoteId}/unlike/`
//             : `${API_URL}${quoteId}/like/`;

//         await axios.post(url, {}, headers);
//         btn.classList.toggle("active-like");
//     }

//     // SAVE / UNSAVE
//     if (btn.classList.contains("save-btn")) {
//         const saved = btn.classList.contains("active-save");
//         const url = saved
//             ? `${API_URL}${quoteId}/unsave/`
//             : `${API_URL}${quoteId}/save/`;

//         await axios.post(url, {}, headers);
//         btn.classList.toggle("active-save");
//     }

//     // SHARE
//     if (btn.classList.contains("share-btn")) {
//         e.stopPropagation();
//         const popup = btn.querySelector(".share-popup");
//         popup.style.display = popup.style.display === "block" ? "none" : "block";

//         const shareUrl = `${window.location.origin}/quotes.html?quote=${quoteId}`;

//         popup.querySelector(".whatsapp").href =
//             `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
//         popup.querySelector(".instagram").href = "https://www.instagram.com/";
//         popup.querySelector(".twitter").href =
//             `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;

//         await axios.post(`${API_URL}${quoteId}/share/`, {}, headers);
//     }
// });

// // CLOSE SHARE POPUP
// document.addEventListener("click", () => {
//     document.querySelectorAll(".share-popup").forEach(p => p.style.display = "none");
// });
