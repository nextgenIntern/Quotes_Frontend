
/* ===================== API ENDPOINTS ===================== */

const paperBackgrounds = [
    "images/bg1.png",
    "images/bg2.png",
    "images/image.png",
    "images/bg4.png",
    "images/bg5.png"
];
/* ===================== DOM ELEMENTS ===================== */
const authorsList = document.getElementById("authorsList");
const searchBox = document.getElementById("searchBox");

const modalEl = document.getElementById("authorModal");
const modal = new bootstrap.Modal(modalEl);

const modalAvatar = document.querySelector("#modalAvatar img");
const modalName = document.getElementById("modalName");
const modalBio = document.getElementById("modalBio");
const modalQuotes = document.getElementById("modalQuotes");

const statQuotes = document.getElementById("statQuotes");
const statLikes = document.getElementById("statLikes");
const statFollowers = document.getElementById("statFollowers");

const followBtn = document.getElementById("followBtn");
const profileBanner = document.querySelector(".profile-banner");

/* ===================== LOCAL STORAGE (FOLLOW MEMORY) ===================== */
function getFollowedUsers() {
  return JSON.parse(localStorage.getItem("followedUsers") || "[]");
}

function saveFollowedUsers(list) {
  localStorage.setItem("followedUsers", JSON.stringify(list));
}

/* ===================== LOAD AUTHORS ===================== */
async function loadAuthors() {
  try {
    const res = await fetch(API.USERS_API);
    const users = await res.json();
    renderAuthors(users);
  } catch (err) {
    console.error("Author load error:", err);
  }
}

