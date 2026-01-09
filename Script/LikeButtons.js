// for like button
function getLikedQuotes() {
  return JSON.parse(localStorage.getItem("likedQuotes")) || [];
}

function saveLikedQuotes(arr) {
  localStorage.setItem("likedQuotes", JSON.stringify(arr));
}


function setupLikeButtons() {
  const likeBtns = document.querySelectorAll(".like-btn");

  likeBtns.forEach(btn => {
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const quoteId = btn.dataset.id;
      let likedQuotes = getLikedQuotes();

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

        const data = await res.json();

        const countSpan = btn.querySelector(".action-count");
        let count = parseInt(countSpan.innerText) || 0;

        if (data.liked) {
          btn.classList.add("liked");
          btn.firstChild.textContent = "favorite";
          countSpan.innerText = count + 1;
          likedQuotes.push(quoteId);
        } else {
          btn.classList.remove("liked");
          btn.firstChild.textContent = "favorite_border";
          countSpan.innerText = Math.max(count - 1, 0);
          likedQuotes = likedQuotes.filter(id => id !== quoteId);
        }

        saveLikedQuotes(likedQuotes);

      } catch (err) {
        console.error("Like error:", err);
      }
    });
  });
}
