/* DigiTour storage layer — Netlify-static friendly
 *
 * HOW IT WORKS (no PHP / no SQL database):
 * 1) Accounts, bookings, reviews: saved in the visitor's browser (localStorage)
 *    so the experience works instantly offline-capable and free on Netlify.
 * 2) Inquiries, new reviews, bookings, registrations ALSO POST to Netlify Forms
 *    so tourism admins can see submissions in the Netlify dashboard inbox.
 * 3) Catalogue (destinations/hotels) remains static JSON in /data.
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
    return Object.assign({ lang: 'en', contrast: false }, read(KEYS.prefs, {}));
  }

  function setPrefs(patch) {
    const next = Object.assign(getPrefs(), patch || {});
    write(KEYS.prefs, next);
    document.documentElement.lang = next.lang === 'fr' ? 'fr' : 'en';
    document.documentElement.classList.toggle('dt-contrast', !!next.contrast);
    document.dispatchEvent(new CustomEvent('dt:prefs', { detail: next }));
    return next;
  }

  function getRegisteredUsers() {
    return read(KEYS.users, []);
  }

  function registerUser(profile) {
    const users = getRegisteredUsers();
    const email = String(profile.email || '').trim().toLowerCase();
    if (!email || !profile.password || !profile.name) {
      throw new Error('Name, email and password are required.');
    }
    if (users.some((u) => u.email === email)) {
      throw new Error('An account with this email already exists on this device.');
    }
    const demo = ((global.DigiTour && DigiTour.meta && DigiTour.meta.demo_users) || []).find(
      (u) => u.email === email
    );
    if (demo) throw new Error('This email is reserved for demo login. Choose another email.');

    const user = {
      id: 'u_' + Date.now(),
      name: String(profile.name).trim(),
      email,
      phone: String(profile.phone || '').trim(),
      password: String(profile.password),
      role: 'tourist',
      created_at: new Date().toISOString(),
    };
    users.push(user);
    write(KEYS.users, users);
    return user;
  }

  function authenticate(email, password) {
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '');
    const demo = ((global.DigiTour && DigiTour.meta && DigiTour.meta.demo_users) || []).find(
      (u) => u.email === e && u.password === p
    );
    if (demo) {
      return { name: demo.name, email: demo.email, role: demo.role, phone: demo.phone || '' };
    }
    const local = getRegisteredUsers().find((u) => u.email === e && u.password === p);
    if (local) {
      return { name: local.name, email: local.email, role: local.role, phone: local.phone || '', id: local.id };
    }
    return null;
  }

  function getLocalBookings() {
    return read(KEYS.bookings, []);
  }

  function saveBooking(booking) {
    const list = getLocalBookings();
    list.unshift(booking);
    write(KEYS.bookings, list);
    return booking;
  }

  function getLocalReviews() {
    return read(KEYS.reviews, []);
  }

  function saveReview(review) {
    const list = getLocalReviews();
    list.unshift(review);
    write(KEYS.reviews, list);
    return review;
  }

  function saveInquiry(inquiry) {
    const list = read(KEYS.inquiries, []);
    list.unshift(inquiry);
    write(KEYS.inquiries, list);
    return inquiry;
  }

  /**
   * Submit to Netlify Forms (visible under Site → Forms after first deploy with netlify attribute).
   * Works only on the Netlify-hosted domain (not always on Live Server).
   */
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
      // Netlify returns 200 on success; local static servers may 404 — that is OK for demo.
      return { ok: res.ok || res.status === 404, status: res.status, netlify: res.ok };
    } catch (err) {
      return { ok: false, status: 0, netlify: false, error: err.message };
    }
  }

  function storageExplainerHTML() {
    return `
      <div class="dt-storage-note alert alert-light border small mb-0">
        <strong><i class="fa-solid fa-shield-halved me-1 text-warning"></i> How DigiTour stores your data (Netlify)</strong>
        <ul class="mb-0 mt-2 ps-3">
          <li><strong>Your account, bookings &amp; reviews</strong> are saved in <em>your browser</em> (localStorage) so the site stays free and fast with no database server.</li>
          <li><strong>Inquiries, bookings &amp; reviews</strong> are also sent to the DigiTour admin inbox via <em>Netlify Forms</em> for follow-up.</li>
          <li>Clearing browser data removes your local account history on that device. Use the same browser to keep your dashboard.</li>
        </ul>
      </div>`;
  }

  global.DigiStorage = {
    KEYS,
    getPrefs,
    setPrefs,
    getRegisteredUsers,
    registerUser,
    authenticate,
    getLocalBookings,
    saveBooking,
    getLocalReviews,
    saveReview,
    saveInquiry,
    submitNetlifyForm,
    storageExplainerHTML,
  };
})(window);
