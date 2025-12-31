// scripts/profile.js

/* ================== API ================== */
const PROFILE_API = API.PROFILE;
const SAVED_API = API.SAVED_QUOTES;

/* ================== AUTH FETCH ================== */
async function authFetch(url, options = {}) {
  const token = getAccessToken();
  options.headers = options.headers || {};
  options.headers['Authorization'] = `Bearer ${token}`;

  // Only set Content-Type if body is NOT FormData
  if (options.body && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  return fetch(url, options);
}

/* ================== PAGE LOAD ================== */
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadProfile();
  loadSavedQuotes();
  setupEditProfile();
  setupBannerUpload();
  setupProfilePhotoUpload();
});

/* ================== AUTH CHECK ================== */
function checkAuth() {
  const token = getAccessToken();
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
  }
}

/* ================== LOAD PROFILE ================== */
async function loadProfile() {
  try {
    const res = await authFetch(PROFILE_API);
    if (!res.ok) throw new Error("Profile fetch failed");

    const data = await res.json();
    renderProfile(data);
    renderPostedQuotes(data);

  } catch (err) {
    console.error(err);
    clearAuth();
  }
}

/* ================== LOAD SAVED QUOTES ================== */
async function loadSavedQuotes() {
  try {
    const res = await authFetch(SAVED_API);
    if (!res.ok) throw new Error("Saved quotes failed");

    const quotes = await res.json();
    renderSavedQuotes(quotes);

  } catch (err) {
    console.error("Saved quotes error:", err);
  }
}

/* ================== RENDER PROFILE ================== */
function renderProfile(profile) {
  document.getElementById("profileUsername").innerText =
    (profile.full_name || "user");

  document.getElementById("profileBio").innerText =
    profile.bio || "✨ Tap edit to add your bio";

  document.getElementById("postsCount").innerText =
    profile.view_count?.length || 0;

  document.getElementById("followersCount").innerText =
    profile.followers_count || 0;

  document.getElementById("likesCount").innerText =
    profile.total_likes_on_posted_quotes || 0;

  // Profile image
  const profileImg = document.getElementById("profileImage");
  if (profile.profile_image) {
    profileImg.src = profile.profile_image;
    profileImg.style.display = "block";
  }

  // Banner image
  const banner = document.getElementById("bannerSection");
  if (profile.background_image) {
    banner.style.backgroundImage = `url(${profile.background_image})`;
    banner.classList.remove("empty-banner");
  }
}

/* ================== SAVED QUOTES ================== */
function renderSavedQuotes(quotes) {
  const container = document.getElementById("savedQuotesContainer");
  container.innerHTML = "";

  if (!quotes.length) {
    container.innerHTML = `<div class="empty-box">💾 No saved quotes</div>`;
    return;
  }

  let row;

  quotes.forEach((q, index) => {

    //  Create a new row every 4 cards
    if (index % 4 === 0) {
      row = document.createElement("div");
      row.className = "row";
      container.appendChild(row);
    }

    row.innerHTML += `
      <div class="col-md-3 col-sm-6 mb-4">
        <div 
          class="quote-card shadow rounded"
          style="
            border:2px solid #333;
            padding:15px;
            border-radius:10px;
            height:100%;
            display:flex;
            flex-direction:column;
            justify-content:space-between;
          "
        >
          <div>
            <p class="quote-text">“${q.text}”</p>
            <p class="quote-author">- ${q.author_username || "Unknown"}</p>

            <!-- bold divider -->
            <hr style="border:2px solid #000;margin:8px 0;">
          </div>

          <div 
            class="icon-bar"
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
            "
          >
            <span class="material-symbols-outlined like-btn" data-id="${q.id}">
              favorite_border
              <span class="action-count">${q.likes_count || 0}</span>
            </span>

            <span class="material-symbols-outlined share-btn" data-id="${q.id}">
              share
            </span>

            <span class="material-symbols-outlined save-btn" data-id="${q.id}">
              bookmark
            </span>

            <a href="comments.html?quote=${q.id}">
              <span class="material-symbols-outlined">
                chat_bubble
              </span>
            </a>
          </div>
        </div>
      </div>
    `;
});

}

