/**
 * DigiTour shared JSON store for Netlify Functions.
 *
 * WHY BLOBS?
 * Netlify's publish folder is read-only after deploy. You cannot permanently
 * append to data/*.json on the live site. We:
 *   1) Seed from static data/*.json (shipped with the site)
 *   2) Persist live writes in Netlify Blobs (free, no MySQL)
 * Local `netlify dev` also writes a fallback under .netlify/digitour-data/
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const LOCAL_DIR = path.join(ROOT, '.netlify', 'digitour-data');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  };
}

function readSeed(fileName, fallback) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, fileName), 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function ensureLocalDir() {
  try {
    fs.mkdirSync(LOCAL_DIR, { recursive: true });
  } catch (_) {}
}

async function getBlobStore() {
  try {
    const { getStore } = require('@netlify/blobs');
    return getStore('digitour');
  } catch (_) {
    return null;
  }
}

async function loadCollection(name, seedFile, fallback) {
  const store = await getBlobStore();
  if (store) {
    try {
      const existing = await store.get(name, { type: 'json' });
      if (existing != null) return existing;
      const seed = readSeed(seedFile, fallback);
      await store.setJSON(name, seed);
      return seed;
    } catch (err) {
      console.warn('Blob read failed, using seed/local', err.message);
    }
  }

  ensureLocalDir();
  const localPath = path.join(LOCAL_DIR, seedFile);
  try {
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf8'));
    }
  } catch (_) {}
  const seed = readSeed(seedFile, fallback);
  try {
    fs.writeFileSync(localPath, JSON.stringify(seed, null, 2));
  } catch (_) {}
  return seed;
}

async function saveCollection(name, seedFile, data) {
  const store = await getBlobStore();
  if (store) {
    try {
      await store.setJSON(name, data);
      return true;
    } catch (err) {
      console.warn('Blob write failed', err.message);
    }
  }
  ensureLocalDir();
  const localPath = path.join(LOCAL_DIR, seedFile);
  fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
  return true;
}

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const password_hash = crypto.createHash('sha256').update(String(password) + s).digest('hex');
  return { salt: s, password_hash };
}

function verifyPassword(password, salt, password_hash) {
  const check = crypto.createHash('sha256').update(String(password) + salt).digest('hex');
  return check === password_hash;
}

function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    role: u.role || 'tourist',
    points: u.points || 0,
    created_at: u.created_at,
  };
}

module.exports = {
  corsHeaders,
  json,
  loadCollection,
  saveCollection,
  hashPassword,
  verifyPassword,
  publicUser,
  readSeed,
};
