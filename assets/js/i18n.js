/* DigiTour EN / FR UI translations */
(function (global) {
  'use strict';

  const STRINGS = {
    en: {
      skip: 'Skip to content',
      home: 'Home',
      destinations: 'Destinations',
      map: 'Map',
      inquiries: 'Inquiries',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      logout: 'Logout',
      createAccount: 'Create account',
      askDigiguide: 'Ask DigiGuide',
      help: 'Help',
      call: 'Call',
      whatsapp: 'WhatsApp',
      backTop: 'Back to top',
      contrast: 'High contrast',
      langSwitched: 'Language: English',
      discover: "Discover Ghana's premier attractions & accommodation",
      quickLinks: 'Quick Links',
      topRegions: 'Top Regions',
      tourismSupport: 'Tourism Support',
      tourismMap: 'Tourism Map',
      demoLogin: 'Demo Login',
      searchDest: 'Search destination',
      region: 'Region',
      allRegions: 'All Ghanaian Regions',
      showing: 'Showing',
      of: 'of',
      whyDigitour: 'Why DigiTour',
      howItWorks: 'How it works',
      featured: 'Featured',
      mustSee: 'Must-see Ghana',
      viewAll: 'View all destinations',
      openMap: 'Open map',
      explore: 'Explore',
      stay: 'Stay',
      community: 'Community',
      travellersSay: 'What travellers say',
      planBook: 'Plan. Book. Explore.',
      step1Title: 'Discover destinations',
      step1Text: 'Browse featured sites, filter by region, or search instantly — no account needed.',
      step2Title: 'Compare nearby hotels',
      step2Text: 'Every attraction shows mapped accommodations with nightly rates and capacity.',
      step3Title: 'Book & track status',
      step3Text: 'Register once, reserve your dates, and follow confirmations on your dashboard.',
      mapHero: 'Interactive tourism map',
      mapLead: 'Live satellite view of DigiTour destinations — filter by region or category, then open details and hotels.',
      mapSearch: 'Search',
      mapCategory: 'Category',
      mapAllCats: 'All categories',
      mapAllRegions: 'All regions',
      mapSites: 'sites',
      mapResults: 'Results',
      mapTap: 'Tap a card to zoom',
      mapSatellite: 'Satellite',
      mapStreets: 'Streets',
      mapHybrid: 'Hybrid',
      mapStreetView: 'Live surroundings',
      mapNote: 'Satellite imagery shows real buildings and landscape. Use “Live surroundings” for Google Maps street-level preview.',
      inquiryTitle: 'Tourist Inquiry',
      inquiryLead: 'Questions about attractions, hotel stays, or travel packages? Send us a message.',
      yourName: 'Your Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Your Message',
      sendInquiry: 'Send Inquiry',
      welcomeBack: 'Welcome back',
      signInLead: 'Sign in to manage bookings',
      password: 'Password',
      logIn: 'Log In',
      noAccount: 'No account?',
      joinDigitour: 'Join DigiTour',
      createFree: 'Create a free tourist account',
      fullName: 'Full Name',
      phone: 'Phone',
      alreadyReg: 'Already registered?',
      footerTag: 'Smart tourism information, accommodation, and booking for Ghana.',
      digiguideHi: "Hi — I'm **DigiGuide**. I search the web first, then answer from DigiTour's live Ghana catalogue. Ask a detailed question.",
    },
    fr: {
      skip: 'Aller au contenu',
      home: 'Accueil',
      destinations: 'Destinations',
      map: 'Carte',
      inquiries: 'Demandes',
      login: 'Connexion',
      register: 'Inscription',
      dashboard: 'Tableau de bord',
      logout: 'Déconnexion',
      createAccount: 'Créer un compte',
      askDigiguide: 'Demander à DigiGuide',
      help: 'Aide',
      call: 'Appeler',
      whatsapp: 'WhatsApp',
      backTop: 'Haut de page',
      contrast: 'Contraste élevé',
      langSwitched: 'Langue : Français',
      discover: 'Découvrez les attractions et hébergements du Ghana',
      quickLinks: 'Liens rapides',
      topRegions: 'Principales régions',
      tourismSupport: 'Assistance tourisme',
      tourismMap: 'Carte touristique',
      demoLogin: 'Connexion démo',
      searchDest: 'Rechercher une destination',
      region: 'Région',
      allRegions: 'Toutes les régions du Ghana',
      showing: 'Affichage',
      of: 'sur',
      whyDigitour: 'Pourquoi DigiTour',
      howItWorks: 'Comment ça marche',
      featured: 'À la une',
      mustSee: 'Incontournables du Ghana',
      viewAll: 'Voir toutes les destinations',
      openMap: 'Ouvrir la carte',
      explore: 'Explorer',
      stay: 'Séjour',
      community: 'Communauté',
      travellersSay: 'Avis des voyageurs',
      planBook: 'Planifier. Réserver. Explorer.',
      step1Title: 'Découvrir les sites',
      step1Text: 'Parcourez les sites, filtrez par région ou recherchez instantanément — sans compte.',
      step2Title: 'Comparer les hôtels proches',
      step2Text: 'Chaque attraction propose des hébergements avec tarifs et capacité.',
      step3Title: 'Réserver et suivre',
      step3Text: 'Inscrivez-vous, réservez vos dates et suivez les confirmations sur votre tableau de bord.',
      mapHero: 'Carte touristique interactive',
      mapLead: 'Vue satellite des destinations DigiTour — filtrez par région ou catégorie, puis ouvrez les détails et hôtels.',
      mapSearch: 'Recherche',
      mapCategory: 'Catégorie',
      mapAllCats: 'Toutes les catégories',
      mapAllRegions: 'Toutes les régions',
      mapSites: 'sites',
      mapResults: 'Résultats',
      mapTap: 'Touchez une carte pour zoomer',
      mapSatellite: 'Satellite',
      mapStreets: 'Plan',
      mapHybrid: 'Hybride',
      mapStreetView: 'Environnement réel',
      mapNote: 'L’imagerie satellite montre les bâtiments et le paysage. Utilisez « Environnement réel » pour un aperçu Google Maps au niveau de la rue.',
      inquiryTitle: 'Demande touristique',
      inquiryLead: 'Questions sur les attractions, hôtels ou forfaits ? Envoyez-nous un message.',
      yourName: 'Votre nom',
      email: 'Adresse e-mail',
      subject: 'Sujet',
      message: 'Votre message',
      sendInquiry: 'Envoyer la demande',
      welcomeBack: 'Bon retour',
      signInLead: 'Connectez-vous pour gérer vos réservations',
      password: 'Mot de passe',
      logIn: 'Se connecter',
      noAccount: 'Pas de compte ?',
      joinDigitour: 'Rejoindre DigiTour',
      createFree: 'Créer un compte touriste gratuit',
      fullName: 'Nom complet',
      phone: 'Téléphone',
      alreadyReg: 'Déjà inscrit ?',
      footerTag: 'Information touristique, hébergement et réservation pour le Ghana.',
      digiguideHi: "Bonjour — je suis **DigiGuide**. Je cherche d'abord sur le web, puis je réponds avec le catalogue live DigiTour. Posez une question détaillée.",
    },
  };

  function lang() {
    try {
      return (global.DigiStorage && DigiStorage.getPrefs().lang) || 'en';
    } catch (_) {
      return 'en';
    }
  }

  function t(key) {
    const L = lang();
    return (STRINGS[L] && STRINGS[L][key]) || (STRINGS.en && STRINGS.en[key]) || key;
  }

  function apply() {
    const L = lang();
    document.documentElement.lang = L === 'fr' ? 'fr' : 'en';
    document.documentElement.setAttribute('data-lang', L);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', val);
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    document.dispatchEvent(new CustomEvent('dt:i18n', { detail: { lang: L } }));
  }

  function setLang(next) {
    if (global.DigiStorage) DigiStorage.setPrefs({ lang: next });
    apply();
  }

  global.DigiI18n = { STRINGS, t, apply, setLang, lang };
})(window);
