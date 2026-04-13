const fs = require('fs');
const path = require('path');

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const jsonPath = path.resolve(__dirname, '../../annunci_vco.json');

    if (!fs.existsSync(jsonPath)) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: "File JSON non trovato. Lo scraper potrebbe non aver ancora girato." })
        };
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const items = JSON.parse(rawData);

    // Mapping dei campi per il frontend
    const annunci = items.map(obj => ({
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
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        extractionDate: fs.statSync(jsonPath).mtime,
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
