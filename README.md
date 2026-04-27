# ⛽ BenzUp - Piemonte

Web app per confrontare i prezzi dei carburanti nelle province del **Piemonte**, ordinati dal più conveniente al meno conveniente.

**Fonte dati:** Ministero delle Imprese e del Made in Italy (MIMIT) — Open Data ufficiali  
**Aggiornamento:** Quotidiano (automatico)
**Province supportate:** VCO, Novara, Torino, Vercelli, Biella, Alessandria, Asti, Cuneo.  
**Caratteristiche:** Ultra-leggera, installabile come App (PWA), privacy-first.

---

## 📁 Struttura del progetto

```
benzup/
├── .github/
│   └── workflows/
│       └── warmup.yml    # GitHub Action per la generazione dei JSON
├── data/
│   ├── VB.json           # Dati statici per provincia
│   └── ...               # Altre province (AL, AT, BI, CN, NO, TO, VC)
├── index.html            # App principale (Frontend statico)
├── infoutili.html        # Pagina informativa (Fonte dati e disclaimers)
├── icon.svg              # Logo personalizzato (SVG ultra-leggero)
├── manifest.json         # Configurazione per installazione Web App (PWA)
├── netlify.toml          # Configurazione Netlify (Hosting statico)
└── spec.md               # Specifiche tecniche dettagliate
```

## ⚙️ Come funziona

1. **Generazione Dati**: Una **GitHub Action** gira ogni 30 minuti (dalle 06:00 alle 14:00 UTC). Controlla se il MIMIT ha pubblicato nuovi dati, scarica i CSV, li processa e genera file JSON statici per ogni provincia piemontese.
2. **Distribuzione**: I file JSON vengono salvati nella cartella `data/` del repository. Netlify serve questi file direttamente tramite la sua CDN globale.
3. **Frontend**: L'utente apre `index.html`. La pagina rileva la provincia e scarica il file corrispondente (es. `/data/VB.json`).
4. **Freshness**: Viene applicato un parametro di cache-busting `?v=YYYY-MM-DD` per garantire che il browser scarichi la versione più recente una volta al giorno.

### ✨ Caratteristiche Avanzate

- **PWA Support**: Installabile su smartphone come app nativa.
- **Static Architecture**: Massima velocità di caricamento e affidabilità.
- **4 Carburanti**: Supporto completo per **Benzina**, **Gasolio**, **GPL** e **Metano**.
- **Filtro Comuni**: Menu a discesa per filtrare rapidamente i distributori per singolo comune.
- **Indicatore Attendibilità (Semaforo)**: Sistema a colori basato sulla data di comunicazione del prezzo al Ministero.
- **Segnalazione Problemi**: Modulo integrato via **Netlify Forms** per segnalare impianti chiusi o prezzi errati direttamente dalla scheda di dettaglio.

---

## 🚀 Sviluppo locale

Per testare in locale:

```bash
# Avvia un server locale (es. con Live Server o python)
python3 -m http.server 8000
```
L'app leggerà i JSON presenti nella cartella `data/`.

---

## ⚖️ Note Legali
Tutti i prezzi provengono dal portale ufficiale del Ministero delle Imprese e del Made in Italy. L'app è un'iniziativa privata, gratuita e dedicata alla comunità degli automobilisti del Piemonte.
