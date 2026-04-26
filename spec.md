# ⛽ BenzUp - Project Specification

## 1. Overview
**BenzUp** is a Progressive Web App (PWA) designed to provide real-time fuel price rankings for the Piedmont region in Italy. It aggregates data from the official Open Data portal of the Ministry of Business and Made in Italy (MIMIT) and serves it via static JSON files for maximum performance and reliability.

### Key Goals
- **Performance**: Instant data loading using static JSON files served via Netlify CDN.
- **Accuracy**: Daily updates triggered by a GitHub Action after MIMIT publication.
- **Portability**: PWA support for native-like experience on mobile devices.
- **Privacy**: Privacy-first approach with no client-side tracking, utilizing Cloudflare Web Analytics (privacy-focused).

---

## 2. Architecture

### Frontend (SPA)
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript.
- **Data Loading**: Fetches static JSON files from `/data/{PROVINCIA}.json`.
- **Cache Busting**: Uses a `?v=YYYY-MM-DD` (UTC) query parameter to ensure daily freshness.
- **Interaction**: Includes a reporting system integrated with Netlify Forms.

### Data Generation (DevOps)
- **GitHub Action** (`.github/workflows/warmup.yml`):
    - **Schedule**: Every 30 minutes from 06:00 to 14:00 UTC.
    - **Intelligent Check**: First verifies local data freshness via `generatedAt` field to avoid redundant MIMIT requests and commits.
    - **Process**: Downloads CSVs, parses data for 8 Piedmont provinces, and updates repository static assets.

---

## 3. Technical Specifications

### Static Data Files: `/data/{PROVINCIA}.json`
- **Structure**:
    ```json
    {
      "extractionDate": "YYYY-MM-DD",
      "generatedAt": "ISO timestamp UTC",
      "totale": 123,
      "distributori": [...]
    }
    ```

### User Feedback System (Netlify Forms)
- **Form Name**: `segnalazioni`
- **Implementation**: 
    - A hidden "skeleton" form is present in the static HTML for build-time detection.
    - A dynamic form is injected into the station detail panel.
- **Fields**:
    - `id-impianto`, `nome-impianto`, `indirizzo`, `comune`, `provincia` (hidden, auto-filled).
    - `messaggio` (Textarea, max 200 chars).
- **Submission**: AJAX via `fetch` API using `application/x-www-form-urlencoded`.

### Reliability Indicator (Traffic Light System)
- 🟢 **Green**: Updated today.
- 🟡 **Yellow**: Updated yesterday.
- 🔴 **Red**: Updated 2 or more days ago.

---

## 4. UI/UX Standards
- **Typography**: 'DM Sans' (general), 'DM Mono' (data).
- **Analytics**: Cloudflare Web Analytics beacon for non-invasive monitoring.
- **Responsiveness**: Mobile-first design with horizontal fuel toggles.

---

## 5. Deployment Configuration
- **Host**: Netlify.
- **Forms**: Enabled via Netlify Forms (handled automatically by build-time crawler).
- **Analytics**: Configured via Cloudflare dashboard.