import { OmegaBaseActorSheet } from "./base-sheet.js";

export default class SynthetiqueSheet extends OmegaBaseActorSheet {
  /**
   * @constructor
   * @param  {...any} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @override
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      height: 800,
      width: 600,
      resizable: false,
      template: "systems/omega/templates/actor/synthetique.html",
      classes: ["omega", "sheet", "actor", "synthetique"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "programmes" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }]
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.logofirme=game.omega.config.FIRME[this.actor.system.firme].logoclass;
    context.armes = this.actor.items.filter((item) => item.type == "arme");
    context.armes.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.attacklabel="Attaque";
      element.system.attackvalue=this.actor.system.caracteristiques.attaque.value;
      element.system.technologielabel=game.omega.config.ARME.TECHNOLOGIE[element.system.technologie];
      element.system.estActif=true;
    });
    context.prognonnul = [];
    context.progfull = [];
    for (let prog in this.actor.system.programmes) {
      context.progfull.push({ label: game.i18n.localize(this.actor.system.programmes[prog].label), value: this.actor.system.programmes[prog].value, reference: prog });
      if (this.actor.system.programmes[prog].value) {
        context.prognonnul.push({ label: game.i18n.localize(this.actor.system.programmes[prog].label), value: this.actor.system.programmes[prog].value, reference: prog });
      }
    }

    context.equipements = context.items.filter((item) => ["equipement", "chassis"].includes(item.type));
    for (let item of context.equipements) {
        item.system.descriptionhtml = TextEditor.enrichHTML(item.system.description, { async: false });
    }
    console.log("eq",context.equipements);
    return context;
  }

  /** @override */
  activateListeners(html){
    super.activateListeners(html);
  }
}

