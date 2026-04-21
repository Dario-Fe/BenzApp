# ⛽ BenzUp - Piemonte

Web app per confrontare i prezzi dei carburanti nelle province del **Piemonte**, ordinati dal più conveniente al meno conveniente.

**Fonte dati:** Ministero delle Imprese e del Made in Italy (MIMIT) — Open Data ufficiali  
**Aggiornamento:** Quotidiano alle ore 08:00  
**Province supportate:** VCO, Novara, Torino, Vercelli, Biella, Alessandria, Asti, Cuneo.  
**Caratteristiche:** Ultra-leggera, installabile come App (PWA), privacy-first.

---

## 📁 Struttura del progetto

```
benzup/
├── index.html            # App principale (Classifica prezzi)
├── infoutili.html        # Pagina informativa (Fonte dati e disclaimers)
├── icon.svg              # Logo personalizzato (SVG ultra-leggero)
├── manifest.json         # Configurazione per installazione Web App (PWA)
├── netlify.toml          # Configurazione Netlify (Redirect e Edge Functions)
└── netlify/
    ├── edge-functions/
    │   └── carburanti-edge.js # Middleware di caching CDN (Ultra-veloce)
    └── functions/
        └── carburanti.js # Funzione serverless (Proxy CSV MIMIT → JSON)
```

## ⚙️ Come funziona

1. **Accesso**: L'utente apre `index.html`. La provincia preferita viene salvata nel browser (`localStorage`).
2. **Dati**: La pagina chiama l'endpoint `/api/carburanti?provincia=XX`.
3. **Edge Caching**: Una **Netlify Edge Function** intercetta la richiesta. Se i dati sono già presenti nella CDN di Netlify, risponde istantaneamente (<500ms).
4. **Elaborazione**: Se i dati non sono in cache (prima richiesta del giorno), la Edge Function chiama la funzione serverless. Questa scarica i CSV dal MIMIT, filtra i dati per la provincia richiesta e li unisce.
5. **Persistenza**: La risposta viene memorizzata nella CDN di Netlify con scadenza automatica alle **08:00 UTC** di ogni giorno, garantendo dati sempre freschi con prestazioni massime.

### ✨ Caratteristiche Avanzate

- **PWA Support**: Installabile su smartphone come app nativa grazie a `manifest.json`.
- **CDN Global Cache**: Grazie alle Edge Functions, i tempi di risposta sono ridotti del 90% rispetto a una funzione serverless standard.
- **4 Carburanti**: Supporto completo per **Benzina**, **Gasolio**, **GPL** e **Metano**.
- **Indicatore Attendibilità (Semaforo)**: Un sistema a colori accanto al nome del distributore indica la freschezza del dato comunicato al Ministero:
  - 🟢 **Verde**: Aggiornato oggi.
  - 🟡 **Giallo**: Aggiornato ieri.
  - 🔴 **Rosso**: Non aggiornato da 2 o più giorni.
- **UX Reattiva**: Animazione dell'icona (pulsing) e messaggi di stato durante il caricamento tra province.

---

## 🚀 Sviluppo e Deploy su Netlify

### Sviluppo locale
Per testare in locale installa la [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install -g netlify-cli
netlify dev
```
L'app sarà disponibile su `http://localhost:8888`. Netlify Dev simulerà sia le Edge Functions che le funzioni serverless.

### Deploy
Basta collegare il repository a Netlify. Il file `netlify.toml` configurerà automaticamente i redirect, le Edge Functions e le funzioni serverless.

---

## ⚖️ Note Legali
Tutti i prezzi provengono dal portale ufficiale del Ministero delle Imprese e del Made in Italy. L'app è un'iniziativa privata, gratuita e dedicata alla comunità degli automobilisti del Piemonte.
