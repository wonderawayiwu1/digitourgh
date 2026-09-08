const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
/** Current Groq free-tier chat model (llama-3.3 is retired on many keys) */
const MODEL = 'openai/gpt-oss-120b';

const { hydrateFromUrl, retrieveRelevant, stripHtml } = require('./_knowledge');

/**
 * Read env vars safely (Netlify + local .env).
 * Trim whitespace / quotes (common Netlify paste issue).
 */
function getEnv(name) {
  let raw = process.env[name] || '';
  if (!raw) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const re = new RegExp('^' + name + '\\s*=\\s*["\']?([^"\'\\r\\n]+)["\']?', 'm');
        const match = content.match(re);
        if (match && match[1]) raw = match[1];
      }
    } catch (_) {}
  }
  let key = String(raw || '').trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  if (key.toUpperCase().startsWith(name + '=')) {
    key = key.slice(name.length + 1).trim();
  }
  key = key.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  return key || null;
}

function getApiKey() {
  const key = getEnv('GROQ_API_KEY') || getEnv('GROQ_KEY');
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

function siteBase(event) {
  const headers = (event && event.headers) || {};
  const proto = headers['x-forwarded-proto'] || 'https';
  const host = headers['x-forwarded-host'] || headers.host;
  if (host) return `${proto}://${host}`;
  return process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
}

async function fetchTimeout(url, options, ms) {
  const wait = ms || 8000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), wait);
  try {
    return await fetch(url, Object.assign({}, options || {}, { signal: ctrl.signal }));
  } finally {
    clearTimeout(timer);
  }
}

function googleQuery(question) {
  const q = String(question || '').trim();
  if (/\bghana\b/i.test(q)) return q;
  const productOnly = /digitour|how do i (book|login|register|use the map)|loyalty points|whatsapp/i.test(q);
  if (productOnly) return q + ' Ghana travel';
  return q + ' Ghana tourism travel';
}

function pushUnique(list, item) {
  if (!item) return;
  const snippet = String(item.snippet || item.title || '').replace(/\s+/g, ' ').trim().slice(0, 700);
  if (snippet.length < 12) return;
  const key = (item.url || item.title || snippet).toLowerCase();
  if (list.some((x) => (x.url && item.url && x.url === item.url) || x.title === item.title)) return;
  if (list.some((x) => String(x.snippet).slice(0, 80) === snippet.slice(0, 80))) return;
  list.push({
    source: item.source || 'Web',
    title: String(item.title || 'Result').slice(0, 180),
    snippet,
    url: item.url || '',
    key,
  });
}

async function googleCustomSearch(query) {
  const key = getEnv('GOOGLE_API_KEY') || getEnv('GOOGLE_CSE_KEY');
  const cx = getEnv('GOOGLE_CSE_ID') || getEnv('GOOGLE_CX');
  if (!key || !cx) return [];
  const results = [];
  try {
    const url =
      'https://www.googleapis.com/customsearch/v1?key=' +
      encodeURIComponent(key) +
      '&cx=' +
      encodeURIComponent(cx) +
      '&q=' +
      encodeURIComponent(query) +
      '&num=8&gl=gh&hl=en';
    const res = await fetchTimeout(url, { headers: { Accept: 'application/json' } }, 8000);
    if (!res.ok) return results;
    const data = await res.json();
    (data.items || []).forEach((it) => {
      pushUnique(results, {
        source: 'Google',
        title: it.title,
        snippet: it.snippet || it.htmlSnippet,
        url: it.link,
      });
    });
  } catch (_) {}
  return results;
}

async function serperGoogleSearch(query) {
  const key = getEnv('SERPER_API_KEY');
  if (!key) return [];
  const results = [];
  try {
    const res = await fetchTimeout(
      'https://google.serper.dev/search',
      {
        method: 'POST',
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, gl: 'gh', hl: 'en', num: 10 }),
      },
      8000
    );
    if (!res.ok) return results;
    const data = await res.json();
    if (data.knowledgeGraph) {
      const kg = data.knowledgeGraph;
      pushUnique(results, {
        source: 'Google Knowledge Graph',
        title: kg.title || query,
        snippet: [kg.type, kg.description, kg.attributes && JSON.stringify(kg.attributes)].filter(Boolean).join(' — '),
        url: kg.website || kg.descriptionLink || '',
      });
    }
    if (data.answerBox) {
      const box = data.answerBox;
      pushUnique(results, {
        source: 'Google Answer',
        title: box.title || box.answer || query,
        snippet: box.answer || box.snippet || box.title,
        url: box.link || '',
      });
    }
    (data.organic || []).forEach((it) => {
      pushUnique(results, {
        source: 'Google',
        title: it.title,
        snippet: it.snippet,
        url: it.link,
      });
    });
  } catch (_) {}
  return results;
}

