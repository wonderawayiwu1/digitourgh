/* DigiTour Map Hub */
(function () {
  'use strict';

  async function bootMap() {
    const DT = window.DigiTour;
    await DT.ready;

    const mapEl = document.getElementById('dtMap');
    if (!mapEl || typeof L === 'undefined') return;

    let geo = { destinations: [] };
    try {
      geo = await fetch('data/geo.json').then((r) => r.json());
    } catch (e) {
      console.warn('geo.json missing', e);
    }

    const map = L.map('dtMap', {
      scrollWheelZoom: true,
      zoomControl: true,
    }).setView([7.95, -1.02], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const regionFilter = document.getElementById('map-region');
    const categoryFilter = document.getElementById('map-category');
    const searchInput = document.getElementById('map-search');
    const countEl = document.getElementById('map-count');
    const listEl = document.getElementById('map-list');

    // Populate filters
    if (regionFilter) {
      (DT.meta.regions || []).forEach((r) => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        regionFilter.appendChild(opt);
      });
    }
    if (categoryFilter) {
      (DT.meta.categories || []).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        categoryFilter.appendChild(opt);
      });
    }

    const layer = L.layerGroup().addTo(map);
    let markers = [];

    function iconFor(cat) {
      const color =
        /Beach/i.test(cat) ? '#0EA5E9' :
        /Nature/i.test(cat) ? '#059669' :
        /Culture|Heritage/i.test(cat) ? '#7C3AED' :
        '#E47911';
      return L.divIcon({
        className: 'dt-map-pin',
        html: `<span style="background:${color}"><i class="fa-solid fa-location-dot"></i></span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -24],
      });
    }

    function apply() {
      const q = (searchInput && searchInput.value || '').toLowerCase().trim();
      const region = (regionFilter && regionFilter.value) || 'all';
      const category = (categoryFilter && categoryFilter.value) || 'all';

      layer.clearLayers();
      markers = [];
      const rows = [];

      (geo.destinations || []).forEach((g) => {
        const matchQ = !q || g.title.toLowerCase().includes(q) || g.region.toLowerCase().includes(q);
        const matchR = region === 'all' || g.region === region;
        const matchC = category === 'all' || g.category === category;
        if (!(matchQ && matchR && matchC)) return;

        const m = L.marker([g.lat, g.lng], { icon: iconFor(g.category) }).addTo(layer);
        m.bindPopup(`
          <div class="dt-map-popup">
            <img src="${DT.esc(g.image_url)}" alt="">
            <strong>${DT.esc(g.title)}</strong>
            <small>${DT.esc(g.region)} · ${DT.esc(g.category)}</small>
            <div class="dt-map-popup-actions">
              <a href="destination-detail.html?id=${g.id}">Details</a>
              <a href="destination-detail.html?id=${g.id}#nearby-hotels">${g.hotels || 0} hotels</a>
            </div>
          </div>`);
        markers.push(m);
        rows.push(g);
      });

      if (countEl) countEl.textContent = String(rows.length);
      if (listEl) {
        listEl.innerHTML = rows.slice(0, 40).map((g) => `
          <button type="button" class="dt-map-list-item" data-id="${g.id}">
            <img src="${DT.esc(g.image_url)}" alt="" loading="lazy">
            <span>
              <strong>${DT.esc(g.title)}</strong>
              <small>${DT.esc(g.region)}</small>
            </span>
          </button>`).join('') || '<p class="text-secondary small p-3 mb-0">No sites match these filters.</p>';
      }

      if (markers.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.12));
      }
    }

    listEl && listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const g = (geo.destinations || []).find((x) => String(x.id) === String(id));
      if (!g) return;
      map.setView([g.lat, g.lng], 11, { animate: true });
      const m = markers.find((mk) => {
        const ll = mk.getLatLng();
        return Math.abs(ll.lat - g.lat) < 0.0001 && Math.abs(ll.lng - g.lng) < 0.0001;
      });
      if (m) m.openPopup();
    });

    searchInput && searchInput.addEventListener('input', () => {
      clearTimeout(searchInput._t);
      searchInput._t = setTimeout(apply, 120);
    });
    regionFilter && regionFilter.addEventListener('change', apply);
    categoryFilter && categoryFilter.addEventListener('change', apply);
    apply();

    setTimeout(() => map.invalidateSize(), 200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.getAttribute('data-page') === 'map.html') {
      // DigiTour boot is in pages.js; wait for content-ready
      document.addEventListener('dt:content-ready', bootMap, { once: true });
    }
  });
})();
