import { OmegaBaseActorSheet } from "./base-sheet.js";

export default class AdvancedSynthSheet extends OmegaBaseActorSheet {
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
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 800,
      width: 600,
      resizable: false,
      template: "systems/omega/templates/actor/advancedsynth.html",
      classes: ["omega", "sheet", "actor", "advancedsynth"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "programmes" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.stockchassis = this.actor.items
      .filter((item) => item.type == "chassis")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    for (let element of context.stockchassis) {
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.nbslotsTotal = await this.actor.getNbslotsTotal(element.id);
      element.system.nbslotsLibres = await this.actor.getNbslotsLibres(element.id);
    }
    context.nomChassisActif = "Aucun";
    const chassisActifId = await this.actor.getChassisActif();
    if (chassisActifId) context.nomChassisActif = this.actor.items.get(chassisActifId).name;
    
    context.typeSynth = game.omega.config.TYPESYNTH[this.actor.system.typeSynth];
    //context.stockchassis = stockchassis;
    context.logofirme = game.omega.config.FIRME[this.actor.system.firme].logoclass;
    // Ordre alphabetique
    context.armes = this.actor.items
      .filter((item) => item.type == "arme")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    for (let element of context.armes) {
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.attacklabel = game.omega.config.ARME.TYPEPROGRAMME[element.system.typeprogramme];
      element.system.attackvalue = this.actor.system.programmes[element.system.typeprogramme].value;
      element.system.technologielabel = game.omega.config.ARME.TECHNOLOGIE[element.system.technologie];
    }

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  _onDropItem(event, data) {
    event.preventDefault();
    Item.fromDropData(data).then((item) => {
      const itemData = foundry.utils.duplicate(item);
      switch (itemData.type) {
        case "extension":
          return this._onDropExtension(event, itemData, data);
        case "arme":
          return this._onDropExtension(event, itemData, data);
        case "chassis":
          return super._onDropItem(event, data);
        case "avantage":
          return false;
        case "regroupement":
          return false;
        case "upgrade":
          return false;
        default:
          return super._onDropItem(event, data);
      }
    });
  }
}
