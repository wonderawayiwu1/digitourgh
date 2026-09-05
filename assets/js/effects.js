/* DigiTour — Motion + Performance */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function throttleRAF(fn) {
    let ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
    };
  }

  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    const onScroll = throttleRAF(() => {
      const top = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      bar.style.width = (height > 0 ? (top / height) * 100 : 0) + '%';
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initNavbar() {
    const nav = $('.navbar-digitour');
    if (!nav) return;
    const onScroll = throttleRAF(() => nav.classList.toggle('is-scrolled', window.scrollY > 24));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Generic reveal for non-grid sections */
  function initReveals() {
    const items = $$('.reveal').filter((el) => !el.classList.contains('is-visible'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach((el) => io.observe(el));
  }

  /**
   * Scroll animations for destination/hotel tiles.
   * Uses IntersectionObserver only (no per-scroll getBoundingClientRect loops).
   */
  function initScrollFx() {
    const items = $$('.scroll-fx').filter((el) => !el.classList.contains('is-inview'));
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-inview', 'is-visible'));
      return;
    }

    // Precompute stagger delay on setup — zero reflow during scroll
    items.forEach((el) => {
      const iVal = parseInt(el.style.getPropertyValue('--i') || '0', 10);
      el.style.transitionDelay = Math.min(iVal * 25, 250) + 'ms';
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            // Drop will-change after paint settles — reduces scroll compositing cost
            setTimeout(() => {
              entry.target.style.willChange = 'auto';
            }, 500);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    items.forEach((el) => io.observe(el));
  }

  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;
    const animate = (el) => {
      const limit = parseInt(el.getAttribute('data-count'), 10) || 0;
      const duration = 1100;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        el.textContent = Math.floor(limit * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = limit;
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((el) => io.observe(el));
  }

  function initFilter() {
    const searchInput = $('#search-input');
    const regionFilter = $('#region-filter');
    const categoryFilter = $('#category-filter');
    const items = $$('.destination-item');
    const countEl = $('#filtered-count');
    if (!items.length) return;
    // DigiTour.bindSearchFilters owns home/destinations search — avoid double handlers
    if (document.body.dataset.page === 'index.html' || document.body.dataset.page === 'destinations.html') {
      return;
    }

    let timer = null;
    const apply = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const region = regionFilter?.value || 'all';
      const category = categoryFilter?.value || 'all';
      let visible = 0;

      items.forEach((item) => {
        const title = item.getAttribute('data-title') || '';
        const itemRegion = item.getAttribute('data-region') || '';
        const itemCategory = item.getAttribute('data-category') || '';
        const matchQ =
          !q ||
          title.includes(q) ||
          itemRegion.toLowerCase().includes(q) ||
          itemCategory.toLowerCase().includes(q);
        const matchR = region === 'all' || itemRegion === region;
        const matchC = category === 'all' || itemCategory === category;
        const show = matchQ && matchR && matchC;

        if (show) {
          item.classList.remove('is-hiding');
          item.hidden = false;
          item.style.display = '';
          visible++;
        } else {
          item.classList.add('is-hiding');
          item.hidden = true;
          item.style.display = 'none';
        }
      });

      if (countEl) countEl.textContent = visible;
    };

    const debounced = () => {
      clearTimeout(timer);
      timer = setTimeout(apply, 80);
    };

    searchInput?.addEventListener('input', debounced);
    regionFilter?.addEventListener('change', apply);
    categoryFilter?.addEventListener('change', apply);
  }

  function initHeroVideos() {
    const root = $('#dtHero');
    if (!root) return;

    const videos = $$('.dt-hero-video', root);
    if (!videos.length) return;
    if (root.dataset.heroReady === '1') return;
    root.dataset.heroReady = '1';

    const dots = $$('.dt-hero-dot', root);
    const titleEl = $('#dtHeroTitle');
    const descEl = $('#dtHeroDesc');
    const ctaEl = $('#dtHeroCta');
    const labelEl = $('#dtHeroLabel');
    if (!videos.length) return;

    let slides = [];
    try {
      slides = JSON.parse(root.getAttribute('data-slides') || '[]');
    } catch (e) {
      slides = [];
    }

    let index = 0;
    let timer = null;
    let inView = true;
    const INTERVAL = 10000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pauseAll = () => {
      videos.forEach((v) => {
        try {
          v.pause();
        } catch (_) {}
      });
    };

    const playVideo = (video) => {
      const fallbacks = $$('.dt-hero-fallback', root);
      videos.forEach((v, vi) => {
        v.classList.remove('is-active');
        try {
          v.pause();
        } catch (_) {}
        if (fallbacks[vi]) fallbacks[vi].classList.remove('is-active');
      });
      const idx = videos.indexOf(video);
      if (reduceMotion) {
        if (fallbacks[idx]) fallbacks[idx].classList.add('is-active');
        return;
      }
      video.classList.add('is-active');
      try {
        video.currentTime = 0;
      } catch (_) {}
      if (!inView) {
        if (fallbacks[idx]) fallbacks[idx].classList.add('is-active');
        return;
      }
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          video.classList.remove('is-active');
          if (fallbacks[idx]) fallbacks[idx].classList.add('is-active');
        });
      }
    };

    const setCopy = (i) => {
      const slide = slides[i] || {};
      if (labelEl && slide.label) labelEl.textContent = slide.label;
      if (titleEl && slide.title) titleEl.innerHTML = slide.title;
      if (descEl && slide.desc) descEl.textContent = slide.desc;
      if (ctaEl && slide.url) ctaEl.setAttribute('href', slide.url);
      dots.forEach((d, di) => {
        d.classList.toggle('is-active', di === i);
        const span = d.querySelector('span');
        if (span) {
          span.style.animation = 'none';
          void span.offsetWidth;
          span.style.animation = '';
        }
      });
    };

    const goTo = (i) => {
      index = ((i % videos.length) + videos.length) % videos.length;
      playVideo(videos[index]);
      setCopy(index);
      restartTimer();
    };

    const restartTimer = () => {
      if (timer) clearInterval(timer);
      if (!inView || document.hidden) return;
      timer = setInterval(() => goTo(index + 1), INTERVAL);
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    videos.forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
    });

    // Pause decoding when hero leaves the viewport (major scroll FPS win)
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            inView = entry.isIntersecting;
            if (inView && !document.hidden) {
              playVideo(videos[index]);
              restartTimer();
            } else {
              if (timer) clearInterval(timer);
              timer = null;
              pauseAll();
            }
          });
        },
        { threshold: 0.15 }
      );
      io.observe(root);
    }

    goTo(0);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (timer) clearInterval(timer);
        pauseAll();
      } else if (inView) {
        playVideo(videos[index]);
        restartTimer();
      }
    });
  }

  /** Banner / section video backdrops — pause off-screen; skip if no <video> */
  function initSectionVideos() {
    const containers = $$('.dt-section-videos');
    if (!containers.length) return;

    containers.forEach((root) => {
      if (root.dataset.sectionReady === '1') return;
      root.dataset.sectionReady = '1';

      const videos = $$('.dt-section-video', root).filter((v) => v.tagName === 'VIDEO');
      const images = $$('.dt-img-cycle', root);

      if (images.length) {
        let index = 0;
        let timer = null;
        const INTERVAL = 7000;
        let active = false;

        const showAt = (i) => {
          index = ((i % images.length) + images.length) % images.length;
          images.forEach((el, ei) => el.classList.toggle('is-active', ei === index));
        };

        const start = () => {
          if (active || document.hidden) return;
          active = true;
          showAt(index);
          timer = setInterval(() => showAt(index + 1), INTERVAL);
        };

        const stop = () => {
          active = false;
          if (timer) clearInterval(timer);
          timer = null;
        };

        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) start();
                else stop();
              });
            },
            { threshold: 0.15 }
          );
          io.observe(root.closest('section') || root);
        } else {
          start();
        }

        document.addEventListener('visibilitychange', () => {
          if (document.hidden) stop();
          else if (root.getBoundingClientRect().top < window.innerHeight && root.getBoundingClientRect().bottom > 0) start();
        });
        return;
      }

      if (!videos.length) return;

      let index = 0;
      let timer = null;
      const INTERVAL = 8000;
      let active = false;

      const playAt = (i) => {
        index = ((i % videos.length) + videos.length) % videos.length;
        videos.forEach((v, vi) => {
          const on = vi === index;
          v.classList.toggle('is-active', on);
          if (on) {
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } else {
            try {
              v.pause();
            } catch (_) {}
          }
        });
      };

      const start = () => {
        if (active || document.hidden) return;
        active = true;
        playAt(index);
        timer = setInterval(() => playAt(index + 1), INTERVAL);
      };

      const stop = () => {
        active = false;
        if (timer) clearInterval(timer);
        timer = null;
        videos.forEach((v) => {
          try {
            v.pause();
          } catch (_) {}
        });
      };

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) start();
              else stop();
            });
          },
          { threshold: 0.2 }
        );
        io.observe(root.closest('section') || root);
      } else {
        start();
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (root.getBoundingClientRect().top < window.innerHeight && root.getBoundingClientRect().bottom > 0) start();
      });
    });
  }

  function initOrbitPause() {
    const wrap = $('.dt-orbit-wrap');
    const track = $('#dtOrbitTrack');
    if (!wrap || !track) return;
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          track.style.animationPlayState = entry.isIntersecting && !document.hidden ? 'running' : 'paused';
        });
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) track.style.animationPlayState = 'paused';
    });
  }

  function initBackTop() {
    const btn = $('#dtBackTop');
    if (!btn) return;
    window.addEventListener(
      'scroll',
      throttleRAF(() => btn.classList.toggle('is-visible', window.scrollY > 480)),
      { passive: true }
    );
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initBookingCalc() {
    const checkIn = $('#check_in_date');
    const checkOut = $('#check_out_date');
    const priceEl = $('#price_per_night');
    const nightsEl = $('#total_nights');
    const totalEl = $('#total_price_calc');
    if (!checkIn || !checkOut || !priceEl) return;

    const calc = () => {
      const price = parseFloat(priceEl.getAttribute('data-price')) || 0;
      if (!checkIn.value || !checkOut.value) return;
      const days = Math.ceil((new Date(checkOut.value) - new Date(checkIn.value)) / 86400000);
      if (days > 0) {
        if (nightsEl) nightsEl.textContent = days;
        if (totalEl) totalEl.textContent = '$' + (days * price).toFixed(2);
      } else {
        if (nightsEl) nightsEl.textContent = '0';
        if (totalEl) totalEl.textContent = '$0.00';
      }
    };
    checkIn.addEventListener('change', calc);
    checkOut.addEventListener('change', calc);
  }

  function initDetailGallery() {
    const carouselEl = $('#destinationGalleryCarousel');
    if (!carouselEl || typeof bootstrap === 'undefined') return;

    const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl, {
      interval: 4000,
      ride: 'carousel',
      wrap: true,
      pause: false,
    });

    const thumbs = $$('.dt-thumb-rail img');
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const slide = parseInt(thumb.getAttribute('data-slide') || '0', 10);
        carousel.to(slide);
        thumbs.forEach((t) => {
          const s = parseInt(t.getAttribute('data-slide') || '0', 10);
          t.classList.toggle('is-active', s === slide);
        });
      });
    });

    carouselEl.addEventListener('slid.bs.carousel', (e) => {
      thumbs.forEach((t) => {
        const s = parseInt(t.getAttribute('data-slide') || '0', 10);
        t.classList.toggle('is-active', s === e.to);
      });
    });
  }

  /** Lighter page background: single static layer (no opacity thrash while scrolling) */
  function initPageBackground() {
    const root = $('#dtPageBg');
    if (!root) return;
    const layers = $$('.dt-page-bg-layer', root);
    const video = $('.dt-page-bg-video', root);
    if (!layers.length) return;

    if (video) {
      try {
        video.pause();
      } catch (_) {}
      video.classList.remove('is-active');
      video.removeAttribute('autoplay');
    }

    // Keep first layer only — cycling fixed backgrounds costs paint during scroll
    layers.forEach((l, i) => {
      l.classList.toggle('is-active', i === 0);
      if (i > 0) l.style.display = 'none';
    });
  }

  function dtInitEffects() {
    initScrollProgress();
    initNavbar();
    initReveals();
    initScrollFx();
    initCounters();
    initFilter();
    initHeroVideos();
    initSectionVideos();
    initOrbitPause();
    initBackTop();
    initBookingCalc();
    initDetailGallery();
    initPageBackground();
  }

  window.dtInitEffects = dtInitEffects;
  document.addEventListener('DOMContentLoaded', dtInitEffects);
  document.addEventListener('dt:content-ready', () => {
    initReveals();
    initScrollFx();
    initCounters();
    initHeroVideos();
    initSectionVideos();
    initOrbitPause();
    initDetailGallery();
    initFilter();
  });
})();
