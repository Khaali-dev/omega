import { OmegaBaseActorSheet } from "./base-sheet.js";

export default class AdvancedSynthSheet extends OmegaBaseActorSheet {
  /**
   * @constructor
   * @param  {...any} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @override
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      height: 800,
      width: 600,
      resizable: false,
      template: "systems/omega/templates/actor/advancedsynth.html",
      classes: ["omega", "sheet", "actor", "advancedsynth"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "programmes" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }]
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    const stockchassis = [];
    for(let chassis in this.actor.system.chassis){
      let dupChassis=duplicate(this.actor.system.chassis[chassis]);;
      stockchassis.push(dupChassis);
    }
    context.typeSynth = game.omega.config.TYPESYNTH[this.actor.system.typeSynth];
    context.stockchassis= stockchassis;
    context.logofirme=game.omega.config.FIRME[this.actor.system.firme].logoclass;
    context.armes = this.actor.items.filter((item) => item.type == "arme");
    context.armes.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
      element.system.attacklabel=game.omega.config.ARME.TYPEPROGRAMME[element.system.typeprogramme];
      element.system.attackvalue=this.actor.system.programmes[element.system.typeprogramme].value;
      element.system.technologielabel=game.omega.config.ARME.TECHNOLOGIE[element.system.technologie];
    });

    return context;
  }

  /** @override */
  activateListeners(html){
    super.activateListeners(html);
  }

}

