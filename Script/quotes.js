const API_URL = "http://140.245.5.153:8001/api/quotes/";

let allQuotes = [];
let categories = [];

document.addEventListener("DOMContentLoaded", fetchQuotes);

async function fetchQuotes() {
    try {
        const res = await axios.get(API_URL);
        allQuotes = res.data;

        // 🔥 Extract UNIQUE categories from API
        categories = [
            ...new Set(
                allQuotes
                    .flatMap(q => q.categories)
                    .map(c => c.name.toLowerCase())
            )
        ];

        console.log("Quotes:", allQuotes);
        console.log("Categories from API:", categories);

        renderCategoryCarousels();
    } catch (err) {
        console.error("Quotes API error:", err);
    }
}

// Create carousel for a category (DESIGN UNCHANGED)
function createCategoryCarousel(quotes, category){
    const filtered = quotes.filter(q =>
        q.categories.some(c =>
            c.name.toLowerCase() === category
        )
    );

    if(filtered.length === 0) return '';

    let slides = [];
    for(let i = 0; i < filtered.length; i += 4) {
        const chunk = filtered.slice(i, i + 4);
        let slideContent = '<div class="row justify-content-center">';

        chunk.forEach(q => {
            slideContent += `
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="quote-card p-3 mb-3 sshadow rounded border">
                        <div class="quote-text fw-bold" style="font-size:1.1rem; color:#333;">
                            “${q.text}”
                        </div>
                        <div class="quote-author text-end fw-semibold mt-2" style="color:#0d6efd;">
                            – ${q.author_username}
                        </div>
                        <div class="d-flex justify-content-between mt-5">
                            <span class="material-symbols-outlined">favorite</span>
                            <span class="material-symbols-outlined">share</span>
                            <span class="material-symbols-outlined">bookmark</span>
                            <a href="comments.html?quote=${q.id}">
                                <span class="material-symbols-outlined">chat_bubble</span>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        slideContent += '</div>';
        slides.push(`
            <div class="carousel-item${i === 0 ? ' active' : ''}">
                ${slideContent}
            </div>
        `);
    }

    return `
        <h4 class="mt-4 mb-3 text-capitalize fw-bold" style="color:#198754;">
            ${category}
        </h4>

        <div id="carousel-${category}" class="carousel slide mb-5"
             data-bs-ride="carousel" data-bs-interval="3000">

            <div class="carousel-inner">
                ${slides.join('')}
            </div>

            <button class="carousel-control-prev" type="button"
                    data-bs-target="#carousel-${category}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon bg-dark rounded-circle p-2"></span>
            </button>

            <button class="carousel-control-next" type="button"
                    data-bs-target="#carousel-${category}" data-bs-slide="next">
                <span class="carousel-control-next-icon bg-dark rounded-circle p-2"></span>
            </button>
        </div>
    `;
}

// Render all category carousels
function renderCategoryCarousels(){
    const container = document.getElementById('quotesCarouselContainer');
    container.innerHTML = '';

    categories.forEach(cat => {
        container.innerHTML += createCategoryCarousel(allQuotes, cat);
    });
}


