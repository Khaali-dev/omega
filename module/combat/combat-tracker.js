export default class OmegaCombatTracker extends CombatTracker {
  get template() {
    return "systems/omega/templates/combat/combat-tracker.html";
  }

  async getData(options) {
    const context = await super.getData(options);
    //console.log("context", context);

    if (!context.hasCombat) {
      return context;
    }

    for (let [i, combatant] of context.combat.turns.entries()) {
      console.log("combatant", combatant);
      console.log("i", i);
      let initdiodes = combatant.getFlag("omega", "initdiodes");
      context.turns[i].initdiodes = initdiodes;
    }
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".diodeup").click(this._onDiode.bind(this));
  }

  /**
   * @description Améliorer (sens=1) ou diminuer (sens=0) la diode d'action
   * @param {*} event
   */
  async _onDiode(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let sens = parseInt(element.dataset.field, 10);
    const combat = this.viewed;
    const combatant = combat.combatants.get(element.dataset.combatantId);
    combatant.changerDiode(sens);
    //this.render();
  }
}
