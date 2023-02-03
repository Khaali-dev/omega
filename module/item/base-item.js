export default class OmegaBaseItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
    if (this.estRegroupement()) this._prepareRegroupement();
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

  estRegroupement(){
    return this.type === "regroupement";
  }
  _prepareRegroupement(){
    let baseDegats = this.system.degats;
    this.system.effetdiode.bleue.degat = baseDegats;
    this.system.effetdiode.verte.degat = baseDegats+1;
    this.system.effetdiode.rouge.degat = baseDegats+2;
    this.system.effetdiode.rouge.degat = baseDegats+2;
    this.system.effetdiode.rouge.effetcritique = this.system.technologie;
  }
}