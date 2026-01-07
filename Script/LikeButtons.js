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