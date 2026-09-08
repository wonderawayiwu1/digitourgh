/**
 * Apply researched copy to destinations.json, geo.json, meta.json, sitemap.xml.
 */
const fs = require('fs');
const path = require('path');
const { COPY, NEW_SITES } = require('./catalogue_extras');

const ROOT = path.join(__dirname, '..');
const DEST_PATH = path.join(ROOT, 'data', 'destinations.json');
const GEO_PATH = path.join(ROOT, 'data', 'geo.json');
const META_PATH = path.join(ROOT, 'data', 'meta.json');

function strip(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toHtml(entry) {
  const geo = (entry.geo || []).map((p) => `<p>${p}</p>`).join('\n');
  const visit = (entry.visit || []).map((p) => `<p>${p}</p>`).join('\n');
  const facts = (entry.facts || [])
    .map(([k, v]) => `  <li><strong>${k}:</strong> ${v}</li>`)
    .join('\n');
  const hist = (entry.history || []).map((p) => `<p>${p}</p>`).join('\n');
  const quote = entry.quote ? `\n<blockquote class="dt-quote">${entry.quote}</blockquote>` : '';
  const description =
    `<h3>Geographic &amp; Architectural Overview</h3>\n${geo}\n\n` +
    `<h3>Key Attributes &amp; Visiting Information</h3>\n${visit}\n\n` +
    `<ul>\n${facts}\n</ul>`;
  const history = `<h3>Historical Origins &amp; Cultural Significance</h3>\n${hist}${quote}`;
  return { description, history };
}

function shortDesc(description) {
  const t = String(description || '')
    .replace(/<h3>[\s\S]*?<\/h3>/gi, ' ')
    .replace(/<ul>[\s\S]*?<\/ul>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= 155) return t;
  return t.slice(0, 154).trim() + '…';
}

/** Pins that were previously in the wrong town or even the wrong region. */
const COORD_FIX = {
  3: [5.5466, -0.1827],
  4: [5.5335, -0.2115],
  15: [5.5338, -0.2104],
  40: [4.997, -2.584],
  42: [5.0194, -1.6306],
  43: [5.023, -2.591],
  63: [6.845, 0.437],
  105: [6.9, -2.317],
};

const missingKeys = [];
for (let i = 1; i <= 105; i++) {
  if (!COPY[i]) missingKeys.push(i);
}
if (missingKeys.length) {
  console.error('COPY missing ids', missingKeys.join(', '));
  process.exit(1);
}

const dests = JSON.parse(fs.readFileSync(DEST_PATH, 'utf8'));
const geo = JSON.parse(fs.readFileSync(GEO_PATH, 'utf8'));
const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

let updated = 0;
dests.forEach((d) => {
  const c = COPY[d.id];
  if (!c) return;
  const html = toHtml(c);
  d.description = html.description;
  d.history = html.history;
  d.short_desc = shortDesc(html.description);
  if (c.location) d.location_contact = c.location;
  if (c.region) d.region = c.region;
  updated += 1;
});

NEW_SITES.forEach((site) => {
  const existing = dests.find((d) => String(d.title || '').toLowerCase() === site.title.toLowerCase());
  if (!existing) return;
  const html = toHtml(site.copy);
  existing.description = html.description;
  existing.history = html.history;
  existing.short_desc = shortDesc(html.description);
  existing.location_contact = site.location_contact;
  existing.region = site.region;
  existing.category = site.category;
  if (site.image_url) {
    existing.image_url = site.image_url;
    existing.images = [site.image_url];
  }
});

let nextId = dests.reduce((m, d) => Math.max(m, d.id), 0);
const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
const existingTitles = new Set(dests.map((d) => String(d.title || '').toLowerCase()));
let added = 0;

NEW_SITES.forEach((site) => {
  if (existingTitles.has(site.title.toLowerCase())) return;
  nextId += 1;
  added += 1;
  const html = toHtml(site.copy);
  dests.push({
    id: nextId,
    title: site.title,
    region: site.region,
    category: site.category,
    description: html.description,
    history: html.history,
    location_contact: site.location_contact,
    image_main: null,
    image_2: null,
    image_3: null,
    is_featured: site.featured || 0,
    created_at: createdAt,
    nearby_hotel_count: 0,
    short_desc: shortDesc(html.description),
    image_url: site.image_url,
    images: [site.image_url],
  });
  geo.destinations.push({
    id: nextId,
    title: site.title,
    region: site.region,
    category: site.category,
    lat: site.lat,
    lng: site.lng,
    image_url: site.image_url,
    hotels: 0,
    featured: !!site.featured,
  });
  existingTitles.add(site.title.toLowerCase());
});

geo.generated_at = new Date().toISOString().slice(0, 10);
dests.forEach((d) => {
  const g = geo.destinations.find((x) => x.id === d.id);
  if (!g) return;
  g.title = d.title;
  g.region = d.region;
  g.category = d.category;
  g.image_url = d.image_url;
  g.featured = !!d.is_featured;
  g.hotels = d.nearby_hotel_count || 0;
  const fix = COORD_FIX[d.id];
  if (fix) {
    g.lat = fix[0];
    g.lng = fix[1];
  }
});
meta.total_destinations = dests.length;
meta.matched_destination_images = dests.filter((d) => d.image_url).length;
meta.seo_description =
  'DigiTour Ghana is the national smart tourism portal to discover ' +
  dests.length +
  ' Ghanaian attractions, compare nearby hotels, book stays, read reviews, and plan trips across all 16 regions.';
meta.regions = Array.from(new Set(dests.map((d) => d.region))).sort();
meta.categories = Array.from(new Set(dests.map((d) => d.category))).sort();

const SITE = 'https://digitourgh.netlify.app';
const sitemapUrls = [
  ['/', 'daily', '1.00'],
  ['/destinations.html', 'daily', '0.95'],
  ['/map.html', 'weekly', '0.90'],
  ['/inquiry.html', 'monthly', '0.60'],
  ['/login.html', 'monthly', '0.40'],
  ['/register.html', 'monthly', '0.50'],
];
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapUrls
    .map(([p, c, pr]) => `<url><loc>${SITE}${p}</loc><changefreq>${c}</changefreq><priority>${pr}</priority></url>`)
    .join('\n') +
  '\n' +
  dests
    .map((d) => `<url><loc>${SITE}/destination-detail.html?id=${d.id}</loc><changefreq>weekly</changefreq><priority>0.75</priority></url>`)
    .join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
fs.writeFileSync(DEST_PATH, JSON.stringify(dests, null, 2) + '\n');
fs.writeFileSync(GEO_PATH, JSON.stringify(geo, null, 2) + '\n');
fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2) + '\n');

const generic = dests.filter((d) => /primary focal point/i.test(d.description || '')).length;
const empty = dests.filter((d) => !d.description || !d.history).map((d) => d.id);
console.log('Updated existing', updated);
console.log('Added', added, 'new sites; total now', dests.length);
console.log('Remaining generic templates', generic);
if (empty.length) console.log('Empty description/history ids', empty.join(', '));
console.log('Fort Apollonia region', dests.find((d) => d.id === 40).region);
console.log('Fort San Sebastian region', dests.find((d) => d.id === 42).region);
console.log('Mim Lake location', dests.find((d) => d.id === 105).location_contact);
console.log('Mount Agou location', dests.find((d) => d.id === 63).location_contact);
