/* DigiTour DigiGuide chatbot widget */
(function () {
  'use strict';

  const SUGGESTIONS = [
    'Best places to visit in Central Region?',
    'Hotels near Kakum National Park',
    'Tell me about Cape Coast Castle',
    'What can I do in Accra in one day?',
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linkify(text) {
    const safe = esc(text);
    return safe
      .replace(/(destination-detail\.html\?id=\d+)/g, '<a href="$1">$1</a>')
      .replace(/(book-hotel\.html\?hotel_id=\d+)/g, '<a href="$1">$1</a>')
      .replace(/(destinations\.html(?:\?[^\s<]+)?)/g, '<a href="$1">$1</a>')
      .replace(/\n/g, '<br>');
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
            <span>Ghana travel AI · DigiTour</span>
          </div>
          <button type="button" class="dt-chat-close" id="dtChatClose" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>
        </header>
        <div class="dt-chat-msgs" id="dtChatMsgs"></div>
        <div class="dt-chat-suggest" id="dtChatSuggest"></div>
        <form class="dt-chat-form" id="dtChatForm">
          <input type="text" id="dtChatInput" maxlength="1200" placeholder="Ask about destinations, hotels…" autocomplete="off" required>
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
      if (open) {
        setTimeout(() => input.focus(), 180);
      }
    }

    function addBubble(role, html, meta) {
      const row = document.createElement('div');
      row.className = 'dt-chat-row dt-chat-' + role;
      row.innerHTML = `
        <div class="dt-chat-bubble">${html}</div>
        ${meta ? `<div class="dt-chat-meta">${esc(meta)}</div>` : ''}`;
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

    async function ask(question) {
      const q = String(question || '').trim();
      if (!q) return;
      suggest.innerHTML = '';
      addBubble('user', esc(q));
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
        typing(false);
        if (!res.ok) {
          const err = data.error || 'Something went wrong.';
          // Local Live Server fallback tip
          if (res.status === 404 || location.port === '5500' || location.port === '8765') {
            addBubble(
              'assistant',
              'DigiGuide needs the Netlify function to reach Groq. Run <code>netlify dev</code> locally, or deploy to Netlify with <strong>GROQ_API_KEY</strong> set. Meanwhile I can still help from the catalogue once the API is live.'
            );
          } else {
            addBubble('assistant', esc(err));
          }
          return;
        }
        const answer = data.answer || 'I could not find an answer.';
        history.push({ role: 'assistant', content: answer });
        const meta = data.usedWeb
          ? 'Catalogue + web sources'
          : data.matches
            ? `Matched ${data.matches.destinations} sites · ${data.matches.hotels} hotels`
            : '';
        addBubble('assistant', linkify(answer), meta);
      } catch (e) {
        typing(false);
        addBubble(
          'assistant',
          'Network error talking to DigiGuide. If you are on Live Server, use <code>netlify dev</code> or deploy to Netlify so <code>/.netlify/functions/chat</code> is available.'
        );
      } finally {
        form.classList.remove('is-busy');
        input.value = '';
        input.focus();
      }
    }

    fab.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
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
      'Hi — I’m <strong>DigiGuide</strong>. Ask me about Ghana destinations, hotels, regions, or travel tips. I’ll use DigiTour’s catalogue first, then the web when needed.'
    );
    renderSuggestions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
