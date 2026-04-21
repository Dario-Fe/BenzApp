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
├── .github/
│   └── workflows/
│       └── warmup.yml    # GitHub Action per il warm-up della cache
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
4. **Elaborazione**: Se i dati non sono in cache, la Edge Function chiama la funzione serverless. Questa scarica i CSV dal MIMIT, filtra i dati e li unisce.
5. **Persistenza**: La risposta viene memorizzata nella CDN di Netlify con scadenza automatica alle **08:00 UTC** di ogni giorno.
6. **Automazione (Warm-up)**: Ogni mattina alle 08:05 UTC, una **GitHub Action** verifica se il MIMIT ha pubblicato i nuovi dati e "scalda" la cache per tutte le province, garantendo risposte immediate ai primi utenti.

### ✨ Caratteristiche Avanzate

- **PWA Support**: Installabile su smartphone come app nativa grazie a `manifest.json`.
- **CDN Global Cache**: Grazie alle Edge Functions, i tempi di risposta sono ridotti del 90%.
- **Automated Warm-up**: Cache pre-popolata ogni mattina per evitare colli di bottiglia al primo accesso.
- **4 Carburanti**: Supporto completo per **Benzina**, **Gasolio**, **GPL** e **Metano**.
- **Indicatore Attendibilità (Semaforo)**: Segnala la freschezza del dato (Verde: oggi, Giallo: ieri, Rosso: 2+ giorni).

---

## 🚀 Sviluppo e Deploy

### Sviluppo locale
Per testare in locale installa la [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install -g netlify-cli
netlify dev
```

### GitHub Actions
Per far funzionare il warm-up automatico, aggiungi un Secret al repository GitHub:
- **`BENZUP_URL`**: L'URL pubblico della tua istanza Netlify (es. `https://nome-app.netlify.app`).

### Deploy
Basta collegare il repository a Netlify. Il file `netlify.toml` configurerà automaticamente i redirect e le funzioni.

---

## ⚖️ Note Legali
Tutti i prezzi provengono dal portale ufficiale del Ministero delle Imprese e del Made in Italy. L'app è un'iniziativa privata, gratuita e dedicata alla comunità degli automobilisti del Piemonte.
