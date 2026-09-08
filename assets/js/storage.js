/* DigiTour storage layer — Netlify Functions + JSON seeds + browser cache
 *
 * Production persistence = Netlify Blobs (via /.netlify/functions/*)
 * Seed files = data/users.json, reviews.json, bookings.json, inquiries.json
 * Browser localStorage = instant UX / offline cache on this device
 */
(function (global) {
  'use strict';

  const KEYS = {
    user: 'dt_user',
    users: 'dt_users',
    bookings: 'dt_bookings',
    reviews: 'dt_reviews',
    inquiries: 'dt_inquiries',
    prefs: 'dt_prefs',
    itinerary: 'dt_itinerary',
  };

  const API = {
    auth: '/.netlify/functions/auth',
    reviews: '/.netlify/functions/reviews',
    inquiries: '/.netlify/functions/inquiries',
    bookings: '/.netlify/functions/bookings',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getPrefs() {
    return Object.assign({ lang: 'en' }, read(KEYS.prefs, {}));
  }

  function setPrefs(patch) {
    const next = Object.assign(getPrefs(), patch || {});
    write(KEYS.prefs, next);
    document.documentElement.lang = next.lang === 'fr' ? 'fr' : 'en';
    document.documentElement.classList.remove('dt-contrast');
    document.dispatchEvent(new CustomEvent('dt:prefs', { detail: next }));
    return next;
  }

  async function apiPost(url, payload) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  function getRegisteredUsers() {
    return read(KEYS.users, []);
  }

  /** Prefer serverless auth; fall back to local demo when offline / WAMP */
  async function registerUser(profile) {
    const name = String(profile.name || '').trim();
    const email = String(profile.email || '').trim().toLowerCase();
    const password = String(profile.password || '');
    const phone = String(profile.phone || '').trim();

    try {
      const { ok, data } = await apiPost(API.auth, {
        action: 'register',
        name,
        email,
        password,
        phone,
        ref: new URLSearchParams(location.search).get('ref') || '',
      });
      if (ok && data.user) {
        write(KEYS.user, data.user);
        return data.user;
      }
      if (data.error) throw new Error(data.error);
    } catch (err) {
      // Local fallback for static servers without Netlify Functions
      if (err.message && !/Failed to fetch|NetworkError|404/i.test(err.message)) throw err;
    }

    const users = getRegisteredUsers();
    if (users.some((u) => u.email === email)) {
      throw new Error('An account with this email already exists on this device.');
    }
    const user = {
      id: 'u_' + Date.now(),
      name,
      email,
      phone,
      role: 'tourist',
      points: 25,
      created_at: new Date().toISOString(),
    };
    users.push(Object.assign({}, user, { password }));
    write(KEYS.users, users);
    write(KEYS.user, user);
    return user;
  }

  async function authenticate(email, password) {
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '');

    try {
      const { ok, data } = await apiPost(API.auth, { action: 'login', email: e, password: p });
      if (ok && data.user) {
        write(KEYS.user, data.user);
        return data.user;
      }
      if (data && data.error && data.status !== 0) {
        // fall through to local only on network failure
      }
    } catch (_) {}

    const demo = ((global.DigiTour && DigiTour.meta && DigiTour.meta.demo_users) || []).find(
      (u) => u.email === e && u.password === p
    );
    if (demo) {
      const user = {
        name: demo.name,
        email: demo.email,
        role: demo.role,
        phone: demo.phone || '',
        points: demo.points || 120,
      };
      write(KEYS.user, user);
      return user;
    }
    const local = getRegisteredUsers().find((u) => u.email === e && u.password === p);
    if (local) {
      const user = {
        name: local.name,
        email: local.email,
        role: local.role,
        phone: local.phone || '',
        id: local.id,
        points: local.points || 0,
      };
      write(KEYS.user, user);
      return user;
    }
    return null;
  }

  async function addPoints(email, add) {
    try {
      const { ok, data } = await apiPost(API.auth, { action: 'points', email, add });
      if (ok && data.user) {
        const cur = read(KEYS.user, null);
        if (cur && cur.email === data.user.email) write(KEYS.user, data.user);
        return data.user;
      }
    } catch (_) {}
    const cur = read(KEYS.user, null);
    if (cur && cur.email === email) {
      cur.points = (cur.points || 0) + (add || 0);
      write(KEYS.user, cur);
      return cur;
    }
    return null;
  }

  function getLocalBookings() {
    return read(KEYS.bookings, []);
  }

  async function saveBooking(booking) {
    const list = getLocalBookings();
    list.unshift(booking);
    write(KEYS.bookings, list);
    try {
      await apiPost(API.bookings, booking);
    } catch (_) {}
    if (booking.guest_email) await addPoints(booking.guest_email, 50);
    return booking;
  }

  function getLocalReviews() {
    return read(KEYS.reviews, []);
  }

  async function saveReview(review) {
    const list = getLocalReviews();
    list.unshift(review);
    write(KEYS.reviews, list);
    try {
      await apiPost(API.reviews, review);
    } catch (_) {}
    if (review.email) await addPoints(review.email, 15);
    return review;
  }

  async function saveInquiry(inquiry) {
    const list = read(KEYS.inquiries, []);
    list.unshift(inquiry);
    write(KEYS.inquiries, list);
    try {
      const { ok, data } = await apiPost(API.inquiries, inquiry);
      if (!ok && data && data.error) throw new Error(data.error);
    } catch (err) {
      if (err.message && !/Failed to fetch|NetworkError/i.test(err.message)) {
        // keep local copy anyway
      }
    }
    return inquiry;
  }

  function getItinerary() {
    return read(KEYS.itinerary, []);
  }

  function addToItinerary(item) {
    const list = getItinerary();
    if (list.some((x) => x.type === item.type && String(x.id) === String(item.id))) return list;
    list.push(Object.assign({ added_at: new Date().toISOString() }, item));
    write(KEYS.itinerary, list);
    return list;
  }

  function clearItinerary() {
    write(KEYS.itinerary, []);
  }

  /** Download offline itinerary as a plain text file (works everywhere, no paid API) */
  function downloadItineraryText() {
    const list = getItinerary();
    const user = read(KEYS.user, null);
    const lines = [
      'DigiTour Ghana — Offline Itinerary',
      '=================================',
      'Traveller: ' + (user && user.name ? user.name : 'Guest'),
      'Exported: ' + new Date().toLocaleString(),
      'Loyalty points: ' + ((user && user.points) || 0),
      '',
    ];
    if (!list.length) lines.push('(Empty — add destinations from detail pages.)');
    list.forEach((item, i) => {
      lines.push((i + 1) + '. [' + item.type + '] ' + item.title);
      if (item.region) lines.push('   Region: ' + item.region);
      if (item.url) lines.push('   Link: ' + item.url);
      lines.push('');
    });
    lines.push('Help: Call 0546004395 · WhatsApp https://wa.me/233546004395');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'DigiTour-Itinerary.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function submitNetlifyForm(formName, fields) {
    const payload = Object.assign({ 'form-name': formName }, fields || {});
    const body = new URLSearchParams();
    Object.keys(payload).forEach((k) => {
      if (payload[k] == null) return;
      body.append(k, String(payload[k]));
    });
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      return { ok: res.ok || res.status === 404, status: res.status, netlify: res.ok };
    } catch (err) {
      return { ok: false, status: 0, netlify: false, error: err.message };
    }
  }

  function storageExplainerHTML() {
    return `
      <div class="dt-storage-note alert alert-light border small mb-0">
        <strong><i class="fa-solid fa-shield-halved me-1 text-warning"></i> How DigiTour stores your data</strong>
        <ul class="mb-0 mt-2 ps-3">
          <li><strong>Accounts, reviews, inquiries &amp; bookings</strong> are saved via <em>Netlify Functions</em> into JSON collections (Netlify Blobs + seed files in <code>/data</code>).</li>
          <li>A copy also stays in <em>your browser</em> so the dashboard works instantly on this device.</li>
          <li>Earn <strong>loyalty points</strong>: +25 register · +50 booking · +15 review.</li>
        </ul>
      </div>`;
  }

  global.DigiStorage = {
    KEYS,
    API,
    getPrefs,
    setPrefs,
    getRegisteredUsers,
    registerUser,
    authenticate,
    addPoints,
    getLocalBookings,
    saveBooking,
    getLocalReviews,
    saveReview,
    saveInquiry,
    getItinerary,
    addToItinerary,
    clearItinerary,
    downloadItineraryText,
    submitNetlifyForm,
    storageExplainerHTML,
  };
})(window);
