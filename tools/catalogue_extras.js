const { COPY, entry } = require('./catalogue_part6');

/** Nationally important sites not in the original 105, with remote images (Wikimedia). */
const NEW_SITES = [
  {
    title: 'Ussher Fort',
    region: 'Greater Accra',
    category: 'History',
    location_contact: 'Ussher Town / Jamestown, Accra',
    lat: 5.5386,
    lng: -0.211,
    featured: 1,
    image_url: 'sources/images/all_tourist_sites/Fort%20Great%20George.jpg',
    copy: entry(
      [
        'Ussher Fort (Dutch Fort Crèvecœur, 1649) stands in Ussher Town, Accra, a few hundred metres from James Fort. It is a stone coastal fort later adapted as a prison and, in recent years, as a museum interpreting slavery and Accra’s port history. With James Fort and Christiansborg it completes the Accra triad of UNESCO forts.',
        'The landward side meets dense Ga Mashie housing; the seaward side faces the historic canoe beaches of Accra.',
      ],
      [
        'Ussher Fort and James Fort were reopened to controlled visits after GMMB safety work (Ministry of Tourism notice, 22 December 2025). Follow marked routes. Combine with Jamestown Lighthouse and James Fort. GMMB ticket.',
      ],
      [
        ['Region', 'Greater Accra — Ussher Town, Accra'],
        ['UNESCO', 'Forts and Castles of Ghana (1979)'],
        ['Built', 'Dutch, 1649 (Fort Crèvecœur)'],
        ['Managed by', 'Ghana Museums and Monuments Board'],
      ],
      [
        'The Dutch built Crèvecœur to rival English James Fort and Danish Christiansborg. Accra’s three European forts explain the city’s split colonial quarters.',
        'Ussher Fort later held prisoners in independent Ghana. Its museum function is part of the national slave-route narrative in the capital, not only on the Central Region coast.',
      ]
    ),
  },
  {
    title: 'Centre for National Culture (Arts Centre), Accra',
    region: 'Greater Accra',
    category: 'Culture & Heritage',
    location_contact: 'High Street, next to Kwame Nkrumah Memorial Park, Accra',
    lat: 5.5455,
    lng: -0.2065,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Kwame%20Nkrumah%20Memorial%20Park.jpg',
    copy: entry(
      [
        'The Centre for National Culture (often called the Arts Centre) on High Street, Accra, is Ghana’s densest craft market: kente, beads, woodcarving, leather, drums and souvenirs in a warren of stalls beside Nkrumah Memorial Park.',
        'It is a commercial cultural bazaar more than a quiet gallery — loud, useful, and the practical place to buy crafts after a museum morning.',
      ],
      [
        'Open daily as a market. Bargain; compare prices; watch bags. Pair with Nkrumah Park next door. Quality varies — inspect stitching and dyes.',
      ],
      [
        ['Region', 'Greater Accra — High Street, Accra'],
        ['Category', 'National craft market / cultural centre'],
        ['Highlights', 'Crafts shopping, drums, cloth, next to KNMP'],
      ],
      [
        'Post-independence cultural policy created national centres to display Ghanaian arts. Accra’s Arts Centre became the tourist-facing craft souk of the capital.',
        'It sits on the same independence axis as the Memorial Park and the old Polo Grounds — culture as commerce beside culture as tomb.',
      ]
    ),
  },
  {
    title: 'Ghana National Mosque',
    region: 'Greater Accra',
    category: 'Culture & Heritage',
    location_contact: 'Kanda / Kawukudi area, Accra',
    lat: 5.591,
    lng: -0.175,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Tamale%20Central%20Mosque.jpg',
    copy: entry(
      [
        'The Ghana National Mosque at Kanda, Accra, is a large contemporary mosque complex with Ottoman-inspired domes and minarets, built with Turkish cooperation and opened in the 2020s as a national-level Friday mosque and campus (including educational facilities).',
        'It is one of the largest mosque complexes in West Africa and a skyline marker of Accra’s twenty-first-century religious architecture — distinct from Tamale’s older urban mosques and from Larabanga’s fifteenth-century mud mosque.',
      ],
      [
        'Non-Muslim visitors should go outside prayer times, dress modestly, remove shoes, and follow staff. Friday midday is for worship. The exterior and courtyards are the usual visit.',
      ],
      [
        ['Region', 'Greater Accra — Kanda, Accra'],
        ['Category', 'National mosque complex'],
        ['Etiquette', 'Active place of worship — modest dress, ask permission'],
      ],
      [
        'Ghana’s Muslim communities (north and zongo quarters of the south) long lacked a single “national” monumental mosque in the capital. This complex fills that civic-symbolic role with international architectural language.',
        'List it as living religion, not as a theme-park replica of Istanbul.',
      ]
    ),
  },
  {
    title: 'Besease Traditional Shrine (Asante Traditional Buildings)',
    region: 'Ashanti Region',
    category: 'Culture & Heritage',
    location_contact: 'Ejisu-Besease, near Kumasi',
    lat: 6.72,
    lng: -1.47,
    featured: 1,
    image_url: 'sources/images/all_tourist_sites/Bonwire%20Kente%20Village.jpg',
    copy: entry(
      [
        'The Besease shrine at Ejisu is the most visitable of the ten surviving Asante Traditional Buildings inscribed by UNESCO in 1980: timber-frame, wattle-and-daub houses arranged around a courtyard, with symbolic bas-reliefs once painted, originally thatched.',
        'These are the last architectural remnants of eighteenth-century Asante shrine-house style after wars and weather destroyed most earth palaces. Patakro, Abirim and others complete the serial property; Besease is the usual stop from Kumasi.',
      ],
      [
        'Short drive from Kumasi toward Ejisu. GMMB caretaker; small fee. Do not touch reliefs. Combine with Bonwire (same road) and Manhyia. The buildings are fragile earth architecture.',
      ],
      [
        ['Region', 'Ashanti Region — Ejisu-Besease'],
        ['UNESCO', 'Asante Traditional Buildings (1980) — serial property of ten shrines'],
        ['Highlights', 'Courtyard shrine house, Adinkra-related reliefs, last Asante earth palaces'],
      ],
      [
        'Asante monumental earth architecture largely perished in the nineteenth-century wars with Britain. UNESCO listed the surviving shrine houses in 1980 as testimony to that civilisation.',
        'A national portal that lists Bonwire but omits Besease would miss Ghana’s second World Heritage property. This entry corrects that omission.',
      ]
    ),
  },
  {
    title: 'Tetteh Quarshie Cocoa Farm, Mampong-Akuapem',
    region: 'Eastern Region',
    category: 'History',
    location_contact: 'Mampong, Akuapem Hills, Eastern Region',
    lat: 5.926,
    lng: -0.133,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Aburi%20Botanical%20Gardens.jpg',
    copy: entry(
      [
        'The Tetteh Quarshie Cocoa Farm at Mampong-Akuapem commemorates the Ghanaian blacksmith who brought Amelonado cocoa pods from Fernando Pó (Bioko) in 1879, planting the trees that seeded Ghana’s cocoa industry — still a pillar of the national economy.',
        'The site is a small historic farm/garden on the Akuapem ridge, not an industrial plantation. Interpretive visits show cocoa trees and the origin story of the Gold Coast cocoa boom.',
      ],
      [
        'Combine with Aburi Botanical Gardens (same hills). Confirm opening with local tourism or GTA listings. Accra–Aburi–Mampong is a classic day loop.',
      ],
      [
        ['Region', 'Eastern Region — Mampong-Akuapem'],
        ['Category', 'Agricultural heritage farm'],
        ['Date', 'Cocoa introduced 1879 by Tetteh Quarshie'],
        ['Highlights', 'Origin point of Ghana cocoa, Akuapem ridge'],
      ],
      [
        'Ghana became the world’s leading cocoa producer in the twentieth century. That global commodity chain starts, in national memory, with Quarshie’s pods on this ridge — before colonial botanical stations scaled the crop.',
        'Aburi Gardens (1890) later trialled varieties; Quarshie’s farm is the folk-hero origin, Aburi the scientific station. Both belong in a national catalogue.',
      ]
    ),
  },
  {
    title: 'Bui National Park',
    region: 'Bono Region',
    category: 'Nature & Wildlife',
    location_contact: 'Bui / Black Volta, Bono–Savannah borderlands',
    lat: 8.28,
    lng: -2.24,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Wechiau%20Hippo%20Sanctuary.jpg',
    copy: entry(
      [
        'Bui National Park on the Black Volta (Bono / Savannah borderlands) protects savanna and riverine habitat historically known for hippos and a spectacular gorge — later altered by the Bui hydroelectric dam (commissioned 2013), which flooded part of the park and created a new lake.',
        'Wildlife viewing is more uncertain than Mole. The story is conservation plus dam-era landscape change.',
      ],
      [
        'Specialist visit via Bole / Banda / Wenchi roads. Check Wildlife Division current access — flooding changed the park you see in old guidebooks. Not a substitute for Mole elephants.',
      ],
      [
        ['Region', 'Bono Region / Savannah border — Black Volta'],
        ['Managed by', 'Wildlife Division'],
        ['Note', 'Bui Dam (2013) inundated sections of the original park'],
        ['Highlights', 'Black Volta gorge/lake, hippo habitat (variable), dam-era geography'],
      ],
      [
        'Bui was gazetted to protect the Black Volta’s wildlife. The dam, a major twenty-first-century power project, repeated Akosombo’s bargain: electricity versus inundation.',
        'Listing Bui honestly — park plus dam — is required for a professional national inventory.',
      ]
    ),
  },
  {
    title: 'Cape St. Paul Lighthouse, Woe',
    region: 'Volta Region',
    category: 'History',
    location_contact: 'Woe, near Keta, Volta Region',
    lat: 5.826,
    lng: 0.898,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Keta%20Lagoon%20and%20Fort%20Prinzenstein.jpg',
    copy: entry(
      [
        'Cape St. Paul Lighthouse at Woe, near Keta, is a historic iron lighthouse (the leaning “tilted” tower is a well-known photograph) on Ghana’s eastern Atlantic coast, warning ships off the Accra–Keta shoreline. It stands in an Anlo-Ewe coastal village of coconut and lagoon.',
        'Coastal erosion that is destroying Fort Prinzenstein also threatens this littoral. The lighthouse is navigation heritage of the eastern forts-and-surf ports.',
      ],
      [
        'Visit with Keta Lagoon / Fort Prinzenstein. Ask locally before climbing; structures may be fragile. The lean of the tower is not a playground.',
      ],
      [
        ['Region', 'Volta Region — Woe, near Keta'],
        ['Category', 'Historic lighthouse'],
        ['Highlights', 'Iron lighthouse, eastern seaboard, pair with Keta fort'],
      ],
      [
        'European trade on the Keta–Ada coast needed landfall lights. Cape St. Paul served that charted danger.',
        'Together with Prinzenstein it tells the eastern, Anlo chapter of Ghana’s Atlantic history, often overshadowed by Cape Coast and Elmina.',
      ]
    ),
  },
  {
    title: 'Fort William, Anomabo',
    region: 'Central Region',
    category: 'History',
    location_contact: 'Anomabo, Central Region',
    lat: 5.175,
    lng: -1.121,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Fort%20Amsterdam.jpg',
    copy: entry(
      [
        'Fort William at Anomabo (Anomabu) is a major British fort (begun 1753–70s) on a Fante port that was one of the busiest slave-export points on the Gold Coast. The fort is a large rectangular coastal fortress in the town fabric of Anomabo, with Posuban shrines in the streets around it.',
        'UNESCO component. Anomabo’s Fante Asafo culture (posuban) and the fort must be read together.',
      ],
      [
        'On the Accra–Cape Coast highway. GMMB ticket when open. Walk the town for posuban. Combine with Fort Amsterdam at Abandze and Cape Coast Castle.',
      ],
      [
        ['Region', 'Central Region — Anomabo'],
        ['UNESCO', 'Forts and Castles of Ghana (1979)'],
        ['Highlights', 'Major British slave-trade fort, Fante port, posuban nearby'],
      ],
      [
        'Anomabo outpaced some better-photographed forts in volume of human trafficking. Ignoring it while listing every small western ruin would distort the historical record.',
        'Fante political skill — playing Europeans against each other — is part of this town’s story, not only European walls.',
      ]
    ),
  },
  {
    title: 'Fort Good Hope, Senya Beraku',
    region: 'Central Region',
    category: 'History',
    location_contact: 'Senya Beraku, Central Region',
    lat: 5.391,
    lng: -0.49,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Winneba%20Lagoon%20and%20Muni-Pomadze%20Ramsar%20Site.jpg',
    copy: entry(
      [
        'Fort Good Hope (De Goede Hoop) at Senya Beraku is a Dutch fort of 1705–15, later expanded with large slave prisons, on a palm-lined cove west of Accra. GMMB notes it was described in 1804 as one of the finest forts on the coast. It has served as a rest house in modern times.',
        'UNESCO component. The setting is a fishing town beach, closer to Accra than Cape Coast, which makes it a practical day trip.',
      ],
      [
        'About 1–1.5 hours west of Accra. GMMB hours often 9:00 am–4:30 pm when open. Combine with Winneba lagoon. Confirm rest-house/monument status before overnight plans.',
      ],
      [
        ['Region', 'Central Region — Senya Beraku'],
        ['UNESCO', 'Forts and Castles of Ghana (1979)'],
        ['Built', 'Dutch, 1705 (expanded 1715)'],
        ['Highlights', 'Cove setting, Accra day-trip fort, slave-prison expansion'],
      ],
      [
        'The Dutch built Good Hope to tap Akyem gold routes. Expansion for slave prisons followed hinterland wars. Britain took it in the 1868 forts exchange.',
        'It is the last major fort built on the Gold Coast — the end of the European fort-building sequence that began at Elmina in 1482.',
      ]
    ),
  },
  {
    title: 'Nkroful (Kwame Nkrumah Birthplace)',
    region: 'Western Region',
    category: 'History',
    location_contact: 'Nkroful, Nzema East, Western Region',
    lat: 4.966,
    lng: -2.325,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Kwame%20Nkrumah%20Memorial%20Park.jpg',
    copy: entry(
      [
        'Nkroful in Nzema country, Western Region, is the birthplace of Kwame Nkrumah (born 1909). A memorial centre / mausoleum complex marks the village where he was first buried after 1972 before the Accra Memorial Park received his remains in 1992.',
        'The site is a patriotic pilgrimage in a rural Nzema landscape, complementary to the Accra park rather than a duplicate museum of the same scale.',
      ],
      [
        'Long drive west of Takoradi / Axim hinterland. Confirm the memorial is open. Combine with Nzulezo or Axim only on a dedicated western heritage trip. Modest village facilities.',
      ],
      [
        ['Region', 'Western Region — Nkroful, Nzema'],
        ['Category', 'Presidential birthplace memorial'],
        ['Highlights', 'Nkrumah origin village, first burial place, Nzema context'],
      ],
      [
        'National memory often starts at Accra’s marble mausoleum. Nkroful is where the life began and where the body first came home.',
        'A complete Nkrumah itinerary is Accra park plus Nkroful — city monument and Nzema village.',
      ]
    ),
  },
  {
    title: 'National Theatre of Ghana',
    region: 'Greater Accra',
    category: 'Culture & Heritage',
    location_contact: 'South Liberation Link / Tetteh Quarshie–Ridge area, Accra',
    lat: 5.5567,
    lng: -0.1915,
    featured: 1,
    image_url: 'sources/images/all_tourist_sites/National%20Museum%20of%20Ghana.jpg',
    copy: entry(
      [
        'The National Theatre of Ghana on Liberation Road, Accra, is the country’s principal purpose-built house for drama, dance and music. Completed in 1992 with Chinese cooperation, its distinctive white, sculptural shell — often compared to a ship or a bird in flight — sits between the Accra city core and the Ridge/Cantonments cultural belt, near the National Museum axis.',
        'Inside are a large auditorium, rehearsal rooms and foyers used by the National Dance Company, National Symphony Orchestra and visiting productions. It is civic architecture of the Fourth Republic, not a colonial leftover.',
      ],
      [
        'Check the current programme (concerts, Ghanaian theatre, dance) before visiting; daytime exterior photography is always possible. Dress as for a theatre. Parking and ride-hail access are straightforward. Combine with the National Museum a short ride away and with KNMP / Independence Square on a culture day in Accra.',
      ],
      [
        ['Region', 'Greater Accra — Accra city, Liberation Road'],
        ['Opened', '1992 (Chinese–Ghanaian project)'],
        ['Category', 'National performing-arts theatre'],
        ['Highlights', 'Landmark roof form, national companies, evening performances'],
      ],
      [
        'Independent Ghana needed a national stage after years of using cinemas and university halls. The 1992 theatre gave the National Dance Company and allied ensembles a home in the capital.',
        'It belongs in a national tourism inventory as living culture — tickets and rehearsals — not only as a photogenic roof.',
      ]
    ),
  },
  {
    title: 'Digya National Park',
    region: 'Bono East Region',
    category: 'Nature & Wildlife',
    location_contact: 'Western Lake Volta / Digya peninsula, Bono East–Oti shorelands',
    lat: 7.42,
    lng: -0.13,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Akosombo%20Dam%20%26%20Lake%20Volta.webp',
    copy: entry(
      [
        'Digya National Park occupies a large peninsula on the western arm of Lake Volta (about 3,478 km²), making it Ghana’s second-largest national park after Mole. Habitat is Guinea savanna woodland and lakeshore, with elephants, antelope, primates and rich waterbirds. Access is historically difficult — by lake and rough tracks — so it remains far less visited than Mole or Kakum.',
        'The shoreline is a flooded Volta landscape created by the Akosombo Dam (1960s). Islands, inlets and former river valleys now form the park’s edge.',
      ],
      [
        'This is not a drop-in day trip. Arrange through Wildlife Division or specialist operators (often via Yeji, Kojokrom or lakeside communities). Expect boats, heat and limited lodging. Do not confuse Digya with Mole: same savanna fauna family, much weaker tourist infrastructure. Confirm security and ranger availability.',
      ],
      [
        ['Region', 'Bono East / Lake Volta western peninsula'],
        ['Area', 'About 3,478 km² (second-largest park in Ghana)'],
        ['Managed by', 'Wildlife Division, Forestry Commission'],
        ['Gazetted', '1971'],
        ['Highlights', 'Lake Volta wilderness, elephants (elusive), waterbirds, low visitor numbers'],
      ],
      [
        'Digya was gazetted in 1971 as the Volta Lake filled, protecting a savanna block that the dam had made into a peninsula. Like Mole, communities were affected by conservation boundaries.',
        'Listing Digya completes Ghana’s “big parks” set: Mole (savanna flagship), Kakum (rainforest walkway), Digya (Volta wilderness), Bia/Ankasa (western forest), Kyabobo (eastern hills).',
      ]
    ),
  },
  {
    title: 'Fort Patience (Apam)',
    region: 'Central Region',
    category: 'History',
    location_contact: 'Apam, Central Region',
    lat: 5.283,
    lng: -0.74,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Fort%20Amsterdam.jpg',
    copy: entry(
      [
        'Fort Patience (Fort Lijdzaamheid) at Apam is a Dutch coastal fort begun in 1697, a compact whitewashed work on a rocky point above a Fante fishing town between Winneba and Cape Coast. UNESCO lists it among Ghana’s forts and castles (1979).',
        'The name “Patience” (Dutch Lijdzaamheid) records how long the Dutch waited for permission and construction. The fort is smaller than Cape Coast or Elmina but sits in a living harbour town.',
      ],
      [
        'Apam is on the Accra–Cape Coast coastal road. GMMB access when open; confirm hours. Combine with Winneba lagoon to the east and Fort Amsterdam / Anomabo to the west. Village protocol applies — this is a working fishing port.',
      ],
      [
        ['Region', 'Central Region — Apam'],
        ['UNESCO', 'Forts and Castles of Ghana (1979)'],
        ['Built', 'Dutch, 1697 (Fort Lijdzaamheid)'],
        ['Highlights', 'Rocky-point fort, Fante fishing town, Accra–Cape Coast stop'],
      ],
      [
        'The Dutch fortified Apam to hold a stretch of coast between English and other Dutch posts. Later British administration inherited the ruin-to-monument sequence typical of Gold Coast forts.',
        'Apam remains a significant Fante town; the fort is one stone in a chain, not a standalone museum-city like Cape Coast.',
      ]
    ),
  },
  {
    title: 'Ada Foah and Songor Lagoon',
    region: 'Greater Accra',
    category: 'Nature & Waterways',
    location_contact: 'Ada Foah, Volta estuary, Greater Accra Region',
    lat: 5.783,
    lng: 0.633,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Treasure%20Island.jpg',
    copy: entry(
      [
        'Ada Foah sits at the Volta River mouth where Ghana’s largest river meets the Atlantic, east of Accra in Greater Accra Region (Dangme East). Estuary, sandbar, mangrove and the Songor (Songaw) Lagoon — a Ramsar wetland famous for salt, waterbirds and sea turtles — define the landscape. DigiTour already lists Treasure Island as a lagoon-island stay; Ada Foah is the historic Dangme town and river-mouth hub itself.',
        'Architecture is a river port: colonial-era traces, canoe landings, lodges, and the open estuary used for boat trips toward the sea and upriver.',
      ],
      [
        'About 2–3 hours east of Accra via Sege / Ada. Boat trips, birding at Songor, and turtle season (subject to conservation rules) are the visits. Respect salt-winning communities and closed nesting beaches. Combine with Treasure Island if you want an overnight on the water. Carry cash; services thin out after Accra.',
      ],
      [
        ['Region', 'Greater Accra — Ada Foah, Volta estuary'],
        ['Wetland', 'Songor Lagoon Ramsar Site'],
        ['Highlights', 'River mouth, lagoon birds, salt flats, Dangme river culture, boat trips'],
        ['Pair with', 'Treasure Island (DigiTour listing), Keta Lagoon further east'],
      ],
      [
        'Ada (Dangme) polities controlled the Volta mouth — a strategic river gate long before Accra became the capital. European traders used the estuary; later colonial Ada was a district centre.',
        'Songor’s salt and birds are a national wetland story. A catalogue that lists a lagoon island but not Ada town would miss the cultural capital of this estuary.',
      ]
    ),
  },
  {
    title: 'Kumasi Centre for National Culture',
    region: 'Ashanti Region',
    category: 'Culture & Heritage',
    location_contact: 'Bantama / cultural-centre precinct, Kumasi',
    lat: 6.694,
    lng: -1.624,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Kejetia%20Market.jpg',
    copy: entry(
      [
        'The Centre for National Culture in Kumasi (often called the Kumasi Cultural Centre) is the Ashanti Region’s public craft and performance campus: galleries, a craft market, open-air performance grounds and workshops for kente, wood, brass and drum — complementary to Manhyia Palace Museum and Kejetia.',
        'It is a working cultural bazaar and theatre yard in the city, not a reconstructed village. Prempeh II Jubilee Museum collections have historically been associated with this cultural-campus landscape.',
      ],
      [
        'Daytime craft shopping and occasional performances. Bargain fairly. Combine with Manhyia, Kejetia and the kente villages (Bonwire, Adanwomase) rather than treating the centre as a substitute for palace history. Watch belongings in crowds.',
      ],
      [
        ['Region', 'Ashanti Region — Kumasi'],
        ['Category', 'Regional cultural centre and craft campus'],
        ['Highlights', 'Craft market, performances, city-centre culture stop'],
        ['Pair with', 'Manhyia Palace Museum, Kejetia, Bonwire'],
      ],
      [
        'Post-independence cultural policy placed regional centres in the regional capitals. Kumasi’s centre is the Asante public square of crafts — commerce meeting chieftaincy tourism.',
        'Manhyia tells kingship; the cultural centre sells and stages the arts that surround the stool.',
      ]
    ),
  },
  {
    title: 'Fort St. Anthony, Axim',
    region: 'Western Region',
    category: 'History',
    location_contact: 'Axim, Western Region',
    lat: 4.869,
    lng: -2.241,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Axim%20Beach%20%26%20Lou%20Moon%20Resort.jpg',
    copy: entry(
      [
        'Fort St. Anthony (São António / Fort Santo Antonio) at Axim is a Portuguese-origin fort of the early 1500s on a rocky headland of the Nzema/Ahanta west coast — among the oldest European works in Ghana after Elmina. UNESCO component (1979). DigiTour already lists Axim Beach & Lou Moon; this entry isolates the monument itself.',
        'Whitewashed walls command the fishing harbour of Axim, a historic gold-and-later-slave port. Dutch then British occupations layered the fabric.',
      ],
      [
        'Walk from Axim town; GMMB hours when open. Combine with Axim Beach lodges, Cape Three Points and Fort Apollonia/Nzulezo further west. The rocks below are slippery. Confirm opening — western forts rotate conservation closures.',
      ],
      [
        ['Region', 'Western Region — Axim headland'],
        ['UNESCO', 'Forts and Castles of Ghana (1979)'],
        ['Built', 'Portuguese, early 16th century (often dated 1515)'],
        ['Highlights', 'Early Portuguese west-coast fort, harbour views, Nzema port town'],
      ],
      [
        'The Portuguese planted St. Anthony to tap western gold after Elmina. The Dutch seized it in the seventeenth century; Britain took over with the 1872 transfer of Dutch possessions.',
        'Axim’s dual listing — beach plus fort — matches how travellers actually use the town: swim and remember.',
      ]
    ),
  },
  {
    title: 'Kalakpa Resource Reserve',
    region: 'Volta Region',
    category: 'Nature & Wildlife',
    location_contact: 'Abutia / Kalakpa, near Ho, Volta Region',
    lat: 6.45,
    lng: 0.35,
    featured: 0,
    image_url: 'sources/images/all_tourist_sites/Shai%20Hills%20Resource%20Reserve.jpg',
    copy: entry(
      [
        'Kalakpa Resource Reserve (sometimes styled Kalakpa Game Production Reserve) lies in the dry forest and savanna mosaic south of Ho in the Volta Region — a Wildlife Division reserve of woodland, grassland and rocky hills used for antelope, primates and birds, with community-linked tourism from Abutia and nearby villages.',
        'It is a compact inland reserve, not Mole-scale. Trails and hill viewpoints are the product; lodging is village or Ho hotels.',
      ],
      [
        'From Ho (short drive toward Abutia). Arrange a ranger or community guide. Best in the dry season for walking. Combine with Wli / Afadja only as a separate highland trip — Kalakpa is the Ho lowland wildlife stop. Carry water; tsetse can occur.',
      ],
      [
        ['Region', 'Volta Region — Abutia / near Ho'],
        ['Managed by', 'Wildlife Division'],
        ['Highlights', 'Savanna-woodland walks, antelope, proximity to Ho'],
      ],
      [
        'Kalakpa was reserved to hold a Volta wildlife area as farming expanded on the Accra–Ho plains. Community conservation experiments (game production / ranching language in older files) mark Ghana’s search for models between national park and farm.',
        'It fills the gap between Shai Hills (closer to Accra) and Kyabobo (far north-east).',
      ]
    ),
  },
];

module.exports = { COPY, entry, NEW_SITES };
