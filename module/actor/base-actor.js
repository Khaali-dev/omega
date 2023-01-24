import { Diodes } from "../common/roll.js";
import { ROLL_TYPE } from "../common/config.js";

export default class OmegaBaseActor extends Actor {
  /** @override */
  prepareData() {
    console.log("demarrage Acteurs");
    super.prepareData();
    if (this.estAdvancedSynth()) this._prepareDataAdvancedSynth();
    if (this.estSynthetique()) this._prepareDataSynthetique();
  }

  async _prepareDataSynthetique() {}
  /**
   * @private
   */
  async _prepareDataAdvancedSynth() {
    // Evaluation des systèmes auxiliaires
    this.system.systemesauxiliaires.blindage.base = this.system.typeSynth === "alpha" ? this.system.programmes.resistance.value * 3 : this.system.programmes.resistance.value * 2;
    this.system.systemesauxiliaires.blindage.max = this.system.systemesauxiliaires.blindage.base + this.system.systemesauxiliaires.blindage.mod;
    this.system.systemesauxiliaires.resistancemoteur.base = this.system.programmes.energie.value;
    this.system.systemesauxiliaires.resistancemoteur.max = this.system.systemesauxiliaires.resistancemoteur.base + this.system.systemesauxiliaires.resistancemoteur.mod;
    this.system.systemesauxiliaires.blindageiem.base =
      this.system.typeSynth === "sigma" ? this.system.caracteristiques.balise.value * 2 : this.system.caracteristiques.balise.value;
    this.system.systemesauxiliaires.blindageiem.max = this.system.systemesauxiliaires.blindageiem.base + this.system.systemesauxiliaires.blindageiem.mod;
    this.system.systemesauxiliaires.integriteinformatique.base = this.system.caracteristiques.cpu.value;
    this.system.systemesauxiliaires.integriteinformatique.max =
      this.system.systemesauxiliaires.integriteinformatique.base + this.system.systemesauxiliaires.integriteinformatique.mod;
    this.system.systemesauxiliaires.energiedisponible.base = this.system.programmes.energie.value * 3;
    this.system.systemesauxiliaires.energiedisponible.max = this.system.systemesauxiliaires.energiedisponible.base + this.system.systemesauxiliaires.energiedisponible.mod;

    this.system.systemesauxiliaires.chance.base = this.system.caracteristiques.interface.value;
    this.system.systemesauxiliaires.chance.value = this.system.systemesauxiliaires.chance.base + this.system.systemesauxiliaires.chance.mod;
    this.system.systemesauxiliaires.vitesse.base = this.system.caracteristiques.moteur.value;
    this.system.systemesauxiliaires.vitesse.value = this.system.systemesauxiliaires.vitesse.base + this.system.systemesauxiliaires.vitesse.mod;
    this.system.systemesauxiliaires.defense.base = this.system.programmes.defense.value;
    this.system.systemesauxiliaires.defense.value = this.system.systemesauxiliaires.defense.base + this.system.systemesauxiliaires.defense.mod;
    this.system.systemesauxiliaires.initiative.base = this.system.programmes.dissipateur.value;
    this.system.systemesauxiliaires.initiative.value = this.system.systemesauxiliaires.initiative.base + this.system.systemesauxiliaires.initiative.mod;

    //traitement du chassis

    this.system.chassis = {};
    this.system.chassisActif = {};
    let chassisList = this.items.filter((item) => item.type == "chassis");
    let chassisActif = this.items.filter((item) => item.type == "chassis" && item.system.estActif);
    if (chassisActif.length) {
      this.activerChassis(chassisActif[0].id);
    }
    for (let chassis of chassisList) {
      this.system.chassis[chassis.id] = {
        name: chassis.name,
        id: chassis.id,
        descriptionhtml: TextEditor.enrichHTML(chassis.description, { async: false }),
        estActif: chassis.system.estActif,
        nbslotstotal: chassis.system.nbslots + this.system.caracteristiques.ossature.value,
        nbslotslibres: chassis.system.nbslots + this.system.caracteristiques.ossature.value,
      };
    }

    await this.initialiserExtensions();
  }

