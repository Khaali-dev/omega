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
    return mergeObject(super.defaultOptions, {
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
  getData(options) {
    const context = super.getData(options);
    const stockchassis = [];
    for (let chassis in this.actor.system.chassis) {
      let dupChassis = duplicate(this.actor.system.chassis[chassis]);
      stockchassis.push(dupChassis);
    }
    context.typeSynth = game.omega.config.TYPESYNTH[this.actor.system.typeSynth];
    context.stockchassis = stockchassis;
    context.logofirme = game.omega.config.FIRME[this.actor.system.firme].logoclass;
    // Ordre alphabetique
    context.armes = this.actor.items
      .filter((item) => item.type == "arme")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    context.armes.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.attacklabel = game.omega.config.ARME.TYPEPROGRAMME[element.system.typeprogramme];
      element.system.attackvalue = this.actor.system.programmes[element.system.typeprogramme].value;
      element.system.technologielabel = game.omega.config.ARME.TECHNOLOGIE[element.system.technologie];
    });

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  _onDropItem(event, data) {
    event.preventDefault();
    Item.fromDropData(data).then((item) => {
      const itemData = duplicate(item);
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