/* ================== EDIT PROFILE ================== */
function setupEditProfile() {
  const editBtn = document.getElementById("editProfileBtn");
  const bioEl = document.getElementById("profileBio");
  const nameEl = document.getElementById("profileUsername");

  editBtn.onclick = () => {
    const bio = bioEl.innerText;
    const name = nameEl.innerText;

    // Editable UI
    nameEl.innerHTML = `
      <input 
        type="text" 
        id="editFullName" 
        value="${name}" 
        class="form-control mb-2"
        title="Name edit coming soon"
      />
    `;

    bioEl.innerHTML = `
      <textarea 
        id="editBio" 
        class="form-control"
        rows="3"
        maxlength="250"
      >${bio}</textarea>
    `;

    editBtn.style.display = "none";

    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Save";
    saveBtn.className = "btn btn-primary mt-2";
    editBtn.parentElement.appendChild(saveBtn);

    saveBtn.onclick = async () => {
      try {
        const res = await authFetch(API.PROFILE, {
          method: "PATCH",
          body: JSON.stringify({
            // full_name: document.getElementById("editFullName").value, // backend support later
            bio: document.getElementById("editBio").value
          })
        });

        if (!res.ok) throw new Error("Profile update failed");

        const data = await res.json();
        renderProfile(data);

        saveBtn.remove();
        editBtn.style.display = "inline-block";

      } catch (err) {
        console.error(err);
        alert("Profile update failed");
      }
    };
  };
}

/* ================== BANNER UPLOAD ================== */
/* ================== BANNER UPLOAD ================== */
function setupBannerUpload() {
  const input = document.getElementById("bannerInput");
  const btn = document.getElementById("changeBannerBtn");
  const banner = document.getElementById("bannerSection");

  btn.onclick = () => input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("background_image", file);

    try {
      const res = await authFetch(PROFILE_API, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to upload banner");

      const data = await res.json();
      if (data.background_image) {
        banner.style.backgroundImage = `url(${data.background_image})`;
        showMessage("Banner uploaded successfully ");
      }

    } catch (err) {
      console.error("Banner upload error:", err);
      alert("Banner upload failed ");
    }
  };
}

/* ================== PROFILE PHOTO UPLOAD ================== */
function setupProfilePhotoUpload() {
  const input = document.getElementById("profileImageInput");
  const btn = document.getElementById("changeProfileBtn");
  const img = document.getElementById("profileImage");

  btn.onclick = () => input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("profile_image", file);

    try {
      const res = await authFetch(PROFILE_API, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to upload profile image");

      const data = await res.json();
      if (data.profile_image) {
        img.src = data.profile_image;
        showMessage("Profile image uploaded successfully ");
      }

    } catch (err) {
      console.error("Profile image upload error:", err);
      alert("Profile image upload failed ❌");
    }
  };
}

/* ================== SHOW MESSAGE ================== */
function showMessage(msg) {
  const existing = document.getElementById("uploadMessage");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.id = "uploadMessage";
  div.innerText = msg;
  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.right = "20px";
  div.style.background = "#0d6efd";
  div.style.color = "#fff";
  div.style.padding = "10px 20px";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  div.style.zIndex = "9999";
  div.style.fontWeight = "600";

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 3000); // Remove after 3 seconds
}


/* ================== RENDER POSTED QUOTES ================== */
function renderPostedQuotes(profile) {
  const container = document.getElementById("postedQuotesContainer");
  container.innerHTML = "";

  const quotes = profile.posted_quotes || [];

  // 🔹 filter by logged-in username
  const myQuotes = quotes.filter(q =>
    q.author_username === q.username
  );

  if (!myQuotes.length) {
    container.innerHTML = `<div class="empty-box"> Not yet posted</div>`;
    return;
  }

  myQuotes.forEach(q => {
    container.innerHTML += `
      <div class="col-md-3 mb-3">
        <div class="quote-card shadow rounded border">
          <p class="quote-text">“${q.text}”</p>
          <p class="quote-author">- ${q.author_username || 'Unknown'}</p>

          <div class="d-flex justify-content-between mt-4 icon-bar">
            <span class="material-symbols-outlined like-btn" data-id="${q.id}" title="Like">
              favorite_border
              <span class="action-count like-count">${q.likes_count || q.likes || 0}</span>
            </span>

            <span class="material-symbols-outlined dislike-btn" data-id="${q.id}" title="Dislike">
              thumb_down_off_alt
              <span class="action-count dislike-count">${q.dislikes || 0}</span>
            </span>

            <span class="material-symbols-outlined share-btn" data-id="${q.id}" title="Share">
              share
              <span class="action-count share-count">${q.share_count || q.shares || 0}</span>
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
      </div>`;
  });
}

