/**
 * DigiTour Map — Smart Zoom + 3D Buildings + Reset View + Labeled Pins
 *
 * Modes:
 *   - 3D City View → MapTiler streets-v2 (+ 3D buildings extrusion)
 *   - Aerial View  → MapTiler hybrid / Esri satellite
 * Smart zoom: ≤16 stay aerial when in Aerial mode; ≥17 auto-switch to streets (crisp)
 * Fallback: free Esri + OSM when MapTiler key/domain fails (localhost + Netlify)
 */
(function () {
  'use strict';

  const mapboxgl = window.maplibregl;
  const ACCRA = [-0.1870, 5.6037];
  const DEFAULT_KEY = 'VdQJc0oCem6tJcSApJ4a';
  const SMART_ZOOM_CUTOFF = 17;
  const LABEL_ZOOM_ALL = 9.5;

  const FALLBACK = {
    hybrid: {
      version: 8,
      sources: {
        esri: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri',
          maxzoom: 19,
        },
        labels: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'esri', type: 'raster', source: 'esri' },
        { id: 'labels', type: 'raster', source: 'labels', paint: { 'raster-opacity': 0.85 } },
      ],
    },
    streets: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap',
          maxzoom: 19,
        },
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    },
  };

  let booted = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shortText(s, n) {
    const t = String(s || '').replace(/\s+/g, ' ').trim();
    return t.length <= n ? t : t.slice(0, n - 1) + '…';
  }

  function qs(name) {
    try {
      return new URLSearchParams(location.search).get(name) || '';
    } catch (_) {
      return '';
    }
  }

  function resolveKey(DT) {
    const q = qs('maptiler_key').trim();
    if (q) {
      try {
        localStorage.setItem('dt_maptiler_key', q);
      } catch (_) {}
      return q;
    }
    try {
      const s = localStorage.getItem('dt_maptiler_key');
      if (s && s.trim()) return s.trim();
    } catch (_) {}
    if (window.DIGITOUR_MAPTILER_KEY) return String(window.DIGITOUR_MAPTILER_KEY).trim();
    if (DT && DT.meta && DT.meta.maptiler_api_key) return String(DT.meta.maptiler_api_key).trim();
    return DEFAULT_KEY;
  }

  function mtStyles(key) {
    const k = encodeURIComponent(key);
    return {
      streets: 'https://api.maptiler.com/maps/streets-v2/style.json?key=' + k,
      hybrid: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + k,
      satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=' + k,
    };
  }

  async function probeMapTiler(key) {
    if (qs('map') === 'fallback') return false;
    if (!key) return false;
    try {
      const res = await fetch(mtStyles(key).streets, { mode: 'cors' });
      if (!res.ok) return false;
      await res.json();
      return true;
    } catch (_) {
      return false;
    }
  }

  function setBadge(text) {
    const el = document.getElementById('dtMapProvider');
    if (el) el.textContent = text;
  }

  async function bootMap() {
    if (booted) return;
    const mapEl = document.getElementById('map');
    if (!mapEl || !mapboxgl) {
      console.error('DigiTour map: #map or MapLibre missing');
      return;
    }
    booted = true;

    const pageBg = document.getElementById('dtPageBg');
    if (pageBg) pageBg.remove();
    document.body.classList.add('dt-map-page');

    const DT = window.DigiTour;
    if (DT && DT.ready) {
      try {
        await DT.ready;
      } catch (_) {}
    }

    const apiKey = resolveKey(DT);
    const hasMapTiler = await probeMapTiler(apiKey);
    const styles = hasMapTiler
      ? mtStyles(apiKey)
      : { streets: FALLBACK.streets, hybrid: FALLBACK.hybrid, satellite: FALLBACK.hybrid };

    setBadge(hasMapTiler ? 'Powered by MapTiler' : 'Powered by Esri / OSM');

    let geo = { destinations: [] };
    try {
      geo = await fetch('data/geo.json?v=cat122').then(function (r) {
        return r.json();
      });
    } catch (e) {
      console.warn('geo.json failed', e);
    }

    const destIndex = {};
    if (DT && Array.isArray(DT.destinations)) {
      DT.destinations.forEach(function (d) {
        destIndex[d.id] = d;
      });
    }

    const all = (geo.destinations || []).slice();
    // Featured first for label priority
    all.sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.title.localeCompare(b.title);
    });

    /** @type {'city'|'aerial'} */
    let viewMode = 'city';
    let buildingsOn = true;
    let smartSwitching = false; // prevent feedback loops
    let currentStyleKey = 'streets';
    let markerStore = [];

    const map = new mapboxgl.Map({
      container: 'map',
      style: styles.streets,
      center: ACCRA,
      zoom: 12,
      pitch: hasMapTiler ? 45 : 0,
      bearing: -8,
      maxPitch: 85,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 110 }), 'bottom-right');

    map.on('error', function (e) {
      console.log(e.error || e);
    });

    // ---------- UI refs ----------
    const regionFilter = document.getElementById('map-region');
    const categoryFilter = document.getElementById('map-category');
    const searchInput = document.getElementById('map-search');
    const pickSelect = document.getElementById('map-pick');
    const searchList = document.getElementById('map-search-list');
    const countEl = document.getElementById('map-count');
    const listEl = document.getElementById('map-list');
    const fitBtn = document.getElementById('map-fit-all');
    const panel = document.getElementById('dtMapPanel');
    const panelToggle = document.getElementById('dtMapPanelToggle');
    const sheetHandle = document.getElementById('dtMapSheetHandle');
    const fabRoot = document.getElementById('dtMapFloatTools');
    const fabBtn = document.getElementById('dtMapFab');
    const fabMenu = document.getElementById('dtMapFabMenu');
    const btnReset = document.getElementById('dtMapReset');
    const btn3d = document.getElementById('dtMapMode3d');
    const btnAerial = document.getElementById('dtMapModeAerial');
    const btnBuildings = document.getElementById('dtMapBuildings');

    function isMobileMap() {
      return window.matchMedia('(max-width: 768px)').matches;
    }

    function setFabOpen(open) {
      if (!fabRoot || !fabBtn || !fabMenu) return;
      fabRoot.classList.toggle('is-open', open);
      fabBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      fabMenu.hidden = isMobileMap() ? !open : false;
      if (!isMobileMap()) {
        fabMenu.hidden = false;
        fabRoot.classList.add('is-open');
      }
    }

    function setSheetExpanded(expanded) {
      if (!panel) return;
      panel.classList.toggle('is-expanded', expanded);
      panel.classList.toggle('is-open', expanded || !isMobileMap());
      if (sheetHandle) {
        sheetHandle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        const hint = sheetHandle.querySelector('.dt-sheet-hint');
        if (hint) {
          hint.innerHTML = expanded
            ? '<i class="fa-solid fa-chevron-down"></i> Swipe down to collapse'
            : '<i class="fa-solid fa-chevron-up"></i> Swipe up for filters';
        }
      }
      if (panelToggle) panelToggle.setAttribute('aria-expanded', expanded || !isMobileMap() ? 'true' : 'false');
      setTimeout(function () {
        map.resize();
      }, 280);
    }

    // Initial mobile layout: collapsed sheet + closed FAB
    if (isMobileMap()) {
      setSheetExpanded(false);
      setFabOpen(false);
    } else {
      panel && panel.classList.add('is-open');
      setFabOpen(true);
      if (fabMenu) fabMenu.hidden = false;
    }

    fabBtn &&
      fabBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setFabOpen(!fabRoot.classList.contains('is-open'));
      });

    fabMenu &&
      fabMenu.addEventListener('click', function (e) {
        if (!isMobileMap()) return;
        if (e.target.closest('.dt-map-tool-btn')) setFabOpen(false);
      });

    document.addEventListener('click', function (e) {
      if (!isMobileMap() || !fabRoot) return;
      if (!fabRoot.contains(e.target)) setFabOpen(false);
    });

    searchInput &&
      searchInput.addEventListener('focus', function () {
        if (isMobileMap()) setSheetExpanded(true);
      });

    // Bottom sheet: tap handle / swipe
    function bindSheetGestures() {
      if (!panel || !sheetHandle) return;
      let startY = 0;
      let dragging = false;

      function onStart(y) {
        startY = y;
        dragging = true;
      }
      function onEnd(y) {
        if (!dragging) return;
        dragging = false;
        const dy = y - startY;
        if (dy < -40) setSheetExpanded(true);
        else if (dy > 40) setSheetExpanded(false);
      }

      sheetHandle.addEventListener('click', function () {
        setSheetExpanded(!panel.classList.contains('is-expanded'));
      });

      panel.addEventListener(
        'touchstart',
        function (e) {
          if (!isMobileMap()) return;
          if (e.target.closest('.dt-map-list, select, input, a, button:not(.dt-sheet-handle)')) return;
          onStart(e.touches[0].clientY);
        },
        { passive: true }
      );
      panel.addEventListener(
        'touchend',
        function (e) {
          if (!dragging) return;
          onEnd(e.changedTouches[0].clientY);
        },
        { passive: true }
      );
    }
    bindSheetGestures();

    window.addEventListener('resize', function () {
      if (isMobileMap()) {
        if (!panel.classList.contains('is-expanded')) setSheetExpanded(false);
        setFabOpen(fabRoot && fabRoot.classList.contains('is-open'));
      } else {
        panel && panel.classList.add('is-open');
        panel && panel.classList.remove('is-expanded');
        setFabOpen(true);
        if (fabMenu) fabMenu.hidden = false;
      }
      map.resize();
    });

    if (regionFilter && DT && DT.meta && DT.meta.regions) {
      DT.meta.regions.forEach(function (r) {
        const o = document.createElement('option');
        o.value = r;
        o.textContent = r;
        regionFilter.appendChild(o);
      });
    }
    if (categoryFilter && DT && DT.meta && DT.meta.categories) {
      DT.meta.categories.forEach(function (c) {
        const o = document.createElement('option');
        o.value = c;
        o.textContent = c;
        categoryFilter.appendChild(o);
      });
    }

    // ---------- 3D buildings ----------
    function add3dBuildings() {
      if (!hasMapTiler || !buildingsOn) return;
      try {
        if (map.getLayer('dt-3d-buildings')) {
          map.setLayoutProperty('dt-3d-buildings', 'visibility', 'visible');
          return;
        }
        // MapTiler / OpenMapTiles building source
        const style = map.getStyle();
        const hasSource = style && style.sources && style.sources.openmaptiles;
        if (!hasSource) return;

        let beforeId;
        const layers = (style.layers || []);
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            beforeId = layers[i].id;
            break;
          }
        }

        map.addLayer(
          {
            id: 'dt-3d-buildings',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            filter: ['!', ['has', 'hide_3d']],
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'render_height'],
                0,
                '#d6cfc4',
                30,
                '#c4b8a5',
                80,
                '#a8977f',
                150,
                '#8a7a66',
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                14.5,
                ['coalesce', ['get', 'render_height'], 8],
              ],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': 0.88,
            },
          },
          beforeId
        );
      } catch (err) {
        console.info('3D buildings not available on this style', err && err.message);
      }
    }

    function setBuildingsVisible(on) {
      buildingsOn = on;
      if (!map.getLayer('dt-3d-buildings')) {
        if (on) add3dBuildings();
        return;
      }
      map.setLayoutProperty('dt-3d-buildings', 'visibility', on ? 'visible' : 'none');
    }

    function applyCityPitch() {
      if (viewMode === 'city' && hasMapTiler) {
        map.easeTo({ pitch: 50, bearing: map.getBearing() || -10, duration: 600 });
      } else {
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      }
    }

    function changeStyle(styleKey, opts) {
      const options = opts || {};
      if (currentStyleKey === styleKey && !options.force) return;
      currentStyleKey = styleKey;
      const next = styles[styleKey] || styles.streets;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = viewMode === 'city' && hasMapTiler ? Math.max(map.getPitch(), 45) : 0;
      const rows = filteredRows();

      smartSwitching = true;
      map.setStyle(next);
      map.once('style.load', function () {
        map.setCenter(center);
        map.setZoom(zoom);
        map.setBearing(bearing);
        map.setPitch(pitch);
        if (viewMode === 'city') add3dBuildings();
        renderMarkers(rows);
        updateLabelVisibility();
        map.resize();
        smartSwitching = false;
      });
    }

    // ---------- Markers + permanent labels ----------
    function clearMarkers() {
      markerStore.forEach(function (m) {
        m.marker.remove();
      });
      markerStore = [];
    }

    function popupHTML(g) {
      const full = destIndex[g.id] || {};
      const desc = shortText(
        full.short_desc || full.description || g.category + ' in ' + g.region,
        130
      );
      const img = esc(g.image_url || '');
      return (
        '<div class="dt-map-popup">' +
        (img ? '<img src="' + img + '" alt="' + esc(g.title) + '" loading="lazy">' : '') +
        '<strong>' +
        esc(g.title) +
        '</strong>' +
        '<small>' +
        esc(g.region) +
        ' · ' +
        esc(g.category) +
        '</small>' +
        '<p>' +
        esc(desc) +
        '</p>' +
        '<div class="dt-map-popup-actions">' +
        '<a class="dt-map-popup-details" href="destination-detail.html?id=' +
        encodeURIComponent(g.id) +
        '">View details</a>' +
        '<span class="dt-map-popup-hotels">' +
        (g.hotels || 0) +
        ' hotels</span></div></div>'
      );
    }

    function makeMarkerEl(g, showLabel) {
      const el = document.createElement('div');
      el.className = 'dt-gl-pin' + (showLabel ? ' has-label' : ' label-hidden');
      el.innerHTML =
        '<button type="button" class="dt-gl-marker" aria-label="' +
        esc(g.title) +
        '"><i class="fa-solid fa-location-dot"></i></button>' +
        '<span class="dt-gl-label">' +
        esc(g.title) +
        '</span>';
      return el;
    }

    function updateLabelVisibility() {
      const z = map.getZoom();
      const showAll = z >= LABEL_ZOOM_ALL;
      markerStore.forEach(function (m, idx) {
        const show = showAll || idx < 10 || m.data.featured;
        m.el.classList.toggle('label-hidden', !show);
        m.el.classList.toggle('has-label', show);
      });
    }

    function renderMarkers(rows) {
      clearMarkers();
      const z = map.getZoom();
      const showAll = z >= LABEL_ZOOM_ALL;

      rows.forEach(function (g, idx) {
        const lng = Number(g.lng);
        const lat = Number(g.lat);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

        const showLabel = showAll || idx < 10 || !!g.featured;
        const el = makeMarkerEl(g, showLabel);
        const popup = new mapboxgl.Popup({
          offset: 28,
          maxWidth: '300px',
          className: 'dt-gl-popup',
        }).setHTML(popupHTML(g));

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        el.querySelector('.dt-gl-marker').addEventListener('click', function (ev) {
          ev.stopPropagation();
          map.flyTo({
            center: [lng, lat],
            zoom: Math.max(map.getZoom(), 15),
            pitch: viewMode === 'city' && hasMapTiler ? 55 : map.getPitch(),
            essential: true,
          });
        });

        markerStore.push({ id: g.id, marker: marker, popup: popup, data: g, el: el });
      });

      if (countEl) countEl.textContent = String(rows.length);
      if (listEl) {
        listEl.innerHTML =
          rows
            .slice(0, 80)
            .map(function (g) {
              return (
                '<button type="button" class="dt-map-list-item" data-id="' +
                esc(g.id) +
                '"><img src="' +
                esc(g.image_url) +
                '" alt="" loading="lazy" width="48" height="48"><span><strong>' +
                esc(g.title) +
                '</strong><small>' +
                esc(g.region) +
                '</small></span></button>'
              );
            })
            .join('') ||
          '<p class="text-secondary small p-3 mb-0">No sites match these filters.</p>';
      }
    }

    function filteredRows() {
      const q = ((searchInput && searchInput.value) || '').toLowerCase().trim();
      const region = (regionFilter && regionFilter.value) || 'all';
      const category = (categoryFilter && categoryFilter.value) || 'all';
      return all.filter(function (g) {
        const matchQ =
          !q ||
          g.title.toLowerCase().includes(q) ||
          g.region.toLowerCase().includes(q) ||
          String(g.category || '')
            .toLowerCase()
            .includes(q);
        return (
          matchQ &&
          (region === 'all' || g.region === region) &&
          (category === 'all' || g.category === category)
        );
      });
    }

    function focusPlace(g, openPopup) {
      if (!g) return;
      const lng = Number(g.lng);
      const lat = Number(g.lat);
      const entry = markerStore.find(function (m) {
        return String(m.id) === String(g.id);
      });
      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 14.5),
        pitch: viewMode === 'city' && hasMapTiler ? 55 : 0,
        essential: true,
      });
      if (openPopup && entry) {
        markerStore.forEach(function (m) {
          if (m.popup.isOpen()) m.popup.remove();
        });
        entry.popup.setLngLat([lng, lat]).setHTML(popupHTML(g)).addTo(map);
      }
    }

    function fitToRows(rows) {
      if (!rows || !rows.length) {
        map.flyTo({ center: ACCRA, zoom: 12, pitch: viewMode === 'city' ? 45 : 0, essential: true });
        return;
      }
      if (rows.length === 1) {
        focusPlace(rows[0], true);
        return;
      }
      const bounds = new mapboxgl.LngLatBounds();
      rows.forEach(function (g) {
        bounds.extend([Number(g.lng), Number(g.lat)]);
      });
      map.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 70, right: 70 },
        maxZoom: 10.2,
        duration: 1200,
        pitch: viewMode === 'city' && hasMapTiler ? 35 : 0,
      });
    }

    /** Reset View — Ghana overview with all pins spread (no giant clump) */
    function resetView() {
      const rows = filteredRows();
      // Brief Accra cue, then fit all pins so sites are spread across Ghana
      map.flyTo({
        center: ACCRA,
        zoom: 12,
        pitch: viewMode === 'city' && hasMapTiler ? 40 : 0,
        bearing: -8,
        essential: true,
        duration: 900,
      });
      setTimeout(function () {
        fitToRows(rows.length ? rows : all);
      }, 950);
    }

    function setModeButtons() {
      if (btn3d) {
        btn3d.classList.toggle('is-active', viewMode === 'city');
        btn3d.setAttribute('aria-pressed', viewMode === 'city' ? 'true' : 'false');
      }
      if (btnAerial) {
        btnAerial.classList.toggle('is-active', viewMode === 'aerial');
        btnAerial.setAttribute('aria-pressed', viewMode === 'aerial' ? 'true' : 'false');
      }
      if (btnBuildings) {
        btnBuildings.classList.toggle('is-active', buildingsOn && viewMode === 'city');
        btnBuildings.disabled = viewMode !== 'city' || !hasMapTiler;
        btnBuildings.setAttribute('aria-pressed', buildingsOn && viewMode === 'city' ? 'true' : 'false');
      }
    }

    // ---------- Smart zoom switching ----------
    map.on('zoomend', function () {
      updateLabelVisibility();
      if (smartSwitching) return;
      if (viewMode !== 'aerial') return; // only smart-switch in Aerial mode

      const z = map.getZoom();
      if (z >= SMART_ZOOM_CUTOFF && currentStyleKey !== 'streets') {
        // Close-in: crisp vector streets instead of blurry satellite
        changeStyle('streets');
      } else if (z < SMART_ZOOM_CUTOFF && currentStyleKey === 'streets') {
        // Zoomed out: return to hybrid/satellite aerial
        changeStyle('hybrid');
      }
    });

    map.on('zoom', function () {
      updateLabelVisibility();
    });

    // ---------- Events ----------
    btnReset && btnReset.addEventListener('click', resetView);
    fitBtn &&
      fitBtn.addEventListener('click', function () {
        fitToRows(filteredRows());
      });

    btn3d &&
      btn3d.addEventListener('click', function () {
        viewMode = 'city';
        buildingsOn = true;
        setModeButtons();
        changeStyle('streets', { force: true });
        applyCityPitch();
      });

    btnAerial &&
      btnAerial.addEventListener('click', function () {
        viewMode = 'aerial';
        setModeButtons();
        const z = map.getZoom();
        changeStyle(z >= SMART_ZOOM_CUTOFF ? 'streets' : 'hybrid', { force: true });
        map.easeTo({ pitch: 0, bearing: 0, duration: 500 });
      });

    btnBuildings &&
      btnBuildings.addEventListener('click', function () {
        if (viewMode !== 'city') return;
        setBuildingsVisible(!buildingsOn);
        setModeButtons();
        if (buildingsOn) applyCityPitch();
      });

    panelToggle &&
      panel &&
      panelToggle.addEventListener('click', function () {
        if (isMobileMap()) {
          setSheetExpanded(!panel.classList.contains('is-expanded'));
          return;
        }
        const open = !panel.classList.contains('is-open');
        panel.classList.toggle('is-open', open);
        panelToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        setTimeout(function () {
          map.resize();
        }, 280);
      });

    if (pickSelect) {
      all.forEach(function (g) {
        const o = document.createElement('option');
        o.value = String(g.id);
        o.textContent = g.title + ' (' + g.region + ')';
        pickSelect.appendChild(o);
      });
    }
    if (searchList) {
      all.forEach(function (g) {
        const o = document.createElement('option');
        o.value = g.title;
        searchList.appendChild(o);
      });
    }

    listEl &&
      listEl.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-id]');
        if (!btn) return;
        const g = all.find(function (x) {
          return String(x.id) === String(btn.getAttribute('data-id'));
        });
        if (!g) return;
        if (
          !markerStore.find(function (m) {
            return String(m.id) === String(g.id);
          })
        ) {
          renderMarkers(filteredRows());
        }
        focusPlace(g, true);
        if (isMobileMap() && panel) {
          setSheetExpanded(false);
          setFabOpen(false);
        }
      });

    pickSelect &&
      pickSelect.addEventListener('change', function () {
        const g = all.find(function (x) {
          return String(x.id) === String(pickSelect.value);
        });
        if (!g) return;
        if (searchInput) searchInput.value = '';
        if (regionFilter) regionFilter.value = 'all';
        if (categoryFilter) categoryFilter.value = 'all';
        renderMarkers(all);
        focusPlace(g, true);
      });

    let searchTimer = null;
    function onFilter() {
      const rows = filteredRows();
      renderMarkers(rows);
      if (rows.length === 1) focusPlace(rows[0], true);
      else fitToRows(rows);
    }
    searchInput &&
      searchInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(onFilter, 180);
      });
    searchInput && searchInput.addEventListener('change', onFilter);
    regionFilter && regionFilter.addEventListener('change', onFilter);
    categoryFilter && categoryFilter.addEventListener('change', onFilter);

    function initial() {
      setModeButtons();
      renderMarkers(all);
      add3dBuildings();
      // Accra start, then fit all pins so nothing looks like one giant clump
      map.jumpTo({ center: ACCRA, zoom: 12, pitch: hasMapTiler ? 40 : 0, bearing: -8 });
      setTimeout(function () {
        fitToRows(all);
        map.resize();
      }, 400);
    }

    if (map.loaded()) initial();
    else map.on('load', initial);

    map.on('style.load', function () {
      if (viewMode === 'city') add3dBuildings();
    });

    window.addEventListener('resize', function () {
      map.resize();
    });
  }

  function start() {
    if (document.body.getAttribute('data-page') !== 'map.html') return;
    document.addEventListener(
      'dt:content-ready',
      function () {
        bootMap().catch(function (err) {
          console.log(err);
        });
      },
      { once: true }
    );
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
