/**
 * DigiGuide knowledge layer — built from live DigiTour JSON (not a stale snapshot).
 * Cold-start cache: destinations, hotels, geo, reviews, meta → searchable chunks.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIRS = [
  path.join(__dirname, '..', '..', 'data'),
  path.join(process.cwd(), 'data'),
  path.join(__dirname, 'data'),
  path.join(__dirname, '..', 'data'),
];

const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'what', 'where', 'when', 'how', 'are', 'is', 'can',
  'you', 'about', 'tell', 'please', 'near', 'best', 'give', 'some', 'that', 'this', 'have',
  'want', 'need', 'would', 'could', 'should', 'into', 'your', 'our', 'any', 'all', 'also',
  'hotel', 'hotels', 'stay', 'stays',
]);

const GENERIC = new Set([
  'ghana', 'tourism', 'tourist', 'travel', 'visit', 'place', 'places', 'site', 'sites',
  'attraction', 'attractions', 'destination', 'destinations', 'country', 'guide',
  'know', 'should', 'there', 'here', 'info', 'information',
]);

const REGION_ALIASES = {
  accra: 'Greater Accra',
  'greater accra': 'Greater Accra',
  osa: 'Greater Accra',
  osu: 'Greater Accra',
  jamestown: 'Greater Accra',
  labadi: 'Greater Accra',
  kokrobite: 'Greater Accra',
  kumasi: 'Ashanti Region',
  ashanti: 'Ashanti Region',
  asante: 'Ashanti Region',
  'cape coast': 'Central Region',
  elmina: 'Central Region',
  kakum: 'Central Region',
  central: 'Central Region',
  winneba: 'Central Region',
  takoradi: 'Western Region',
  western: 'Western Region',
  busua: 'Western Region',
  axim: 'Western Region',
  nzulezo: 'Western Region',
  volta: 'Volta Region',
  ho: 'Volta Region',
  wli: 'Volta Region',
  afadjato: 'Volta Region',
  keta: 'Volta Region',
  eastern: 'Eastern Region',
  aburi: 'Eastern Region',
  akosombo: 'Eastern Region',
  koforidua: 'Eastern Region',
  boti: 'Eastern Region',
  tamale: 'Northern Region',
  northern: 'Northern Region',
  mole: 'Savannah Region',
  savannah: 'Savannah Region',
  larabanga: 'Savannah Region',
  'upper east': 'Upper East Region',
  bolgatanga: 'Upper East Region',
  paga: 'Upper East Region',
  'upper west': 'Upper West Region',
  wa: 'Upper West Region',
  bono: 'Bono Region',
  'bono east': 'Bono East Region',
  kintampo: 'Bono East Region',
  oti: 'Oti Region',
  'western north': 'Western North Region',
  ahafo: 'Ahafo Region',
  mim: 'Ahafo Region',
  'north east': 'North East Region',
};

const PLACE_ALIASES = {
  nkrumah: 'kwame nkrumah memorial park',
  'independence square': 'black star square',
  'black star': 'black star square',
  christiansborg: 'osu castle',
  'osu castle': 'osu castle',
  kakum: 'kakum national park canopy walkway',
  'canopy walk': 'kakum national park canopy walkway',
  'cape coast castle': 'cape coast castle',
  elmina: 'elmina castle',
  'st george': 'elmina castle',
  mole: 'mole national park',
  wli: 'wli waterfalls',
  'agumatsa': 'wli waterfalls',
  afadjato: 'mount afadjato',
  larabanga: 'larabanga mosque',
  nzulezo: 'nzulezo stilt village',
  nzulezu: 'nzulezo stilt village',
  labadi: 'labadi pleasure beach',
  bojo: 'bojo beach',
  manhyia: 'manhyia palace museum',
  kente: 'bonwire kente village',
  bonwire: 'bonwire kente village',
  bosomtwe: 'lake bosomtwe',
  'lake volta': 'akosombo dam & lake volta',
  akosombo: 'akosombo dam & lake volta',
  paga: 'paga crocodile pond',
  kintampo: 'kintampo waterfalls',
  aburi: 'aburi botanical gardens',
  boti: 'boti waterfalls',
  'slave river': 'assin manso slave river site',
  'web dubois': 'w.e.b. du bois memorial centre',
  'du bois': 'w.e.b. du bois memorial centre',
  kejetia: 'kejetia market',
  makola: 'makola market',
  ussher: 'ussher fort',
  'arts centre': 'centre for national culture',
  'national mosque': 'ghana national mosque',
  besease: 'besease traditional shrine',
  'asante traditional': 'besease traditional shrine',
  'tetteh quarshie': 'tetteh quarshie cocoa farm',
  bui: 'bui national park',
  nkroful: 'nkroful',
  'national theatre': 'national theatre of ghana',
  digya: 'digya national park',
  'ada foah': 'ada foah and songor lagoon',
  songor: 'ada foah and songor lagoon',
  kalakpa: 'kalakpa resource reserve',
  'fort william': 'fort william, anomabo',
  anomabo: 'fort william, anomabo',
  'senya beraku': 'fort good hope, senya beraku',
  'good hope': 'fort good hope, senya beraku',
};

let CACHE = null;

function readJSON(file, fallback) {
  for (let i = 0; i < DATA_DIRS.length; i++) {
    try {
      const p = path.join(DATA_DIRS[i], file);
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (_) {}
  }
  return fallback;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|div|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(q) {
  return String(q || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w) && !GENERIC.has(w));
}

function expandQuery(question) {
  const q = String(question || '').toLowerCase();
  const extras = [];
  Object.keys(PLACE_ALIASES).forEach((alias) => {
    if (q.includes(alias)) extras.push(PLACE_ALIASES[alias]);
  });
  Object.keys(REGION_ALIASES).forEach((alias) => {
    if (q.includes(alias)) extras.push(REGION_ALIASES[alias].toLowerCase());
  });
  return `${q} ${extras.join(' ')}`.trim();
}

function categoryHint(question) {
  const q = String(question || '').toLowerCase();
  if (/\bbeach|beaches|surf\b/.test(q)) return 'Beach';
  if (/\bwaterfall|waterfalls|falls\b/.test(q)) return 'waterfall';
  if (/\bcastl|fort|slave|unesco\b/.test(q)) return 'History';
  if (/\bwildlife|safari|monkey|hippo|crocodile\b/.test(q)) return 'Nature & Wildlife';
  if (/\bkente|market|pottery|craft|mosque\b/.test(q)) return 'Culture & Heritage';
  return null;
}

function detectRegion(question) {
  const q = String(question || '').toLowerCase();
  let found = null;
  Object.keys(REGION_ALIASES).forEach((alias) => {
    if (q.includes(alias)) found = REGION_ALIASES[alias];
  });
  return found;
}

function scoreText(text, tokens) {
  const t = String(text || '').toLowerCase();
  let score = 0;
  tokens.forEach((tok) => {
    if (!t.includes(tok)) return;
    score += tok.length > 6 ? 4 : tok.length > 4 ? 3 : 2;
  });
  return score;
}

function phraseBonus(haystack, question) {
  const h = String(haystack || '').toLowerCase();
  const q = String(question || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  if (q.length > 8 && h.includes(q)) return 40;
  const words = q.split(/\s+/).filter((w) => w.length > 3);
  let bonus = 0;
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = words[i] + ' ' + words[i + 1];
    if (h.includes(phrase)) bonus += 10;
  }
  return bonus;
}

function productKnowledge(meta, destinations, hotels) {
  const destCount = destinations.length;
  const hotelCount = hotels.length;
  const regions = Array.from(new Set(destinations.map((d) => d.region))).sort();
  const categories = Array.from(new Set(destinations.map((d) => d.category))).sort();
  const phone = (meta && meta.phone_local) || '0546004395';
  const wa = (meta && meta.whatsapp) || 'https://wa.me/233546004395';
  const featured = destinations.filter((d) => d.is_featured).map((d) => d.title);

  return `
DigiTour Ghana is a smart tourism & accommodation portal (${(meta && meta.site_url) || 'https://digitourgh.netlify.app'}).
Tagline: ${(meta && meta.tagline) || 'Smart Tourism & Accommodation Portal'}.
Catalogue size: ${destCount} destinations and ${hotelCount} nearby hotels across all 16 Ghana regions.
Regions: ${regions.join('; ')}.
Categories: ${categories.join('; ')}.
Featured highlights: ${featured.join('; ')}.

PAGES / HOW TO USE THE SITE:
- Home (index.html): hero videos, search + region filter, featured destinations, featured hotels, reviews.
- Full catalogue (destinations.html): all ${destCount} sites. Filter by region or category (History, Nature & Wildlife, Beach, Culture & Heritage, History & Culture, Nature & Waterways). Search by title.
- Destination detail (destination-detail.html?id={id}): full description, history, photo gallery, nearby hotels with book links, reviews, share, add to offline itinerary.
- Book hotel (book-hotel.html?hotel_id={id}): login required. Date + guest calculator using listed USD nightly rate. Saves booking (+50 loyalty points) and shows confirmation on dashboard.
- Interactive map (map.html): MapTiler 3D (streets with 3D buildings / aerial hybrid / satellite). Free Esri+OSM fallback if MapTiler is blocked. Search pins, filters, Reset View, 3D City / Aerial / 3D Buildings toggles. Pins open destination details and nearby hotels.
- Inquiry (inquiry.html): name, email, subject, message — saved via Netlify Functions + local cache.
- Register (register.html): free tourist account, +25 loyalty points.
- Login (login.html): demo kwame@example.com / demo123 (also adwoa@example.com / demo123 and admin@digitour.gh / demo123).
- Dashboard (dashboard.html): loyalty points, bookings, community reviews, offline itinerary download as .txt.

PRODUCT BEHAVIOUR:
- Help float (bottom-left headset): Call tel:+233546004395 or WhatsApp ${wa}.
- DigiGuide chat (bottom-right): this assistant.
- Language: EN / FR via Google Translate (cookie dt_lang). Default English.
- Currency switcher: USD (base), GHS (×15.5), EUR (×0.92). Hotel prices in catalogue are USD per night.
- Loyalty: +25 register, +50 booking, +15 approved review.
- Offline itinerary: add a destination from its detail page, download from Dashboard.
- Accounts / bookings / reviews / inquiries persist with Netlify Functions + Blobs in production, plus browser localStorage cache on each device.
- Contact: Call ${phone} · WhatsApp ${wa} · ${((meta && meta.email_info) || 'info@digitour.gh')} / ${((meta && meta.email_support) || 'support@digitour.gh')}.
- Address: ${(meta && meta.address) || 'Tourism Board Building, Accra, Ghana'}.
- AI itinerary planner modal on the site can draft 1/3/5/7-day plans by budget and interest (history, nature, beach, culture).
`.trim();
}

function buildIndex(payload) {
  const destinations = (payload && payload.destinations) || readJSON('destinations.json', []);
  const hotels = (payload && payload.hotels) || readJSON('hotels.json', []);
  const reviews = (payload && payload.reviews) || readJSON('reviews.json', []);
  const meta = (payload && payload.meta) || readJSON('meta.json', {});
  const geo = (payload && payload.geo) || readJSON('geo.json', { destinations: [] });
  const geoById = {};
  (geo.destinations || []).forEach((g) => {
    geoById[String(g.id)] = g;
  });

  const destDocs = destinations.map((d) => {
    const g = geoById[String(d.id)] || {};
    const description = stripHtml(d.description);
    const history = stripHtml(d.history);
    const nearbyHotels = hotels.filter((h) => String(h.destination_id) === String(d.id));
    const haystack = [
      d.title,
      d.region,
      d.category,
      d.location_contact,
      description,
      history,
      nearbyHotels.map((h) => h.name).join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return {
      id: d.id,
      title: d.title,
      region: d.region,
      category: d.category,
      location: d.location_contact || '',
      lat: g.lat || null,
      lng: g.lng || null,
      featured: !!d.is_featured,
      hotels_nearby: nearbyHotels.length || d.nearby_hotel_count || 0,
      description,
      history,
      haystack,
      url: `destination-detail.html?id=${d.id}`,
      map: 'map.html',
      hotel_ids: nearbyHotels.map((h) => h.id),
    };
  });

  const hotelDocs = hotels.map((h) => {
    const haystack = [h.name, h.region, h.destination_title, h.description, h.contact_phone]
      .join(' ')
      .toLowerCase();
    return {
      id: h.id,
      name: h.name,
      region: h.region || '',
      near: h.destination_title || '',
      destination_id: h.destination_id,
      price_usd: h.price_per_night,
      beds: h.room_capacity || 1,
      phone: h.contact_phone || '',
      email: h.contact_email || '',
      description: stripHtml(h.description),
      haystack,
      url: `book-hotel.html?hotel_id=${h.id}`,
      dest_url: `destination-detail.html?id=${h.destination_id}`,
    };
  });

  const byRegion = {};
  destDocs.forEach((d) => {
    if (!byRegion[d.region]) byRegion[d.region] = [];
    byRegion[d.region].push({ id: d.id, title: d.title, category: d.category, hotels: d.hotels_nearby });
  });

  const reviewDocs = (reviews || []).map((r) => ({
    name: r.full_name,
    rating: r.rating,
    about: r.dest_title || r.hotel_name || '',
    destination_id: r.destination_id,
    hotel_id: r.hotel_id,
    comment: String(r.comment || ''),
    status: r.status || 'Approved',
  }));

  return {
    meta,
    destDocs,
    hotelDocs,
    byRegion,
    reviewDocs,
    product: productKnowledge(meta, destinations, hotels),
    site: {
      name: (meta && meta.site_name) || 'DigiTour Ghana',
      tagline: (meta && meta.tagline) || '',
      url: (meta && meta.site_url) || 'https://digitourgh.netlify.app',
      phone: (meta && meta.phone_local) || '0546004395',
      whatsapp: (meta && meta.whatsapp) || 'https://wa.me/233546004395',
      email: (meta && meta.email_info) || 'info@digitour.gh',
      support: (meta && meta.email_support) || 'support@digitour.gh',
      address: (meta && meta.address) || 'Tourism Board Building, Accra, Ghana',
      totals: { destinations: destDocs.length, hotels: hotelDocs.length, reviews: reviewDocs.length },
      regions: Object.keys(byRegion).sort(),
    },
    builtAt: new Date().toISOString(),
  };
}

function getKnowledge() {
  if (!CACHE) CACHE = buildIndex();
  return CACHE;
}

async function hydrateFromUrl(base) {
  let kb = getKnowledge();
  if (kb.destDocs && kb.destDocs.length) return kb;
  if (!base) return kb;
  try {
    const load = async (file, fallback) => {
      try {
        const res = await fetch(String(base).replace(/\/$/, '') + '/data/' + file);
        return res.ok ? await res.json() : fallback;
      } catch (_) {
        return fallback;
      }
    };
    const [destinations, hotels, reviews, meta, geo] = await Promise.all([
      load('destinations.json', []),
      load('hotels.json', []),
      load('reviews.json', []),
      load('meta.json', {}),
      load('geo.json', { destinations: [] }),
    ]);
    if (destinations && destinations.length) {
      CACHE = buildIndex({ destinations, hotels, reviews, meta, geo });
    }
  } catch (_) {}
  return getKnowledge();
}

function compactDest(d, descLimit, histLimit) {
  return {
    id: d.id,
    title: d.title,
    region: d.region,
    category: d.category,
    location: d.location,
    lat: d.lat,
    lng: d.lng,
    featured: d.featured,
    hotels_nearby: d.hotels_nearby,
    description: (d.description || '').slice(0, descLimit),
    history: (d.history || '').slice(0, histLimit),
    url: d.url,
  };
}

function compactHotel(h) {
  return {
    id: h.id,
    name: h.name,
    region: h.region,
    near: h.near,
    destination_id: h.destination_id,
    price_usd: h.price_usd,
    beds: h.beds,
    phone: h.phone,
    email: h.email,
    description: h.description,
    url: h.url,
    dest_url: h.dest_url,
  };
}

function retrieveRelevant(question) {
  const kb = getKnowledge();
  const expanded = expandQuery(question);
  const tokens = tokenize(expanded);
  const regionHint = detectRegion(question);
  const catHint = categoryHint(question);
  const qLower = String(question || '').toLowerCase();

  const productHints = [
    'book', 'booking', 'login', 'register', 'dashboard', 'map', 'language', 'french',
    'whatsapp', 'call', 'inquiry', 'itinerary', 'loyalty', 'points', 'currency',
    'account', 'how do i', 'how to use', 'digitour',
  ];
  const isProduct = productHints.some((h) => qLower.includes(h));

  if (!tokens.length) {
    return {
      destinations: kb.destDocs.filter((d) => d.featured).slice(0, 8).map((d) => compactDest(d, 900, 700)),
      hotels: kb.hotelDocs.slice(0, 8).map(compactHotel),
      regionList: null,
      reviews: kb.reviewDocs.slice(0, 6),
      matched: false,
      topScore: 0,
      isProduct,
      regionHint,
    };
  }

  const scoredDest = kb.destDocs
    .map((d) => {
      let score = scoreText(d.haystack, tokens);
      score += phraseBonus(d.title, expanded) * 2;
      score += phraseBonus(d.haystack, expanded);
      const titleLow = d.title.toLowerCase();
      tokens.forEach((tok) => {
        if (titleLow === tok) score += 40;
        else if (titleLow.includes(tok)) score += tok.length > 4 ? 22 : 10;
      });
      if (regionHint && d.region === regionHint) score += 22;
      if (catHint === 'Beach' && d.category === 'Beach') score += 28;
      if (catHint === 'History' && /history/i.test(d.category)) score += 16;
      if (catHint === 'Nature & Wildlife' && /nature|wildlife/i.test(d.category)) score += 12;
      if (catHint === 'Culture & Heritage' && /culture|heritage/i.test(d.category)) score += 16;
      if (catHint === 'waterfall' && /fall|wli|boti|kintampo|tagbo/i.test(titleLow + ' ' + d.haystack)) score += 30;
      if (d.featured) score += 2;
      return { doc: d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const scoredHotels = kb.hotelDocs
    .map((h) => {
      let score = scoreText(h.haystack, tokens);
      score += phraseBonus(h.name, expanded) * 2;
      const nameLow = h.name.toLowerCase();
      tokens.forEach((tok) => {
        if (nameLow.includes(tok)) score += tok.length > 4 ? 20 : 10;
      });
      if (regionHint && h.region === regionHint) score += 12;
      if (catHint === 'Beach' && /beach|resort|labadi|busua|bojo|kokrobite/i.test(nameLow + ' ' + (h.near || ''))) score += 18;
      return { doc: h, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const peak = scoredDest[0] ? scoredDest[0].score : 0;
  const ratio = peak >= 30 ? 0.55 : 0.42;
  const tightDest = scoredDest.filter((x) => peak < 12 || x.score >= peak * ratio).slice(0, 6);
  let topDest = tightDest.map((x) => compactDest(x.doc, 1600, 1200));

  const destCap = peak >= 30 ? 2 : 4;
  const primaryIds = new Set(tightDest.slice(0, destCap).map((x) => String(x.doc.id)));
  const linkedHotels = kb.hotelDocs.filter((h) => primaryIds.has(String(h.destination_id)));
  const weakHotel = new Set(['park', 'hotel', 'lodge', 'national', 'guest', 'house', 'beach', 'resort', 'water', 'falls']);
  const distinctive = tokens.filter((t) => t.length > 4 && !weakHotel.has(t));
  const seenH = new Set();
  let topHotels = [];
  linkedHotels.forEach((h) => {
    seenH.add(h.id);
    topHotels.push(compactHotel(h));
  });
  scoredHotels.forEach((x) => {
    if (seenH.has(x.doc.id)) return;
    const nameLow = x.doc.name.toLowerCase();
    if (!distinctive.some((t) => nameLow.includes(t))) return;
    seenH.add(x.doc.id);
    topHotels.push(compactHotel(x.doc));
  });
  topHotels = topHotels.slice(0, 10);

  let regionList = null;
  if (regionHint && kb.byRegion[regionHint]) {
    regionList = {
      region: regionHint,
      destinations: kb.byRegion[regionHint],
    };
    if (!topDest.length) {
      topDest = kb.destDocs
        .filter((d) => d.region === regionHint)
        .slice(0, 8)
        .map((d) => compactDest(d, 900, 600));
    }
  }

  const destIds = new Set(topDest.map((d) => String(d.id)));
  const reviews = kb.reviewDocs
    .filter((r) => destIds.has(String(r.destination_id)) || !topDest.length)
    .slice(0, 6);

  const topScore = Math.max(
    scoredDest[0] ? scoredDest[0].score : 0,
    scoredHotels[0] ? scoredHotels[0].score : 0
  );

  return {
    destinations: topDest,
    hotels: topHotels,
    regionList,
    reviews: reviews.length ? reviews : kb.reviewDocs.slice(0, 4),
    matched: topDest.length > 0 || topHotels.length > 0,
    topScore,
    isProduct,
    regionHint,
  };
}

module.exports = {
  stripHtml,
  tokenize,
  getKnowledge,
  hydrateFromUrl,
  retrieveRelevant,
  expandQuery,
};
