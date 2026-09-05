# DigiTour Frontend (Static)

Static rebuild of the DigiTour Ghana PHP/MySQL portal for free Netlify hosting.
All catalogue data lives in `data/*.json`. Auth, bookings, and inquiries use `localStorage` (demo mode).

## What's included

- **105 destinations** and **97 hotels** exported from `digitour_db.sql`
- Real media under `sources/` (destination photos, hotel photos, hero videos, logos)
- Amazon-gold UI, bento grids, Trip Planner, currency switcher, Call/WhatsApp floats
- Smooth landing page (hero video only — no full-page video backdrops while scrolling)

## Demo login

| Email | Password |
|-------|----------|
| kwame@example.com | demo123 |
| adwoa@example.com | demo123 |

## Local preview

Serve over HTTP (required for `fetch` of JSON):

```bash
cd DigiTour_Frontend
python -m http.server 8765
```

Open `http://localhost:8765`

Or use Live Server / VS Code — avoid opening `index.html` as a `file://` URL.

## Deploy to Netlify

1. Drag the entire `DigiTour_Frontend` folder (including `sources/` and `data/`) onto [Netlify Drop](https://app.netlify.com/drop), **or**
2. Connect the repo and leave `netlify.toml` as-is (`publish = "."`).

**Important:** Keep `sources/` inside the publish folder so images and hero videos load.

## Re-export data after SQL or media changes

```bash
python _export_sql.py
```

This rematches every destination/hotel title to files in `sources/` the same way the PHP backend did.
