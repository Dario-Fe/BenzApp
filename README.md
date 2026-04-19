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
├── netlify.toml          # Configurazione Netlify (Redirect API)
└── netlify/
    └── functions/
        └── carburanti.js # Funzione serverless (Proxy CSV MIMIT → JSON)
```

## ⚙️ Come funziona

1. **Accesso**: L'utente apre `index.html`. La provincia preferita viene salvata nel browser (`localStorage`).
2. **Dati**: La pagina chiama l'endpoint `/api/carburanti?provincia=XX`.
3. **Serverless**: La funzione Netlify scarica i CSV ufficiali dal MIMIT, filtra i dati per la provincia richiesta e li unisce in un JSON ottimizzato. Implementa un sistema di **caching per provincia** per garantire risposte istantanee.
4. **Visualizzazione**: Il frontend riceve i dati, calcola le statistiche (min/media/max) e ordina i distributori dal più economico.

### ✨ Caratteristiche Avanzate

- **PWA Support**: Installabile su smartphone come app nativa grazie a `manifest.json`.
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
L'app sarà disponibile su `http://localhost:8888`.

### Deploy
Basta collegare il repository a Netlify. Il file `netlify.toml` configurerà automaticamente i redirect e la funzione serverless.

---

## ⚖️ Note Legali
Tutti i prezzi provengono dal portale ufficiale del Ministero delle Imprese e del Made in Italy. L'app è un'iniziativa privata, gratuita e dedicata alla comunità degli automobilisti del Piemonte.
