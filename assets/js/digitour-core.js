/* DigiTour Frontend — Core utilities, data, auth, currency, layout */
(function (global) {
  'use strict';

  const DT = {
    meta: null,
    destinations: [],
    hotels: [],
    reviews: [],
    bookings: [],
    ready: null,
  };

  const SHAPES = ['wide', 'circle', 'std', 'tall', 'hero', 'circle', 'std', 'square'];
  const ACCENTS = ['gold', 'teal', 'coral', 'navy', 'sunset', 'gold', 'teal', 'coral'];

  function bentoMeta(i) {
    return { shape: SHAPES[i % SHAPES.length], accent: ACCENTS[i % ACCENTS.length] };
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurrency() {
    return localStorage.getItem('dt_currency') || 'USD';
  }

  function setCurrency(c) {
    localStorage.setItem('dt_currency', c);
    document.dispatchEvent(new CustomEvent('dt:currency', { detail: c }));
    updateCurrencyUI();
    document.querySelectorAll('[data-price-usd]').forEach((el) => {
      const usd = parseFloat(el.getAttribute('data-price-usd')) || 0;
      el.textContent = formatCurrency(usd);
    });
  }

  function formatCurrency(amountUsd) {
    const c = getCurrency();
    const n = Number(amountUsd) || 0;
    if (c === 'GHS') return '₵' + (n * 15.5).toFixed(2);
    if (c === 'EUR') return '€' + (n * 0.92).toFixed(2);
    return '$' + n.toFixed(2);
  }

  function updateCurrencyUI() {
    const c = getCurrency();
    const labels = { USD: '$ USD', GHS: '₵ GHS', EUR: '€ EUR' };
    document.querySelectorAll('[data-currency-label]').forEach((el) => {
      el.textContent = labels[c] || '$ USD';
    });
    document.querySelectorAll('[data-curr-item]').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-curr-item') === c);
      el.classList.toggle('fw-bold', el.getAttribute('data-curr-item') === c);
    });
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('dt_user') || 'null');
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    if (user) localStorage.setItem('dt_user', JSON.stringify(user));
    else localStorage.removeItem('dt_user');
    document.dispatchEvent(new CustomEvent('dt:auth'));
  }

  function isLoggedIn() {
    return !!getUser();
  }

  function renderStars(rating) {
    const r = Math.max(1, Math.min(5, parseInt(rating, 10) || 1));
    let out = '';
    for (let i = 1; i <= 5; i++) {
      out += i <= r
        ? '<i class="fa fa-star text-warning"></i>'
        : '<i class="far fa-star text-muted"></i>';
    }
    return out;
  }

  function shortDesc(text, len) {
    const t = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length <= len) return t;
    return t.slice(0, len - 1).trim() + '…';
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function pageName() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path.toLowerCase();
  }

  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  DT.ready = (async function loadAll() {
    const base = 'data/';
    const [meta, destinations, hotels, reviews, bookings] = await Promise.all([
      loadJSON(base + 'meta.json'),
      loadJSON(base + 'destinations.json'),
      loadJSON(base + 'hotels.json'),
      loadJSON(base + 'reviews.json'),
      loadJSON(base + 'bookings.json'),
    ]);
    DT.meta = meta;
    DT.destinations = destinations;
    DT.hotels = hotels;
    DT.reviews = reviews;
    DT.bookings = bookings;
    return DT;
  })();

  function destById(id) {
    return DT.destinations.find((d) => String(d.id) === String(id));
  }

  function hotelById(id) {
    return DT.hotels.find((h) => String(h.id) === String(id));
  }

  function hotelsForDest(destId) {
    return DT.hotels.filter((h) => String(h.destination_id) === String(destId));
  }

  function reviewsForDest(destId) {
    return DT.reviews.filter((r) => String(r.destination_id) === String(destId));
  }

  function toast(message, type) {
    const wrap = document.getElementById('dtToastHost') || (() => {
      const d = document.createElement('div');
      d.id = 'dtToastHost';
      d.style.cssText = 'position:fixed;top:90px;right:16px;z-index:9999;max-width:360px;';
      document.body.appendChild(d);
      return d;
    })();
    const el = document.createElement('div');
    el.className = 'alert alert-' + (type || 'success') + ' shadow fade show';
    el.innerHTML = message;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function bentoDestCard(dest, i) {
    const meta = bentoMeta(i);
    const showP = meta.shape !== 'circle';
    return `
      <a href="destination-detail.html?id=${dest.id}"
         class="destination-item bento-item bento-${meta.shape} accent-${meta.accent} scroll-fx"
         data-title="${esc(String(dest.title).toLowerCase())}"
         data-region="${esc(dest.region)}"
         data-category="${esc(dest.category)}"
         style="--i:${Math.min(i, 12)}">
        <div class="bento-media">
          <img src="${esc(dest.image_url)}" alt="${esc(dest.title)}" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async" width="640" height="420">
        </div>
        <div class="bento-cap">
          <span class="bento-chip">${esc(dest.region)}</span>
          <h3>${esc(dest.title)}</h3>
          ${showP ? `<p>${esc(shortDesc(dest.short_desc || dest.description, meta.shape === 'hero' || meta.shape === 'wide' ? 140 : 80))}</p>` : ''}
          <span class="bento-meta"><i class="fa-solid fa-hotel"></i> ${dest.nearby_hotel_count || 0} hotels · ${esc(dest.category)}</span>
        </div>
      </a>`;
  }

  function bentoHotelCard(hotel, i) {
    const meta = bentoMeta(i + 2);
    const shape = meta.shape === 'circle' ? 'square' : meta.shape;
    return `
      <article class="bento-item bento-${shape} accent-${meta.accent} hotel-bento scroll-fx" style="--i:${Math.min(i, 8)}">
        <div class="bento-media">
          <img src="${esc(hotel.image_url)}" alt="${esc(hotel.name)}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" width="640" height="420">
          <span class="hotel-price-tag bento-price" data-price-usd="${hotel.price_per_night}">${formatCurrency(hotel.price_per_night)}/night</span>
        </div>
        <div class="bento-cap">
          <span class="bento-chip">${esc(hotel.region || '')}</span>
          <h3>${esc(hotel.name)}</h3>
          <p>Near <strong>${esc(hotel.destination_title || '')}</strong> · ${hotel.room_capacity || 1} bed(s)</p>
          <div class="d-flex gap-2 flex-wrap mt-2">
            <a class="btn btn-digitour-gold btn-sm" href="book-hotel.html?hotel_id=${hotel.id}">Book now</a>
            <a class="btn btn-digitour-outline btn-sm" href="destination-detail.html?id=${hotel.destination_id}">Site</a>
          </div>
        </div>
      </article>`;
  }

  function itineraryModalHTML() {
    return `
<div class="modal fade" id="itineraryPlannerModal" tabindex="-1" aria-labelledby="itineraryPlannerModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
      <div class="modal-header text-white py-3" style="background: linear-gradient(135deg, #1f2937, #10b981);">
        <h5 class="modal-title fw-bold" id="itineraryPlannerModalLabel">
          <i class="fa-solid fa-wand-magic-sparkles text-warning me-2"></i> AI Ghanaian Travel Itinerary Planner
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-4 bg-light">
        <form id="itineraryForm">
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label fw-bold text-dark"><i class="fa-solid fa-clock text-success me-1"></i> Trip Duration</label>
              <select id="tripDuration" class="form-select rounded-3" required>
                <option value="1">1 Day Express Tour</option>
                <option value="3" selected>3 Days Heritage & Safari</option>
                <option value="5">5 Days Full Ghana Odyssey</option>
                <option value="7">7 Days Luxury Eco Explorer</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold text-dark"><i class="fa-solid fa-wallet text-warning me-1"></i> Budget Range</label>
              <select id="tripBudget" class="form-select rounded-3" required>
                <option value="budget">Budget Backpacker ($30 - $70 / day)</option>
                <option value="moderate" selected>Comfort Explorer ($80 - $180 / day)</option>
                <option value="luxury">Luxury VIP ($200+ / day)</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold text-dark"><i class="fa-solid fa-heart text-danger me-1"></i> Primary Interest</label>
              <select id="tripInterest" class="form-select rounded-3" required>
                <option value="history">Historical Forts & Castles</option>
                <option value="nature" selected>Canopy Walks & Waterfalls</option>
                <option value="beach">Tropical Beaches & Resorts</option>
                <option value="culture">Cultural Heritage & Crafts</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-digitour-primary w-100 fw-bold py-2 rounded-3">
            <i class="fa-solid fa-compass me-2"></i> Generate Custom Ghana Tour Plan
          </button>
        </form>
        <div id="itineraryResults" class="mt-4 d-none">
          <div class="p-3 bg-white border rounded-4 shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-route text-success me-2"></i> Your Customized Travel Plan</h6>
              <span class="badge bg-success" id="planBadge">3-Day Safari & History</span>
            </div>
            <div id="itineraryDays" class="vstack gap-3"></div>
            <div class="mt-3 text-end">
              <button type="button" onclick="window.print()" class="btn btn-sm btn-outline-dark me-2"><i class="fa-solid fa-print me-1"></i> Print Plan</button>
              <a href="destinations.html" class="btn btn-sm btn-success fw-bold"><i class="fa-solid fa-compass me-1"></i> Explore All Sites</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  function currencySwitcherHTML() {
    return `
<div class="dropdown d-inline-block">
  <button class="btn btn-nav-currency btn-sm dropdown-toggle rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    <i class="fa-solid fa-coins me-1"></i><span data-currency-label>$ USD</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
    <li><h6 class="dropdown-header text-uppercase small fw-bold">Select Currency</h6></li>
    <li><a class="dropdown-item d-flex align-items-center justify-content-between" href="#" data-curr-item="USD" data-set-curr="USD"><span>USD ($)</span> <small class="text-muted">Base</small></a></li>
    <li><a class="dropdown-item d-flex align-items-center justify-content-between" href="#" data-curr-item="GHS" data-set-curr="GHS"><span>GHS (₵)</span> <small class="text-muted">~15.5/$</small></a></li>
    <li><a class="dropdown-item d-flex align-items-center justify-content-between" href="#" data-curr-item="EUR" data-set-curr="EUR"><span>EUR (€)</span> <small class="text-muted">~0.92/$</small></a></li>
  </ul>
</div>`;
  }

  function renderShell(options) {
    const opts = options || {};
    const active = opts.active || pageName();
    const isHome = active === 'index.html' || active === '' || active === '/';
    const user = getUser();
    const meta = DT.meta || {};
    const wa = meta.whatsapp || 'https://wa.me/233549326089';
    const tel = meta.tel || 'tel:+233549326089';
    const phone = meta.phone_local || '0549326089';

    const bg = (meta.page_bg && meta.page_bg.length) ? meta.page_bg : [
      'sources/images/all_tourist_sites/Kakum%20National%20Park%20Canopy%20Walkway.jpg',
      'sources/images/all_tourist_sites/Cape%20Coast%20Castle.jpg',
      'sources/images/all_tourist_sites/Wli%20Waterfalls.jpg',
      'sources/images/all_tourist_sites/Mole%20National%20Park.jpg',
    ];
    // Single static wash image — avoids multi-layer opacity thrash while scrolling
    const bgLayers = `<div class="dt-page-bg-layer is-active" style="background-image:url('${bg[0]}')"></div>`;

    // Ensure favicon matches PHP
    let fav = document.querySelector('link[rel="icon"]');
    if (!fav) {
      fav = document.createElement('link');
      fav.rel = 'icon';
      fav.type = 'image/svg+xml';
      document.head.appendChild(fav);
    }
    fav.href = 'sources/images/logo-svg/logo-outline-white.svg';

    const topAuth = user
      ? `<span class="me-3"><i class="fa-solid fa-user me-1" style="color:#FEBD69"></i> Welcome, <strong>${esc(user.name)}</strong></span>
         <a href="dashboard.html" class="me-2"><i class="fa-solid fa-gauge me-1"></i> My Dashboard</a>
         <a href="#" class="text-danger fw-bold" data-logout><i class="fa-solid fa-right-from-bracket me-1"></i> Logout</a>`
      : `<a href="login.html" class="me-3"><i class="fa-solid fa-right-to-bracket me-1"></i> Login</a>
         <a href="register.html" class="btn btn-sm btn-digitour-gold py-1 px-3"><i class="fa-solid fa-user-plus me-1"></i> Sign Up</a>`;

    const navAuthDesktop = user
      ? `<a class="dt-nav-link ${active === 'dashboard.html' ? 'is-active' : ''}" href="dashboard.html"><i class="fa-solid fa-gauge"></i><span>Dashboard</span></a>
         <a class="dt-nav-link dt-nav-logout" href="#" data-logout><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></a>`
      : `<a class="dt-nav-link ${active === 'login.html' ? 'is-active' : ''}" href="login.html"><i class="fa-solid fa-right-to-bracket"></i><span>Login</span></a>
         <a class="btn btn-digitour-gold btn-sm dt-nav-cta" href="register.html">Register</a>`;

    const navAuthMobile = user
      ? `<a class="dt-drawer-link" href="dashboard.html" data-drawer-close><i class="fa-solid fa-gauge"></i> Dashboard</a>
         <a class="dt-drawer-link text-danger" href="#" data-logout data-drawer-close><i class="fa-solid fa-right-from-bracket"></i> Logout</a>`
      : `<a class="dt-drawer-link" href="login.html" data-drawer-close><i class="fa-solid fa-right-to-bracket"></i> Login</a>
         <a class="btn btn-digitour-gold w-100 mt-2" href="register.html" data-drawer-close>Create account</a>`;

    const backBtn = !isHome
      ? `<button type="button" class="btn btn-nav-back btn-sm rounded-pill" onclick="if(document.referrer && document.referrer.indexOf(window.location.host) !== -1){ history.back(); } else { window.location.href='index.html'; }" title="Go Back">
           <i class="fa-solid fa-arrow-left"></i><span class="d-none d-sm-inline">Back</span>
         </button>`
      : '';

    const header = `
<div class="dt-page-bg" id="dtPageBg" aria-hidden="true">${bgLayers}<div class="dt-page-bg-wash"></div></div>
<div id="scroll-progress"></div>
<div class="top-bar d-none d-lg-block">
  <div class="container d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
      <i class="fa-solid fa-location-dot me-2" style="color:#FEBD69"></i>
      Discover Ghana's premier attractions &amp; accommodation
      <span class="mx-2 opacity-50">|</span>
      <i class="fa-solid fa-envelope me-1" style="color:#FEBD69"></i> ${esc(meta.email_info || 'info@digitour.gh')}
      <span class="mx-2 opacity-50">|</span>
      <a href="${wa}" target="_blank" rel="noopener"><i class="fab fa-whatsapp me-1"></i> WhatsApp ${esc(phone)}</a>
      <span class="mx-2 opacity-50">|</span>
      <a href="${tel}"><i class="fa-solid fa-phone me-1"></i> Call</a>
    </div>
    <div>${topAuth}</div>
  </div>
</div>
<header class="dt-site-header sticky-top">
  <div class="container dt-header-bar">
    <div class="dt-header-left">
      ${backBtn}
      <a class="navbar-brand dt-brand" href="index.html">
        <i class="fa-solid fa-compass" style="color:var(--amazon-orange)"></i>
        Digi<span>Tour</span>
      </a>
    </div>
    <nav class="dt-nav-desktop" aria-label="Primary">
      <a class="dt-nav-link ${isHome ? 'is-active' : ''}" href="index.html"><i class="fa-solid fa-house"></i><span>Home</span></a>
      <a class="dt-nav-link ${active.includes('destination') ? 'is-active' : ''}" href="destinations.html"><i class="fa-solid fa-map-location-dot"></i><span>Destinations</span></a>
      <a class="dt-nav-link ${active === 'inquiry.html' ? 'is-active' : ''}" href="inquiry.html"><i class="fa-solid fa-circle-question"></i><span>Inquiries</span></a>
      ${navAuthDesktop}
    </nav>
    <button type="button" class="dt-menu-btn" id="dtMenuOpen" aria-label="Open menu" aria-expanded="false" aria-controls="dtMobileDrawer">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<div class="dt-drawer-backdrop" id="dtDrawerBackdrop" hidden></div>
<aside class="dt-mobile-drawer" id="dtMobileDrawer" aria-hidden="true" role="dialog" aria-label="Site menu">
  <div class="dt-drawer-head">
    <a class="navbar-brand dt-brand" href="index.html" data-drawer-close>
      <i class="fa-solid fa-compass" style="color:var(--amazon-orange)"></i>
      Digi<span>Tour</span>
    </a>
    <button type="button" class="dt-drawer-close" id="dtMenuClose" aria-label="Close menu"><i class="fa-solid fa-xmark"></i></button>
  </div>
  <nav class="dt-drawer-nav">
    <a class="dt-drawer-link ${isHome ? 'is-active' : ''}" href="index.html" data-drawer-close><i class="fa-solid fa-house"></i> Home</a>
    <a class="dt-drawer-link ${active.includes('destination') ? 'is-active' : ''}" href="destinations.html" data-drawer-close><i class="fa-solid fa-map-location-dot"></i> Destinations</a>
    <a class="dt-drawer-link ${active === 'inquiry.html' ? 'is-active' : ''}" href="inquiry.html" data-drawer-close><i class="fa-solid fa-circle-question"></i> Inquiries</a>
    <a class="dt-drawer-link" href="#" data-open-chat data-drawer-close><i class="fa-solid fa-comments"></i> Ask DigiGuide</a>
  </nav>
  <div class="dt-drawer-actions">
    ${navAuthMobile}
    <div class="dt-drawer-contact">
      <a href="${tel}"><i class="fa-solid fa-phone"></i> ${esc(phone)}</a>
      <a href="${wa}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>
    </div>
  </div>
</aside>`;

    const year = new Date().getFullYear();
    const footer = `
<footer class="footer-digitour">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4 col-md-6">
        <a class="navbar-brand text-white fw-bold fs-3 mb-3 d-block" href="index.html" style="font-family:var(--font-display)">
          <i class="fa-solid fa-compass me-2" style="color:#FF9900"></i> Digi<span style="color:#FEBD69">Tour</span> Ghana
        </a>
        <p>Smart tourism information, accommodation, and booking for Ghana. Discover attractions, compare nearby hotels, and reserve with confidence.</p>
        <div class="d-flex gap-2 mt-3">
          <a href="#" class="btn btn-outline-light btn-sm rounded-circle" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="btn btn-outline-light btn-sm rounded-circle" aria-label="X"><i class="fab fa-x-twitter"></i></a>
          <a href="#" class="btn btn-outline-light btn-sm rounded-circle" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" class="btn btn-outline-light btn-sm rounded-circle" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
        </div>
      </div>
      <div class="col-lg-2 col-md-6">
        <h5>Quick Links</h5>
        <ul class="list-unstyled">
          <li class="mb-2"><a href="index.html"><i class="fa-solid fa-angle-right me-2" style="color:#FF9900"></i> Home</a></li>
          <li class="mb-2"><a href="destinations.html"><i class="fa-solid fa-angle-right me-2" style="color:#FF9900"></i> Destinations</a></li>
          <li class="mb-2"><a href="inquiry.html"><i class="fa-solid fa-angle-right me-2" style="color:#FF9900"></i> Inquiries</a></li>
          <li class="mb-2"><a href="login.html"><i class="fa-solid fa-angle-right me-2" style="color:#FF9900"></i> Login</a></li>
          <li class="mb-2"><a href="register.html"><i class="fa-solid fa-angle-right me-2" style="color:#FF9900"></i> Sign Up</a></li>
        </ul>
      </div>
      <div class="col-lg-3 col-md-6">
        <h5>Top Regions</h5>
        <ul class="list-unstyled">
          <li class="mb-2"><a href="destinations.html?region=Central+Region"><i class="fa-solid fa-location-dot me-2" style="color:#FEBD69"></i> Central Region</a></li>
          <li class="mb-2"><a href="destinations.html?region=Greater+Accra"><i class="fa-solid fa-location-dot me-2" style="color:#FEBD69"></i> Greater Accra</a></li>
          <li class="mb-2"><a href="destinations.html?region=Savannah+Region"><i class="fa-solid fa-location-dot me-2" style="color:#FEBD69"></i> Savannah Region</a></li>
          <li class="mb-2"><a href="destinations.html?region=Western+Region"><i class="fa-solid fa-location-dot me-2" style="color:#FEBD69"></i> Western Region</a></li>
          <li class="mb-2"><a href="destinations.html?region=Eastern+Region"><i class="fa-solid fa-location-dot me-2" style="color:#FEBD69"></i> Eastern Region</a></li>
        </ul>
      </div>
      <div class="col-lg-3 col-md-6">
        <h5>Tourism Support</h5>
        <p><i class="fa-solid fa-map-marker-alt me-2" style="color:#FF9900"></i> ${esc(meta.address || 'Tourism Board Building, Accra, Ghana')}</p>
        <p><i class="fa-solid fa-phone me-2" style="color:#FF9900"></i><a href="${tel}">${esc(phone)}</a></p>
        <p><i class="fab fa-whatsapp me-2" style="color:#25D366"></i><a href="${wa}" target="_blank" rel="noopener">WhatsApp Admin</a></p>
        <p><i class="fa-solid fa-envelope me-2" style="color:#FF9900"></i> ${esc(meta.email_support || 'support@digitour.gh')}</p>
      </div>
    </div>
    <hr class="my-4" style="border-color:rgba(255,255,255,0.12)">
    <div class="row align-items-center">
      <div class="col-md-7 text-center text-md-start">
        <p class="mb-0 small">&copy; ${year} DigiTour Ghana. Smart Tourism &amp; Accommodation Platform.</p>
      </div>
      <div class="col-md-5 text-center text-md-end mt-2 mt-md-0">
        <a href="login.html" class="small" style="color:#94A3B8"><i class="fa-solid fa-lock me-1"></i> Demo Login</a>
      </div>
    </div>
  </div>
</footer>
<button type="button" class="dt-back-top" id="dtBackTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
<div class="dt-contact-float" id="dtContactFloat">
  <a class="dt-float-btn dt-float-call" href="${tel}" title="Call Admin ${esc(phone)}" aria-label="Call Admin"><i class="fa-solid fa-phone"></i><span>Call</span></a>
  <a class="dt-float-btn dt-float-wa" href="${wa}?text=${encodeURIComponent('Hello DigiTour Admin, I need help with a destination / hotel booking.')}" target="_blank" rel="noopener" title="WhatsApp ${esc(phone)}" aria-label="WhatsApp Admin"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
</div>`;

    const headerMount = document.getElementById('dt-header');
    const footerMount = document.getElementById('dt-footer');
    if (headerMount) headerMount.innerHTML = header;
    if (footerMount) footerMount.innerHTML = footer;

    bindShellEvents();
    bindMobileNav();
  }

  function bindMobileNav() {
    const openBtn = document.getElementById('dtMenuOpen');
    const closeBtn = document.getElementById('dtMenuClose');
    const drawer = document.getElementById('dtMobileDrawer');
    const backdrop = document.getElementById('dtDrawerBackdrop');
    if (!openBtn || !drawer || !backdrop) return;

    const setOpen = (open) => {
      document.body.classList.toggle('dt-drawer-open', open);
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      backdrop.hidden = !open;
    };

    openBtn.addEventListener('click', () => setOpen(true));
    closeBtn && closeBtn.addEventListener('click', () => setOpen(false));
    backdrop.addEventListener('click', () => setOpen(false));
    drawer.querySelectorAll('[data-drawer-close]').forEach((el) => {
      el.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  function bindShellEvents() {
    document.querySelectorAll('[data-logout]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setUser(null);
        toast('You have been logged out.', 'info');
        setTimeout(() => { window.location.href = 'index.html'; }, 600);
      });
    });
  }

  function bindSearchFilters() {
    const search = document.getElementById('search-input');
    const region = document.getElementById('region-filter');
    const countEl = document.getElementById('filtered-count');
    const container = document.getElementById('destination-container');
    if (!container || container.dataset.filterBound === '1') return;
    container.dataset.filterBound = '1';

    let timer = null;
    function apply() {
      const q = (search && search.value || '').toLowerCase().trim();
      const r = (region && region.value) || 'all';
      let shown = 0;
      container.querySelectorAll('.destination-item').forEach((item) => {
        const title = item.getAttribute('data-title') || '';
        const reg = item.getAttribute('data-region') || '';
        const okQ = !q || title.includes(q) || (item.getAttribute('data-category') || '').toLowerCase().includes(q);
        const okR = r === 'all' || reg === r;
        const show = okQ && okR;
        item.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (countEl) countEl.textContent = String(shown);
    }
    if (search) {
      search.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(apply, 100);
      });
    }
    if (region) region.addEventListener('change', apply);
    apply();
  }

  // Export
  Object.assign(DT, {
    esc, bentoMeta, formatCurrency, getCurrency, setCurrency, getUser, setUser, isLoggedIn,
    renderStars, shortDesc, qs, pageName, destById, hotelById, hotelsForDest, reviewsForDest,
    toast, bentoDestCard, bentoHotelCard, renderShell, bindSearchFilters, updateCurrencyUI,
  });

  global.DigiTour = DT;
})(window);
