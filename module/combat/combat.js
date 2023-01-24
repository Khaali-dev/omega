export default class OmegaCombat extends Combat {

  
  /**
   * @description Ordre des combatants
   * 
   */
  _sortCombatants(a, b) {
    if (a.defeated) {
      return 1;
    }
    if (b.defeated) {
      return -1;
    }
    let initdiodesA = a.getFlag("omega", "initdiodes");
    let initdiodesB = b.getFlag("omega", "initdiodes");
    if (typeof initdiodesA !== "undefined" && typeof initdiodesB !== "undefined") {
      let diff = initdiodesB.initEval - initdiodesA.initEval;
      if (diff != 0) {
        return diff;
      }
    }
    return a.tokenId - b.tokenId;
  }


  _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    this.setupTurns();
    if (game.user.id === userId) this.update({ turn: 0 });
    else this.update({ turn: 0 });

    if (this.active && (options.render !== false)) this.collection.render();
  }


  async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
    ids = typeof ids === "string" ? [ids] : ids;
    console.log("this", this);
    console.log("ids", ids);

    for (let combatantId of ids) {
      console.log("combatantId", combatantId);
      // Get Combatant data
      const c = this.combatants.get(combatantId);
      if (!c) return;
      const actor = game.actors.get(c.actorId);
      if (!actor) return;
      let diodesResult = await actor.piocherInitiative();
      let vitesse = await actor.valeurVitesse();
      console.log("Initiative tirée pour le combattant " + c.name + " : " + diodesResult);

      let initDiodes = {
        rougeplus: 0,
        rouge: diodesResult.diodesParCouleur.rouge,
        verte: diodesResult.diodesParCouleur.verte,
        bleue: diodesResult.diodesParCouleur.bleue,
        blanche: diodesResult.diodesParCouleur.blanche,
        noire: diodesResult.diodesParCouleur.noire,
        noiremoins: 0,
        nbActions: diodesResult.nbDiodes,
        vitesse: vitesse,
        initEval: 0,
      };
      initDiodes.initEval = await c.calculerInitEval(initDiodes);
      console.log("calcul de Initiative : ", initDiodes.initEval);
      c.update({ "flags.omega.initdiodes": initDiodes, initiative: initDiodes.initEval });
    }
    return this;
  }

  async startCombat() {
    await this.setupTurns();
    return super.startCombat();
  }

  async nextTurn() {
    await this.combatant.spendAction();
    if (this.combatant.initiative <= 0) {
        return this.nextRound();
      }

    return this.update({ turn: 0});
  }

  async nextRound() {
    //await this._pushHistory(this.combatants.map(c => c.getState()));
    //await this._pushHistory("newRound");


    await this.resetAll();

    return this.update({ round: this.round + 1, turn: 0 }, { advanceTime: CONFIG.time.roundTime });
  }


  /**
   * Reset all combatant initiative scores, setting the turn back to zero
   * @return {Promise<Combat>}
   */
  async resetAll() {
    let initdiodes = {
      rouge: 0,
      verte: 0,
      bleue: 0,
      blanche: 0,
      noire: 0,
      nbActions: 0,
      initEval: 0,
    };
    for (let c of this.combatants) {
      c.updateSource({ initiative: null, "flags.omega.initdiodes": initdiodes });
    }
    return this.update({ turn: 0, combatants: this.combatants.toObject() }, { diff: false });
  }
}
