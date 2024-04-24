export default class OmegaBaseItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
    if (this.estRegroupement()) this._prepareRegroupement();
    if (this.estArme()) this._prepareArme();
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

  estArme(){
    return this.type === "arme";
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
    this._prepareLabelDiodes();
  }
  _prepareArme(){
    this._prepareLabelDiodes();
  }

  _prepareLabelDiodes(){
    let listeEffets = {
      ...foundry.utils.duplicate(game.omega.config.EFFET_NEGATIF),
      ...foundry.utils.duplicate(game.omega.config.EFFET_CRITIQUE),
      ...foundry.utils.duplicate(game.omega.config.REGROUPEMENT_ARMES.EFFET_CRITIQUE)
    }
    for(let diode in this.system.effetdiode){
      this.system.effetdiode[diode].label = this.system.effetdiode[diode].degat.toString();
      if((this.system.technologie==="iem") && (this.system.effetdiode[diode].degat!=="0")){
        this.system.effetdiode[diode].label += " IEM "
      }
      if (this.system.effetdiode[diode].effetcritique !== "aucun") {
        this.system.effetdiode[diode].label += " - " + listeEffets[this.system.effetdiode[diode].effetcritique].label;
        this.system.effetdiode[diode].tooltip = true;
        this.system.effetdiode[diode].description = "OMEGA.EFFET_CRITIQUE." + this.system.effetdiode[diode].effetcritique +".description";
      }
    }
  }
}