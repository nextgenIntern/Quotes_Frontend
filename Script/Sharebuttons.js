let isSharing = false;

// for share button
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".share-btn");
  if (!btn) return;

  if (isSharing) return; // 🛑 block double clicks
  isSharing = true;

  const shareUrl = btn.dataset.url;

  try {
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: "Quote",
        text: "Check out this quote",
        url: shareUrl
      });
    } 
    else if (
      window.isSecureContext &&
      typeof navigator.clipboard?.writeText === "function"
    ) {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    } 
    else {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Link copied!");
    }
  } catch (err) {
    console.error("Share error:", err);
  } finally {
    isSharing = false; // ✅ unlock after dialog closes
  }
});
