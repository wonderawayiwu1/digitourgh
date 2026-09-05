const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
/** Current Groq free-tier chat model (llama-3.3 is retired on many keys) */
const MODEL = 'openai/gpt-oss-120b';

/**
 * Read GROQ_API_KEY safely.
 * - Trim whitespace / quotes (common Netlify paste issue → "Invalid API Key")
 * - Use bracket access so esbuild does not bake an empty value at build time
 */
function getApiKey() {
  let raw = process.env['GROQ_API_KEY'] || process.env['GROQ_KEY'] || '';
  if (!raw) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^GROQ_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
        if (match && match[1]) {
          raw = match[1];
        }
      }
    } catch (_) {}
  }
  let key = String(raw || '').trim();
  // Strip wrapping quotes and accidental "GROQ_API_KEY=" prefix
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  if (key.toUpperCase().startsWith('GROQ_API_KEY=')) {
    key = key.slice('GROQ_API_KEY='.length).trim();
  }
  // Drop BOM / zero-width chars
  key = key.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (key && key.startsWith('gsk_')) return key;
  return key || null;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function siteBase(event) {
  const headers = (event && event.headers) || {};
  const proto = headers['x-forwarded-proto'] || 'https';
  const host = headers['x-forwarded-host'] || headers.host;
  if (host) return `${proto}://${host}`;
  return process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
}

async function loadJSON(base, file) {
  try {
    const fs = require('fs');
    const path = require('path');
    const localPath = path.resolve(__dirname, '../../data', file);
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf8'));
    }
  } catch (_) {}
  const res = await fetch(`${base}/data/${file}`);
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  return res.json();
}

function tokenize(q) {
  return String(q || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'what', 'where', 'when', 'how', 'are', 'is', 'can', 'you', 'about', 'tell', 'please', 'near', 'best'].includes(w));
}

function scoreText(text, tokens) {
  const t = String(text || '').toLowerCase();
  let score = 0;
  tokens.forEach((tok) => {
    if (t.includes(tok)) score += tok.length > 5 ? 3 : 2;
  });
  return score;
}

function compactCatalog(destinations, hotels, reviews, meta) {
  const dests = destinations.map((d) => ({
    id: d.id,
    title: d.title,
    region: d.region,
    category: d.category,
    location: d.location_contact || '',
    hotels_nearby: d.nearby_hotel_count || 0,
    summary: stripHtml(d.short_desc || d.description).slice(0, 220),
    url: `destination-detail.html?id=${d.id}`,
  }));

  const hotelList = hotels.map((h) => ({
    id: h.id,
    name: h.name,
    region: h.region || '',
    near: h.destination_title || '',
    destination_id: h.destination_id,
    price_usd: h.price_per_night,
    beds: h.room_capacity || 1,
    summary: stripHtml(h.description).slice(0, 140),
    url: `book-hotel.html?hotel_id=${h.id}`,
  }));

  const revs = (reviews || []).slice(0, 12).map((r) => ({
    name: r.full_name,
    rating: r.rating,
    about: r.dest_title || r.hotel_name || '',
    comment: String(r.comment || '').slice(0, 160),
  }));

  return {
    site: {
      name: (meta && meta.site_name) || 'DigiTour Ghana',
      tagline: (meta && meta.tagline) || '',
      phone: (meta && meta.phone_local) || '',
      whatsapp: (meta && meta.whatsapp) || '',
      email: (meta && meta.email_info) || '',
      totals: {
        destinations: dests.length,
        hotels: hotelList.length,
      },
    },
    destinations: dests,
    hotels: hotelList,
    reviews: revs,
  };
}

