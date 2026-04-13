const fs = require('fs');
const path = require('path');

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const csvPath = path.resolve(__dirname, '../../annunci_vco.csv');

    if (!fs.existsSync(csvPath)) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: "File CSV non trovato." })
        };
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim());

    if (lines.length < 2) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ extractionDate: new Date(), annunci: [] })
        };
    }

    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const headers_csv = parseCSVLine(headerLine);

    const annunci = [];
    for (let i = 1; i < lines.length; i++) {
        const currentline = parseCSVLine(lines[i]);
        if (currentline.length < headers_csv.length) continue;

        const obj = {};
        for (let j = 0; j < headers_csv.length; j++) {
            obj[headers_csv[j]] = currentline[j];
        }

        annunci.push({
            id: obj.idAnnuncio,
            titolo: obj.titoloVacancy,
            azienda: obj.azienda,
            descrizione: obj.qualifica,
            comune: obj.descrComuneSede,
            provincia: obj.descrProvinciaSede,
            contratto: obj.contratto,
            dataScadenza: obj.dataScadenza,
            cpi: obj.descrCpi,
            link: `https://pslp.regione.piemonte.it/pslpwcl/pslpfcweb/consulta-annunci/dettaglio-annuncio/${obj.idAnnuncio}`
        });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        extractionDate: fs.statSync(csvPath).mtime,
        totale: annunci.length,
        annunci: annunci
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

function parseCSVLine(line) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = "";
        } else {
            cur += char;
        }
    }
    result.push(cur.trim());
    return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
}
