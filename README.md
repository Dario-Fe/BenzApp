# ⛽ BenzUp - VCO

Web app per confrontare i prezzi di benzina e gasolio nella provincia del **Verbano-Cusio-Ossola (VCO)**, ordinati dal più conveniente al meno conveniente.

**Fonte dati:** Ministero delle Imprese e del Made in Italy (MIMIT) — Open Data ufficiali  
**Aggiornamento:** quotidiano alle ore 08:00  
**Caratteristiche:** Ultra-leggera, installabile come App (PWA), privacy-first.

---

## 📁 Struttura del progetto

```
benzup-vco/
├── index.html            # App principale (Classifica prezzi)
├── infoutili.html        # Pagina informativa (Fonte dati e disclaimers)
├── icon.svg              # Logo personalizzato (SVG ultra-leggero)
├── manifest.json         # Configurazione per installazione Web App (PWA)
├── netlify.toml          # Configurazione Netlify (Redirect API)
└── netlify/
    └── functions/
        └── carburanti.js # Funzione serverless (Proxy CSV MIMIT → JSON)
```

## ⚙️ Come funziona

1. **Accesso**: L'utente apre `index.html` (o l'app installata sulla home).
2. **Dati**: La pagina chiama l'endpoint `/api/carburanti`.
3. **Serverless**: La funzione Netlify scarica i CSV ufficiali dal MIMIT, filtra i dati per la provincia del VCO e li unisce.
4. **Visualizzazione**: Il frontend riceve un JSON leggero, ordina i distributori dal più economico e applica una codifica a colori (verde per i più convenienti, rosso per i più cari).

### ✨ Novità: PWA Support
BenzUp è ora una **Progressive Web App**. Grazie al file `manifest.json` e all'icona `icon.svg` (un'emoji ⛽ perfettamente centrata), puoi aggiungere l'app alla schermata home del tuo smartphone per aprirla istantaneamente come se fosse un'app nativa.

---

## 🚀 Sviluppo e Deploy su Netlify

### Sviluppo locale
Per testare in locale installa la [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install -g netlify-cli
netlify dev
```
L'app sarà disponibile su `http://localhost:8888`.

### Deploy
Basta collegare il repository a Netlify. Il file `netlify.toml` configurerà automaticamente i redirect e la funzione serverless.

---

## ⚖️ Note Legali
Tutti i prezzi provengono dal portale ufficiale del Ministero delle Imprese e del Made in Italy. L'app è un'iniziativa privata, gratuita e dedicata alla comunità degli automobilisti del VCO.
