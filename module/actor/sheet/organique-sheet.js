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
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 800,
      width: 600,
      resizable: false,
      template: "systems/omega/templates/actor/organique.html",
      classes: ["omega", "sheet", "actor", "organique"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "personnalite" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.armes = this.actor.items.filter((item) => item.type === "arme");
    for (let element of context.armes) {
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.attacklabel = game.omega.config.ARME.TYPEPROGRAMME[this.actor.getEquivalentOrga(element.system.typeprogramme)];
      element.system.attackvalue = this.actor.system.caracteristiques[this.actor.getEquivalentOrga(element.system.typeprogramme)].value;
      element.system.technologielabel = game.omega.config.ARME.TECHNOLOGIE[element.system.technologie];
      element.system.estActif = true;
    }
    context.avantages = this.actor.items.filter((item) => item.type === "avantage");
    context.avantages.forEach(async (element) => {
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
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
      const itemData = foundry.utils.duplicate(item);
      switch (itemData.type) {
        case "extension":
          return this._onDropExtension(event, itemData, data);
        case "arme":
          return this._onDropExtension(event, itemData, data);
        case "chassis":
          return false;
        case "avantage":
          return super._onDropItem(event, data);
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
