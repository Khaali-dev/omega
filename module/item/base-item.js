export default class OmegaBaseItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
    console.log("thisitem", this);
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
    console.log("this2.type", this.system.degats);
    let baseDegats = this.system.degats;
    this.system.effetdiode.bleue.degat = baseDegats;
    this.system.effetdiode.bleue.label = baseDegats.toString();
    this.system.effetdiode.verte.degat = baseDegats+1;
    this.system.effetdiode.verte.label = (baseDegats+1).toString();
    this.system.effetdiode.rouge.degat = baseDegats+2;
    this.system.effetdiode.rouge.label = (baseDegats+2).toString().concat(" et effet critique");
  }
}