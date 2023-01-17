import { Diodes } from "../common/roll.js";
import { ROLL_TYPE } from "../common/config.js";

export default class OmegaBaseActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
    if (this.isPlayer()) this._prepareDataPlayer();
    if (this.isNpc()) this._prepareDataNpc();
  }

  /**
   * @private
   */
  async _prepareDataPlayer() {
    console.log("demarrage Acteurs");
    // Evaluation des systèmes auxiliaires
    this.system.systemesauxiliaires.blindage.max= (this.system.programmes.resistance.value * 2) + this.system.systemesauxiliaires.blindage.mod;
    this.system.systemesauxiliaires.resistancemoteur.max= this.system.programmes.energie.value + this.system.systemesauxiliaires.resistancemoteur.mod;
    this.system.systemesauxiliaires.blindageiem.max= this.system.caracteristiques.balise.value + this.system.systemesauxiliaires.blindageiem.mod;
    this.system.systemesauxiliaires.integriteinformatique.max= this.system.caracteristiques.cpu.value + this.system.systemesauxiliaires.integriteinformatique.mod;
    this.system.systemesauxiliaires.energiedisponible.max= (this.system.programmes.energie.value * 3) + this.system.systemesauxiliaires.energiedisponible.mod;

    this.system.systemesauxiliaires.chance.max= this.system.caracteristiques.interface.value + this.system.systemesauxiliaires.chance.mod;
    this.system.systemesauxiliaires.vitesse.max= this.system.caracteristiques.moteur.value + this.system.systemesauxiliaires.vitesse.mod;
    this.system.systemesauxiliaires.defense.max= this.system.programmes.defense.value + this.system.systemesauxiliaires.defense.mod;
    this.system.systemesauxiliaires.initiative.max= this.system.programmes.dissipateur.value + this.system.systemesauxiliaires.initiative.mod;
    
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
      this.system.chassisActif.id= chassisId;
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
      if (item.type === "extension") {
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
            extensionArray.push(itemDup);
          }
        }
      }
    }
    this.updateEmbeddedDocuments("Item", extensionArray);
  }

  utiliserSlots(chassisId, nbSlots) {
    this.system.chassis[chassisId].nbslotslibres = this.system.chassis[chassisId].nbslotslibres - nbSlots;
  }

  isPlayer() {
    return this.type === "player";
  }

  isNpc() {
    return this.type === "npc";
  }
  async desactiveAutresChassis(chassisId) {}
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
    if (!this.system[group][field].value) return;
    let program = {
      value: this.system[group][field].value,
      label: this.system[group][field].label,
      group: group,
      reference: field,
    };
    let data = {};
    let diodes = new Diodes(this, ROLL_TYPE.PROGRAM, program, data);
    diodes.openDialog();
  }
  async shoot(weaponId){
    let weapon = this.items.get(weaponId);
    let program = {
      value: this.system.programmes[weapon.system.weapon.typeprogramme].value,
      label: game.i18n.localize(this.system.programmes[weapon.system.weapon.typeprogramme].label),
      group: "programmes",
      reference: weapon.system.weapon.typeprogramme,
    };
    let data = {itemId: weaponId};
    let diodes = new Diodes(this, ROLL_TYPE.ATTACK, program, data);
    diodes.openDialog();

  }
  async chanceRoll(){
    let program = {
      value: this.system.systemesauxiliaires.chance.max,
      label: "Chance",
      group: "systemesauxiliaires",
      reference: "chance",
    };
    let data = {};
    let diodes = new Diodes(this, ROLL_TYPE.CHANCE, program, data);
    diodes.openDialog();

  }
}