function retrieveRelevant(catalog, question) {
  const tokens = tokenize(question);
  if (!tokens.length) {
    return {
      destinations: catalog.destinations.filter((d) => d.hotels_nearby > 0).slice(0, 8),
      hotels: catalog.hotels.slice(0, 8),
      matched: false,
    };
  }

  const scoredDest = catalog.destinations
    .map((d) => ({
      ...d,
      _score: scoreText(`${d.title} ${d.region} ${d.category} ${d.location} ${d.summary}`, tokens),
    }))
    .filter((d) => d._score > 0)
    .sort((a, b) => b._score - a._score);

  const scoredHotels = catalog.hotels
    .map((h) => ({
      ...h,
      _score: scoreText(`${h.name} ${h.region} ${h.near} ${h.summary}`, tokens),
    }))
    .filter((h) => h._score > 0)
    .sort((a, b) => b._score - a._score);

  const topDest = scoredDest.slice(0, 8).map(({ _score, ...rest }) => rest);
  let topHotels = scoredHotels.slice(0, 8).map(({ _score, ...rest }) => rest);

  // Pull hotels for matched destinations
  if (topDest.length && topHotels.length < 4) {
    const ids = new Set(topDest.map((d) => String(d.id)));
    const extra = catalog.hotels.filter((h) => ids.has(String(h.destination_id))).slice(0, 6);
    const seen = new Set(topHotels.map((h) => h.id));
    extra.forEach((h) => {
      if (!seen.has(h.id)) topHotels.push(h);
    });
    topHotels = topHotels.slice(0, 10);
  }

  return {
    destinations: topDest,
    hotels: topHotels,
    matched: topDest.length > 0 || topHotels.length > 0,
    topScore: Math.max(
      scoredDest[0] ? scoredDest[0]._score : 0,
      scoredHotels[0] ? scoredHotels[0]._score : 0
    ),
  };
}

async function duckDuckGoSearch(query) {
  const results = [];
  try {
    const instant = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (instant.ok) {
      const data = await instant.json();
      if (data.AbstractText) {
        results.push({
          source: 'DuckDuckGo',
          title: data.Heading || query,
          snippet: data.AbstractText,
          url: data.AbstractURL || '',
        });
      }
      (data.RelatedTopics || []).slice(0, 4).forEach((t) => {
        if (t.Text) {
          results.push({
            source: 'DuckDuckGo',
            title: (t.FirstURL || '').split('/').pop() || 'Related',
            snippet: t.Text,
            url: t.FirstURL || '',
          });
        } else if (t.Topics) {
          t.Topics.slice(0, 2).forEach((x) => {
            if (x.Text) {
              results.push({
                source: 'DuckDuckGo',
                title: 'Related',
                snippet: x.Text,
                url: x.FirstURL || '',
              });
            }
          });
        }
      });
    }
  } catch (_) {}

  try {
    const wiki = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=4&namespace=0&format=json&origin=*`
    );
    if (wiki.ok) {
      const data = await wiki.json();
      const titles = data[1] || [];
      const descs = data[2] || [];
      const urls = data[3] || [];
      titles.forEach((title, i) => {
        results.push({
          source: 'Wikipedia',
          title,
          snippet: descs[i] || title,
          url: urls[i] || '',
        });
      });
    }
  } catch (_) {}

  // Lite HTML scrape as last resort for Ghana tourism queries
  if (results.length < 2) {
    try {
      const htmlRes = await fetch(
        `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query + ' Ghana tourism')}`,
        {
          headers: {
            'User-Agent': 'DigiTourBot/1.0 (+https://digitour.gh)',
            Accept: 'text/html',
          },
        }
      );
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const re = /<a[^>]+rel="nofollow"[^>]*>([^<]+)<\/a>[\s\S]*?<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
        let m;
        let n = 0;
        while ((m = re.exec(html)) && n < 4) {
          results.push({
            source: 'DuckDuckGo Lite',
            title: stripHtml(m[1]).slice(0, 120),
            snippet: stripHtml(m[2]).slice(0, 220),
            url: '',
          });
          n++;
        }
      }
    } catch (_) {}
  }

  return results.slice(0, 8);
}

function needsWebSearch(question, retrieval) {
  const q = question.toLowerCase();
  const webHints = [
    'weather',
    'visa',
    'flight',
    'currency rate',
    'exchange',
    'news',
    'today',
    'latest',
    'covid',
    'safety',
    'embassy',
    'how to get',
    'distance from',
    'airport',
    'outside',
    'world',
    'compare to',
  ];
  if (webHints.some((h) => q.includes(h))) return true;
  if (!retrieval.matched) return true;
  if ((retrieval.topScore || 0) < 3) return true;
  return false;
}

async function callGroq(apiKey, system, messages) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.35,
      max_tokens: 900,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || 'Groq API error';
    // Helpful hint when key is malformed after paste
    if (/invalid api key/i.test(msg)) {
      throw new Error(
        'Invalid API Key — in Netlify, edit GROQ_API_KEY, paste only the gsk_… value (no spaces/quotes), save, then trigger “Clear cache and deploy site”.'
      );
    }
    throw new Error(msg);
  }
  const choice = data.choices && data.choices[0] && data.choices[0].message;
  const content = (choice && choice.content) || '';
  // Some Groq models put draft text in reasoning; prefer content
  return String(content).trim() || '';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'POST only' }) };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'GROQ_API_KEY is not configured. Add it in Netlify → Site settings → Environment variables.',
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const question = String(payload.message || '').trim();
  if (!question || question.length > 1200) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Please enter a question (max 1200 characters).' }),
    };
  }

  const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];

  try {
    const base = siteBase(event);
    const [destinations, hotels, reviews, meta] = await Promise.all([
      loadJSON(base, 'destinations.json'),
      loadJSON(base, 'hotels.json'),
      loadJSON(base, 'reviews.json'),
      loadJSON(base, 'meta.json'),
    ]);

    const catalog = compactCatalog(destinations, hotels, reviews, meta);
    const retrieval = retrieveRelevant(catalog, question);
    const useWeb = needsWebSearch(question, retrieval);
    let webResults = [];
    if (useWeb) {
      webResults = await duckDuckGoSearch(question);
    }

    const system = `You are DigiGuide, DigiTour Ghana's friendly tourism AI assistant.