function decodeGoogleHref(href) {
  try {
    const raw = String(href || '');
    const m = raw.match(/[?&]q=([^&]+)/);
    if (m) return decodeURIComponent(m[1]);
    if (/^https?:\/\//i.test(raw)) return raw;
  } catch (_) {}
  return '';
}

async function googleHtmlSearch(query) {
  const results = [];
  try {
    const url =
      'https://www.google.com/search?q=' +
      encodeURIComponent(query) +
      '&num=10&hl=en&gl=gh&pws=0&gbv=1';
    const res = await fetchTimeout(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      8500
    );
    if (!res.ok) return results;
    const html = await res.text();
    const re = /<a[^>]+href="(\/url\?q=[^"]+|https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    let n = 0;
    while ((m = re.exec(html)) && n < 12) {
      const href = decodeGoogleHref(m[1].replace(/&amp;/g, '&'));
      if (!href || /google\.(com|co)|accounts\.google|support\.google|maps\.google/i.test(href)) continue;
      const title = stripHtml(m[2]).slice(0, 160);
      if (!title || title.length < 8) continue;
      pushUnique(results, {
        source: 'Google',
        title,
        snippet: title,
        url: href,
      });
      n++;
    }

    const snippetRe = /<td[^>]*class="[^"]*result-snippet[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
    const extraSnips = [];
    let s;
    while ((s = snippetRe.exec(html))) extraSnips.push(stripHtml(s[1]));
    results.forEach((r, i) => {
      if (extraSnips[i] && extraSnips[i].length > (r.snippet || '').length) r.snippet = extraSnips[i].slice(0, 700);
    });
  } catch (_) {}
  return results;
}

async function jinaWebSearch(query) {
  const results = [];
  try {
    const res = await fetchTimeout('https://s.jina.ai/' + encodeURIComponent(query), {
      headers: {
        Accept: 'application/json',
        'X-Retain-Images': 'none',
        'User-Agent': 'DigiTourDigiGuide/2.0',
      },
    }, 8000);
    if (!res.ok) return results;
    const data = await res.json().catch(() => null);
    const items = (data && (data.data || data.results || data)) || [];
    const list = Array.isArray(items) ? items : [];
    list.slice(0, 8).forEach((it) => {
      pushUnique(results, {
        source: 'Web',
        title: it.title || it.name,
        snippet: it.description || it.content || it.snippet,
        url: it.url || it.link,
      });
    });
    if (!list.length && typeof data === 'string') {
      pushUnique(results, { source: 'Web', title: query, snippet: String(data).slice(0, 1200), url: '' });
    }
  } catch (_) {}
  return results;
}

async function wikipediaExtracts(query, destTitles) {
  const results = [];
  const titlesToFetch = [];

  try {
    const searchQ = query + (/\bghana\b/i.test(query) ? '' : ' Ghana');
    const wiki = await fetchTimeout(
      'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
        encodeURIComponent(searchQ) +
        '&limit=4&namespace=0&format=json&origin=*',
      { headers: { Accept: 'application/json' } },
      7000
    );
    if (wiki.ok) {
      const data = await wiki.json();
      (data[1] || []).forEach((title, i) => {
        titlesToFetch.push({ title, url: (data[3] || [])[i] || '' });
      });
    }
  } catch (_) {}

  (destTitles || []).slice(0, 3).forEach((t) => {
    if (t && !titlesToFetch.some((x) => x.title.toLowerCase() === String(t).toLowerCase())) {
      titlesToFetch.push({ title: t, url: '' });
    }
  });

  const unique = titlesToFetch.slice(0, 5);
  await Promise.all(
    unique.map(async (item) => {
      try {
        const url =
          'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=0&explaintext=1&exchars=1800&redirects=1&format=json&origin=*&titles=' +
          encodeURIComponent(item.title);
        const res = await fetchTimeout(url, { headers: { Accept: 'application/json' } }, 7000);
        if (!res.ok) return;
        const data = await res.json();
        const pages = (data.query && data.query.pages) || {};
        Object.keys(pages).forEach((id) => {
          const p = pages[id];
          if (!p || p.missing || !p.extract) return;
          pushUnique(results, {
            source: 'Wikipedia',
            title: p.title,
            snippet: p.extract,
            url: item.url || 'https://en.wikipedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')),
          });
        });
      } catch (_) {}
    })
  );

  try {
    const voyQ = query.replace(/\bghana\b/gi, '').trim() || 'Ghana';
    const voySearch = await fetchTimeout(
      'https://en.wikivoyage.org/w/api.php?action=query&list=search&srsearch=' +
        encodeURIComponent(voyQ + ' Ghana') +
        '&srlimit=2&format=json&origin=*',
      { headers: { Accept: 'application/json' } },
      7000
    );
    if (voySearch.ok) {
      const data = await voySearch.json();
      const hits = ((data.query && data.query.search) || []).slice(0, 2);
      await Promise.all(
        hits.map(async (hit) => {
          try {
            const url =
              'https://en.wikivoyage.org/w/api.php?action=query&prop=extracts&exintro=0&explaintext=1&exchars=1600&redirects=1&format=json&origin=*&titles=' +
              encodeURIComponent(hit.title);
            const res = await fetchTimeout(url, { headers: { Accept: 'application/json' } }, 7000);
            if (!res.ok) return;
            const body = await res.json();
            const pages = (body.query && body.query.pages) || {};
            Object.keys(pages).forEach((id) => {
              const p = pages[id];
              if (!p || p.missing || !p.extract) return;
              pushUnique(results, {
                source: 'Wikivoyage',
                title: p.title,
                snippet: p.extract,
                url: 'https://en.wikivoyage.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')),
              });
            });
          } catch (_) {}
        })
      );
    }
  } catch (_) {}

  return results;
}