/* ===================== RENDER AUTHORS ===================== */
function renderAuthors(list) {
  authorsList.innerHTML = list.map(u => `
    <div class="col-12 col-md-6 col-lg-3">
      <div class="author-card">
        <div class="author-avatar">
          <img src="${u.profile_image || "images/no profile.png"}">
        </div>

        <div class="author-body">
       <div class="author-name">
  ${u.full_name && u.full_name.trim() !== "" ? u.full_name : u.username}
</div>

          <div class="author-bio">
            ${truncate(u.bio || "No bio available", 100)}
          </div>

          <div class="author-meta mt-2">
            <span class="meta-pill">${u.total_quotes_posted || 0} quotes</span>
            <span class="meta-pill">${u.total_likes_for_his_quotes || 0} likes</span>
            <span class="meta-pill">${u.followers_count || 0} followers</span>
            <button class="btn-view" data-username="${u.username}">
              View profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  attachViewHandlers();
}


/* ===================== VIEW PROFILE HANDLER ===================== */
function attachViewHandlers() {
  document.querySelectorAll(".btn-view").forEach(btn => {
    btn.onclick = () => openAuthorProfile(btn.dataset.username);
  });
}

/* ===================== OPEN AUTHOR PROFILE ===================== */
async function openAuthorProfile(username) {
  try {
    const res = await fetch(API.SEARCH_API + username);
    const data = await res.json();
    if (!data.length) return;

    const author = data[0];

    /* Avatar */
    modalAvatar.src = author.profile_image
      ? author.profile_image
      : "images/no profile.png";

    /* Banner */
    if (profileBanner) {
      profileBanner.style.backgroundImage = `url(${
        author.profile_background
          ? author.profile_background
          : "images/h1.jpg"
      })`;
      profileBanner.style.backgroundSize = "cover";
      profileBanner.style.backgroundPosition = "center";
    }

    modalName.textContent = author.username;
    modalBio.textContent = author.bio || "No bio available";

    statQuotes.textContent = `Quotes: ${author.total_quotes_posted || 0}`;
    statLikes.textContent =
      `Likes: ${author.total_likes_for_his_quotes || 0}`;
    statFollowers.textContent =
      `Followers: ${author.followers_count || 0}`;

    setupFollowButton(author.username);

    renderAuthorQuotes(author.quotes || []);

    modal.show();
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

// helper function
function getRandomPaper() {
    return paperBackgrounds[Math.floor(Math.random() * paperBackgrounds.length)];
}
/* ===================== RENDER AUTHOR QUOTES ===================== */
function renderAuthorQuotes(quotes) {
  if (!quotes.length) {
    modalQuotes.innerHTML = `<div class="text-muted">No quotes yet</div>`;
    return;
  }

  modalQuotes.innerHTML = quotes.map(q => `
<div class="quote-card h-100 shadow rounded p-3 d-flex flex-column justify-content-between"
           style="background-image: url('${getRandomPaper()}') !important; cursor:pointer;"
           onclick="openQuotePage(event, '${q.slug}')">
        
        <p class="text-danger flex-grow-1 fw-bolder">“${q.text}”</p>
        <p class="quote-author mt-2 ">– ${q.full_name || q.author_username}</p>

        <hr style="border:2px solid #000; margin:8px 0;">

        <div class="d-flex justify-content-between mt-3 icon-bar">
          <span class="material-symbols-outlined like-btn" data-id="${q.id}">
  favorite_border
  <span class="action-count">${q.likes_count || 0}</span>
</span>


          <span class="material-symbols-outlined share-btn" data-id="${q.id}">
  <span class="icon-text " style="cursor: pointer;">share</span>
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
  `).join("");
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

/* ===================== FOLLOW / UNFOLLOW ===================== */
function setupFollowButton(username) {
  if (!followBtn) return;

  const token = localStorage.getItem("accessToken");
  followBtn.style.display = token ? "inline-block" : "none";

  let followedUsers = getFollowedUsers();
  let isFollowing = followedUsers.includes(username);

  updateFollowUI(isFollowing);

  followBtn.onclick = async () => {
    try {
      const url = isFollowing
        ? API.UNFOLLOW_API(username)
        : API.FOLLOW_API(username);

      const res = await authFetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Follow API failed");

      isFollowing = !isFollowing;

      if (isFollowing) {
        followedUsers.push(username);
      } else {
        followedUsers = followedUsers.filter(u => u !== username);
      }

      saveFollowedUsers(followedUsers);
      updateFollowUI(isFollowing);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };
}

function updateFollowUI(isFollowing) {
  followBtn.textContent = isFollowing ? "Following" : "Follow";
  followBtn.className = isFollowing
    ? "btn btn-secondary btn-sm"
    : "btn btn-outline-primary btn-sm";
}

/* ===================== SEARCH ===================== */
if (searchBox) {
  searchBox.addEventListener("input", async () => {
    const q = searchBox.value.trim();
    if (!q) {
      loadAuthors();
      return;
    }

    try {
      const res = await fetch(API.SEARCH_API + q);
      const data = await res.json();
      renderAuthors(data);
    } catch (err) {
      console.error("Search error:", err);
    }
  });
}

/* ===================== UTIL ===================== */
function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

/* ===================== INIT ===================== */
loadAuthors();


const authorModalEl = document.getElementById("authorModal");

authorModalEl.addEventListener("hidden.bs.modal", () => {
  document.body.focus();
});


function closeAuthorModal() {
  // Move focus OUT before closing modal
  document.activeElement.blur();
  document.body.focus();

  const modalEl = document.getElementById("authorModal");
  const instance = bootstrap.Modal.getInstance(modalEl);
  instance.hide();
}

// for like and share button in quotes.js and aurhor.js then where ever manual js is needed
document.addEventListener("click", async (e) => {

  /* ================= SAVE ================= */
  const saveBtn = e.target.closest(".save-btn");
  if (saveBtn) {
    const quoteId = saveBtn.dataset.id;
    let savedQuotes = getSavedQuotes();
    const isSaved = saveBtn.classList.contains("saved");

    try {
      const res = await authFetch(
        isSaved ? API.UNSAVE_QUOTE(quoteId) : API.SAVE_QUOTE(quoteId),
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Save failed");

      saveBtn.classList.toggle("saved");
      saveBtn.childNodes[0].textContent = saveBtn.classList.contains("saved")
        ? "bookmark"
        : "bookmark_border";

      if (saveBtn.classList.contains("saved")) {
        if (!savedQuotes.includes(quoteId)) savedQuotes.push(quoteId);
      } else {
        savedQuotes = savedQuotes.filter(id => id !== quoteId);
      }

      saveSavedQuotes(savedQuotes);
    } catch (err) {
      console.error("Save error:", err);
    }
    return;
  }

  /* ================= LIKE ================= */
 
});


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
