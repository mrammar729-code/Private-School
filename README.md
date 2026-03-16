# Pakistan Problem Reporter

A lightweight mobile/web-first prototype for reporting civic issues in Pakistan and viewing transparency data.

## Features implemented

- Issue reporting with map pinning, category, urgency, and description.
- National live map with filter by city/category/status and marker detail panel.
- One-tap complaint links for electricity, water, garbage, and corruption authorities.
- Community chat room UI with room switching.
- Urdu/English language toggle.
- Gamification badges based on reporter activity.
- Transparency Dashboard tab with:
  - Budget tracker cards
  - Project status and delay reason
  - Corruption alerts
  - Development map overlay with progress color coding
  - Budget pie visualization and project timeline
  - Source links list for public data references

## Tech notes

- Built as static frontend (HTML/CSS/JS) with Leaflet map tiles.
- No-code integration points are documented in UI for Glide + Google Sheets + Zapier + Firebase/Socket.io.
- Data is persisted locally in browser `localStorage` for demo purposes.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
