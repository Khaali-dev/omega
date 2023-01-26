(() => {
  let dialog_content = `  
    <div class="dialog">
        <div style="width:100%; text-align:center">
            <h3>Importation de PNJ</h3>
        </div>
        <div class="advantage">
            <label for="npcname">Nom du personnage</label>
            <input name="npcname" type="text">
        </div>
        <div class="advantage">
            <label for="npctext">Collez ici les données du PNJ depuis le PDF</label>
            <input name="npctext" type="text">
        </div>
        <div class="advantage">
            <label for="actortype">Type de personnage</label>
            <select name="actortype" id="actor-select">
                <option value="advancedsynth">Synthetique avancé</option>
                <option value="synthetique">Synthetique</option>
                <option value="organique">Organique</option>
            </select>
        </div>
        <div class="advantage">
            <label for="extensions">Extensions</label>
            <input name="extensions" type="text">
        </div>
        <div class="advantage">
            <label for="description">Description</label>
            <input name="description" type="text">
        </div>
    </div>`;

  let x = new Dialog({
    content: dialog_content,
    buttons: {
      Ok: {
        label: `Ok`,
        callback: async (html) =>
          await extractAllData(
            html.find("[name=npcname]")[0].value,
            html.find("[name=npctext]")[0].value,
            html.find("[name=actortype]")[0].value,
            html.find("[name=extensions]")[0].value,
            html.find("[name=description]")[0].value
          ),
      },
      Cancel: { label: `Cancel` },
    },
  });

  x.options.width = 400;
  x.position.width = 400;

  x.render(true);
})();

