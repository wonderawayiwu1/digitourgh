# DigiTour Frontend (Static + DigiGuide AI)

Static DigiTour Ghana site for free Netlify hosting, plus a serverless **DigiGuide** chatbot (Groq).

## Features

- 105 destinations · 97 hotels · reviews · demo auth/bookings (`localStorage`)
- Smooth landing page (hero video only — no full-page video backdrops)
- Mobile-friendly header with slide-over drawer (no Bootstrap hamburger collapse)
- **DigiGuide** chat: DigiTour catalogue context + DuckDuckGo/Wikipedia web fallback

## Demo login

| Email | Password |
|-------|----------|
| kwame@example.com | demo123 |
| adwoa@example.com | demo123 |

## DigiGuide setup (required for chat)

1. Create a free key at [console.groq.com](https://console.groq.com)
2. Keep it in `.env` locally (already gitignored):

```env
GROQ_API_KEY=gsk_...
```

3. On Netlify: **Site settings → Environment variables → Add `GROQ_API_KEY`**
4. Local chat testing (functions need Netlify CLI):

```bash
npm i -g netlify-cli
netlify login
netlify dev
```

Open the URL Netlify prints (usually `http://localhost:8888`). Live Server (`:5500`) serves HTML only — the chat API will not run there.

## Local static preview (no chat)

```bash
python -m http.server 8765
```

## Deploy to Netlify

Drag the folder to [Netlify Drop](https://app.netlify.com/drop) **or** connect the Git repo.

**Must include:** `sources/`, `data/`, `netlify/functions/`, and set `GROQ_API_KEY` in Netlify env.

## Security

- Never commit `.env`
- If a Groq key was pasted in chat or committed, **rotate it** in the Groq console

## Re-export data

```bash
python _export_sql.py
```
