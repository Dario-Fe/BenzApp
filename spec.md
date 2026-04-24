# ⛽ BenzUp - Project Specification

## 1. Overview
**BenzUp** is a Progressive Web App (PWA) designed to provide real-time fuel price rankings for the Piedmont region in Italy. It aggregates data from the official Open Data portal of the Ministry of Business and Made in Italy (MIMIT) and serves it via static JSON files for maximum performance and reliability.

### Key Goals
- **Performance**: Instant data loading using static JSON files served via Netlify CDN.
- **Accuracy**: Daily updates triggered by a GitHub Action after MIMIT publication.
- **Portability**: PWA support for native-like experience on mobile devices.
- **Privacy**: Privacy-first approach with no client-side tracking.

---

## 2. Architecture

### Frontend (SPA)
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript.
- **Data Loading**: Fetches static JSON files from `/data/{PROVINCIA}.json`.
- **Cache Busting**: Uses a `?v=YYYY-MM-DD` (UTC) query parameter to ensure daily freshness.
- **Pages**:
  - `index.html`: Main interface for ranking and details.
  - `infoutili.html`: Legal disclaimers and information.

### Data Generation (DevOps)
- **GitHub Action** (`.github/workflows/warmup.yml`):
    - **Schedule**: Every 30 minutes from 08:00 to 14:00 UTC.
    - **Logic**:
        1. Checks MIMIT `Last-Modified` header.
        2. If updated today and not yet processed, downloads CSVs.
        3. Parses CSVs and generates one JSON file per Piedmont province.
        4. Commits and pushes the JSON files to the `data/` directory in the main branch.
- **Storage**: JSON files are stored in the `data/` directory at the root of the repository.

### Backend (Netlify - Legacy/Inactive)
- **Edge Functions** & **Serverless Functions**: Remains in the repository but disabled in `netlify.toml`. Replaced by static JSON delivery.

---

## 3. Technical Specifications

### Static Data Files: `/data/{PROVINCIA}.json`
- **Format**: JSON
- **Structure**:
    ```json
    {
      "extractionDate": "YYYY-MM-DD",
      "generatedAt": "ISO timestamp UTC",
      "totale": 123,
      "distributori": [...]
    }
    ```
- **Provinces**: AL, AT, BI, CN, NO, TO, VB, VC.

### Reliability Indicator (Traffic Light System)
Calculated in the frontend by comparing the `extractionDate` from the JSON with the `aggiornato` field of each station:
- 🟢 **Green**: Updated today.
- 🟡 **Yellow**: Updated yesterday.
- 🔴 **Red**: Updated 2 or more days ago.

---

## 4. UI/UX Standards
- **Typography**: 'DM Sans' for general text, 'DM Mono' for prices and dates.
- **Loading State**: Pulsing ⛽ logo animation during data fetch.
- **Responsiveness**: Optimized for mobile devices with horizontal fuel toggles.

---

## 5. Deployment Configuration
- **Host**: Netlify.
- **Publish Directory**: `.` (Root).
- **Automation**: GitHub Actions for data updates and Netlify for static site hosting.

---

## 6. Future Roadmap
- [ ] Integration with maps for proximity-based search.
- [ ] Historical price trends using Git history of JSON files.
- [ ] User alerts for price drops.
