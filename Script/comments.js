
const params = new URLSearchParams(window.location.search);
const quoteId = params.get("quote");

// ================= LOAD QUOTE =================
async function loadQuote() {
    try {
        const res = await fetch(
            `http://eternal-lines.com/api/quotes/${quoteId}/`
        );
        const data = await res.json();

        document.getElementById("quoteText").innerText = `“${data.text}”`;
        document.getElementById("quoteAuthor").innerText =
            `— ${data.author_username || "Unknown"}`;
    } catch (err) {
        console.error("Quote load error:", err);
    }
}

// ================= LOAD COMMENTS =================
async function loadComments() {
    try {
        const res = await fetch(
            `http://140.245.5.153:8001/api/quotes/${quoteId}/comments/`
        );

        const comments = await res.json();

        const list = document.getElementById("commentsList");
        const count = document.getElementById("commentCount");

        list.innerHTML = "";
        count.innerText = comments.length;

        if (comments.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    Be the first to comment 🌱
                </div>
            `;
            return;
        }

        comments.forEach(c => {
            list.innerHTML += `
                <div class="comment-card">
                    <div class="comment-avatar">
                        ${c.username[0].toUpperCase()}
                    </div>

                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between">
                            <div>
                                <span class="comment-author">
                                    ${c.username}
                                </span>
                                ${
                                    c.is_personality
                                    ? `<span class="badge bg-warning text-dark ms-1">Personality</span>`
                                    : ""
                                }
                            </div>
                            <span class="comment-time">
                                ${new Date(c.created_at).toLocaleString()}
                            </span>
                        </div>

                        <p class="mb-1">${c.text}</p>

                        <small class="text-muted">
                            ❤️ ${c.likes_count}
                        </small>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Load comments error:", err);
    }
}

// ================= ADD COMMENT =================
async function addComment() {
    const textarea = document.getElementById("commentText");
    const text = textarea.value.trim();

    if (!text) {
        alert("Comment cannot be empty");
        return;
    }

    try {
        const res = await authFetch(
            `https://eternal-lines.com/api/quotes/${quoteId}/comment/`,
            {
                method: "POST",
                body: JSON.stringify({ text })
            }
        );

        if (!res.ok) throw new Error("Comment failed");

        textarea.value = "";
        loadComments();

    } catch (err) {
        console.error("Add comment error:", err);
        alert(
  err.message === "Comment failed"
    ? "Failed to post comment"
    : "Please login to comment"
);

    }
}

// ================= INIT =================
loadQuote();
loadComments();
