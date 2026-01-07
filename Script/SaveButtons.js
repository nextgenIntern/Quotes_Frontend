function getSavedQuotes() {
  return JSON.parse(localStorage.getItem("savedQuotes")) || [];
}

function saveSavedQuotes(arr) {
  localStorage.setItem("savedQuotes", JSON.stringify(arr));
}


// This function sets up save/unsave buttons
/* ================== SETUP SAVE/UNSAVE BUTTONS ================== */


function setupSaveButtons() {
  const saveBtns = document.querySelectorAll(".save-btn");
  
  if (!saveBtns.length) return;

  let savedQuotes = getSavedQuotes();

  saveBtns.forEach(btn => {
    const quoteId = btn.dataset.id;
    if (!quoteId) return;

    // Restore state
    if (savedQuotes.includes(quoteId)) {
      btn.classList.add("saved");
      btn.textContent = "bookmark";
    } else {
      btn.textContent = "bookmark_border";
    }

    btn.onclick = async () => {
      const isSaved = btn.classList.contains("saved");

      try {
        const url = isSaved
          ? API.UNSAVE_QUOTE(quoteId)
          : API.SAVE_QUOTE(quoteId);

        const res = await authFetch(url, { method: "POST" });
        if (!res.ok) throw new Error("Save failed");

        btn.classList.toggle("saved");
        btn.textContent = btn.classList.contains("saved")
          ? "bookmark"
          : "bookmark_border";

        if (btn.classList.contains("saved")) {
          if (!savedQuotes.includes(quoteId)) {
            savedQuotes.push(quoteId);
          }
        } else {
          savedQuotes = savedQuotes.filter(id => id !== quoteId);

          // remove card only on saved page
          if (document.getElementById("savedQuotesContainer")) {
            btn.closest(".col-lg-3, .col-md-4, .col-sm-6")?.remove();
          }
        }

        saveSavedQuotes(savedQuotes);
      } catch (err) {
        console.error("Save error:", err);
      }
    };
  });
}


