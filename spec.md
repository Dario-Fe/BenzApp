# ⛽ BenzUp - Project Specification

## 1. Overview
**BenzUp** is a Progressive Web App (PWA) designed to provide real-time fuel price rankings for the Piedmont region in Italy. It aggregates data from the official Open Data portal of the Ministry of Business and Made in Italy (MIMIT) and presents it in a user-friendly, performance-optimized interface.

### Key Goals
- **Performance**: Sub-second response times using Netlify Edge Functions and CDN caching.
- **Accuracy**: Daily updates with reliability indicators based on data freshness.
- **Portability**: PWA support for native-like experience on mobile devices.
- **Privacy**: No client-side tracking, server-side data processing.

---

## 2. Architecture

### Frontend (SPA)
- **Tech Stack**: HTML5, CSS3 (Custom Variables), Vanilla JavaScript.
- **Pages**:
  - `index.html`: Main interface for ranking and details.
  - `infoutili.html`: Legal disclaimers, data source info, and reliability explanation.
- **Assets**:
  - `icon.svg`: Vector logo and loading indicator.
  - `manifest.json`: PWA configuration.

### Backend (Netlify)
- **Edge Layer** (`netlify/edge-functions/carburanti-edge.js`):
    - Intercepts `/api/carburanti`.
    - Manages CDN caching via `Netlify-CDN-Cache-Control`.
    - Implements dynamic TTL (expires daily at 08:00 UTC).
    - Local development detection for seamless proxying.
- **Serverless Layer** (`netlify/functions/carburanti.js`):
    - Fetches CSVs from MIMIT (`anagrafica_impianti_attivi.csv`, `prezzo_alle_8.csv`).
    - Parses and merges data.
    - Filters by province (`provincia` query parameter).
    - Implements secondary in-memory cache.

### Automation
- **GitHub Action** (`.github/workflows/warmup.yml`):
    - Scheduled daily at 08:05 UTC.
    - Monitors MIMIT for new data (via `Last-Modified` header).
    - Triggers sequential warm-up requests for all 8 Piedmontese provinces.

---

## 3. Technical Specifications

### API Endpoint: `/api/carburanti`
- **Method**: `GET`
- **Parameters**:
  - `provincia` (required, defaults to `VB`): Two-letter province code (AL, AT, BI, CN, NO, TO, VB, VC).
- **Response**: JSON object containing:
  - `extractionDate`: The date the data was extracted from MIMIT.
  - `totale`: Number of stations found.
  - `distributori`: Array of station objects (id, name, address, prices for Benzina/Gasolio/GPL/Metano, etc.).

### Caching Strategy
1. **CDN Level (Edge)**:
   - TTL calculated as seconds remaining until 08:00 UTC.
   - Cache key based on URL (path + `provincia` param).
   - Only successful (200 OK) responses are cached.
2. **Function Level**:
   - Simple in-memory cache indexed by province and current date.
   - Resets on cold start.

### Reliability Indicator (Traffic Light System)
Calculated by comparing the current date with the `aggiornato` field of each station:
- 🟢 **Green**: Updated today.
- 🟡 **Yellow**: Updated yesterday.
- 🔴 **Red**: Updated 2 or more days ago.

---

## 4. UI/UX Standards
- **Typography**: 'DM Sans' for general text, 'DM Mono' for prices and dates.
- **Color Palette**:
  - Background: `#f5f4f0`
  - Accent (Benzina/Success): `#1a6b3a`
  - Accent (Gasolio): `#1a3f6b`
  - Accent (GPL): `#8e44ad`
  - Accent (Metano): `#f39c12`
- **Loading State**: Pulsing ⛽ logo animation.
- **Responsiveness**: Horizontal scroll for fuel toggles on mobile, card-based layout for listings.

---

## 5. Deployment Configuration
- **Host**: Netlify.
- **Redirects**: Handled via `netlify.toml`.
- **Environment Variables**:
  - `BENZUP_URL`: Public URL of the app (required for GitHub Action warm-up).

---

## 6. Future Roadmap
- [ ] Integration with maps for proximity-based search.
- [ ] Historical price trends for each station.
- [ ] User alerts for price drops in preferred provinces.
