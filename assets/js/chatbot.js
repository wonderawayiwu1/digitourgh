/* DigiTour DigiGuide chatbot — markdown UI + Font Awesome */
(function () {
  'use strict';

  const SUGGESTIONS = [
    'What should I know about Kakum National Park?',
    'Plan a 5-day Ghana trip with DigiTour hotels',
    'Best beaches in Ghana and nearby stays',
    'How do I book a hotel and use the map?',
  ];

  const STOP = {
    the: 1, and: 1, for: 1, with: 1, from: 1, what: 1, where: 1, when: 1, how: 1,
    are: 1, is: 1, can: 1, you: 1, about: 1, tell: 1, please: 1, near: 1, best: 1,
  };

  const EMOJI_ICONS = [
    [/📞|☎️|📱|☎/gu, '<i class="fa-solid fa-phone dt-md-ico" aria-hidden="true"></i>'],
    [/💬|🗨️|🗯️/gu, '<i class="fab fa-whatsapp dt-md-ico dt-md-wa" aria-hidden="true"></i>'],
    [/🌟|⭐|✨|🎉|🔥|👍|👏/gu, '<i class="fa-solid fa-star dt-md-ico dt-md-gold" aria-hidden="true"></i>'],
    [/🏨|🛏️|🛏|🏢/gu, '<i class="fa-solid fa-hotel dt-md-ico" aria-hidden="true"></i>'],
    [/📍|📌|🗺️|🗺|🧭|🏖️|🏖/gu, '<i class="fa-solid fa-location-dot dt-md-ico" aria-hidden="true"></i>'],
    [/💰|💵|💲|💳|🏷️|🏷/gu, '<i class="fa-solid fa-tag dt-md-ico" aria-hidden="true"></i>'],
    [/🔗/gu, '<i class="fa-solid fa-link dt-md-ico" aria-hidden="true"></i>'],
    [/👉|➡️|➡|⏩/gu, '<i class="fa-solid fa-arrow-right dt-md-ico" aria-hidden="true"></i>'],
    [/ℹ️|ℹ/gu, '<i class="fa-solid fa-circle-info dt-md-ico" aria-hidden="true"></i>'],
    [/⚠️|⚠/gu, '<i class="fa-solid fa-triangle-exclamation dt-md-ico" aria-hidden="true"></i>'],
    [/✅|✔️|✔/gu, '<i class="fa-solid fa-circle-check dt-md-ico dt-md-ok" aria-hidden="true"></i>'],
    [/❌|✖️|✖/gu, '<i class="fa-solid fa-circle-xmark dt-md-ico" aria-hidden="true"></i>'],
    [/👋|🙋|😀|😃|😄|😁|😊|🙂/gu, '<i class="fa-solid fa-hand dt-md-ico" aria-hidden="true"></i>'],
    [/🌍|🌎|🌏|✈️|✈|🧳/gu, '<i class="fa-solid fa-globe-africa dt-md-ico" aria-hidden="true"></i>'],
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function replaceEmojis(text) {
    let out = String(text || '');
    EMOJI_ICONS.forEach(([re, html]) => {
      out = out.replace(re, html);
    });
    // Strip leftover decorative emojis completely
    out = out.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
    return out;
  }

  function stripHtmlTagsAndAttrs(str) {
    let s = String(str || '');
    // Convert any raw HTML links <a href="URL"...>label</a> to markdown [label](URL)
    s = s.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    // Strip any hallucinated HTML attributes or raw HTML tags
    s = s.replace(/target=["']?_blank["']?/gi, '');
    s = s.replace(/rel=["']?noopener["']?/gi, '');
    s = s.replace(/<[^>]+>/g, '');
    return s;
  }

  function inlineFormat(text) {
    const cleanInput = stripHtmlTagsAndAttrs(text);
    let s = esc(cleanInput);

    // Bold / italic / underline / strike / code
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/_(.+?)_/g, '<em>$1</em>');
    s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
    s = s.replace(/\+\+(.+?)\+\+/g, '<u>$1</u>');

    // Phone numbers (Ghana style) — run BEFORE URL replacements so digits in URLs/hrefs are not mutated
    s = s.replace(/(^|[\s(>:;,.])((?:\+?233|0)\s*\d{2}\s*\d{3}\s*\d{4})(?!\d)/gi, (full, prefix, num) => {
      const digits = num.replace(/\D/g, '');
      const tel = digits.startsWith('233') ? `+${digits}` : digits;
      return `${prefix}<a class="dt-md-btn dt-md-btn-call" href="tel:${tel}"><i class="fa-solid fa-phone"></i> ${num.trim()}</a>`;
    });

    // Markdown links [label](url)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const safeUrl = String(url).replace(/&amp;/g, '&').trim();
      if (/^https?:\/\//i.test(safeUrl) || /\.html(\?|$)/i.test(safeUrl)) {
        const isBook = /book-hotel\.html/i.test(safeUrl);
        const isDest = /destination-detail\.html/i.test(safeUrl);
        const isWa = /wa\.me/i.test(safeUrl);
        const cls = isBook
          ? 'dt-md-btn dt-md-btn-book'
          : isDest
            ? 'dt-md-btn dt-md-btn-dest'
            : isWa
              ? 'dt-md-btn dt-md-btn-wa'
              : 'dt-md-link';
        const icon = isBook
          ? '<i class="fa-solid fa-calendar-check"></i> '
          : isDest
            ? '<i class="fa-solid fa-map-location-dot"></i> '
            : isWa
              ? '<i class="fab fa-whatsapp"></i> '
              : '';
        const target = /^https?:\/\//i.test(safeUrl) ? ' target="_blank" rel="noopener"' : '';
        return `<a class="${cls}" href="${esc(safeUrl)}"${target}>${icon}${label}</a>`;
      }
      return label;
    });

    // Bare DigiTour paths
    s = s.replace(
      /(^|[\s(>])(book-hotel\.html\?hotel_id=\d+)/g,
      '$1<a class="dt-md-btn dt-md-btn-book" href="$2"><i class="fa-solid fa-calendar-check"></i> Book</a>'
    );
    s = s.replace(
      /(^|[\s(>])(destination-detail\.html\?id=\d+)/g,
      '$1<a class="dt-md-btn dt-md-btn-dest" href="$2"><i class="fa-solid fa-map-location-dot"></i> View</a>'
    );
    s = s.replace(
      /(^|[\s(>])(destinations\.html(?:\?[^\s<)]+)?)/g,
      '$1<a class="dt-md-link" href="$2">Browse destinations</a>'
    );

    // Bare URLs / wa.me (must be preceded by start or space/bracket, NOT inside an HTML tag attribute)
    s = s.replace(/(^|[\s(>])(https?:\/\/[^\s<"'\&]+)/g, (full, prefix, url) => {
      const clean = url.replace(/[.,);&]+$/, '');
      const trail = url.slice(clean.length);
      if (/wa\.me/i.test(clean)) {
        return `${prefix}<a class="dt-md-btn dt-md-btn-wa" href="${esc(clean)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>${trail}`;
      }
      return `${prefix}<a class="dt-md-link" href="${esc(clean)}" target="_blank" rel="noopener">${esc(clean.replace(/^https?:\/\//, ''))}</a>${trail}`;
    });

    return s;
  }

  function parseTable(rows) {
    if (rows.length < 2) return null;
    const split = (line) =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());

    const headers = split(rows[0]);
    let i = 1;
    if (/^[\s|:-]+$/.test(rows[1])) i = 2;

    const cards = [];
    for (; i < rows.length; i++) {
      const cols = split(rows[i]);
      if (!cols.length || cols.every((c) => !c)) continue;
      const fields = headers.map((h, idx) => ({
        label: h,
        value: cols[idx] || '',
      }));
      const titleField =
        fields.find((f) => /hotel|name|title|site|attraction/i.test(f.label)) || fields[1] || fields[0];
      const price = fields.find((f) => /price|usd|rate|cost/i.test(f.label));
      const near = fields.find((f) => /near|attraction|destination|region/i.test(f.label));
      const beds = fields.find((f) => /bed|capacity|guest/i.test(f.label));
      const summary = fields.find((f) => /summary|desc|about|note/i.test(f.label));
      const link = fields.find((f) => /book|link|url/i.test(f.label));

      cards.push({ titleField, price, near, beds, summary, link, fields });
    }

    if (!cards.length) return null;

    return (
      `<div class="dt-md-cards">` +
      cards
        .map((c, idx) => {
          const title = inlineFormat((c.titleField && c.titleField.value) || `Option ${idx + 1}`);
          const metaBits = [];
          if (c.near && c.near.value) {
            metaBits.push(
              `<span><i class="fa-solid fa-location-dot"></i> ${inlineFormat(c.near.value)}</span>`
            );
          }
          if (c.price && c.price.value) {
            metaBits.push(
              `<span class="dt-md-price"><i class="fa-solid fa-tag"></i> ${inlineFormat(c.price.value)}${/night|usd|\/|/i.test(c.price.value) ? '' : '/night'}</span>`
            );
          }
          if (c.beds && c.beds.value) {
            metaBits.push(
              `<span><i class="fa-solid fa-bed"></i> ${inlineFormat(c.beds.value)} beds</span>`
            );
          }
          const summary = c.summary && c.summary.value
            ? `<p class="dt-md-card-desc">${inlineFormat(c.summary.value)}</p>`
            : '';
          let action = '';
          if (c.link && c.link.value) {
            const raw = c.link.value.replace(/`/g, '').trim();
            const m = raw.match(/(book-hotel\.html\?hotel_id=\d+|destination-detail\.html\?id=\d+|https?:\/\/\S+)/i);
            if (m) {
              const href = m[1];
              const isBook = /book-hotel/i.test(href);
              action = `<a class="dt-md-btn ${isBook ? 'dt-md-btn-book' : 'dt-md-btn-dest'}" href="${esc(href)}">${
                isBook
                  ? '<i class="fa-solid fa-calendar-check"></i> Book now'
                  : '<i class="fa-solid fa-arrow-right"></i> Open'
              }</a>`;
            }
          }
          return `<article class="dt-md-card">
            <div class="dt-md-card-top">
              <span class="dt-md-card-num">${idx + 1}</span>
              <h4>${title}</h4>
            </div>
            ${metaBits.length ? `<div class="dt-md-card-meta">${metaBits.join('')}</div>` : ''}
            ${summary}
            ${action ? `<div class="dt-md-card-actions">${action}</div>` : ''}
          </article>`;
        })
        .join('') +
      `</div>`
    );
  }

  function renderMarkdown(raw) {
    let text = String(raw || '').replace(/\r\n/g, '\n').trim();
    text = replaceEmojis(text);

    // Temporarily protect FA icon HTML from escaping by using placeholders
    const icons = [];
    text = text.replace(/<i class="[^"]+"[^>]*><\/i>/g, (m) => {
      icons.push(m);
      return `%%ICO${icons.length - 1}%%`;
    });

    const lines = text.split('\n');
    const html = [];
    let i = 0;
    let listType = null;

    const closeList = () => {
      if (listType) {
        html.push(listType === 'ol' ? '</ol>' : '</ul>');
        listType = null;
      }
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Table block
      if (trimmed.startsWith('|') && i + 1 < lines.length && /\|/.test(lines[i + 1])) {
        closeList();
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        const cards = parseTable(tableLines);
        if (cards) {
          html.push(cards);
        } else {
          // Fallback scrollable table
          html.push('<div class="dt-md-table-wrap"><table class="dt-md-table"><tbody>');
          tableLines.forEach((tl, ti) => {
            if (/^[\s|:-]+$/.test(tl)) return;
            const cells = tl
              .trim()
              .replace(/^\|/, '')
              .replace(/\|$/, '')
              .split('|')
              .map((c) => c.trim());
            const tag = ti === 0 ? 'th' : 'td';
            html.push(
              '<tr>' + cells.map((c) => `<${tag}>${inlineFormat(c)}</${tag}>`).join('') + '</tr>'
            );
          });
          html.push('</tbody></table></div>');
        }
        continue;
      }

      if (!trimmed) {
        closeList();
        i++;
        continue;
      }

      if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
        closeList();
        html.push('<hr class="dt-md-hr">');
        i++;
        continue;
      }

      const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        closeList();
        const level = Math.min(heading[1].length + 2, 5); // h3–h5 in chat
        html.push(`<h${level} class="dt-md-h">${inlineFormat(heading[2])}</h${level}>`);
        i++;
        continue;
      }

      const ul = trimmed.match(/^[-*•]\s+(.+)$/);
      if (ul) {
        if (listType !== 'ul') {
          closeList();
          html.push('<ul class="dt-md-list">');
          listType = 'ul';
        }
        html.push(`<li>${inlineFormat(ul[1])}</li>`);
        i++;
        continue;
      }

      const ol = trimmed.match(/^\d+[.)]\s+(.+)$/);
      if (ol) {
        if (listType !== 'ol') {
          closeList();
          html.push('<ol class="dt-md-list">');
          listType = 'ol';
        }
        html.push(`<li>${inlineFormat(ol[1])}</li>`);
        i++;
        continue;
      }

      closeList();
      // Blockquote
      if (trimmed.startsWith('>')) {
        html.push(`<blockquote class="dt-md-quote">${inlineFormat(trimmed.replace(/^>\s?/, ''))}</blockquote>`);
        i++;
        continue;
      }

      html.push(`<p class="dt-md-p">${inlineFormat(trimmed)}</p>`);
      i++;
    }
    closeList();

    let out = html.join('');
    out = out.replace(/%%ICO(\d+)%%/g, (_, n) => icons[Number(n)] || '');
    return `<div class="dt-md">${out}</div>`;
  }

  function mount() {
    if (document.getElementById('dtChatRoot')) return;

    const root = document.createElement('div');
    root.id = 'dtChatRoot';
    root.innerHTML = `
      <button type="button" class="dt-chat-fab" id="dtChatFab" aria-label="Open DigiGuide chat">
        <i class="fa-solid fa-comments"></i>
        <span class="dt-chat-fab-label">DigiGuide</span>
      </button>
      <section class="dt-chat-panel" id="dtChatPanel" aria-hidden="true" role="dialog" aria-label="DigiGuide assistant">
        <header class="dt-chat-head">
          <div class="dt-chat-avatar" aria-hidden="true"><i class="fa-solid fa-compass"></i></div>
          <div class="dt-chat-head-text">
            <strong>DigiGuide</strong>
            <span>Google + catalogue · Ghana travel AI</span>
          </div>
          <button type="button" class="dt-chat-close" id="dtChatClose" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>
        </header>
        <div class="dt-chat-msgs" id="dtChatMsgs"></div>
        <div class="dt-chat-suggest" id="dtChatSuggest"></div>
        <form class="dt-chat-form" id="dtChatForm">
          <input type="text" id="dtChatInput" maxlength="2000" placeholder="Ask about Ghana travel, destinations, hotels…" autocomplete="off" required>
          <button type="submit" id="dtChatSend" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>
        </form>
      </section>`;
    document.body.appendChild(root);

    const fab = document.getElementById('dtChatFab');
    const panel = document.getElementById('dtChatPanel');
    const closeBtn = document.getElementById('dtChatClose');
    const form = document.getElementById('dtChatForm');
    const input = document.getElementById('dtChatInput');
    const msgs = document.getElementById('dtChatMsgs');
    const suggest = document.getElementById('dtChatSuggest');
    const history = [];

    function setOpen(open) {
      document.body.classList.toggle('dt-chat-open', open);
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) setTimeout(() => input.focus(), 180);
    }

    function addBubble(role, content, meta, isHtml) {
      const row = document.createElement('div');
      row.className = 'dt-chat-row dt-chat-' + role;
      const body = role === 'assistant' && !isHtml ? renderMarkdown(content) : isHtml ? content : `<div class="dt-md"><p class="dt-md-p">${esc(content)}</p></div>`;
      row.innerHTML = `
        <div class="dt-chat-bubble">${body}</div>
        ${meta ? `<div class="dt-chat-meta"><i class="fa-solid fa-circle-info"></i> ${esc(meta)}</div>` : ''}`;
      msgs.appendChild(row);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function renderSuggestions() {
      suggest.innerHTML = SUGGESTIONS.map(
        (s) => `<button type="button" class="dt-chat-chip" data-q="${esc(s)}">${esc(s)}</button>`
      ).join('');
    }

    function typing(on) {
      let el = document.getElementById('dtChatTyping');
      if (!on) {
        if (el) el.remove();
        return;
      }
      if (el) return;
      el = document.createElement('div');
      el.id = 'dtChatTyping';
      el.className = 'dt-chat-row dt-chat-assistant';
      el.innerHTML = `<div class="dt-chat-bubble dt-chat-typing"><span></span><span></span><span></span></div>`;
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    }

    let cachedApiKey = null;
    let cachedCatalog = null;

    async function getLocalApiKey() {
      if (cachedApiKey) return cachedApiKey;
      if (window.GROQ_API_KEY) {
        cachedApiKey = window.GROQ_API_KEY;
        return cachedApiKey;
      }
      const dirPath = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
      const candidatePaths = [
        '.env',
        './.env',
        '/.env',
        dirPath + '.env',
        '/DigiTour_Frontend/.env'
      ];
      for (const p of candidatePaths) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            const txt = await res.text();
            const m = txt.match(/^GROQ_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
            if (m && m[1]) {
              let k = m[1].trim();
              if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
                k = k.slice(1, -1).trim();
              }
              if (k.toUpperCase().startsWith('GROQ_API_KEY=')) {
                k = k.slice('GROQ_API_KEY='.length).trim();
              }
              k = k.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
              if (k && k.startsWith('gsk_')) {
                cachedApiKey = k;
                return cachedApiKey;
              }
            }
          }
        } catch (_) {}
      }
      return null;
    }

    function stripText(html) {
      return String(html || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function tokensOf(q) {
      return String(q || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP[w]);
    }

    function retrieveLocal(catalog, question) {
      const tokens = tokensOf(question);
      const dests = catalog.destinations || [];
      const hotels = catalog.hotels || [];
      const score = (text) => {
        const t = String(text || '').toLowerCase();
        let s = 0;
        tokens.forEach((tok) => {
          if (t.includes(tok)) s += tok.length > 5 ? 4 : 2;
        });
        return s;
      };
      let destMatches = dests
        .map((d) => ({
          d,
          s: score([d.title, d.region, d.category, d.location_contact, d.description, d.history].join(' ')),
        }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 6)
        .map((x) => x.d);
      let hotelMatches = hotels
        .map((h) => ({
          h,
          s: score([h.name, h.region, h.destination_title, h.description].join(' ')),
        }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map((x) => x.h);
      if (!destMatches.length) destMatches = dests.filter((d) => d.is_featured).slice(0, 6);
      if (destMatches.length && hotelMatches.length < 4) {
        const ids = new Set(destMatches.map((d) => String(d.id)));
        hotels.forEach((h) => {
          if (ids.has(String(h.destination_id)) && !hotelMatches.some((x) => x.id === h.id)) hotelMatches.push(h);
        });
        hotelMatches = hotelMatches.slice(0, 10);
      }
      return { destMatches, hotelMatches };
    }

    async function webSearchLocal(question) {
      const results = [];
      const q = /\bghana\b/i.test(question) ? question : question + ' Ghana tourism';
      try {
        const search = await fetch(
          'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
            encodeURIComponent(q) +
            '&srlimit=4&utf8=&format=json&origin=*'
        );
        if (search.ok) {
          const data = await search.json();
          const hits = ((data.query && data.query.search) || []).slice(0, 3);
          await Promise.all(
            hits.map(async (hit) => {
              try {
                const ex = await fetch(
                  'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=0&explaintext=1&exchars=1600&redirects=1&format=json&origin=*&titles=' +
                    encodeURIComponent(hit.title)
                );
                if (!ex.ok) return;
                const body = await ex.json();
                const pages = (body.query && body.query.pages) || {};
                Object.keys(pages).forEach((id) => {
                  const p = pages[id];
                  if (p && p.extract) {
                    results.push({
                      source: 'Wikipedia',
                      title: p.title,
                      snippet: p.extract,
                      url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')),
                    });
                  }
                });
              } catch (_) {}
            })
          );
        }
      } catch (_) {}
      try {
        const voy = await fetch(
          'https://en.wikivoyage.org/w/api.php?action=query&list=search&srsearch=' +
            encodeURIComponent(q) +
            '&srlimit=2&format=json&origin=*'
        );
        if (voy.ok) {
          const data = await voy.json();
          ((data.query && data.query.search) || []).slice(0, 2).forEach((hit) => {
            results.push({
              source: 'Wikivoyage',
              title: hit.title,
              snippet: stripText(hit.snippet || hit.title),
              url: 'https://en.wikivoyage.org/wiki/' + encodeURIComponent(hit.title.replace(/ /g, '_')),
            });
          });
        }
      } catch (_) {}
      return results.slice(0, 8);
    }

    async function getLocalCatalog() {
      if (cachedCatalog) return cachedCatalog;
      try {
        const [dRes, hRes, mRes, rRes] = await Promise.all([
          fetch('data/destinations.json?v=cat122'),
          fetch('data/hotels.json'),
          fetch('data/meta.json?v=cat122'),
          fetch('data/reviews.json'),
        ]);
        cachedCatalog = {
          destinations: dRes.ok ? await dRes.json() : [],
          hotels: hRes.ok ? await hRes.json() : [],
          meta: mRes.ok ? await mRes.json() : {},
          reviews: rRes.ok ? await rRes.json() : [],
        };
      } catch (_) {
        cachedCatalog = { destinations: [], hotels: [], meta: {}, reviews: [] };
      }
      return cachedCatalog;
    }

    async function askLocalFallback(q, historyList) {
      if (location.port !== '8888') {
        try {
          const devRes = await fetch('http://localhost:8888/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q, history: historyList.slice(-8) }),
          });
          if (devRes.ok) {
            const devData = await devRes.json();
            if (devData && devData.answer) {
              history.push({ role: 'assistant', content: devData.answer });
              const note = devData.usedGoogle ? 'Google + live DigiTour catalogue' : 'Local Server (port 8888)';
              addBubble('assistant', devData.answer, note);
              return true;
            }
          }
        } catch (_) {}
      }

      const apiKey = await getLocalApiKey();
      if (!apiKey) return false;

      const catalogData = await getLocalCatalog();
      const retrieved = retrieveLocal(catalogData, q);
      const webResults = await webSearchLocal(q);
      const site = catalogData.meta || {};

      const destPayload = retrieved.destMatches.map((d) => ({
        id: d.id,
        title: d.title,
        region: d.region,
        category: d.category,
        location: d.location_contact,
        description: stripText(d.description).slice(0, 1600),
        history: stripText(d.history).slice(0, 1200),
        url: 'destination-detail.html?id=' + d.id,
      }));
      const hotelPayload = retrieved.hotelMatches.map((h) => ({
        id: h.id,
        name: h.name,
        region: h.region,
        near: h.destination_title,
        price_usd: h.price_per_night,
        beds: h.room_capacity,
        description: h.description,
        url: 'book-hotel.html?hotel_id=' + h.id,
      }));

      const systemPrompt = `You are DigiGuide, DigiTour Ghana's expert tourism AI concierge.

MISSION: Give thorough, accurate, well-structured answers (typically 350–900 words for place questions). Prefer depth over brevity.

SOURCE ORDER:
1. WEB / WIKIPEDIA RESULTS first for breadth and current travel context.
2. DIGITOUR CATALOGUE as ground truth for destinations we list, hotel prices, IDs, and booking links. Never invent prices or IDs.

FORMATTING: clean Markdown; no emojis; no pipe tables.
Hotel cards:
### 1. Hotel Name
- Near: Attraction
- Price: $95/night · Beds: 2
- Summary: useful detail
- Book: [Book now](book-hotel.html?hotel_id=4)
Contact: Call ${site.phone_local || '0546004395'} · WhatsApp ${site.whatsapp || 'https://wa.me/233546004395'}

PRODUCT: ${site.total_destinations || 122} destinations and ${site.total_hotels || 97} hotels across 16 regions. Pages: index.html, destinations.html, destination-detail.html?id=, book-hotel.html?hotel_id=, map.html (MapTiler 3D streets/aerial/satellite + free fallback), inquiry.html, login.html, register.html, dashboard.html. Help float = Call or WhatsApp. EN/FR toggle. Currency USD/GHS/EUR. Loyalty +25 register, +50 booking, +15 review. Demo login kwame@example.com / demo123.

WEB RESULTS:
${JSON.stringify(webResults)}

MATCHED DESTINATIONS:
${JSON.stringify(destPayload)}

MATCHED HOTELS:
${JSON.stringify(hotelPayload)}`;

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            temperature: 0.4,
            max_tokens: 3200,
            messages: [
              { role: 'system', content: systemPrompt },
              ...historyList.slice(-8).map((h) => ({ role: h.role, content: h.content })),
              { role: 'user', content: q },
            ],
          }),
        });

        if (!groqRes.ok) {
          const errData = await groqRes.json().catch(() => ({}));
          const errMsg = (errData && errData.error && errData.error.message) || 'Groq API error';
          addBubble('assistant', 'Local API Error: ' + errMsg);
          return true;
        }

        const groqData = await groqRes.json();
        const ans =
          (groqData.choices &&
            groqData.choices[0] &&
            groqData.choices[0].message &&
            groqData.choices[0].message.content) ||
          '';
        if (ans) {
          history.push({ role: 'assistant', content: ans });
          addBubble('assistant', ans, webResults.length ? 'Web + live DigiTour catalogue' : 'Live DigiTour catalogue');
          return true;
        }
      } catch (_) {}
      return false;
    }

    async function ask(question) {
      const q = String(question || '').trim();
      if (!q) return;
      suggest.innerHTML = '';
      addBubble('user', q);
      history.push({ role: 'user', content: q });
      typing(true);
      form.classList.add('is-busy');

      try {
        const res = await fetch('/.netlify/functions/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: q, history: history.slice(0, -1) }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.answer) {
          typing(false);
          history.push({ role: 'assistant', content: data.answer });
          const meta = data.usedGoogle
            ? 'Google + DigiTour catalogue'
            : data.usedWeb
              ? 'Web + DigiTour catalogue'
              : data.matches
                ? `Matched ${data.matches.destinations} sites · ${data.matches.hotels} hotels`
                : '';
          addBubble('assistant', data.answer, meta);
          return;
        }

        // Try local fallback if Netlify function endpoint is unavailable (e.g. on WAMP / localhost)
        const handledLocally = await askLocalFallback(q, history.slice(0, -1));
        typing(false);
        if (handledLocally) return;

        if (!res.ok) {
          const err = data.error || 'Something went wrong.';
          addBubble('assistant', err);
          return;
        }
      } catch (e) {
        const handledLocally = await askLocalFallback(q, history.slice(0, -1));
        typing(false);
        if (handledLocally) return;

        addBubble(
          'assistant',
          'Network error talking to DigiGuide. You can start local dev server using `node server.js` or deploy to Netlify.'
        );
      } finally {
        form.classList.remove('is-busy');
        input.value = '';
        input.focus();
      }
    }

    if (window.DigiTour && window.DigiTour.makeDraggable) {
      window.DigiTour.makeDraggable(fab, fab, 'dt_pos_chat');
    }

    fab.addEventListener('click', () => {
      if (fab._wasDragged) {
        fab._wasDragged = false;
        return;
      }
      setOpen(!panel.classList.contains('is-open'));
    });
    closeBtn.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      ask(input.value);
    });
    suggest.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-q]');
      if (btn) ask(btn.getAttribute('data-q'));
    });
    document.addEventListener('click', (e) => {
      const openChat = e.target.closest('[data-open-chat]');
      if (openChat) {
        e.preventDefault();
        setOpen(true);
      }
    });

    addBubble(
      'assistant',
      (window.DigiI18n && DigiI18n.t('digiguideHi')) ||
        "Hi — I'm **DigiGuide**. I search the web first, then answer from DigiTour's live Ghana catalogue (destinations, hotels, map, bookings). Ask a detailed question.",
      '',
      false
    );
    renderSuggestions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
