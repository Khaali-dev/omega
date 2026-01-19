export default class OmegaCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  static DEFAULT_OPTIONS = {
    actions: {
      diodeup: OmegaCombatTracker.#onDiodeup,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: "templates/sidebar/tabs/combat/header.hbs",
    },
    tracker: {
      template: "systems/omega/templates/combat/tracker.hbs",
      scrollable: [""],
    },
    footer: {
      template: "templates/sidebar/tabs/combat/footer.hbs",
    },
  };

  /** @override */
  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);

    let initdiodes = combatant.getFlag("omega", "initdiodes");
    turn.initdiodes = initdiodes;

    return turn;
  }

  /* -------------------------------------------------- */
  /*   Actions                                          */
  /* -------------------------------------------------- */

  /**
   * Handle modifying a diode.
   * @this {CombatTracker}
   * @param {...any} args
   */
  static #onDiodeup(...args) {
    return this._onDiode(...args);
  }

  /**
   * @description Améliorer (sens=1) ou diminuer (sens=0) la diode d'action
   * @param {PointerEvent} event  The triggering event.
   * @param {HTMLElement} target  The action target element.
   */
  async _onDiode(event, target) {
    event.preventDefault();
    let sens = parseInt(target.dataset.field, 10);
    const combat = this.viewed;
    const combatant = combat.combatants.get(target.dataset.combatantId);
    combatant.changerDiode(sens);
  }
}
