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
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 800,
      width: 600,
      resizable: false,
      template: "systems/omega/templates/actor/synthetique.html",
      classes: ["omega", "sheet", "actor", "synthetique"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "programmes" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.logofirme = game.omega.config.FIRME[this.actor.system.firme].logoclass;
    context.armes = this.actor.items.filter((item) => item.type == "arme");
    for (let element of context.armes) {
      element.system.descriptionhtml = await TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.attacklabel = "Attaque";
      element.system.attackvalue = this.actor.system.caracteristiques.attaque.value;
      element.system.technologielabel = game.omega.config.ARME.TECHNOLOGIE[element.system.technologie];
      element.system.estActif = true;
    }
    context.prognonnul = [];
    context.progfull = [];
    for (let prog in this.actor.system.programmes) {
      context.progfull.push({ label: game.i18n.localize(this.actor.system.programmes[prog].label), value: this.actor.system.programmes[prog].value, reference: prog });
      if (this.actor.system.programmes[prog].value) {
        context.prognonnul.push({ label: game.i18n.localize(this.actor.system.programmes[prog].label), value: this.actor.system.programmes[prog].value, reference: prog });
      }
    }

    context.nomChassisActif = "Aucun";
    const chassisActifId = await this.actor.getChassisActif();
    if (chassisActifId) context.nomChassisActif = this.actor.items.get(chassisActifId).name;

    context.equipements = context.items.filter((item) => ["equipement", "chassis"].includes(item.type));
    for (let item of context.equipements) {
      item.system.descriptionhtml = await TextEditor.enrichHTML(item.system.description, { async: false });
    }
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".prog-input").change(this._onprogChange.bind(this));
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
  async _onprogChange(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let prog = element.dataset.field;
    let value = element.valueAsNumber;
    let linkMod = "system.programmes." + prog + ".value";
    await this.actor.update({ [linkMod]: value });
    return;
  }
}
