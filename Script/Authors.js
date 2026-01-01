
    // Sample data - replace with API data later
    const authors = [
      {
        id:1,
        name: "Winston Churchill",
        bio: "British statesman, army officer, and writer. Prime Minister of the UK during WWII.",
        avatar: "https://i.pravatar.cc/300?img=12",
        tags: ["historical","politics"],
        quotes: [
          "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          "To improve is to change; to be perfect is to change often."
        ],
        stats: { quotes: 28, likes: 12458, followers: 98000 }
      },
      {
        id:2,
        name: "Buddha",
        bio: "An enlightened teacher and the founder of Buddhism whose teachings focus on compassion and mindfulness.",
        avatar: "https://i.pravatar.cc/300?img=10",
        tags: ["philosophy","historical","spiritual"],
        quotes: [
          "What we think, we become.",
          "Peace comes from within. Do not seek it without."
        ],
        stats: { quotes: 18, likes: 94034, followers: 180000 }
      },
      {
        id:3,
        name: "Jane Austen",
        bio: "English novelist known for her witty exploration of early 19th-century British life.",
        avatar: "https://i.pravatar.cc/300?img=20",
        tags: ["historical","poet","literature"],
        quotes: [
          "There is no charm equal to tenderness of heart.",
          "I declare after all there is no enjoyment like reading!"
        ],
        stats: { quotes: 12, likes: 20340, followers: 42000 }
      },
      {
        id:4,
        name: "Rumi",
        bio: "13th-century Persian poet, jurist, Islamic scholar, and Sufi mystic.",
        avatar: "https://i.pravatar.cc/300?img=25",
        tags: ["poet","spiritual","philosophy"],
        quotes: [
          "The wound is the place where the Light enters you.",
          "Let yourself be silently drawn by the strange pull of what you really love."
        ],
        stats: { quotes: 34, likes: 158000, followers: 290000 }
      },
      {
        id:5,
        name: "Maya Angelou",
        bio: "American poet, memoirist, and civil rights activist.",
        avatar: "https://i.pravatar.cc/300?img=18",
        tags: ["modern","poet","literature"],
        quotes: [
          "If you don't like something, change it. If you can't change it, change your attitude.",
          "There is no greater agony than bearing an untold story inside you."
        ],
        stats: { quotes: 22, likes: 62000, followers: 98000 }
      }
    ];

    const authorsList = document.getElementById('authorsList');
    const searchBox = document.getElementById('searchBox');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = new bootstrap.Modal(document.getElementById('authorModal'), {});
    const modalAvatar = document.getElementById('modalAvatar').querySelector('img');
    const modalName = document.getElementById('modalName');
    const modalBio = document.getElementById('modalBio');
    const modalQuotes = document.getElementById('modalQuotes');
    const statQuotes = document.getElementById('statQuotes');
    const statLikes = document.getElementById('statLikes');
    const statFollowers = document.getElementById('statFollowers');

    // Render author cards
    function renderAuthors(list){
      authorsList.innerHTML = list.map(a => `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="author-card">
            <div class="author-avatar"><img src="${a.avatar}" alt="${a.name}"></div>
            <div class="author-body">
              <div class="author-name">${a.name}</div>
              <div class="author-bio">${truncate(a.bio, 110)}</div>
              <div class="author-meta mt-2">
                <span class="meta-pill">${a.stats.quotes} quotes</span>
                <span class="meta-pill">${(a.stats.likes/1000).toFixed(1)}k likes</span>
                <div style="margin-left:auto" class="author-actions">
                  <button class="btn-view" data-id="${a.id}">View profile</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      attachViewHandlers();
    }

    // Truncate function
    function truncate(str, n){
      return str.length > n ? str.slice(0,n-1) + '…' : str;
    }

    // Attach click handlers to view buttons
    function attachViewHandlers(){
      document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.id);
          const author = authors.find(x=>x.id===id);
          if(!author) return;
          openAuthorModal(author);
        });
      });
    }

    // Open modal and populate
    function openAuthorModal(author){
      modalAvatar.src = author.avatar;
      modalName.textContent = author.name;
      modalBio.textContent = author.bio;
      statQuotes.textContent = `Quotes: ${author.stats.quotes}`;
      statLikes.textContent = `Likes: ${author.stats.likes.toLocaleString()}`;
      statFollowers.textContent = `Followers: ${author.stats.followers.toLocaleString()}`;

      modalQuotes.innerHTML = author.quotes.map(q=> `<div class="quote-item">${q}</div>`).join('');
      modal.show();
    }

    // Search & filter logic
    function filterAndRender(){
      const q = searchBox.value.trim().toLowerCase();
      const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

      const filtered = authors.filter(a=>{
        const matchesSearch = a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q) || a.tags.join(' ').includes(q);
        const matchesFilter = activeFilter === 'all' ? true : a.tags.includes(activeFilter);
        return matchesSearch && matchesFilter;
      });
      renderAuthors(filtered);
    }

    // Setup filters
    filterBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        filterAndRender();
      });
    });

    // Search input
    searchBox.addEventListener('input', filterAndRender);

    // initial render
    renderAuthors(authors);

    // Optional: keyboard hotspot to focus search on '/'
    document.addEventListener('keydown', e=>{
      if(e.key === '/') { e.preventDefault(); searchBox.focus(); }
    });

 