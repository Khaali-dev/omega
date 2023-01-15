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
  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 340,
      resizable: true,
      classes: ["omega", "sheet", "item"],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  /** 
   * @override
   */
  getData() {
    const context = super.getData();
    let sheetData = {
      id: this.item.id,
      editable : this.isEditable,
      item: context.item,
      system: context.item.system,
      config: game.omega.config,
    }

    return sheetData;
  }

}