  async activerChassis(chassisId) {
    let chassisArray = [];
    let item = this.items.get(chassisId);
    if (item) {
      this.system.chassisActif.label = item.name;
      this.system.chassisActif.id = chassisId;
      let itemDup = duplicate(item);
      itemDup.system.estActif = true;
      chassisArray.push(itemDup);
      //Ajouter la prise en compte des différents bonus des extensions du chassis

      //desactive tous les autres chassis
      for (const [key, item2] of this.items.entries()) {
        if (item2.type === "chassis" && item2.id !== chassisId) {
          let itemDup2 = duplicate(item2);
          itemDup2.system.estActif = false;
          chassisArray.push(itemDup2);
        }
      }
      this.updateEmbeddedDocuments("Item", chassisArray);
    }
  }

  _prepareDataNpc() {}

  async initialiserExtensions() {
    let extensionArray = [];
    for (const [key, item] of this.items.entries()) {
      if (["extension", "arme"].includes(item.type)) {
        let itemDup = duplicate(item);
        if (item.system.chassisId.length) {
          let chassis = this.items.get(item.system.chassisId);
          if (chassis) {
            if (item.system.chassisId === this.system.chassisActif.id) {
              itemDup.system.estActif = true;
            } else {
              itemDup.system.estActif = false;
            }
            this.utiliserSlots(item.system.chassisId, item.system.nbSlots);
          } else {
            itemDup.system.chassisId = "";
            itemDup.system.estActif = false;
          }
        }
        extensionArray.push(itemDup);
      }
    }
    this.updateEmbeddedDocuments("Item", extensionArray);
  }

  utiliserSlots(chassisId, nbSlots) {
    this.system.chassis[chassisId].nbslotslibres = this.system.chassis[chassisId].nbslotslibres - nbSlots;
  }

  estAdvancedSynth() {
    return this.type === "advancedsynth";
  }
  estOrganique() {
    return this.type === "organique";
  }
  estSynthetique() {
    return this.type === "synthetique";
  }

  /* Get the Players owning an actor, that is not a GM and that is connected */
  async getOwnerPlayer() {
    let permissions = Object.entries(this.ownership);
    let ownerIds = permissions.reduce((idValue, e) => {
      if (e[1] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
        idValue.push(e[0]);
      }
      return idValue;
    }, []);
    let owningPlayers = game.users.filter((user) => user.active && !user.isGM && ownerIds.includes(user.id));
    return owningPlayers;
  }
  async check(group, field) {
    let value = this.system[group][field].value;
    if (!value) return;
    let program = {
      value: value,
      label: this.system[group][field].label,
      group: group,
      reference: field,
    };
    let data = {};
    let diodes = new Diodes(this.id, ROLL_TYPE.PROGRAM, program, data);
    diodes.openDialog();
  }
  async shoot(armeId) {
    let arme = this.items.get(armeId);
    let group = this.estOrganique() ? "caracteristiques" : "programmes";
    let field = arme.system.typeprogramme;
    if (this.estOrganique()) {
      field = this.getEquivalentOrga(arme.system.typeprogramme);
    } else if (this.estSynthetique() && this.system.programmes[arme.system.typeprogramme].value < this.system.caracteristiques.attaque.value) {
      group = "caracteristiques";
      field = "attaque";
    }
    let program = {
      value: this.system[group][field].value,
      label: game.i18n.localize(this.system[group][field].label),
      group: group,
      reference: field,
    };
    let data = { itemId: armeId };
    let diodes = new Diodes(this.id, ROLL_TYPE.ATTACK, program, data);
    diodes.openDialog();
  }
  async chanceRoll() {
    let program = {
      value: this.system.systemesauxiliaires.chance.value,
      label: "Chance",
      group: "systemesauxiliaires",
      reference: "chance",
    };
    let data = {};
    let diodes = new Diodes(this.id, ROLL_TYPE.CHANCE, program, data);
    diodes.openDialog();
  }
  getEquivalentOrga(programme) {
    if (this.estOrganique()) return game.omega.config.ORGANIQUE.EQUIVALENCE[programme];
    else return programme;
  }

  async piocherInitiative(){
    let program = {
      value: 0,
      label: "Initiative",
      group: "",
      reference: "initiative",
    };
    if(this.estAdvancedSynth()){
      program.value = this.system.systemesauxiliaires.initiative.value;
      program.group = "systemesauxiliaires";
    }
    else {
      program.value = this.system.caracteristiques.initiative.value;
      program.group = "caracteristiques";
    }
    
    let data = {};
    let diodes = new Diodes(this.id, ROLL_TYPE.INITIATIVE, program, data);
    return(diodes.openDialog());
  }
  valeurVitesse(){
    if(this.estSynthetique()){
      return(this.system.caracteristiques.vitesse.value);
    }
    else {
      return(this.system.systemesauxiliaires.vitesse.value);
    }
  }
}
