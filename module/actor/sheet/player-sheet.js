import { OmegaBaseActorSheet } from "./base-sheet.js";

export default class PlayerSheet extends OmegaBaseActorSheet {
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
      template: "systems/omega/templates/actor/player.html",
      classes: ["omega", "sheet", "actor", "player"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "programmes" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }]
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    const stockchassis = [];
    for(let chassis in this.actor.system.chassis){
      let dupChassis=duplicate(this.actor.system.chassis[chassis]);;
      stockchassis.push(dupChassis);
    }
    context.stockchassis= stockchassis;

    return context;
  }

  /** @override */
  activateListeners(html){
    super.activateListeners(html);
  }

  /** @override */
  _onDrop(event) {
    event.preventDefault();
    if (!this.options.editable) return false;
    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      return false;
    }
    if (!data) return false;

    // Case 1 - Dropped Item
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }
    // Case 2 - Dropped Actor
    if (data.type === "Actor") {
      return false;
    }
  }

  /**
   * @name _onDropItem
   * @description Handle dropping of an item reference or item data onto an Item Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  _onDropItem(event, data) {
    Item.fromDropData(data).then((item) => {
      const itemData = duplicate(item);
      switch (itemData.type) {
        case "skill":
          return this._onDropSkillItem(event, itemData);
        default:
          return super._onDropItem(event, data);
      }
    });
  }

  /**
   * @name _onDropSkillItem
   * @description Handle the drop of a skill on a weapon item
   * @param {*} event
   * @param {*} itemData
   * @returns
   */
  _onDropSkillItem(event, itemData) {
    event.preventDefault();

    // Get the target
    const id = event.target.parentElement.dataset["itemId"];
    const target = this.actor.items.get(id);
    if (!target || target.type !== "weapon") return;
    let targetData = duplicate(target);
    targetData.system.skillName = itemData.name;
    targetData.system.skillValue = this.actor.getSkillValue(itemData);

    targetData.system.skillId = itemData._id;

    this.actor.updateEmbeddedDocuments("Item", [targetData]);
  }
}
