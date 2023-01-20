import { OmegaBaseActorSheet } from "./base-sheet.js";

export default class OrganiqueSheet extends OmegaBaseActorSheet {
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
      template: "systems/omega/templates/actor/organique.html",
      classes: ["omega", "sheet", "actor", "organique"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "personnalite" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }]
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.armes = this.actor.items.filter((item) => item.type === "arme");
    context.armes.forEach((element) => {
      console.log("element",element);
      console.log("element.system.typeprogramme",element.system.typeprogramme);
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.attacklabel=game.omega.config.ARME.TYPEPROGRAMME[this.actor.getEquivalentOrga(element.system.typeprogramme)];
      element.system.attackvalue=this.actor.system.caracteristiques[this.actor.getEquivalentOrga(element.system.typeprogramme)].value;
      element.system.technologielabel=game.omega.config.ARME.TECHNOLOGIE[element.system.technologie];
    });
    context.avantages = this.actor.items.filter((item) => item.type === "avantage");
    context.avantages.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });

    return context;
  }

  /** @override */
  activateListeners(html){
    super.activateListeners(html);
  }

}

