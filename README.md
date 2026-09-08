# DigiTour Frontend (Static + DigiGuide AI)

National DigiTour Ghana portal for free **Netlify** hosting — no PHP and no SQL database.

## Architecture (how data works without a backend)

| Data | Where it lives | Why |
|------|----------------|-----|
| Destinations / hotels / seed reviews | `data/*.json` (static files) | Instant, free, versioned with the site |
| Accounts (register/login) | Browser `localStorage` (`dt_users`, `dt_user`) | Works offline on each device; no server DB needed |
| Bookings & user reviews | Browser `localStorage` + **Netlify Forms** | User sees them immediately; admin sees copies in Netlify → Forms |
| Inquiries | Netlify Forms (`inquiry`) + local copy | Real admin inbox on Netlify |
| DigiGuide answers | Netlify Function + Groq API | API key stays server-side |

**Important:** Clearing browser data removes that device’s local account/bookings. On production Netlify, Forms still retain inquiry/booking/review submissions for staff.

Demo logins still work: `kwame@example.com` / `demo123`.

## What’s included

- 122 destinations · 97 hotels · interactive **Map** (`map.html`)
- DigiGuide chatbot (Google-first search, then live DigiTour RAG catalogue)
- SEO: `robots.txt`, `sitemap.xml`, Open Graph, JSON-LD, canonical URLs
- PWA shell (`site.webmanifest` + `sw.js`) for basic offline access
- Share buttons, related destinations, booking QR ticket
- EN/FR language toggle + high-contrast mode
- Mobile drawer navigation

## DigiGuide (chat)

1. Set `GROQ_API_KEY` in Netlify → Environment variables  
2. Optional Google keys for first-pass web search: `GOOGLE_API_KEY` + `GOOGLE_CSE_ID`, or `SERPER_API_KEY`  
3. Or keep keys in local `.env` (gitignored)  
4. Local chat: `node server.js` or `netlify dev` — DigiGuide rebuilds from current `data/*.json` on each function cold start

## Deploy

1. Push / drag the full folder to Netlify (include `sources/`, `data/`, `netlify/functions/`)  
2. Set `GROQ_API_KEY`  
3. After first deploy, open **Forms** and confirm `inquiry`, `booking`, `review`, `registration` appear  
4. Submit Search Console with `https://digitourgh.netlify.app/sitemap.xml`

## Local preview

```bash
python -m http.server 8765
# or
node server.js
```

## Re-export catalogue from SQL

```bash
python _export_sql.py
```
