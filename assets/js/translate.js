/**
 * DigiTour language toggle — Google Translate (pure JS / cookie driven)
 *
 * Uses the free Google Website Translator + googtrans cookie.
 * EN (default) / FR buttons. Choice is saved in cookie `dt_lang`.
 * No paid Cloud Translation API.
 */
(function (global) {
  'use strict';

  const COOKIE = 'dt_lang';
  const GOOG = 'googtrans';

  function setCookie(name, value, days) {
    const max = days ? '; max-age=' + days * 86400 : '';
    document.cookie = name + '=' + encodeURIComponent(value) + max + '; path=/; SameSite=Lax';
  }

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function lang() {
    return getCookie(COOKIE) === 'fr' ? 'fr' : 'en';
  }

  function applyGoogTrans(code) {
    if (code === 'fr') {
      setCookie(GOOG, '/en/fr', 365);
      setCookie('googtrans', '/en/fr', 365);
    } else {
      // Clear Google translate cookies to restore English
      setCookie(GOOG, '', -1);
      setCookie('googtrans', '/en/en', 1);
      document.cookie = 'googtrans=; path=/; max-age=0';
      document.cookie = 'googtrans=/en/en; path=/; max-age=86400; SameSite=Lax';
    }
  }

  function syncButtons() {
    const L = lang();
    document.querySelectorAll('[data-set-lang]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-set-lang') === L);
    });
    document.documentElement.lang = L === 'fr' ? 'fr' : 'en';
    document.documentElement.setAttribute('data-lang', L);
  }

  function setLang(next) {
    const code = next === 'fr' ? 'fr' : 'en';
    const prev = lang();
    setCookie(COOKIE, code, 365);
    if (window.DigiStorage) DigiStorage.setPrefs({ lang: code });
    applyGoogTrans(code);
    syncButtons();
    // Reload so Google Translate re-applies cleanly across dynamic content
    if (prev !== code) {
      setTimeout(() => window.location.reload(), 120);
    }
  }

  function injectTranslateWidget() {
    if (document.getElementById('google_translate_element')) return;
    const box = document.createElement('div');
    box.id = 'google_translate_element';
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(box);

    global.googleTranslateElementInit = function () {
      try {
        // eslint-disable-next-line no-new
        new global.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fr',
            autoDisplay: false,
            layout: global.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      } catch (_) {}
    };

    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }

  function hideGoogleBanner() {
    const css = document.createElement('style');
    css.textContent = `
      .goog-te-banner-frame, .goog-te-balloon-frame, #goog-gt-tt, .goog-tooltip,
      .goog-te-balloon-frame, .skiptranslate iframe.skiptranslate { display:none !important; }
      body { top: 0 !important; }
      .goog-logo-link, .goog-te-gadget span { display:none !important; }
      .goog-te-gadget { font-size:0 !important; }
      #google_translate_element { display:none !important; }
    `;
    document.head.appendChild(css);
  }

  function boot() {
    hideGoogleBanner();
    injectTranslateWidget();
    // Restore FR if cookie set
    if (lang() === 'fr') applyGoogTrans('fr');
    syncButtons();
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-set-lang]');
      if (!btn) return;
      e.preventDefault();
      setLang(btn.getAttribute('data-set-lang'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.DigiTranslate = { setLang, lang, syncButtons };
})(window);
