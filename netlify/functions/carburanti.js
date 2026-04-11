const https = require("https");

// Simple in-memory cache: resets on cold start (fine for daily data)
let cache = null;
let cacheDate = null;

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  // First line is extraction date, second is header
  const dataLine = lines[0]; // e.g. "Estrazione del 2026-03-30"
  const dateMatch = dataLine.match(/(\d{4}-\d{2}-\d{2})/);
  const extractionDate = dateMatch ? dateMatch[1] : null;

  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cols = lines[i].split("|");
    if (cols.length >= 10) {
      rows.push({
        idImpianto: cols[0]?.trim(),
        gestore: cols[1]?.trim(),
        bandiera: cols[2]?.trim(),
        tipoImpianto: cols[3]?.trim(),
        nome: cols[4]?.trim(),
        indirizzo: cols[5]?.trim(),
        comune: cols[6]?.trim(),
        provincia: cols[7]?.trim(),
        lat: parseFloat(cols[8]?.trim()),
        lng: parseFloat(cols[9]?.trim()),
      });
    }
  }
  return { rows, extractionDate };
}

function parsePrezzi(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const prezzi = {};
  for (let i = 2; i < lines.length; i++) {
    const cols = lines[i].split("|");
    if (cols.length >= 5) {
      const id = cols[0]?.trim();
      let carburante = cols[1]?.trim().toLowerCase();
      if (carburante.includes("gpl")) carburante = "gpl";
      if (carburante.includes("metano")) carburante = "metano";
      
      const prezzo = parseFloat(cols[2]?.trim());
      const isSelf = cols[3]?.trim() === "1";
      const dtComu = cols[4]?.trim();
      if (!prezzi[id]) prezzi[id] = {};
      const key = isSelf ? `${carburante}_self` : `${carburante}_servito`;
      prezzi[id][key] = { prezzo, dtComu };
      // Also store raw list for detail
      if (!prezzi[id].all) prezzi[id].all = [];
      prezzi[id].all.push({
        carburante: cols[1]?.trim(),
        prezzo,
        isSelf,
        dtComu,
      });
    }
  }
  return prezzi;
}

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const today = new Date().toISOString().split("T")[0];

    // Use cache if same day
    if (cache && cacheDate === today) {
      return { statusCode: 200, headers, body: JSON.stringify(cache) };
    }

    const [anagraficaText, prezziText] = await Promise.all([
      fetchCSV("https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv"),
      fetchCSV("https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv"),
    ]);

    const { rows: impianti, extractionDate } = parseCSV(anagraficaText);
    const prezzi = parsePrezzi(prezziText);

    // Filter only VB province
    const impiantiVB = impianti.filter((i) => i.provincia === "VB");

    // Merge with prices
    const distributori = impiantiVB.map((imp) => {
      const p = prezzi[imp.idImpianto] || {};
      return {
        id: imp.idImpianto,
        nome: imp.nome,
        gestore: imp.gestore,
        bandiera: imp.bandiera,
        indirizzo: imp.indirizzo,
        comune: imp.comune,
        lat: imp.lat,
        lng: imp.lng,
        benzina_self: p.benzina_self?.prezzo ?? null,
        benzina_servito: p.benzina_servito?.prezzo ?? null,
        gasolio_self: p.gasolio_self?.prezzo ?? null,
        gasolio_servito: p.gasolio_servito?.prezzo ?? null,
        gpl_self: p.gpl_self?.prezzo ?? null,
        gpl_servito: p.gpl_servito?.prezzo ?? null,
        metano_self: p.metano_self?.prezzo ?? null,
        metano_servito: p.metano_servito?.prezzo ?? null,
        aggiornato: p.all?.[0]?.dtComu ?? null,
        prezziDettaglio: p.all ?? [],
      };
    });

    const result = {
      extractionDate,
      totale: distributori.length,
      distributori,
    };

    cache = result;
    cacheDate = today;

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
