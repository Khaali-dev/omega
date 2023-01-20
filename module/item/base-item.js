export default class OmegaBaseItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Get the Item's data
    const system = this.system;
  }

  getSystemData(field) {
    return eval(`this.system.${field}`);
  }

  isCaC(){
    return this.system.portee === ""
  }
}