/**
 * Always search Google first. Official CSE / Serper if keys exist,
 * otherwise Google HTML, then Jina, plus Wikipedia/Wikivoyage depth.
 */
async function openWebSearch(query) {
  const results = [];
  try {
    const instant = await fetchTimeout(
      'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1&skip_disambig=1',
      { headers: { Accept: 'application/json' } },
      7000
    );
    if (instant.ok) {
      const data = await instant.json();
      if (data.AbstractText) {
        pushUnique(results, {
          source: 'Web',
          title: data.Heading || query,
          snippet: data.AbstractText,
          url: data.AbstractURL || '',
        });
      }
      (data.RelatedTopics || []).slice(0, 5).forEach((t) => {
        if (t.Text) {
          pushUnique(results, {
            source: 'Web',
            title: (t.FirstURL || '').split('/').pop() || 'Related',
            snippet: t.Text,
            url: t.FirstURL || '',
          });
        }
      });
    }
  } catch (_) {}

  try {
    const htmlRes = await fetchTimeout(
      'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query),
      {
        headers: {
          'User-Agent': 'DigiTourBot/2.0',
          Accept: 'text/html',
        },
      },
      8000
    );
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const re = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
      let m;
      let n = 0;
      while ((m = re.exec(html)) && n < 6) {
        pushUnique(results, {
          source: 'Web',
          title: stripHtml(m[2]).slice(0, 160),
          snippet: stripHtml(m[3]).slice(0, 500),
          url: String(m[1] || '').replace(/&amp;/g, '&'),
        });
        n++;
      }
      if (n === 0) {
        const re2 = /class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
        let s;
        let c = 0;
        while ((s = re2.exec(html)) && c < 5) {
          pushUnique(results, {
            source: 'Web',
            title: query,
            snippet: stripHtml(s[1]).slice(0, 500),
            url: '',
          });
          c++;
        }
      }
    }
  } catch (_) {}

  return results;
}

async function googleFirstSearch(question, destTitles) {
  const query = googleQuery(question);
  const collected = [];
  let usedGoogle = false;

  const [cse, serper] = await Promise.all([googleCustomSearch(query), serperGoogleSearch(query)]);
  cse.forEach((r) => pushUnique(collected, r));
  serper.forEach((r) => pushUnique(collected, r));
  if (cse.length || serper.length) usedGoogle = true;

  if (collected.length < 4) {
    const html = await googleHtmlSearch(query);
    html.forEach((r) => pushUnique(collected, r));
    if (html.length) usedGoogle = true;
  }

  if (collected.length < 3) {
    const jina = await jinaWebSearch(query);
    jina.forEach((r) => pushUnique(collected, r));
  }

  if (collected.length < 4) {
    const extra = await openWebSearch(query);
    extra.forEach((r) => pushUnique(collected, r));
  }

  const wiki = await wikipediaExtracts(query, destTitles);
  wiki.forEach((r) => pushUnique(collected, r));

  return {
    results: collected.slice(0, 12),
    usedGoogle,
    query,
  };
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
      temperature: 0.4,
      max_tokens: 3200,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || 'Groq API error';
    if (/invalid api key/i.test(msg)) {
      throw new Error(
        'Invalid API Key — in Netlify, edit GROQ_API_KEY, paste only the gsk_… value (no spaces/quotes), save, then trigger “Clear cache and deploy site”.'
      );
    }
    throw new Error(msg);
  }
  const choice = data.choices && data.choices[0] && data.choices[0].message;
  const content = (choice && choice.content) || '';
  return String(content).trim() || '';
}

