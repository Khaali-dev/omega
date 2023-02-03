import { Diodes } from "../common/roll.js";
import { ROLL_TYPE } from "../common/config.js";

export default class OmegaBaseActor extends Actor {
  /** @override */
  prepareData() {
    console.log("demarrage Acteurs");
    super.prepareData();
    if (this.estAdvancedSynth()) this._prepareDataAdvancedSynth();
    if (this.estSynthetique()) this._prepareDataSynthetique();
    if (this.estOrganique()) this._prepareDataOrganique();
    if (this.estVaisseau()) this._prepareDataVaisseau();
  }

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

    //Malus dégâts subis
    this.system.malusDegatsSubis = Math.min(3, this.system.systemesauxiliaires.resistancemoteur.max - this.system.systemesauxiliaires.resistancemoteur.value);

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

  async _prepareDataOrganique() {
    this.system.malusDegatsSubis = Math.min(3, this.system.systemesauxiliaires.vie.base - this.system.systemesauxiliaires.vie.value);
  }

  async _prepareDataSynthetique() {
    this.system.malusDegatsSubis = Math.min(3, this.system.systemesauxiliaires.resistancemoteur.base - this.system.systemesauxiliaires.resistancemoteur.value);
  }

  async _prepareDataVaisseau() {
    this.system.systemesauxiliaires.initiative.value = Math.max(this.system.classe, 6);
    for (let membreEquipage in this.system.equipage) {
      let actorEquipage = game.actors.get(this.system.equipage[membreEquipage].actorid);
      if (actorEquipage) {
        this.system.equipage[membreEquipage].img = actorEquipage.img;
        this.system.equipage[membreEquipage].name = actorEquipage.name;
        if (typeof actorEquipage["programme_" + membreEquipage] == "function") {
          this.system.equipage[membreEquipage].value = actorEquipage["programme_" + membreEquipage]();
        } else {
          console.log("pas de fonction");
        }
      } else {
        this.system.equipage[membreEquipage].img = "systems/omega/assets/image/robot.svg";
        this.system.equipage[membreEquipage].name = "Automatique";
        this.system.equipage[membreEquipage].value = this.system.equipage[membreEquipage].autovalue;
      }
    }
    let regroupements = this.items.filter((item) => item.type === "regroupement");
    const updateRa = [];
    regroupements.forEach((element) => {
      updateRa.push({ _id: element.id, "system.attackvalue": this.system.equipage.cannonier.value + element.system.modificateurtir });
    });
    this.updateEmbeddedDocuments("Item", updateRa);
  }

  programme_tacticien() {
    return this.system.sousprogrammes?.tactique?.value;
  }

  programme_cannonier() {
    return this.system.sousprogrammes?.conduitedetir?.value;
  }

  programme_opsar() {
    return this.system.sousprogrammes?.opsar?.value;
  }

  programme_mecanicien() {
    return this.system.sousprogrammes?.mecanique?.value;
  }

  programme_pilote() {
    return this.system.sousprogrammes?.pilotage?.value;
  }

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
  estVaisseau() {
    return this.type === "vaisseau";
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
    if (typeof value === "undefined") return;
    let program = {
      value: value,
      label: this.system[group][field].label,
      group: group,
      reference: field,
    };
    let data = {
      malusDegatsSubis: this.system.malusDegatsSubis,
      extraText: ""
    };
    let diodes = new Diodes(this, ROLL_TYPE.PROGRAM, program, data);
    diodes.openDialog();
  }

  async shoot(armeId) {
    let arme = this.items.get(armeId);
    let group = this.estOrganique() ? "caracteristiques" : "programmes";
    let field = arme.system?.typeprogramme;
    let program = {};
    if (this.estOrganique()) {
      field = this.getEquivalentOrga(arme.system.typeprogramme);
    } else if (this.estSynthetique() && this.system.programmes[arme.system.typeprogramme].value < this.system.caracteristiques.attaque.value) {
      group = "caracteristiques";
      field = "attaque";
    }
    if (this.estVaisseau()) {
      program = {
        value: arme.system.attackvalue,
        label: game.i18n.localize("OMEGA.label.programmes.conduitedetir"),
        reference: "cannonier",
      };
    } else {
      program = {
        value: this.system[group][field].value,
        label: game.i18n.localize(this.system[group][field].label),
        reference: field,
      };
    }
    let data = {
      itemId: armeId,
      nomArme: arme.name,
      malusDegatsSubis: this.system.malusDegatsSubis,
    };
    let diodes = new Diodes(this, ROLL_TYPE.ATTACK, program, data);
    diodes.openDialog();
  }
  async chanceRoll() {
    let program = {
      value: this.system.systemesauxiliaires.chance.value,
      label: "Chance",
      reference: "chance",
    };
    let data = {
      malusDegatsSubis: 0,
      extraText: ""
    };
    let diodes = new Diodes(this, ROLL_TYPE.CHANCE, program, data);
    diodes.openDialog();
  }
  getEquivalentOrga(programme) {
    if (this.estOrganique()) return game.omega.config.ORGANIQUE.EQUIVALENCE[programme];
    else return programme;
  }

  async piocherInitiative() {
    let program = {
      value: 0,
      label: "Initiative",
      reference: "initiative"
    };
    let data = {
      malusDegatsSubis: this.system.malusDegatsSubis,
      extraText: ""
    };
    if (this.estAdvancedSynth()) {
      program.value = this.system.systemesauxiliaires.initiative.value;
    } else if (this.estVaisseau()) {
      program.value = Math.min(this.system.classe, 6);
      if (this.system.classe > 6) {
        data.extraText = game.i18n.format("OMEGA.chatmessage.vaisseauExtraInitText", { bonus: (this.system.classe - 6).toString() });
      }
    } else {
      program.value = this.system.caracteristiques.initiative.value;
    }

    let diodes = new Diodes(this, ROLL_TYPE.INITIATIVE, program, data);
    return diodes.openDialog();
  }

  valeurVitesse() {
    if (this.estSynthetique()) {
      return this.system.caracteristiques.vitesse.value;
    } else if (this.estVaisseau()){
      return this.system.vitesse;
    }else {
      return this.system.systemesauxiliaires.vitesse.value;
    }
  }

  async changerEquipage(actorId, posteEquipage) {
    let updateData = duplicate(this);
    let actorEquipage = game.actors.get(actorId);
    if (actorEquipage) {
      updateData.system.equipage[posteEquipage].actorid = actorId;
      updateData.system.equipage[posteEquipage].img = actorEquipage.img;
      updateData.system.equipage[posteEquipage].name = actorEquipage.name;
      if (typeof actorEquipage["programme_" + posteEquipage] == "function") {
        updateData.system.equipage[posteEquipage].value = actorEquipage["programme_" + posteEquipage]();
      } else {
        console.log("pas de fonction");
      }
    } else {
      updateData.system.equipage[posteEquipage].value = this.system.equipage[posteEquipage].autovalue;
      updateData.system.equipage[posteEquipage].actorid = "";
      updateData.system.equipage[posteEquipage].img = "systems/omega/assets/image/robot.svg";
      updateData.system.equipage[posteEquipage].name = "Automatique";
    }
    return await this.update(updateData);
  }

  rechargerRegroupements(){
    const updates =[];
    const regroupements = this.items.filter((item) => item.type === "regroupement");
    regroupements.forEach((element) => {
      updates.push({"_id": element.id, "system.tireffectue" : false})
    });
    this.updateEmbeddedDocuments('Item', updates);
  }
}
