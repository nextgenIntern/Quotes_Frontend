// scripts/submit-quote.js

const QUOTE_API = API.SUBMIT_QUOTE;      // POST API
const LANG_API = API.LANGUAGES;          // GET API
const CATEGORY_API = API.CATEGORIES;     // GET API

let categories = []; // global array for suggestions

document.addEventListener("DOMContentLoaded", () => {
  loadLanguages();
  loadCategories();
  setupSubmitQuote();
  setupResetButton();
});

/* ================= LOAD LANGUAGES ================= */
async function loadLanguages() {
  try {
    const res = await authFetch(LANG_API);
    if (!res.ok) throw new Error("Failed to fetch languages");

    const languages = await res.json();
    const langSelect = document.getElementById("quoteLanguage");

    languages.forEach(lang => {
      const option = document.createElement("option");
      option.value = lang.code;
      option.innerText = lang.name;
      langSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Languages load error:", err);
  }
}

/* ================= LOAD CATEGORIES ================= */

let selectedCategories = [];

/* ========== LOAD CATEGORIES ========== */
async function loadCategories() {
  try {
    const res = await authFetch(CATEGORY_API);
    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();
    categories = data.map(cat => cat.name);

    renderCategoryChips();

  } catch (err) {
    console.error("Categories load error:", err);
  }
}

function renderCategoryChips() {
  const container = document.getElementById("categoryChips");
  container.innerHTML = "";

  categories.forEach(cat => {
    const chip = document.createElement("div");
    chip.className = "category-chip";
    chip.textContent = cat;

    chip.onclick = () => toggleCategory(cat, chip);

    container.appendChild(chip);
  });
}
function toggleCategory(category, chipEl) {
  if (selectedCategories.includes(category)) {
    selectedCategories = selectedCategories.filter(c => c !== category);
    chipEl.classList.remove("selected");
  } else {
    selectedCategories.push(category);
    chipEl.classList.add("selected");
  }

  console.log("Selected:", selectedCategories);
}




  window.getSelectedCategories = () => selectedCategories;


/* ================= SUBMIT QUOTE ================= */
function setupSubmitQuote() {
  const form = document.getElementById("submitQuoteForm");

  if (!form) {
    console.error("submitQuoteForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = document.getElementById("quoteText").value.trim();
    const language_code = document.getElementById("quoteLanguage").value;
    const categoriesSelected = window.getSelectedCategories();

    console.log("Submitting:", { text, language_code, categoriesSelected });

    if (!text || !language_code || categoriesSelected.length === 0) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await authFetch(QUOTE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language_code,
          categories: categoriesSelected
        })
      });

      if (!res.ok) throw new Error("Quote submission failed");

      const data = await res.json();
      alert("Quote submitted successfully!");

      // reset form
      form.reset();

      // reset categories (DATA + UI)
      selectedCategories.length = 0;
      document
        .querySelectorAll(".category-chip.selected")
        .forEach(chip => chip.classList.remove("selected"));

    } catch (err) {
      console.error("Quote submission error:", err);
      alert("Failed to submit quote. Try again.");
    }
  });
}

function setupResetButton() {
  const resetBtn = document.getElementById("resetQuoteForm");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", () => {
    // clear selected categories array
    selectedCategories.length = 0;

    // remove selected class from all chips
    document
      .querySelectorAll(".category-chip.selected")
      .forEach(chip => chip.classList.remove("selected"));

    console.log("Form reset: categories cleared");
  });
}