function buildSystemPrompt(kb, retrieval, web) {
  const phone = kb.site.phone;
  const wa = kb.site.whatsapp;

  return `You are DigiGuide, DigiTour Ghana's expert tourism AI concierge.

MISSION
Give travellers a thorough, accurate, well-structured answer. Prefer depth over brevity. Typical destination answers should be 350–900 words with clear headings. Hotel or how-to answers can be a bit shorter but still complete. Never reply with a tiny 3-bullet teaser when the traveller asked a real question.

HOW TO USE SOURCES (strict order)
1. GOOGLE / WEB RESULTS — read these first for breadth, current travel logistics (visas, weather, access, opening hours rumours, safety, flights), and general background.
2. DIGITOUR CATALOGUE (RAG) — this is ground truth for what DigiTour actually lists: destination names, regions, descriptions, history, hotel names, USD prices, IDs, and booking/detail URLs. Never invent DigiTour hotel prices, IDs, or pages.
3. WIKIPEDIA / WIKIVOYAGE — use for extra history and travel context when it does not contradict the DigiTour catalogue.
If web and catalogue disagree on a DigiTour listing (price, hotel name, whether we offer it), the catalogue wins. If the question is about the wider world (visa, weather, flights), the web wins.

FORMATTING (critical — replies show in a mobile chat panel)
- Clean Markdown: **bold**, *italic*, ## / ### headings, bullet lists, numbered lists.
- NEVER use emojis or emoji shortcodes. Use plain words (Phone, WhatsApp, Hotel, Location).
- NEVER use wide Markdown pipe tables (| col |). They break the chat UI.
- For hotels, use a compact card-style list:
  ### 1. Hotel Name
  - Near: Attraction
  - Price: $95/night · Beds: 2
  - Summary: two sentences of useful detail
  - Book: [Book now](book-hotel.html?hotel_id=4)
- Turn booking/detail paths into markdown links: [View destination](destination-detail.html?id=32)
- For phone/WhatsApp write: Call: ${phone} and WhatsApp: ${wa}
- End with a short "Next on DigiTour" line pointing to the most useful page, plus Call/WhatsApp if they may need a human.

ANSWER SHAPE FOR PLACE QUESTIONS
## Overview
What it is, where it is, why it matters.
## History & significance
A real paragraph, not one sentence.
## Visiting today
What to expect, highlights, region, access.
## Stays on DigiTour
Hotels we actually list, with prices and book links.
## Practical tips
Combine web + catalogue: timing, pairing with nearby sites, safety/logistics if known.
If several catalogue matches exist, cover the best 3–6 in some depth rather than dumping every catalogue name.

PRODUCT QUESTIONS
Explain DigiTour flows from PRODUCT KNOWLEDGE: map (3D/aerial/fallback), booking (login, dates, +50 points), register (+25), reviews (+15), EN/FR, Help float, itinerary, inquiry form, demo login.

SITE CONTACT
Call ${phone} · WhatsApp ${wa} · ${kb.site.email} / ${kb.site.support}
${kb.site.address}

SITE OVERVIEW
${JSON.stringify(kb.site)}

PRODUCT KNOWLEDGE (DigiTour how-to — treat as ground truth)
${kb.product}

GOOGLE / WEB SEARCH RESULTS (consult first)
Search query used: ${web.query}
${JSON.stringify(web.results)}

DIGITOUR RAG — MATCHED DESTINATIONS (full current catalogue text)
${JSON.stringify(retrieval.destinations)}

DIGITOUR RAG — MATCHED HOTELS (current prices/IDs)
${JSON.stringify(retrieval.hotels)}

REGION DIRECTORY (if the traveller asked about a region)
${JSON.stringify(retrieval.regionList)}

SAMPLE REVIEWS
${JSON.stringify(retrieval.reviews)}`;
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
  if (!question || question.length > 2000) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Please enter a question (max 2000 characters).' }),
    };
  }

  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];

  try {
    const kb = await hydrateFromUrl(siteBase(event));
    const retrieval = retrieveRelevant(question);
    const destTitles = retrieval.destinations.map((d) => d.title);

    const web = await googleFirstSearch(question, destTitles);

    const system = buildSystemPrompt(kb, retrieval, web);

    const messages = [
      ...history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2500) })),
      { role: 'user', content: question },
    ];

    const answer = await callGroq(apiKey, system, messages);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        answer,
        usedWeb: web.results.length > 0,
        usedGoogle: web.usedGoogle,
        knowledgeBuiltAt: kb.builtAt,
        matches: {
          destinations: retrieval.destinations.length,
          hotels: retrieval.hotels.length,
          web: web.results.length,
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
