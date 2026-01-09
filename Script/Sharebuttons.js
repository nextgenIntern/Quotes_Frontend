let isSharing = false;

/* ================= SHARE HANDLER ================= */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".share-btn");
  if (!btn) return;

  if (isSharing) return; // 🛑 prevent double click
  isSharing = true;

  try {
    // Prefer slug from dataset, fallback to URL
    const slug = btn.dataset.slug || getSlugFromURL();

    if (!slug) {
      console.error("No slug found for sharing");
      return;
    }

    // ✅ Canonical share URL
    const shareUrl = `https://eternal-lines.com/quote/${slug}`;

    // ✅ Mobile / supported browsers
    if (navigator.share) {
      await navigator.share({
        title: "Eternal Lines",
        text: "Check out this quote ✨",
        url: shareUrl
      });
    }
    // ✅ Modern desktop fallback
    else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      showToast("🔗 Link copied!");
    }
    // ✅ Legacy fallback
    else {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("🔗 Link copied!");
    }

  } catch (err) {
    console.error("Share error:", err);
  } finally {
    isSharing = false; // ✅ always unlock
  }
});

/* ================= SLUG HELPER ================= */
function getSlugFromURL() {
  const path = window.location.pathname.replace(/\/$/, "");
  return path.substring(path.lastIndexOf("/") + 1);
}

/* ================= TOAST ================= */
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #000;
    color: #fff;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = "1"));

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
