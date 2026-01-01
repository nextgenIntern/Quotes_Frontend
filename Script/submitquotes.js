// scripts/submit-quote.js

const QUOTE_API = API.SUBMIT_QUOTE;      // POST API
const LANG_API = API.LANGUAGES;          // GET API
const CATEGORY_API = API.CATEGORIES;     // GET API

let categories = []; // global array for suggestions

document.addEventListener("DOMContentLoaded", () => {
  loadLanguages();
  loadCategories();
  setupTagsInput();
  setupSubmitQuote();
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
async function loadCategories() {
  try {
    const res = await authFetch(CATEGORY_API);
    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();
    categories = data.map(cat => cat.name); // update global categories
    console.log("Loaded categories:", categories);

  } catch (err) {
    console.error("Categories load error:", err);
  }
}

/* ================= TAGS INPUT UI ================= */
function setupTagsInput() {
  const tagsInput = document.getElementById('tagsInput');
  const tagInput = document.getElementById('tagInput');
  const suggestions = document.getElementById('suggestions');
  let selected = [];

  function renderTags() {
    tagsInput.querySelectorAll('.tag').forEach(t => t.remove());
    selected.forEach(cat => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `${cat} <span class="remove">&times;</span>`;
      tag.querySelector('.remove').onclick = () => {
        selected = selected.filter(c => c !== cat);
        renderTags();
      };
      tagsInput.insertBefore(tag, tagInput);
    });
  }

  function showSuggestions() {
    const val = tagInput.value.toLowerCase();
    suggestions.innerHTML = '';
    const filtered = categories.filter(c => c.toLowerCase().includes(val) && !selected.includes(c));
    if (!filtered.length) return suggestions.classList.add('d-none');
    filtered.forEach(c => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.textContent = c;
      item.onclick = () => {
        selected.push(c);
        tagInput.value = '';
        renderTags();
        suggestions.classList.add('d-none');
      };
      suggestions.appendChild(item);
    });
    suggestions.classList.remove('d-none');
  }

  tagInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && tagInput.value.trim() && !selected.includes(tagInput.value.trim())) {
      selected.push(tagInput.value.trim());
      tagInput.value = '';
      renderTags();
      suggestions.classList.add('d-none');
      e.preventDefault();
    }
  });

  tagInput.addEventListener('input', showSuggestions);
  document.addEventListener('click', e => {
    if (!tagsInput.contains(e.target)) suggestions.classList.add('d-none');
  });

  // Save selected categories in a global property for submit
  window.getSelectedCategories = () => selected;
}

/* ================= SUBMIT QUOTE ================= */
function setupSubmitQuote() {
  const form = document.getElementById("submitQuoteForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = document.getElementById("quoteText").value.trim();
    const language_code = document.getElementById("quoteLanguage").value;
    const selectedCategories = window.getSelectedCategories();
    console.log("Submitting quote:", { text, language_code, selectedCategories });


    if (!text || !language_code || selectedCategories.length === 0) {
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
          categories: selectedCategories
        })
      });

      if (!res.ok) throw new Error("Quote submission failed");

      const data = await res.json();
      console.log("Quote submitted:", data);
      alert("Quote submitted successfully!");

    //   addQuoteToProfile(data);

      // reset form and selected categories
      form.reset();
      window.getSelectedCategories().length = 0; // clear array
      document.getElementById('tagsInput').querySelectorAll('.tag').forEach(t => t.remove());

    } catch (err) {
      console.error("Quote submission error:", err);
      alert("Failed to submit quote. Try again.");
    }
  });
}

/* ================= ADD QUOTE TO PROFILE ================= */
// function addQuoteToProfile(quote) {
//   const container = document.getElementById("userQuotesContainer");

//   const card = document.createElement("div");
//   card.className = "quote-card shadow rounded border p-3 mb-3";

//   card.innerHTML = `
//     <p class="quote-text">“${quote.text}”</p>
//     <p class="quote-author">- You</p>
//     <div class="d-flex justify-content-between mt-3 icon-bar">
//       <span class="material-symbols-outlined like-btn" data-id="${quote.id}" title="Like">
//         favorite_border
//         <span class="action-count like-count">0</span>
//       </span>
//       <span class="material-symbols-outlined dislike-btn" data-id="${quote.id}" title="Dislike">
//         thumb_down_off_alt
//         <span class="action-count dislike-count">0</span>
//       </span>
//       <span class="material-symbols-outlined share-btn" data-id="${quote.id}" title="Share">
//         share
//         <span class="action-count share-count">0</span>
//       </span>
//       <span class="material-symbols-outlined save-btn" data-id="${quote.id}" title="Save">
//         bookmark
//         <span class="action-count save-count">0</span>
//       </span>
//       <a href="comments.html?quote=${quote.id}">
//         <span class="material-symbols-outlined comment-btn" title="Comments">
//           chat_bubble
//         </span>
//       </a>
//     </div>
//   `;

//   container.prepend(card);
// }
