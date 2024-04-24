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
    return foundry.utils.mergeObject(super.defaultOptions, {
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
  async getData(options) {
    const context = await super.getData(options);
    let sheetData = {
      id: this.item.id,
      editable: this.isEditable,
      item: context.item,
      system: context.item.system,
      config: game.omega.config,
      damagevalue: {
        "0": "0",
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5",
        "6": "6",
        "7": "7",
        "8": "8",
      },
    };

    return sheetData;
  }
}