async function extractAllData(npcRawName, npcRawData, npcType, extensionRaw, descriptionRaw) {
  let npcData = npcRawData.replace(/[\r|\n]/g, "");
  let extensionsData = extensionRaw.replace(/[\r|\n]/g, "");
  //console.log("npcRawData: ", npcRawData);

  let extractData = function (inputData, inputPattern) {
    let tmp = inputData.match(inputPattern);
    //     console.log("tmp: ", tmp);

    if (tmp != null && tmp.length >= 2) {
      // successful match
      return tmp[1];
    }
    return "";
  };

  let extractMultData = function (inputData, inputPattern) {
    let tmp = inputData.match(inputPattern);
    //console.log("tmp: ", tmp);

    if (tmp != null && tmp.length >= 1) {
      return tmp;
    }
    return [];
  };

  let cleanUpText = function (textBlob) {
    if (!textBlob) return "";
    if (textBlob.length === 0) return "";
    textBlob = textBlob.trim();
    if (textBlob.length === 0) return "";
    let cleanData = textBlob.charAt(0).toUpperCase() + textBlob.slice(1);
    return cleanData;
  };
  let cleanUpTextLow = function (textBlob) {
    if (!textBlob) return "";
    if (textBlob.length === 0) return "";
    textBlob = textBlob.trim();
    if (textBlob.length === 0) return "";
    let cleanData = textBlob.charAt(0).toUpperCase() + textBlob.slice(1).toLowerCase();
    return cleanData;
  };

  let expectedData = npcData.replace(/- /g, "");

  let pattern = /^(.+?) \(/;
  let attributePattern;
  let resultData;
  
  const cleanName = npcRawName;
  
  let description = descriptionRaw.replace(/[\r|\n]/g, "");

  let newValues = {
    name: cleanName,
    type: npcType,
    folder: null,
    sort: 12000,
    system: {},
    token: {},
    items: [],
    flags: {},
  };

  let system;
  if (npcType === "advancedsynth") {
    system = {
      programmes: {
        basededonnees: {
          value: 2,
          label: "OMEGA.label.programmes.basededonnees",
        },
        connexion: {
          value: 2,
          label: "OMEGA.label.programmes.connexion",
        },
        contremesure: {
          value: 2,
          label: "OMEGA.label.programmes.contremesure",
        },
        dissipateur: {
          value: 2,
          label: "OMEGA.label.programmes.dissipateur",
        },
        hacking: {
          value: 2,
          label: "OMEGA.label.programmes.hacking",
        },
        omega: {
          value: 2,
          label: "OMEGA.label.programmes.omega",
        },
        armesaenergie: {
          value: 2,
          label: "OMEGA.label.programmes.armesaenergie",
        },
        detecteur: {
          value: 2,
          label: "OMEGA.label.programmes.detecteur",
        },
        defense: {
          value: 2,
          label: "OMEGA.label.programmes.defense",
        },
        energie: {
          value: 2,
          label: "OMEGA.label.programmes.energie",
        },
        exterminateur: {
          value: 2,
          label: "OMEGA.label.programmes.exterminateur",
        },
        resistance: {
          value: 2,
          label: "OMEGA.label.programmes.resistance",
        },
        artillerie: {
          value: 2,
          label: "OMEGA.label.programmes.artillerie",
        },
        tactique: {
          value: 2,
          label: "OMEGA.label.programmes.tactique",
        },
        reprogrammation: {
          value: 2,
          label: "OMEGA.label.programmes.reprogrammation",
        },
        neutralisationcognitive: {
          value: 2,
          label: "OMEGA.label.programmes.neutralisationcognitive",
        },
        recherche: {
          value: 2,
          label: "OMEGA.label.programmes.recherche",
        },
        cybernetique: {
          value: 2,
          label: "OMEGA.label.programmes.cybernetique",
        },
        ingenierie: {
          value: 2,
          label: "OMEGA.label.programmes.ingenierie",
        },
        chirurgie: {
          value: 2,
          label: "OMEGA.label.programmes.chirurgie",
        },
      },
      caracteristiques: {
        ia: {
          value: 2,
          label: "OMEGA.label.programmes.ia",
        },
        cpu: {
          value: 2,
          label: "OMEGA.label.programmes.cpu",
        },
        interface: {
          value: 2,
          label: "OMEGA.label.programmes.interface",
        },
        ossature: {
          value: 2,
          label: "OMEGA.label.programmes.ossature",
        },
        moteur: {
          value: 2,
          label: "OMEGA.label.programmes.moteur",
        },
        balise: {
          value: 2,
          label: "OMEGA.label.programmes.balise",
        },
      },
      sousprogrammes: {
        armesetdestruction: {
          value: 0,
          label: "Armes et destruction",
        },
        biologieorganiques: {
          value: 0,
          label: "Bio./Organiques",
        },
        conduitedetir: {
          value: 0,
          label: "Conduite de tir",
        },
        espace: {
          value: 0,
          label: "Espace",
        },
        mecanique: {
          value: 0,
          label: "Mécanique",
        },
        medecine: {
          value: 0,
          label: "Médecine",
        },
        opsar: {
          value: 0,
          label: "Opsar",
        },
        pilotage: {
          value: 0,
          label: "Pilotage",
        },
        tactique: {
          value: 0,
          label: "Tactique",
        },
      },
    };
  } else if (npcType === "synthetique") {
    system = {
      caracteristiques: {
        attaque: {
          value: 2,
          label: "OMEGA.label.programmes.attaque",
        },
        defense: {
          value: 2,
          label: "OMEGA.label.programmes.defense",
        },
        initiative: {
          value: 2,
          label: "OMEGA.label.programmes.initiative",
        },
        vitesse: {
          value: 2,
          label: "OMEGA.label.programmes.vitesse",
        },
      },
      programmes: {
        basededonnees: {
          value: 0,
          label: "OMEGA.label.programmes.basededonnees",
        },
        connexion: {
          value: 0,
          label: "OMEGA.label.programmes.connexion",
        },
        contremesure: {
          value: 2,
          label: "OMEGA.label.programmes.contremesure",
        },
        dissipateur: {
          value: 0,
          label: "OMEGA.label.programmes.dissipateur",
        },
        hacking: {
          value: 0,
          label: "OMEGA.label.programmes.hacking",
        },
        armesaenergie: {
          value: 0,
          label: "OMEGA.label.programmes.armesaenergie",
        },
        detecteur: {
          value: 2,
          label: "OMEGA.label.programmes.detecteur",
        },
        exterminateur: {
          value: 0,
          label: "OMEGA.label.programmes.exterminateur",
        },
        resistance: {
          value: 0,
          label: "OMEGA.label.programmes.resistance",
        },
        artillerie: {
          value: 0,
          label: "OMEGA.label.programmes.artillerie",
        },
        tactique: {
          value: 0,
          label: "OMEGA.label.programmes.tactique",
        },
        reprogrammation: {
          value: 0,
          label: "OMEGA.label.programmes.reprogrammation",
        },
        neutralisationcognitive: {
          value: 0,
          label: "OMEGA.label.programmes.neutralisationcognitive",
        },
        recherche: {
          value: 0,
          label: "OMEGA.label.programmes.recherche",
        },
        cybernetique: {
          value: 0,
          label: "OMEGA.label.programmes.cybernetique",
        },
        ingenierie: {
          value: 0,
          label: "OMEGA.label.programmes.ingenierie",
        },
        chirurgie: {
          value: 0,
          label: "OMEGA.label.programmes.chirurgie",
        },
      },
      sousprogrammes: {
        armesetdestruction: {
          value: 0,
          label: "Armes et destruction",
        },
        biologieorganiques: {
          value: 0,
          label: "Biologie / Organiques",
        },
        conduitedetir: {
          value: 0,
          label: "Conduite de tir",
        },
        espace: {
          value: 0,
          label: "Espace",
        },
        mecanique: {
          value: 0,
          label: "Mécanique",
        },
        medecine: {
          value: 0,
          label: "Médecine",
        },
        opsar: {
          value: 0,
          label: "Opsar",
        },
        pilotage: {
          value: 0,
          label: "Pilotage",
        },
        tactique: {
          value: 0,
          label: "Tactique",
        },
      },
      systemesauxiliaires: {
        blindage: {
          base: 4,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.blindage",
        },
        blindageiem: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.blindageiem",
        },
        chance: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.chance",
        },
        defense: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.defense",
        },
        energiedisponible: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.energiedisponible",
        },
        initiative: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.initiative",
        },
        integriteinformatique: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.integriteinformatique",
        },
        resistancemoteur: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.resistancemoteur",
        },
        vitesse: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.vitesse",
        },
      },
    };
  } else if (npcType === "organique") {
    system = {
      caracteristiques: {
        connaissance: {
          value: 2,
          label: "OMEGA.label.programmes.connaissance",
        },
        corpsacorps: {
          value: 2,
          label: "OMEGA.label.programmes.corpsacorps",
        },
        defense: {
          value: 2,
          label: "OMEGA.label.programmes.defense",
        },
        empathie: {
          value: 2,
          label: "OMEGA.label.programmes.empathie",
        },
        initiative: {
          value: 2,
          label: "OMEGA.label.programmes.initiative",
        },
        raisonnement: {
          value: 2,
          label: "OMEGA.label.programmes.raisonnement",
        },
        rapidite: {
          value: 2,
          label: "OMEGA.label.programmes.rapidite",
        },
        sens: {
          value: 2,
          label: "OMEGA.label.programmes.sens",
        },
        tir: {
          value: 2,
          label: "OMEGA.label.programmes.tir",
        },
        vitalite: {
          value: 2,
          label: "OMEGA.label.programmes.vitalite",
        },
      },
      systemesauxiliaires: {
        armure: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.armure",
        },
        defense: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.defense",
        },
        vie: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.vie",
        },
        vitesse: {
          base: 2,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.vitesse",
        },
        chance: {
          base: 0,
          value: 0,
          mod: 0,
          label: "OMEGA.label.programmes.chance",
        },
      },
    };
  }
  Object.keys(system).forEach((key, index1) => {
    for(let prog in system[key]){
      pattern = game.i18n.localize(system[key][prog].label) + " ([0-9]+)";
      attributePattern = new RegExp(pattern);
      resultData = extractData(expectedData, attributePattern);
      console.log("resultData", resultData);
      if (resultData.length) {
        system[key][prog].value = parseInt(resultData, 10);
        if (system[key][prog]?.base) system[key][prog].base = parseInt(resultData, 10);
      }
    }
  });
  system.description = description;
  if (npcType === "advancedsynth" || npcType === "synthetique") {
    pattern = "FIRME :([EARTHFUCYBLI]+)";
    attributePattern = new RegExp(pattern);
    resultData = extractData(expectedData, attributePattern);
    if (resultData === "EARTH") system.firm = "earthshield";
    else if (resultData === "FUTURE") system.firm = "futuretechnologies";
    else if (resultData === "CYBERLIFE") system.firm = "cyberlife";
  }

  setProperty(newValues, "system", system);
  let actor = await Actor.create(newValues);
  let itemArray = [];

  if (npcType === "advancedsynth" || npcType === "synthetique") {
    pattern = "Châssis : ([îïœöôïîéëèêçûùüáàâÉËÈÊÔÀÁÄÎÏŒa-zA-Z]+)";
    attributePattern = new RegExp(pattern);
    resultData = extractData(expectedData, attributePattern);
    if (resultData.length) {
      let searcheditem = game.items.filter((item) => item.type === "chassis" && item.name === resultData);
      if (searcheditem.length) {
        let ItemCopy = duplicate(searcheditem[0]);
        itemArray.push(ItemCopy);
      }
    }
  }
  //extensions
  if(extensionRaw.length){
  pattern = "([îïœôöèêäâàçûùéÉËÈÊÔÀÁÄÎÏŒ0-9a-zA-Z-s’]+),";
  attributePattern = new RegExp(pattern);
  resultData = extractMultData(extensionsData, attributePattern);
  if (resultData.length > 1) {
    if (resultData.length) {
      resultData.forEach(function (element, index) {
        if (index) {
          let searcheditem = game.items.filter((item) => item.name === element);
          if (searcheditem.length) {
            let ItemCopy = duplicate(searcheditem[0]);
            itemArray.push(ItemCopy);
          }
        }
      });
    }
  }}
  controlDoc = await actor.createEmbeddedDocuments("Item", itemArray);
}
