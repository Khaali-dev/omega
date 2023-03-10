import { OMEGA } from "../../common/config.js";
export default class OmegaBaseItemSheet extends ItemSheet {
  /**
   * @constructor
   * @param  {...any} args
   */
  constructor(...args) {
    super(...args);
    this.options.submitOnClose = true;
  }

  /**
   * @return the path of the specified item sheet.
   */
  get template() {
    return `systems/omega/templates/item/${this.item.type}.html`;
  }

  /**
   * @override
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 400,
      resizable: true,
      classes: ["omega", "sheet", "item"],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  /**
   * @override
   */
  getData() {
    const context = super.getData();
    let sheetData = {
      id: this.item.id,
      editable: this.isEditable,
      item: context.item,
      system: context.item.system,
      config: game.omega.config,
      damagevalue: {
        degats0: 0,
        degats1: 1,
        degats2: 2,
        degats3: 3,
        degats4: 4,
        degats5: 5,
        degats6: 6,
        degats7: 7,
        degats8: 8
      }
    };

    return sheetData;
  }
}
