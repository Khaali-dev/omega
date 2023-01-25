export default class OmegaCombatant extends Combatant {
  _onCreate(data, options, userID) {
    super._onCreate(data, options, userID);
    if (game.user.isGM) this.setFlag("omega", "initdiodes", {
      rougeplus:0,
      rouge: 0,
      rouge: 0,
      verte: 0,
      bleue: 0,
      blanche: 0,
      noire: 0,
      noiremoins:0,
      nbActions: 0,
      initEval: 0,
      vitesse:0
    });
  }
  
  /**
   * @description Calcule une valeur numérique pour l'initiative, utilisée pour le classement
   * 
   */
  async calculerInitEval(initDiodes) {
    if(initDiodes.rougeplus) return(130+initDiodes.vitesse);
    if(initDiodes.rouge) return(110+initDiodes.vitesse);
    if(initDiodes.verte) return(90+initDiodes.vitesse);
    if(initDiodes.bleue) return(70+initDiodes.vitesse);
    if(initDiodes.blanche) return(50+initDiodes.vitesse);
    if(initDiodes.noire) return(30+initDiodes.vitesse);
    if(initDiodes.noiremoins) return(10+initDiodes.vitesse);
    return(0);
  }

  /**
   * @description le personnage dépense une action et donc la meilleure diode est supprimée, l'initiative est recalculée
   * 
   */
  async depenserDiode() {
    let initdiodes = this.getFlag("omega", "initdiodes");
    if (initdiodes.rougeplus > 0) {
      initdiodes.rougeplus = initdiodes.rougeplus - 1;
    } else if (initdiodes.rouge > 0) {
      initdiodes.rouge = initdiodes.rouge - 1;
    } else if (initdiodes.verte > 0) {
      initdiodes.verte = initdiodes.verte - 1;
    } else if (initdiodes.bleue > 0) {
      initdiodes.bleue = initdiodes.bleue - 1;
    } else if (initdiodes.blanche > 0) {
      initdiodes.blanche = initdiodes.blanche - 1;
    } else if (initdiodes.noire > 0) {
      initdiodes.noire = initdiodes.noire - 1;
    } else if (initdiodes.noiremoins > 0) {
      initdiodes.noiremoins = initdiodes.noiremoins - 1;
    }else return await this.update({ "initiative":  0});
    initdiodes.nbActions = initdiodes.nbActions - 1;
    initdiodes.initEval = await this.calculerInitEval(initdiodes);
    return await this.update({ "flags.omega.initdiodes": initdiodes, "initiative":  initdiodes.initEval});
  }
  
  /**
   * @description Améliorer (sens=1) ou diminuer (sens=0) la diode d'action
   * 
   */
  async changerDiode(sens){
    let initdiodes = this.getFlag("omega", "initdiodes");
    if (initdiodes.rougeplus > 0) {
      if(!sens){
        initdiodes.rougeplus = initdiodes.rougeplus - 1;
        initdiodes.rouge = initdiodes.rouge + 1;
      }
    } else if (initdiodes.rouge > 0) {
      if(sens){
        initdiodes.rougeplus = initdiodes.rougeplus + 1;
      } else{
        initdiodes.verte = initdiodes.verte + 1;
      }
      initdiodes.rouge = initdiodes.rouge - 1;
    } else if (initdiodes.verte > 0) {
      if(sens){
        initdiodes.rouge = initdiodes.rouge + 1;
      } else{
        initdiodes.bleue = initdiodes.bleue + 1;
      }
      initdiodes.verte = initdiodes.verte - 1;
    } else if (initdiodes.bleue > 0) {
      if(sens){
        initdiodes.verte = initdiodes.verte + 1;
      } else{
        initdiodes.blanche = initdiodes.blanche + 1;
      }
      initdiodes.bleue = initdiodes.bleue - 1;
    } else if (initdiodes.blanche > 0) {
      if(sens){
        initdiodes.bleue = initdiodes.bleue + 1;
      } else{
        initdiodes.noire = initdiodes.noire + 1;
      }
      initdiodes.blanche = initdiodes.blanche - 1;
    } else if (initdiodes.noire > 0) {
      if(sens){
        initdiodes.blanche = initdiodes.blanche + 1;
      } else{
        initdiodes.noiremoins = initdiodes.noiremoins + 1;
      }
      initdiodes.noire = initdiodes.noire - 1;
    } else if (initdiodes.noiremoins > 0) {
      if(sens){
        initdiodes.noire = initdiodes.noire + 1;
        initdiodes.noiremoins = initdiodes.noiremoins - 1;
      } 
    }
    initdiodes.initEval = await this.calculerInitEval(initdiodes);
    return await this.update({ "flags.omega.initdiodes": initdiodes, "initiative":  initdiodes.initEval});
  }


  async setState(data) {
    return await this.update({
      initiative: data.initiative,
      ["flags.omega.initdiodes"]: data.initdiodes
    });
  }

  getState() {
    return {
      id: this.id,
      initiative: this.initiative,
      initdiodes: this.getFlag("omega", "initdiodes")
    };
  }

}
