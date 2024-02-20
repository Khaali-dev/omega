
export default function setupTextEnrichers() {

  console.log('=============================== Setting up enrichers ===============================')
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
        pattern: /@contenu\[(.+?)\]/gm,
        enricher: async (match, options) => {
            const myData = await $.ajax({
                url: match[1],
                type: 'GET',
            });
            const doc = document.createElement("span");
            doc.innerHTML = myData;
            return doc;
        }
    },
  ]);
}
