# DigiTour Ghana — Deploy to Netlify (step by step)

This site is **static HTML/CSS/JS** plus **Netlify Functions**. There is **no PHP** and **no MySQL**.

## Important: how “JSON storage” works on Netlify

Netlify’s published folder is **read-only** after deploy. Functions **cannot permanently append** to `data/users.json` on the live disk.

DigiTour therefore:

1. **Seeds** from `data/*.json` (users, reviews, bookings, inquiries, destinations, hotels).
2. **Saves live writes** with **Netlify Blobs** (free) through Functions:
   - `/.netlify/functions/auth`
   - `/.netlify/functions/reviews`
   - `/.netlify/functions/inquiries`
   - `/.netlify/functions/bookings`
3. Also keeps a **browser cache** (localStorage) so the dashboard feels instant.

You still edit seed catalogue files under `data/` in Git; live registrations/reviews/bookings go to Blobs.

---

## 1) Prepare the project on your PC

1. Install [Node.js LTS](https://nodejs.org/) (includes `npm`).
2. Install [Git](https://git-scm.com/) if needed.
3. Open a terminal in this folder:

```bash
cd c:\wamp64\www\DigiTour_Frontend
npm install
```

4. (Optional local test with Functions)

```bash
npm install -g netlify-cli
netlify login
netlify dev
```

Open the URL Netlify prints (usually `http://localhost:8888`).

---

## 2) Map tiles (localhost + Netlify)

The map works in **two modes**:

1. **MapTiler** (if your key allows the current domain)
2. **Free fallback** — Esri satellite + OpenStreetMap (no key required)

On first load the site **probes** MapTiler. If the key is missing, blocked, or fails on Netlify, it **auto-switches** to free tiles so you can still test pins/popups locally and in production.

### Local testing
- Open `map.html` on WAMP / Live Server — map should load even without MapTiler.
- Force free tiles: `map.html?map=fallback`
- Force MapTiler: `map.html?map=maptiler`
- Save a key in the browser:  
  `localStorage.setItem('dt_maptiler_key', 'YOUR_KEY')` then reload  
  or open `map.html?maptiler_key=YOUR_KEY`

### Netlify / MapTiler Cloud
- Key lives in `data/meta.json` → `maptiler_api_key` (and default in `map.js`).
- In [MapTiler Cloud](https://cloud.maptiler.com/) → your key → allow:
  - `http://localhost` / your local port
  - `https://YOUR-SITE.netlify.app`
- Until that is set, production still works via the **free tile fallback**.

---

## 3) Groq + Google keys for DigiGuide chatbot

In Netlify → Site settings → Environment variables:

- `GROQ_API_KEY` = your Groq key (no spaces) — required for answers
- **Google search (recommended)** — DigiGuide searches Google first, then DigiTour RAG:
  - Option A: `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` (Google Programmable Search / Custom Search JSON API)
  - Option B: `SERPER_API_KEY` ([serper.dev](https://serper.dev) Google SERP API)
- If those Google keys are missing, DigiGuide still tries a Google HTML search, then Wikipedia / Wikivoyage, then the live DigiTour catalogue (`data/destinations.json`, `data/hotels.json`, `data/geo.json`, `data/reviews.json`, `data/meta.json`).

Local chat with the retrained pipeline: `node server.js` then open `http://localhost:8888`.

---

## 4) Deploy with Git (recommended)

1. Create a GitHub/GitLab repo and push this project.
2. Go to [https://app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Build settings:
   - **Build command:** `npm install` (or leave the `netlify.toml` command)
   - **Publish directory:** `.` (site root)
   - **Functions directory:** `netlify/functions` (already in `netlify.toml`)
4. Click **Deploy**.
5. After deploy, open:
   - `https://YOUR-SITE.netlify.app`
   - `https://YOUR-SITE.netlify.app/map.html` (3D MapTiler)
   - Login demo: `kwame@example.com` / `demo123`

Update `data/meta.json` → `site_url` to your real Netlify URL, then redeploy.

---

## 5) Deploy by drag-and-drop (quick)

1. Run `npm install` locally once so `node_modules` exists for Functions bundling **or** let Netlify run `npm install` during build.
2. Prefer Git deploy. Pure drag-and-drop of the folder may not install Function dependencies correctly unless Netlify build runs `npm install`.

Recommended `netlify.toml` build command (already close):

```toml
[build]
  publish = "."
  command = "npm install"
  functions = "netlify/functions"
```

---

## 6) After go-live checklist

- [ ] EN / FR buttons translate the page (Google Translate cookie)
- [ ] Help button → Call / WhatsApp (`0546004395`)
- [ ] Map loads satellite / streets 3D (MapTiler)
- [ ] Register / Login works
- [ ] Book hotel → appears on Dashboard (+50 points)
- [ ] Leave a review (+15 points)
- [ ] Inquiry form submits
- [ ] Offline itinerary download from Dashboard
- [ ] DigiGuide chat answers (if `GROQ_API_KEY` set)
- [ ] Submit sitemap in Google Search Console: `https://YOUR-SITE.netlify.app/sitemap.xml`

---

## 7) Custom domain (optional)

Netlify → Domain management → Add domain → follow DNS instructions.

---

## Demo credentials

- Email: `kwame@example.com`
- Password: `demo123`
