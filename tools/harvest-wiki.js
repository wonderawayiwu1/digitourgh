/**
 * Harvest Wikipedia extracts for DigiTour destinations (facts only; we paraphrase later).
 */
const fs = require('fs');
const path = require('path');

const dests = require('../data/destinations.json');

const WIKI_TITLES = {
  1: 'Kwame Nkrumah Mausoleum',
  2: 'Independence Square (Accra)',
  3: 'Osu Castle',
  4: 'Jamestown, Accra',
  5: 'National Museum of Ghana',
  6: 'W. E. B. Du Bois Memorial Centre for Pan-African Culture',
  7: 'Makola Market',
  8: 'Labadi Beach',
  9: 'Bojo Beach',
  10: 'Kokrobite',
  11: 'Achimota Forest Reserve',
  12: 'University of Ghana',
  13: 'Shai Hills Resource Reserve',
  14: 'Ada Foah',
  15: 'Fort James (Ghana)',
  16: 'Teshie',
  17: 'Kane Kwei Carpentry Workshop',
  18: 'Manhyia Palace',
  19: 'Lake Bosumtwi',
  20: 'Kejetia Market',
  21: 'Okomfo Anokye',
  22: 'Kente cloth',
  23: 'Adanwomase',
  24: 'Adinkra symbols',
  25: 'Ahwiaa',
  26: 'Bobiri Forest Butterfly Sanctuary',
  27: 'Kumasi Zoo',
  28: 'Pottery',
  29: 'Owabi Wildlife Sanctuary',
  30: 'Kumasi',
  31: 'Obuasi',
  32: 'Kakum National Park',
  33: 'Cape Coast Castle',
  34: 'Elmina Castle',
  35: 'Fort Coenraadsburg',
  36: 'Assin Manso',
  37: 'Posuban',
  38: 'Brenu Akyinim',
  39: 'Muni-Pomadze Ramsar Site',
  40: 'Fort Apollonia',
  41: 'Fort Amsterdam (Ghana)',
  42: 'Fort Saint Sebastian',
  43: 'Nzulezo',
  44: 'Busua',
  45: 'Ankasa Conservation Area',
  46: 'Fort Metal Cross',
  47: 'Axim',
  48: 'Sekondi-Takoradi',
  49: 'Fort Gross-Friedrichsburg',
  50: 'Cape Three Points',
  51: 'Butre, Ghana',
  52: 'Tamale, Ghana',
  53: 'Tamale, Ghana',
  54: 'Daboya',
  55: 'Yendi',
  56: 'Wli Waterfalls',
  57: 'Mount Afadja',
  58: 'Tafi Atome Monkey Sanctuary',
  59: 'Amedzofe',
  60: 'Fort Prinzenstein',
  61: 'Wli Waterfalls',
  62: 'Logba people',
  63: 'Mount Agou',
  64: 'Aburi Botanical Gardens',
  65: 'Boti Falls',
  66: 'Umbrella Rock',
  67: 'Three-Headed Palm Tree',
  68: 'Asenema Waterfalls',
  69: 'Adom Waterfalls',
  70: 'Bunso Eco Park',
  71: 'Akosombo Dam',
  72: 'Safari Valley',
  73: 'Dodi Island',
  74: 'Koforidua',
  75: 'Sajuna Beach Club',
  76: 'Paga Crocodile Pond',
  77: 'Tongo Hills',
  78: 'Sirigu',
  79: 'Pikworo Slave Camp',
  80: 'Navrongo Cathedral',
  81: "Wa Naa's Palace",
  82: 'Gwollu',
  83: 'Wechiau Hippo Sanctuary',
  84: 'Gbele Resource Reserve',
  85: 'Boabeng-Fiema Monkey Sanctuary',
  86: 'Kintampo waterfalls',
  87: 'Fuller Falls',
  88: 'Buoyem Caves',
  89: 'Tanoboase Sacred Grove',
  90: 'Duasidan Monkey Sanctuary',
  91: 'Mole National Park',
  92: 'Larabanga Mosque',
  93: 'Larabanga',
  94: 'Mognori',
  95: 'Salaga',
  96: 'Gambaga',
  97: 'Naa Gbewaa',
  98: 'Kyabobo National Park',
  99: 'Oti Region',
  100: 'Oti Region',
  101: 'Sefwi Wiawso',
  102: 'Bia National Park',
  103: 'Sefwi Wiawso',
  104: 'Mim, Ghana',
  105: 'Ahafo Region',
};

async function fetchExtract(title) {
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&exintro=0&explaintext=1&exchars=1800&inprop=url&redirects=1&format=json&origin=*&titles=' +
    encodeURIComponent(title);
  const res = await fetch(url, { headers: { 'User-Agent': 'DigiTourGhana/1.0 (catalogue research)' } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = (data.query && data.query.pages) || {};
  const p = Object.values(pages)[0];
  if (!p || p.missing || !p.extract) return null;
  return { title: p.title, extract: p.extract, url: p.fullurl || '' };
}

(async () => {
  const out = {};
  for (const d of dests) {
    const wiki = WIKI_TITLES[d.id] || d.title;
    process.stdout.write(`#${d.id} ${d.title} -> ${wiki}\n`);
    try {
      const hit = await fetchExtract(wiki);
      out[d.id] = {
        dest: d.title,
        wikiQuery: wiki,
        wikiTitle: hit && hit.title,
        url: hit && hit.url,
        extract: (hit && hit.extract) || '',
      };
    } catch (e) {
      out[d.id] = { dest: d.title, wikiQuery: wiki, extract: '', error: e.message };
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  const file = path.join(__dirname, '..', 'data', '_wiki-research.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  const filled = Object.values(out).filter((x) => x.extract && x.extract.length > 80).length;
  console.log('saved', file, 'with extracts', filled, '/', dests.length);
})();
