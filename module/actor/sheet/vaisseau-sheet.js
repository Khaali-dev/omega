import { OmegaBaseActorSheet } from "./base-sheet.js";
import { OMEGA } from "../../common/config.js";

export default class VaisseauSheet extends OmegaBaseActorSheet {
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
      height: 600,
      width: 800,
      resizable: false,
      template: "systems/omega/templates/actor/vaisseau.html",
      classes: ["omega", "sheet", "actor", "vaisseau"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "vaisseau-pont" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.regroupements = this.actor.items.filter((item) => item.type === "regroupement");
    context.regroupements.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });
    context.upgrades = this.actor.items.filter((item) => item.type === "upgrade");
    context.upgrades.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });
    context.equipage = duplicate(this.actor.system.equipage);
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".piocheequipage").click(this._onEquipageRoll.bind(this));
    html.find(".change_equipage").click(this._onEquipageChange.bind(this));
    html.find(".sheet-reload").click(this._onRechargerRegroupement.bind(this));
  }
  _onDropItem(event, data) {
    event.preventDefault();
    Item.fromDropData(data).then((item) => {
      const itemData = duplicate(item);
      switch (itemData.type) {
        case "extension":
          return false;
        case "arme":
          return false;
        case "chassis":
          return false;
        case "avantage":
          return false;
        case "regroupement":
          return super._onDropItem(event, data);
        case "upgrade":
          return super._onDropItem(event, data);
        default:
          return super._onDropItem(event, data);
      }
    });
  }

  _onEquipageRoll(event, data) {
    event.preventDefault();
    let element = event.currentTarget;
    let field = element.dataset.field;
    let group = "equipage";
    if (this.actor.system[group][field].actorid.length) {
      let actorEquipage = game.actors.get(this.actor.system[group][field].actorid);
      return actorEquipage.check("sousprogrammes", OMEGA.EQUIPAGE[field].reference);
    } else return this.actor.check(group, field);
  }

  async _onEquipageChange(event, data) {
    event.preventDefault();
    let element = event.currentTarget;
    const posteEquipage = element.dataset.field;
    if (!posteEquipage) return false;
    await this.actor.changerEquipage("", posteEquipage);
  }

  async _onDropActor(event, data) {
    event.preventDefault();
    const posteEquipage = event.target.dataset.equipage;
    if (!posteEquipage) return false;
    Actor.fromDropData(data).then(async (actor) => {
      const actorId = actor._id;
      await this.actor.changerEquipage(actorId, posteEquipage);
    });
  }

  async changerEquipage(actorId, posteEquipage) {
    let updateData = duplicate(this.actor);
    let actorEquipage = game.actors.get(actorId);
    if (actorEquipage) {
      updateData.system.equipage[posteEquipage].actorid = actorId;
      updateData.system.equipage[posteEquipage].img = actorEquipage.img;
      updateData.system.equipage[posteEquipage].name = actorEquipage.name;
      if (typeof actorEquipage["programme_" + posteEquipage] == "function") {
        updateData.system.equipage[posteEquipage].value = actorEquipage["programme_" + posteEquipage]();
      } else {
        console.log("pas de fonction");
      }
    } else {
      updateData.system.equipage[posteEquipage].value = this.actor.system.equipage[posteEquipage].autovalue;
      updateData.system.equipage[posteEquipage].actorid = "";
      updateData.system.equipage[posteEquipage].img = "systems/omega/assets/image/robot.svg";
      updateData.system.equipage[posteEquipage].name = "Automatique";
    }
    return await this.actor.update(updateData);
  }

  _onRechargerRegroupement(event, data) {
    event.preventDefault();
    return this.actor.rechargerRegroupements();
  }
}
