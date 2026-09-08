/* DigiTour SEO injector — Open Graph, Twitter, JSON-LD, canonical */
(function () {
  'use strict';

  function upsertMeta(attr, key, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href) {
    if (!href) return;
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function upsertJsonLd(id, data) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function abs(base, path) {
    try {
      return new URL(path, base).href;
    } catch (e) {
      return path;
    }
  }

  async function run() {
    const DT = window.DigiTour;
    if (!DT) return;
    try {
      await DT.ready;
    } catch (_) {
      return;
    }

    const meta = DT.meta || {};
    const base = (meta.site_url || location.origin).replace(/\/$/, '');
    const page = document.body.getAttribute('data-page') || DT.pageName();
    const keywords = (meta.seo_keywords || []).join(', ');
    let title = document.title || meta.site_name || 'DigiTour Ghana';
    let description = meta.seo_description || meta.tagline || '';
    let image = abs(base, (meta.page_bg && meta.page_bg[0]) || 'sources/images/logo-svg/logo-colored.svg');
    let canonical = abs(base, page === 'index.html' ? '/' : page);
    let type = 'website';

    if (page === 'destination-detail.html') {
      const dest = DT.destById(DT.qs('id'));
      if (dest) {
        title = `${dest.title} | DigiTour Ghana`;
        description = DT.shortDesc(dest.short_desc || dest.description, 155);
        image = abs(base, dest.image_url);
        canonical = abs(base, `destination-detail.html?id=${dest.id}`);
        type = 'article';
        document.title = title;
        upsertJsonLd('dt-jsonld-place', {
          '@context': 'https://schema.org',
          '@type': 'TouristAttraction',
          name: dest.title,
          description,
          image: image,
          address: {
            '@type': 'PostalAddress',
            addressRegion: dest.region,
            addressCountry: 'GH',
          },
          url: canonical,
          isAccessibleForFree: true,
        });
      }
    } else if (page === 'destinations.html') {
      title = 'Browse All Ghana Tourist Destinations | DigiTour Ghana';
      description = `Explore ${DT.destinations.length} attractions across Ghana — castles, parks, beaches, waterfalls — and find nearby hotels on DigiTour.`;
      document.title = title;
    } else if (page === 'map.html') {
      title = 'Interactive Ghana Tourism Map | DigiTour Ghana';
      description = 'Explore DigiTour destinations on a full-screen MapTiler 3D map of Ghana with satellite, terrain, and streets.';
      document.title = title;
    } else if (page === 'index.html') {
      title = 'DigiTour Ghana | Discover Attractions & Book Hotels';
      document.title = title;
    }

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'author', 'DigiTour Ghana · Tourism Board');
    upsertMeta('name', 'theme-color', '#E47911');
    upsertMeta('name', 'robots', 'index,follow,max-image-preview:large');
    upsertMeta('property', 'og:site_name', meta.site_name || 'DigiTour Ghana');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:locale', meta.locale || 'en_GH');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
    upsertLink('canonical', canonical);
    upsertLink('manifest', 'site.webmanifest');

    upsertJsonLd('dt-jsonld-org', {
      '@context': 'https://schema.org',
      '@type': 'TouristInformationCenter',
      name: meta.site_name || 'DigiTour Ghana',
      url: base,
      description: meta.seo_description,
      telephone: meta.tel,
      email: meta.email_info,
      address: {
        '@type': 'PostalAddress',
        streetAddress: meta.address,
        addressLocality: 'Accra',
        addressCountry: 'GH',
      },
      areaServed: 'Ghana',
      sameAs: [meta.whatsapp].filter(Boolean),
    });

    upsertJsonLd('dt-jsonld-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DigiTour Ghana',
      url: base,
      potentialAction: {
        '@type': 'SearchAction',
        target: abs(base, 'destinations.html?q={search_term_string}'),
        'query-input': 'required name=search_term_string',
      },
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(run, 0));
  } else {
    setTimeout(run, 0);
  }

  // Re-run after DigiTour data boots
  document.addEventListener('dt:content-ready', run);
})();
