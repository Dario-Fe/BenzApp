# ⛽ BenzUp

Web app per confrontare i prezzi di benzina e gasolio nella provincia di Verbania (VCO), ordinati dal più conveniente al meno conveniente.

**Fonte dati:** Ministero delle Imprese e del Made in Italy (MIMIT) — Open Data ufficiali  
**Aggiornamento:** quotidiano alle ore 08:00

---

## 🚀 Deploy su Netlify (passo per passo)

### 1. Carica su GitHub

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/carburanti-vb.git
git push -u origin main
```

### 2. Collega a Netlify

1. Vai su [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Seleziona il tuo repository GitHub
3. Lascia le impostazioni di build vuote (non serve build step)
4. Clicca **Deploy site**

Netlify rileverà automaticamente il file `netlify.toml` e configurerà la funzione serverless.

### 3. Pronto!

L'app sarà disponibile su `https://nome-sito.netlify.app`

---

## 📁 Struttura del progetto

```
carburanti-vb/
├── index.html                    # Frontend (unico file HTML/CSS/JS)
├── netlify.toml                  # Configurazione Netlify
└── netlify/
    └── functions/
        └── carburanti.js         # Funzione serverless (proxy MIMIT)
```

## ⚙️ Come funziona

1. Il browser carica `index.html`
2. La pagina chiama `/api/carburanti` (→ `netlify/functions/carburanti.js`)
3. La funzione serverless scarica i due CSV dal MIMIT, filtra per provincia VB, unisce i dati
4. Restituisce un JSON leggero al browser
5. Il frontend ordina e mostra i distributori

**Cache:** i CSV MIMIT vengono riscaricati al massimo una volta per cold start della funzione — il consumo di banda su Netlify è minimo.

---

## 🔧 Sviluppo locale

Per testare in locale installa [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install -g netlify-cli
netlify dev
```

L'app sarà disponibile su `http://localhost:8888`
