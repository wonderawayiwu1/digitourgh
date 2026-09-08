/**
 * DigiTour Auth API
 * POST { action: "register"|"login", name?, email, password, phone? }
 * Stores users in Netlify Blobs (seeded from data/users.json).
 */
const {
  json,
  corsHeaders,
  loadCollection,
  saveCollection,
  hashPassword,
  verifyPassword,
  publicUser,
} = require('./_data');

const DEMO_EMAIL = 'kwame@example.com';
const DEMO_PASS = 'demo123';

function ensureDemo(users) {
  let list = Array.isArray(users) ? users.slice() : [];
  const idx = list.findIndex((u) => u.email === DEMO_EMAIL);
  const hashed = hashPassword(DEMO_PASS, 'demo_salt_digitour');
  const demo = {
    id: 'u_demo_kwame',
    name: 'Kwame Asante',
    email: DEMO_EMAIL,
    phone: '0546004395',
    role: 'tourist',
    points: 120,
    salt: hashed.salt,
    password_hash: hashed.password_hash,
    created_at: '2026-01-01T00:00:00.000Z',
  };
  if (idx === -1) list.unshift(demo);
  else list[idx] = Object.assign({}, list[idx], demo, { points: list[idx].points || 120 });
  return list;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Use POST' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const action = String(body.action || '').toLowerCase();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    let users = ensureDemo(await loadCollection('users', 'users.json', []));

    if (action === 'register') {
      const name = String(body.name || '').trim();
      const phone = String(body.phone || '').trim();
      if (!name || !email || password.length < 4) {
        return json(400, { error: 'Name, email and password (min 4 chars) are required.' });
      }
      if (users.some((u) => u.email === email)) {
        return json(409, { error: 'An account with this email already exists.' });
      }
      const ref = String(body.ref || '').trim().toLowerCase();
      const { salt, password_hash } = hashPassword(password);
      const user = {
        id: 'u_' + Date.now(),
        name,
        email,
        phone,
        role: 'tourist',
        points: 25, // welcome loyalty points
        salt,
        password_hash,
        created_at: new Date().toISOString(),
        referred_by: ref || null,
      };
      users.push(user);
      // Referral bonus
      if (ref && ref !== email) {
        const referrer = users.find((u) => u.email === ref);
        if (referrer) referrer.points = (referrer.points || 0) + 20;
      }
      await saveCollection('users', 'users.json', users);
      return json(200, {
        ok: true,
        message: 'Account created. +25 loyalty points welcome bonus.',
        user: publicUser(user),
        token: Buffer.from(user.id + ':' + user.email).toString('base64'),
      });
    }

    if (action === 'login') {
      if (!email || !password) return json(400, { error: 'Email and password required.' });
      const found = users.find((u) => u.email === email);
      if (!found || !verifyPassword(password, found.salt, found.password_hash)) {
        return json(401, { error: 'Invalid email or password.' });
      }
      return json(200, {
        ok: true,
        user: publicUser(found),
        token: Buffer.from(found.id + ':' + found.email).toString('base64'),
      });
    }

    if (action === 'points') {
      // Add loyalty points for an authenticated email
      const found = users.find((u) => u.email === email);
      if (!found) return json(404, { error: 'User not found' });
      const add = Math.max(0, parseInt(body.add, 10) || 0);
      found.points = (found.points || 0) + add;
      await saveCollection('users', 'users.json', users);
      return json(200, { ok: true, user: publicUser(found) });
    }

    return json(400, { error: 'Unknown action. Use register, login, or points.' });
  } catch (err) {
    return json(500, { error: err.message || 'Auth failed' });
  }
};