FORMATTING RULES (critical — replies show in a narrow mobile chat panel):
- Use clean Markdown only: **bold**, *italic*, headings (##), bullet lists, numbered lists.
- NEVER use emojis or emoji shortcodes. Use plain words (Phone, WhatsApp, Hotel, Location).
- NEVER use wide Markdown pipe tables (| col |). They break the chat UI.
- For hotels or destinations, use a compact list like:
  ### 1. Hotel Name
  - Near: Attraction
  - Price: $95/night · Beds: 2
  - Summary: one short sentence
  - Book: book-hotel.html?hotel_id=4
- Keep answers concise. Prefer 4–8 items max unless asked for more.
- Turn booking/detail paths into markdown links: [Book now](book-hotel.html?hotel_id=4)
- For phone/WhatsApp write: Call: 0549326089 and WhatsApp: https://wa.me/...

CONTENT RULES:
- Prefer DigiTour catalogue facts when available.
- Never invent DigiTour hotel prices or IDs — only use provided catalogue data.
- If using web sources, say so briefly.
- If the question is outside tourism, help briefly then steer back to Ghana travel when useful.
Phone/WhatsApp from catalogue: ${catalog.site.phone} / ${catalog.site.whatsapp}.

SITE OVERVIEW:
${JSON.stringify(catalog.site)}

RELEVANT DIGITOUR DESTINATIONS:
${JSON.stringify(retrieval.destinations)}

RELEVANT DIGITOUR HOTELS:
${JSON.stringify(retrieval.hotels)}

SAMPLE REVIEWS:
${JSON.stringify(catalog.reviews.slice(0, 4))}

WEB SEARCH RESULTS (${useWeb ? 'included' : 'not needed'}):
${JSON.stringify(webResults)}`;

    const messages = [
      ...history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) })),
      { role: 'user', content: question },
    ];

    const answer = await callGroq(apiKey, system, messages);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        answer,
        usedWeb: useWeb && webResults.length > 0,
        matches: {
          destinations: retrieval.destinations.length,
          hotels: retrieval.hotels.length,
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message || 'Chat failed' }),
    };
  }
};
