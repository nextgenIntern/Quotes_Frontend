// scripts/categories.js

const CATEGORY_API = API.CATEGORIES;

document.addEventListener("DOMContentLoaded", loadCategories);

async function loadCategories() {
  const carouselInner = document.querySelector("#categoryCarousel .carousel-inner");

  if (!carouselInner) {
    console.warn("Category carousel not found in DOM");
    return;
  }

  try {
    const res = await fetch(CATEGORY_API);

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const categories = await res.json();
    renderCategories(categories);

  } catch (err) {
    console.error("Categories load error:", err);
    carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <div class="category-tag text-danger">
            ⚠️ Failed to load categories
          </div>
        </div>
      </div>
    `;
  }
}

function renderCategories(categories) {
  const carouselInner = document.querySelector("#categoryCarousel .carousel-inner");
  carouselInner.innerHTML = "";

  if (!Array.isArray(categories) || categories.length === 0) {
    carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <div class="category-tag">No categories available</div>
        </div>
      </div>
    `;
    return;
  }

  const chunkSize = 5;

  for (let i = 0; i < categories.length; i += chunkSize) {
    const chunk = categories.slice(i, i + chunkSize);

    const slide = document.createElement("div");
    slide.className = "carousel-item";
    if (i === 0) slide.classList.add("active");

    const slideContent = document.createElement("div");
    slideContent.className = "d-flex justify-content-center gap-3 flex-wrap";

    chunk.forEach(cat => {
      const tag = document.createElement("div");
      tag.className = "category-tag";
      tag.textContent = cat.name || "Unnamed";
      slideContent.appendChild(tag);
    });

    slide.appendChild(slideContent);
    carouselInner.appendChild(slide);
  }
}
