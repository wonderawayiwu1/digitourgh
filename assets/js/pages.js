/* DigiTour Frontend — Page bootstrappers */
(function () {
  'use strict';

  const HERO_SLIDES = null; // loaded from meta.json (PHP-identical sources paths)

  function bootHome() {
    const DT = window.DigiTour;
    const sorted = [...DT.destinations].sort((a, b) => (b.is_featured - a.is_featured) || (a.id - b.id));
    // Keep landing light: featured strip + compact grid (full catalogue on destinations.html)
    const gridList = sorted.slice(0, 12);
    const orbit = sorted.slice(0, 10);
    const hotels = [...DT.hotels].sort((a, b) => b.price_per_night - a.price_per_night).slice(0, 6);
    const reviews = DT.reviews.slice(0, 6);
    const heroSlides = (DT.meta && DT.meta.hero_slides) || [];

    const hero = document.getElementById('dtHero');
    if (hero && heroSlides.length) {
      hero.setAttribute('data-slides', JSON.stringify(heroSlides.map((s) => ({
        label: s.label, title: s.title, desc: s.desc, url: s.url,
      }))));
      hero.innerHTML = `
        <div class="dt-hero-videos" aria-hidden="true">
          ${heroSlides.map((s, i) => `
            <video class="dt-hero-video ${i === 0 ? 'is-active' : ''}" muted playsinline loop preload="${i === 0 ? 'metadata' : 'none'}" poster="${s.poster}">
              <source src="${s.video}" type="video/mp4">
            </video>`).join('')}
          ${heroSlides.map((s, i) => `
            <div class="dt-hero-fallback ${i === 0 ? 'is-active' : ''}" style="background-image:url('${s.poster}')" data-hero-fallback="${i}"></div>`).join('')}
        </div>
        <div class="dt-hero-overlay"></div>
        <div class="container dt-hero-content">
          <div class="row align-items-end">
            <div class="col-lg-8">
              <div class="dt-hero-kicker"><i class="fa-solid fa-compass"></i> Smart Tourism · Ghana</div>
              <h1 class="dt-hero-brand">Digi<span>Tour</span></h1>
              <div class="dt-hero-slide-copy">
                <p class="mb-1 small text-uppercase fw-bold" style="letter-spacing:.12em;color:#FEBD69;" id="dtHeroLabel">${DT.esc(heroSlides[0].label)}</p>
                <h2 id="dtHeroTitle">${DT.esc(heroSlides[0].title)}</h2>
                <p id="dtHeroDesc">${DT.esc(heroSlides[0].desc)}</p>
                <div class="dt-hero-actions">
                  <a href="${heroSlides[0].url}" class="btn btn-digitour-gold" id="dtHeroCta"><i class="fa-solid fa-arrow-right me-2"></i> Explore This Site</a>
                  <a href="#destinations-grid" class="btn btn-digitour-outline" style="border-color:#fff;color:#fff;">Browse All Destinations</a>
                </div>
              </div>
              <div class="dt-hero-progress" role="tablist" aria-label="Hero slides">
                ${heroSlides.map((s, i) => `<button type="button" class="dt-hero-dot ${i === 0 ? 'is-active' : ''}" aria-label="Slide ${i + 1}"><span></span></button>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="dt-orbit-wrap">
          <div class="dt-orbit-track" id="dtOrbitTrack">
            ${[...orbit, ...orbit].map((od) => `
              <a class="dt-orbit-item" href="destination-detail.html?id=${od.id}" title="${DT.esc(od.title)}">
                <div class="dt-orbit-circle"><img src="${DT.esc(od.image_url)}" alt="${DT.esc(od.title)}" loading="lazy" decoding="async" width="80" height="80"></div>
                <span>${DT.esc(od.title)}</span>
              </a>`).join('')}
          </div>
        </div>`;
    }

    const searchCount = document.getElementById('filtered-count');
    const totalLabel = document.getElementById('total-dest-label');
    if (searchCount) searchCount.textContent = String(gridList.length);
    if (totalLabel) totalLabel.textContent = String(DT.destinations.length);

    const stats = document.getElementById('home-stats');
    if (stats) {
      stats.innerHTML = `
        <div class="dt-stat reveal reveal-delay-1"><div class="dt-stat-num" data-count="${DT.destinations.length}">0</div><div class="dt-stat-label">Tourist Sites</div></div>
        <div class="dt-stat reveal reveal-delay-2"><div class="dt-stat-num" data-count="16">0</div><div class="dt-stat-label">Regions Covered</div></div>
        <div class="dt-stat reveal reveal-delay-3"><div class="dt-stat-num" data-count="${DT.hotels.length}">0</div><div class="dt-stat-label">Nearby Hotels</div></div>`;
    }

    const featStrip = document.getElementById('featured-strip');
    if (featStrip) {
      featStrip.innerHTML = sorted.slice(0, 8).map((feat) => `
        <a class="dt-featured-card" href="destination-detail.html?id=${feat.id}">
          <img src="${DT.esc(feat.image_url)}" alt="${DT.esc(feat.title)}" loading="lazy" decoding="async" width="280" height="180">
          <div class="dt-featured-card-cap">
            <span class="dt-badge dt-badge-gold mb-2">${DT.esc(feat.region)}</span>
            <h5>${DT.esc(feat.title)}</h5>
            <small>${DT.esc(feat.category)} · ${feat.nearby_hotel_count || 0} hotels nearby</small>
          </div>
        </a>`).join('');
    }

    const grid = document.getElementById('destination-container');
    if (grid) grid.innerHTML = gridList.map((d, i) => DT.bentoDestCard(d, i)).join('');

    const hotelGrid = document.getElementById('hotel-container');
    if (hotelGrid) hotelGrid.innerHTML = hotels.map((h, i) => DT.bentoHotelCard(h, i)).join('');

    const hotelLead = document.getElementById('hotel-lead');
    if (hotelLead) hotelLead.innerHTML = `Hand-picked stays from <strong>${DT.hotels.length}</strong> mapped hotels — book with clear nightly rates.`;

    const reviewRow = document.getElementById('reviews-row');
    if (reviewRow) {
      reviewRow.innerHTML = reviews.map((rev, i) => `
        <div class="col-md-4 reveal ${i % 3 === 1 ? 'reveal-delay-1' : (i % 3 === 2 ? 'reveal-delay-2' : '')}">
          <div class="review-card">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar-circle me-3">${DT.esc(String(rev.full_name).charAt(0).toUpperCase())}</div>
              <div>
                <h6 class="fw-bold mb-0">${DT.esc(rev.full_name)}</h6>
                <small class="text-secondary">${DT.esc(rev.dest_title || rev.hotel_name || 'Ghana traveller')}</small>
              </div>
            </div>
            <p class="text-secondary small flex-grow-1">“${DT.esc(rev.comment)}”</p>
            <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
              <div>${DT.renderStars(rev.rating)}</div>
              <span class="dt-badge dt-badge-teal">Approved</span>
            </div>
          </div>
        </div>`).join('');
    }

    const cta = document.getElementById('home-cta');
    if (cta) {
      const logged = DT.isLoggedIn();
      cta.innerHTML = `
        <h2 class="text-white mb-2" style="font-family:var(--font-display);font-weight:800;">Ready to explore Ghana?</h2>
        <p class="mb-4 mx-auto" style="max-width:520px;opacity:.9;">Create a free account to book hotels, leave reviews, and track your reservations.</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          ${logged
            ? `<a href="dashboard.html" class="btn btn-digitour-gold">Go to dashboard</a>`
            : `<a href="register.html" class="btn btn-digitour-gold">Create free account</a>
               <a href="login.html" class="btn btn-digitour-outline" style="border-color:#fff;color:#fff;">Log in</a>`}
          <a href="inquiry.html" class="btn btn-digitour-outline" style="border-color:#FEBD69;color:#FEBD69;">Ask a question</a>
        </div>`;
    }

    const topTitle = document.getElementById('top50-title');
    const topLead = document.getElementById('top50-lead');
    if (topTitle) topTitle.textContent = `Featured Ghana destinations`;
    if (topLead) {
      topLead.innerHTML =
        `A smooth selection of <strong>${gridList.length}</strong> highlights from <strong>${DT.destinations.length}</strong> sites. Search above or <a href="destinations.html">browse the full catalogue</a>.`;
    }

    DT.bindSearchFilters();
    enhanceHeroFallbacks();
    document.body.classList.add('dt-ready');
  }

  function enhanceHeroFallbacks() {
    document.querySelectorAll('.dt-hero-video').forEach((video, i) => {
      const fallback = document.querySelector(`[data-hero-fallback="${i}"]`);
      const fail = () => {
        if (fallback) fallback.classList.add('is-active');
        video.classList.remove('is-active');
      };
      video.addEventListener('error', fail);
      const source = video.querySelector('source');
      if (source) source.addEventListener('error', fail);
    });
  }

  function bootDestinations() {
    const DT = window.DigiTour;
    const regionQ = DT.qs('region') || '';
    const categoryQ = DT.qs('category') || '';
    let list = [...DT.destinations].sort((a, b) => (b.is_featured - a.is_featured) || (a.id - b.id));
    if (regionQ) list = list.filter((d) => d.region === regionQ);
    if (categoryQ) list = list.filter((d) => d.category === categoryQ);

    const title = document.getElementById('dest-hero-title');
    if (title) title.textContent = `Explore ${DT.destinations.length} destinations`;

    document.querySelectorAll('.category-pill').forEach((pill) => {
      const cat = pill.getAttribute('data-category') || '';
      pill.classList.toggle('active', cat === categoryQ || (!categoryQ && cat === ''));
    });

    const regionSelect = document.getElementById('region-filter');
    if (regionSelect && regionQ) regionSelect.value = regionQ;

    const grid = document.getElementById('destination-container');
    if (grid) {
      if (!list.length) {
        grid.innerHTML = `<div class="bento-item bento-wide" style="grid-column:1/-1;min-height:180px;display:grid;place-items:center;background:#fff;border-radius:24px;">
          <div class="text-center p-4"><p class="lead mb-3">No destinations match your filter criteria.</p>
          <a href="destinations.html" class="btn btn-digitour-outline">Reset Filters</a></div></div>`;
      } else {
        grid.innerHTML = list.map((d, i) => DT.bentoDestCard(d, i)).join('');
      }
    }
    const count = document.getElementById('filtered-count');
    const total = document.getElementById('total-count');
    if (count) count.textContent = String(list.length);
    if (total) total.textContent = String(DT.destinations.length);
    DT.bindSearchFilters();
  }

  function bootDetail() {
    const DT = window.DigiTour;
    const id = DT.qs('id');
    const dest = DT.destById(id);
    if (!dest) {
      window.location.href = 'destinations.html';
      return;
    }
    document.title = dest.title + ' | DigiTour Ghana';
    const hotels = DT.hotelsForDest(dest.id);
    const reviews = DT.reviewsForDest(dest.id);
    const images = dest.images && dest.images.length ? dest.images : [dest.image_url];
    const wa = (DT.meta && DT.meta.whatsapp) || 'https://wa.me/233549326089';

    const hero = document.getElementById('detail-hero');
    if (hero) {
      hero.style.setProperty('--detail-bg', `url('${dest.image_url}')`);
      hero.innerHTML = `
        <div class="container py-2">
          <div class="row align-items-center">
            <div class="col-lg-8 reveal reveal-left">
              <a href="destinations.html" class="btn btn-sm btn-outline-light mb-3 rounded-pill px-3 shadow-sm d-inline-flex align-items-center gap-2" style="background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.4);">
                <i class="fa-solid fa-arrow-left"></i> Back to Destinations
              </a><br>
              <span class="dt-badge dt-badge-gold mb-2 me-2">${DT.esc(dest.region)}</span>
              <span class="dt-badge dt-badge-navy mb-2">${DT.esc(dest.category)}</span>
              <h1 class="dt-detail-title text-white mb-3">${DT.esc(dest.title)}</h1>
              <p class="lead mb-0 dt-detail-lead"><i class="fa-solid fa-location-dot me-2" style="color:#FEBD69"></i> ${DT.esc(dest.location_contact || '')}</p>
            </div>
            <div class="col-lg-4 text-lg-end mt-4 mt-lg-0 reveal reveal-right">
              <a href="#nearby-hotels" class="btn btn-digitour-gold"><i class="fa-solid fa-bed me-2"></i> Book Nearby Hotel</a>
            </div>
          </div>
        </div>`;
    }

    const overview = document.getElementById('article-overview-body');
    if (overview) overview.innerHTML = dest.description || '';
    const historyWrap = document.getElementById('article-history');
    const historyBody = document.getElementById('article-history-body');
    if (dest.history && historyBody) {
      historyBody.innerHTML = dest.history;
      historyWrap && historyWrap.classList.remove('d-none');
    }

    const gallery = document.getElementById('article-gallery');
    if (gallery) {
      gallery.innerHTML = `
        <h3 class="fw-bold border-bottom pb-2 mb-3"><i class="fa-solid fa-images me-2" style="color:var(--amazon-orange)"></i> Photo Gallery (${images.length} photos)</h3>
        <div id="destinationGalleryCarousel" class="carousel slide dt-gallery-carousel mb-3" data-bs-ride="carousel" data-bs-interval="4000" data-bs-pause="false" data-bs-wrap="true">
          <div class="carousel-indicators">
            ${images.map((_, idx) => `<button type="button" data-bs-target="#destinationGalleryCarousel" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}" aria-label="Slide ${idx + 1}"></button>`).join('')}
          </div>
          <div class="carousel-inner">
            ${images.map((img, idx) => `
              <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                <img src="${DT.esc(img)}" class="d-block w-100" alt="${DT.esc(dest.title)} Photo ${idx + 1}">
                <div class="carousel-caption d-none d-md-block rounded p-2" style="background:rgba(35,47,62,.55);">
                  <p class="mb-0 fw-bold">${DT.esc(dest.title)} — ${idx + 1} / ${images.length}</p>
                </div>
              </div>`).join('')}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#destinationGalleryCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
          <button class="carousel-control-next" type="button" data-bs-target="#destinationGalleryCarousel" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
        </div>
        <div class="dt-thumb-rail ${images.length > 6 ? 'auto-scroll' : ''}">
          ${(images.length > 6 ? images.concat(images) : images).map((img, idx) => {
            const real = idx % images.length;
            return `<img src="${DT.esc(img)}" data-slide="${real}" alt="Thumbnail ${real + 1}" class="${real === 0 ? 'is-active' : ''}">`;
          }).join('')}
        </div>`;
    }

    const reviewMount = document.getElementById('reviews-mount');
    if (reviewMount) {
      let html = `<h3 class="fw-bold border-bottom pb-2 mb-4 h4"><i class="fa-solid fa-comments me-2" style="color:var(--amazon-orange)"></i> Reviews</h3>`;
      if (!reviews.length) {
        html += `<p class="text-secondary p-3 rounded-3" style="background:var(--bg-soft)">No reviews approved for this site yet. Be the first to share your experience!</p>`;
      } else {
        html += `<div class="d-flex flex-column gap-3 mb-4">${reviews.map((rev) => `
          <div class="review-card">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center">
                <div class="avatar-circle me-2">${DT.esc(String(rev.full_name).charAt(0).toUpperCase())}</div>
                <div><h6 class="fw-bold mb-0">${DT.esc(rev.full_name)}</h6></div>
              </div>
              <div>${DT.renderStars(rev.rating)}</div>
            </div>
            <p class="mb-0 small text-secondary">${DT.esc(rev.comment)}</p>
          </div>`).join('')}</div>`;
      }
      html += `<div class="auth-card mt-4">
        <h5 class="fw-bold mb-3"><i class="fa-solid fa-pen-to-square me-2" style="color:var(--amazon-orange)"></i> Leave a Review for ${DT.esc(dest.title)}</h5>
        ${DT.isLoggedIn() ? `
          <form id="review-form">
            <div class="mb-3"><label class="form-label fw-bold">Your Rating</label>
              <select name="rating" class="form-select w-auto" required>
                <option value="5">5 Stars (Excellent)</option><option value="4">4 Stars (Very Good)</option>
                <option value="3">3 Stars (Average)</option><option value="2">2 Stars (Poor)</option><option value="1">1 Star (Very Poor)</option>
              </select></div>
            <div class="mb-3"><label class="form-label fw-bold">Your Review Comments</label>
              <textarea name="comment" class="form-control" rows="3" required placeholder="Describe your experience visiting this site..."></textarea></div>
            <button type="submit" class="btn btn-digitour-primary"><i class="fa-solid fa-paper-plane me-1"></i> Submit Review</button>
          </form>` : `
          <p class="text-secondary mb-2">You must be logged in as a registered tourist to submit reviews.</p>
          <a href="login.html" class="btn btn-digitour-outline btn-sm"><i class="fa-solid fa-right-to-bracket me-1"></i> Log In to Review</a>`}
      </div>`;
      reviewMount.innerHTML = html;
      const rf = document.getElementById('review-form');
      if (rf) {
        rf.addEventListener('submit', (e) => {
          e.preventDefault();
          DT.toast('<i class="fa-solid fa-check-circle me-1"></i> Thank you! Your review was submitted (demo — pending approval).', 'success');
          rf.reset();
        });
      }
    }

    const facts = document.getElementById('dest-facts');
    if (facts) {
      facts.innerHTML = `
        <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
          <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-compass me-2" style="color:var(--amazon-orange)"></i> Destination Facts</h5>
          <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i class="fa-solid fa-check-circle me-1"></i> Verified</span>
        </div>
        <ul class="list-group list-group-flush mb-4">
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-2">
            <span class="text-secondary fw-semibold"><i class="fa-solid fa-map-pin me-2 text-warning"></i> Region</span>
            <span class="fw-bold text-dark">${DT.esc(dest.region)}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-2">
            <span class="text-secondary fw-semibold"><i class="fa-solid fa-layer-group me-2 text-info"></i> Category</span>
            <span class="fw-bold text-dark">${DT.esc(dest.category)}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-2">
            <span class="text-secondary fw-semibold"><i class="fa-solid fa-camera me-2 text-danger"></i> Photos</span>
            <span class="dt-badge dt-badge-gold fw-bold">${images.length} photos</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-2">
            <span class="text-secondary fw-semibold"><i class="fa-solid fa-hotel me-2 text-primary"></i> Accommodations</span>
            <span class="dt-badge dt-badge-teal fw-bold">${hotels.length} available</span>
          </li>
        </ul>
        <div class="d-grid gap-2 mb-3">
          <a href="#nearby-hotels" class="btn btn-digitour-gold py-2 fw-bold shadow-sm"><i class="fa-solid fa-bed me-2"></i> Book Nearby Hotels</a>
          <a href="inquiry.html?site=${encodeURIComponent(dest.title)}" class="btn btn-digitour-outline py-2 fw-bold"><i class="fa-solid fa-paper-plane me-2"></i> Ask Admin a Question</a>
        </div>
        <div class="p-3 rounded-3 bg-light text-center border">
          <small class="text-secondary d-block"><i class="fa-solid fa-shield-cat me-1 text-success"></i> Instant Confirmation & Guided Tours Available</small>
        </div>`;
    }

    const hotelTitle = document.getElementById('nearby-title');
    if (hotelTitle) hotelTitle.textContent = `Hotels near ${dest.title}`;
    const hotelGrid = document.getElementById('nearby-hotels-grid');
    if (hotelGrid) {
      if (!hotels.length) {
        hotelGrid.innerHTML = `<div class="alert alert-info py-4 text-center reveal"><i class="fa-solid fa-hotel fa-2x mb-2 d-block"></i>Currently no hotels registered near this location.</div>`;
      } else {
        hotelGrid.innerHTML = `<div class="bento-grid bento-hotels">${hotels.map((hotel, hi) => {
          const meta = DT.bentoMeta(hi + 1);
          const shape = meta.shape === 'circle' ? 'square' : meta.shape;
          return `
            <article class="bento-item bento-${shape} accent-${meta.accent} hotel-bento reveal" style="--i:${hi}">
              <div class="bento-media">
                <img src="${DT.esc(hotel.image_url)}" alt="${DT.esc(hotel.name)}" loading="lazy">
                <span class="hotel-price-tag bento-price" data-price-usd="${hotel.price_per_night}">${DT.formatCurrency(hotel.price_per_night)}/night</span>
              </div>
              <div class="bento-cap">
                <span class="bento-chip">${hotel.room_capacity || 1} bed(s)</span>
                <h3>${DT.esc(hotel.name)}</h3>
                <p>${DT.esc(DT.shortDesc(hotel.description, 90))}</p>
                <div class="d-flex gap-2 flex-wrap mt-2">
                  <a class="btn btn-digitour-gold btn-sm" href="book-hotel.html?hotel_id=${hotel.id}">Book Now</a>
                  <a class="btn btn-digitour-outline btn-sm" href="${wa}?text=${encodeURIComponent('Hi, I want to ask about ' + hotel.name + ' near ' + dest.title)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i></a>
                </div>
              </div>
            </article>`;
        }).join('')}</div>`;
      }
    }
  }

  function bootBook() {
    const DT = window.DigiTour;
    const hotelId = DT.qs('hotel_id');
    if (!DT.isLoggedIn()) {
      window.location.href = 'login.html?msg=' + encodeURIComponent('Please log in to reserve a room.') + '&redirect=' + encodeURIComponent('book-hotel.html?hotel_id=' + hotelId);
      return;
    }
    const hotel = DT.hotelById(hotelId);
    if (!hotel) {
      window.location.href = 'destinations.html';
      return;
    }
    document.title = 'Book ' + hotel.name + ' | DigiTour Ghana';
    const images = hotel.images || [hotel.image_url];
    const today = new Date();
    const inDate = new Date(today); inDate.setDate(today.getDate() + 1);
    const outDate = new Date(today); outDate.setDate(today.getDate() + 3);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const header = document.getElementById('book-header');
    if (header) {
      header.style.background = `linear-gradient(rgba(15, 23, 43, .72), rgba(15, 23, 43, .72)), url('${hotel.image_url}') center/cover`;
      header.innerHTML = `
        <div class="container-fluid page-header-inner py-4 py-md-5">
          <div class="container text-center pb-3 pb-md-4 pt-3">
            <h1 class="dt-page-hero-title text-white mb-2">${DT.esc(hotel.name)}</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb justify-content-center text-uppercase mb-0 small">
                <li class="breadcrumb-item"><a href="index.html" class="text-warning">Home</a></li>
                <li class="breadcrumb-item"><a href="destinations.html" class="text-warning">Destinations</a></li>
                <li class="breadcrumb-item text-white active">Book Room</li>
              </ol>
            </nav>
          </div>
        </div>`;
    }

    const left = document.getElementById('book-left');
    if (left) {
      left.innerHTML = `
        <div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
          <div id="bookingHotelCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              ${images.map((img, i) => `<div class="carousel-item ${i === 0 ? 'active' : ''}"><img src="${DT.esc(img)}" class="d-block w-100" style="height:320px;object-fit:cover;" alt="${DT.esc(hotel.name)}"></div>`).join('')}
            </div>
            ${images.length > 1 ? `<button class="carousel-control-prev" type="button" data-bs-target="#bookingHotelCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
            <button class="carousel-control-next" type="button" data-bs-target="#bookingHotelCarousel" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>` : ''}
          </div>
          <div class="p-4">
            <h4 class="fw-bold">${DT.esc(hotel.name)}</h4>
            <p class="text-secondary mb-2"><i class="fa-solid fa-map-marker-alt me-1 text-warning"></i> Near <strong>${DT.esc(hotel.destination_title)}</strong> · ${DT.esc(hotel.region)}</p>
            <p class="small text-secondary">${DT.esc(hotel.description || '')}</p>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <span class="dt-badge dt-badge-gold"><i class="fa-solid fa-bed me-1"></i> ${hotel.room_capacity || 1} beds</span>
              <span class="dt-badge dt-badge-teal" data-price-usd="${hotel.price_per_night}">${DT.formatCurrency(hotel.price_per_night)} / night</span>
            </div>
          </div>
        </div>`;
    }

    const right = document.getElementById('book-right');
    if (right) {
      right.innerHTML = `
        <div class="card border-0 shadow-lg rounded-4 p-4">
          <h5 class="fw-bold mb-3"><i class="fa-solid fa-calendar-check me-2" style="color:var(--amazon-orange)"></i> Reservation details</h5>
          <div id="book-alert"></div>
          <form id="booking-form">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Check-in</label>
                <input type="date" id="check_in_date" name="check_in" class="form-control" required min="${fmt(today)}" value="${fmt(inDate)}">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Check-out</label>
                <input type="date" id="check_out_date" name="check_out" class="form-control" required min="${fmt(inDate)}" value="${fmt(outDate)}">
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Guests</label>
                <input type="number" name="guests" class="form-control" min="1" max="${hotel.room_capacity || 4}" value="2" required>
              </div>
            </div>
            <div class="mt-4 p-3 rounded-3" style="background:var(--bg-soft);border:1px solid var(--border-soft)">
              <div class="d-flex justify-content-between mb-2"><span>Price / night</span><strong id="price_per_night" data-price="${hotel.price_per_night}" data-price-usd="${hotel.price_per_night}">${DT.formatCurrency(hotel.price_per_night)}</strong></div>
              <div class="d-flex justify-content-between mb-2"><span>Nights</span><strong id="total_nights">2</strong></div>
              <div class="d-flex justify-content-between border-top pt-2"><span class="fw-bold">Total</span><strong class="text-success fs-5" id="total_price_calc" data-price-usd="${hotel.price_per_night * 2}">${DT.formatCurrency(hotel.price_per_night * 2)}</strong></div>
            </div>
            <button type="submit" class="btn btn-digitour-gold w-100 mt-4 fw-bold py-2"><i class="fa-solid fa-lock me-2"></i> Confirm Reservation</button>
            <p class="small text-secondary text-center mt-3 mb-0">Static demo — booking is saved in your browser only.</p>
          </form>
        </div>`;
    }

    // Re-bind price calculator after dynamic DOM
    const checkInInput = document.getElementById('check_in_date');
    const checkOutInput = document.getElementById('check_out_date');
    const pricePerNightElem = document.getElementById('price_per_night');
    const nightsCountElem = document.getElementById('total_nights');
    const totalPriceElem = document.getElementById('total_price_calc');
    function calc() {
      if (!checkInInput || !checkOutInput || !pricePerNightElem) return;
      const price = parseFloat(pricePerNightElem.getAttribute('data-price')) || 0;
      const d1 = new Date(checkInInput.value);
      const d2 = new Date(checkOutInput.value);
      const days = Math.ceil((d2 - d1) / 86400000);
      if (days > 0) {
        nightsCountElem.textContent = String(days);
        totalPriceElem.textContent = DT.formatCurrency(days * price);
        totalPriceElem.setAttribute('data-price-usd', String(days * price));
      }
    }
    if (checkInInput) checkInInput.addEventListener('change', calc);
    if (checkOutInput) checkOutInput.addEventListener('change', calc);
    calc();

    const form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const nights = parseInt(document.getElementById('total_nights').textContent, 10) || 1;
        const booking = {
          id: Date.now(),
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          destination_title: hotel.destination_title,
          check_in_date: fd.get('check_in'),
          check_out_date: fd.get('check_out'),
          guests_count: parseInt(fd.get('guests'), 10) || 1,
          total_price: nights * hotel.price_per_night,
          status: 'Pending',
          user_name: (DT.getUser() || {}).name || 'Guest',
        };
        const stored = JSON.parse(localStorage.getItem('dt_bookings') || '[]');
        stored.unshift(booking);
        localStorage.setItem('dt_bookings', JSON.stringify(stored));
        window.location.href = 'dashboard.html?msg=' + encodeURIComponent('Reservation submitted successfully! Status: Pending (demo).');
      });
    }
  }

  function bootInquiry() {
    const DT = window.DigiTour;
    const site = DT.qs('site') || '';
    const subject = document.getElementById('inq-subject');
    if (subject && site) subject.value = 'Inquiry regarding ' + site;
    const user = DT.getUser();
    if (user) {
      const n = document.getElementById('inq-name');
      const e = document.getElementById('inq-email');
      if (n) n.value = user.name || '';
      if (e) e.value = user.email || '';
    }
    const form = document.getElementById('inquiry-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const alert = document.getElementById('inq-alert');
        if (alert) {
          alert.innerHTML = `<div class="alert alert-success"><i class="fa-solid fa-circle-check me-1"></i> Thank you! Your inquiry has been sent to the DigiTour Tourism Board. (Static demo — no server.)</div>`;
        }
        form.reset();
        DT.toast('Inquiry sent successfully (demo).', 'success');
      });
    }
  }

  function bootLogin() {
    const DT = window.DigiTour;
    if (DT.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }
    const msg = DT.qs('msg');
    if (msg) {
      const el = document.getElementById('login-msg');
      if (el) el.innerHTML = `<div class="alert alert-info"><i class="fa-solid fa-info-circle me-1"></i> ${DT.esc(msg)}</div>`;
    }
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.email.value.trim().toLowerCase();
        const password = form.password.value;
        const demo = (DT.meta.demo_users || []).find((u) => u.email === email && u.password === password);
        const err = document.getElementById('login-error');
        if (!demo) {
          if (err) err.innerHTML = `<div class="alert alert-danger"><i class="fa-solid fa-triangle-exclamation me-1"></i> Invalid email or password. Try kwame@example.com / demo123</div>`;
          return;
        }
        DT.setUser({ name: demo.name, email: demo.email, role: demo.role });
        const redirect = DT.qs('redirect') || 'dashboard.html';
        window.location.href = redirect;
      });
    }
  }

  function bootRegister() {
    const DT = window.DigiTour;
    if (DT.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.full_name.value.trim();
        const email = form.email.value.trim().toLowerCase();
        const phone = form.phone.value.trim();
        if (!name || !email || !form.password.value) {
          DT.toast('Please fill all required fields.', 'danger');
          return;
        }
        DT.setUser({ name, email, phone, role: 'tourist' });
        window.location.href = 'dashboard.html?msg=' + encodeURIComponent('Welcome to DigiTour! Account created (demo).');
      });
    }
  }

  function bootDashboard() {
    const DT = window.DigiTour;
    if (!DT.isLoggedIn()) {
      window.location.href = 'login.html?msg=' + encodeURIComponent('Please log in to view your dashboard.');
      return;
    }
    const user = DT.getUser();
    const msg = DT.qs('msg');
    if (msg) {
      const el = document.getElementById('dash-msg');
      if (el) el.innerHTML = `<div class="alert alert-success alert-dismissible fade show">${DT.esc(msg)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }
    document.getElementById('dash-name') && (document.getElementById('dash-name').textContent = user.name);
    document.getElementById('dash-email') && (document.getElementById('dash-email').textContent = user.email);

    const localBookings = JSON.parse(localStorage.getItem('dt_bookings') || '[]');
    const firstName = (user.name || '').split(' ')[0];
    const seed = DT.bookings.filter((b) => {
      if (!firstName) return false;
      return String(b.user_name || '').toLowerCase().includes(firstName.toLowerCase());
    });
    const all = [...localBookings, ...seed];

    const bookMount = document.getElementById('dash-bookings');
    if (bookMount) {
      if (!all.length) {
        bookMount.innerHTML = `<p class="text-secondary">No bookings yet. <a href="destinations.html">Explore destinations</a> and reserve a stay.</p>`;
      } else {
        bookMount.innerHTML = `<div class="table-responsive"><table class="table align-middle">
          <thead><tr><th>Hotel</th><th>Dates</th><th>Guests</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>${all.map((b) => `
            <tr>
              <td><strong>${DT.esc(b.hotel_name)}</strong><br><small class="text-secondary">${DT.esc(b.destination_title || '')}</small></td>
              <td>${DT.esc(b.check_in_date)} → ${DT.esc(b.check_out_date)}</td>
              <td>${b.guests_count}</td>
              <td data-price-usd="${b.total_price}">${DT.formatCurrency(b.total_price)}</td>
              <td><span class="badge ${b.status === 'Confirmed' ? 'bg-success' : b.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}">${DT.esc(b.status)}</span></td>
            </tr>`).join('')}</tbody></table></div>`;
      }
    }

    const revMount = document.getElementById('dash-reviews');
    if (revMount) {
      revMount.innerHTML = DT.reviews.slice(0, 4).map((r) => `
        <div class="review-card mb-3">
          <div class="d-flex justify-content-between"><strong>${DT.esc(r.dest_title || r.hotel_name || 'Ghana')}</strong>${DT.renderStars(r.rating)}</div>
          <p class="small text-secondary mb-0 mt-2">“${DT.esc(r.comment)}”</p>
        </div>`).join('') || '<p class="text-secondary">No reviews yet.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const DT = window.DigiTour;
    try {
      await DT.ready;
    } catch (err) {
      console.error(err);
      document.body.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger m-3">Failed to load DigiTour data. Serve this folder over HTTP (e.g. Netlify or a local static server).</div>`);
      return;
    }
    const page = document.body.getAttribute('data-page') || DT.pageName();
    DT.renderShell({ active: page });
    const map = {
      'index.html': bootHome,
      'destinations.html': bootDestinations,
      'destination-detail.html': bootDetail,
      'book-hotel.html': bootBook,
      'inquiry.html': bootInquiry,
      'login.html': bootLogin,
      'register.html': bootRegister,
      'dashboard.html': bootDashboard,
    };
    if (map[page]) map[page]();
    document.body.classList.add('dt-ready');
    // Re-init effects after dynamic content
    setTimeout(() => {
      document.dispatchEvent(new Event('dt:content-ready'));
    }, 50);
  });
})();
