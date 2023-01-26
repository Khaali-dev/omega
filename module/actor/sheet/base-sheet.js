export class OmegaBaseActorSheet extends ActorSheet {
  /**
   * @constructor
   * @param  {...any} args
   */
  constructor(...args) {
    super(...args);
    this.options.submitOnClose = true;
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.system = context.actor.system;
    context.flags = context.actor.flags;
    context.id = context.actor.id;
    context.config = game.omega.config;
    context.editable = this.isEditable;
    context.isGm = game.user.isGM;
    context.estorganique = this.actor.estOrganique();
    context.extensions = this.actor.items.filter((item) => item.type == "extension");
    context.extensions.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });
    context.descriptionhtml = TextEditor.enrichHTML(this.actor.system.description, { async: false });
    context.equipements = this.actor.items.filter((item) => item.type == "equipement");
    context.equipements.forEach((element) => {
      element.system.descriptionhtml = TextEditor.enrichHTML(element.system.description, { async: false });
    });
    /*context.equipments = context.items.filter((item) => ["equipment", "armor", "arme"].includes(item.type));
    for (let item of context.equipments) {
        item.system.descriptionhtml = TextEditor.enrichHTML(item.system.description, { async: false });
    }

    // Alphabetic order for skills
    context.skills = context.items
      .filter((item) => item.type == "skill")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });*/

    context.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");
    context.estAdvancedSynth = this.actor.estAdvancedSynth();
    context.descriptionhtml = TextEditor.enrichHTML(this.actor.system.description, { async: false });
    context.system = context.actor.system;
    context.flags = context.actor.flags;
    context.ssprognonnul = [];
    context.ssprogfull = [];
    for (let ssprog in this.actor.system.sousprogrammes) {
      context.ssprogfull.push({ label: this.actor.system.sousprogrammes[ssprog].label, value: this.actor.system.sousprogrammes[ssprog].value, reference: ssprog });
      if (this.actor.system.sousprogrammes[ssprog].value) {
        context.ssprognonnul.push({ label: this.actor.system.sousprogrammes[ssprog].label, value: this.actor.system.sousprogrammes[ssprog].value, reference: ssprog });
      }
    }
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    html.find(".ssprog-input").change(this._onssprogChange.bind(this));
    html.find(".nomchassis").change(this._onChassisChange.bind(this));

    html.find(".caract-text").click(this._onCaractRoll.bind(this));
    html.find(".prog-text").click(this._onProgramRoll.bind(this));
    html.find(".chance-roll").click(this._onChanceRoll.bind(this));
    html.find(".ssprogram-text").click(this._onSsProgramRoll.bind(this));
    html.find(".aux-text").click(this._onAuxSystRoll.bind(this));

    html.find(".item-edit").click((ev) => this._onItemEdit(ev));
    html.find(".item-delete").click((ev) => this._onItemDelete(ev));
    html.find(".item-activer").click((ev) => this._onChassisActivate(ev));
    html.find(".item-remove").click((ev) => this._onExtensionRemove(ev));

    html.find(".item-shoot").click((ev) => this._onItemRoll(ev));
  }

  /**
   * @description Manage the lock/unlock button on the sheet
   * @param {*} event
   */
  async _onSheetChangelock(event) {
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    flagData ? await this.actor.unsetFlag(game.system.id, "SheetUnlocked") : await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");

    this.actor.sheet.render(true);
  }
  async _onssprogChange(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let ssprog = element.dataset.field;
    let value = element.valueAsNumber;
      let linkMod = "system.sousprogrammes." + ssprog + ".value";
      await this.actor.update({ [linkMod]: value });
    
    return;
  }
  async _onChassisChange(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let chassisId = element.firstElementChild.value;
    if (chassisId) {
      this.actor.activeChassis(chassisId);
    }
    return;
  }

  async _onCaractRoll(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let field = element.dataset.field;
    let group = "caracteristiques";
    return this.actor.check(group, field);
  }

  async _onProgramRoll(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let field = element.dataset.field;
    let group = "programmes";
    return this.actor.check(group, field);
  }

  async _onSsProgramRoll(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let field = element.dataset.field;
    let group = "sousprogrammes";
    return this.actor.check(group, field);
  }
  async _onAuxSystRoll(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let field = element.dataset.field;
    let group = "systemesauxiliaires";
    return this.actor.check(group, field);
  }

  async _onChanceRoll(event) {
    event.preventDefault();
    return this.actor.chanceRoll();
  }

  async _onItemRoll(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let field = element.dataset.field;
    let item = this.actor.items.get(field);
    if (!item || !item.type === "arme") return;
    return this.actor.shoot(field);
  }
  _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.dataset.field;
    let item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.dataset.field;
    let item = this.actor.items.get(itemId);
    if (item === null) {
      return;
    }
    this.actor.deleteEmbeddedDocuments("Item", [item.id], { render: true });
  }

  _onChassisActivate(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let chassisId = element.dataset.field;
    return this.actor.activerChassis(chassisId);
  }
  _onExtensionRemove(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let extensionId = element.dataset.field;
    const target = this.actor.items.get(extensionId);
    if (target) {
      const itemData = duplicate(target);
      itemData.system.chassisId = "";
      return this.actor.updateEmbeddedDocuments("Item", [itemData]);
    }
  }

  /** @override */
  _onDrop(event) {
    event.preventDefault();
    if (!this.options.editable) return false;
    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      return false;
    }
    if (!data) return false;

    // Case 1 - Dropped Item
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }
    // Case 2 - Dropped Actor
    if (data.type === "Actor") {
      return false;
    }
  }
  _onDropItem(event, data) {
    event.preventDefault();
    Item.fromDropData(data).then((item) => {
      const itemData = duplicate(item);
      switch (itemData.type) {
        case "extension":
          return this._onDropExtension(event, itemData, data);
        case "arme":
          return this._onDropExtension(event, itemData, data);
        case "chassis":
          if (this.actor.estOrganique()) {
            return false;
          } else return super._onDropItem(event, data);
        case "avantage":
          if (this.actor.estOrganique()) {
            return super._onDropItem(event, data);
          } else return false;
        default:
          return super._onDropItem(event, data);
      }
    });
  }
  async _onDropExtension(event, itemData, data) {
    event.preventDefault();

    // Get the target chassis
    if (this.actor.estAdvancedSynth()) {
      const id = event.target.dataset.chassis;
      const target = this.actor.items.get(id);
      console.log("target", target);
      if (!target || target.type !== "chassis") {
        return super._onDropItem(event, data);
      } else {
        console.log("itemData2", itemData);
        const moveditem = this.actor.items.get(itemData._id);
        console.log("moveditem", moveditem);
        if (!moveditem) {
          console.log("data", data);
          return super._onDropItem(event, data);
        }
        itemData.system.chassisId = id;
        await this.actor.updateEmbeddedDocuments("Item", [itemData]);
        console.log(this.actor.items);
      }
    } else return super._onDropItem(event, data);
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemData = {
      type: element.dataset.type,
    };
    switch (element.dataset.type) {
      case "boon":
        itemData.name = game.i18n.localize("OMEGA.boon.add");
        break;
      case "arme":
        itemData.name = game.i18n.localize("OMEGA.arme.add");
        itemData.system = {
          state: "active",
        };
        break;
      case "skill":
        itemData.name = game.i18n.localize("OMEGA.skill.add");
        break;
      case "armor":
        itemData.name = game.i18n.localize("OMEGA.armor.add");
        itemData.system = {
          state: "active",
        };
        break;
      case "equipment":
        itemData.name = game.i18n.localize("OMEGA.equipment.add");
        break;
    }

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
}
