import { ROLL_TYPE } from "./config.js";

export class Diodes {
  /**
   * Tirage de diodes
   * @param actor The actor which performs the action
   * @param rolltype the type of roll (program, arme)
   * @param program  The program (skill) : '{Value , label, group, reference}
   * @param data
   *        itemId  the id of the arme used
   *        mod  modifier to the roll
   */

  constructor(actorId, rolltype, program, data) {
    this.actor = actorId ? game.actors.get(actorId) : undefined;
    this.rolltype = rolltype;
    this.program = program;
    this.data = data;
    this.isReroll = false;
  }

  async openDialog() {
    this.data.isAttack = this.rolltype === ROLL_TYPE.ATTACK ? true : false;
    if (this.rolltype === ROLL_TYPE.SIMPLE) {
      let userId = game.userId;
      this.data.introText = "Pioche simple de diodes";
      this.data.actorname = game.users.get(userId)?.name;
      this.data.charImg = "icons/svg/mystery-man.svg";
      this.data.estAdvancedSynth = true;
    } else {
      let namesForText = { actorname: this.actor.name, program: game.i18n.localize(this.program.label) };
      if (this.data.isAttack) {
        if (!this.data.itemId) {
          return;
        } else {
          let arme = this.actor.items.get(this.data.itemId);
          if (!arme) return;
          namesForText.arme = arme.name;
        }
      }
      let prepareintrotext = this.actor.estOrganique() ? "organique" : "";
      this.data.introText = game.i18n.format("OMEGA.dialog.introtext." + this.rolltype + prepareintrotext, namesForText);
      this.actorname = this.actor.name;
      this.data.charImg = this.actor.img;
      this.data.estAdvancedSynth = this.actor.estAdvancedSynth();
    }

    if ([ROLL_TYPE.CHANCE, ROLL_TYPE.INITIATIVE].includes(this.rolltype)) {
      this.data.formula = this.program.value.toString();
      this.data.formulaValue = this.program.value;
      await this.piocher();
      return(await this.showResult());
    } else {
      const html = await renderTemplate("systems/omega/templates/chat/roll-dialog.html", {
        actorname: this.data.actorname,
        program: this.program,
        type: this.rollType,
        action: this.data,
        isAttack: this.data.isAttack,
        arme: this.data?.arme,
        introText: this.data.introText,
        charImg: this.data.charImg,
        estAdvancedSynth: this.data.estAdvancedSynth,
      });
      return(await new Dialog({
        title: "Tirage de diode",
        content: html,
        buttons: {
          roll: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("OMEGA.dialog.button.roll"),
            callback: async (html) => {
              this.data.applyModifiers = [];

              if (this.rolltype === ROLL_TYPE.SIMPLE) {
                // Piochage simple
                const nbdiodes = html.find("#nbdiodes")[0].value;
                let diodesNum = parseInt(nbdiodes);
                if (diodesNum) {
                  this.data.formula = nbdiodes;
                  this.data.formulaValue = diodesNum;
                }
              } else {
                this.data.formula = this.program.value.toString();
                this.data.formulaValue = this.program.value;
                // The optional modifier
                const modifier = html.find("#rollmodifier")[0].value;
                this.data.modifier = parseInt(modifier);

                if (this.data.modifier) {
                  if (this.data.modifier > 0) {
                    this.data.formula = this.data.formula.concat(" +");
                  }
                  this.data.formula = this.data.formula.concat(" ", this.data.modifier.toString());
                  this.data.formulaValue = this.data.formulaValue + this.data.modifier;
                  this.data.applyModifiers.push(game.i18n.format("OMEGA.chatmessage.custommodifier", { rollModifier: this.data.modifier }));
                }
                // Difficulte
                const difficulty = html.find("#difficulty")[0].value;
                this.data.difficulty = parseInt(difficulty);
                this.data.difficultyText = game.i18n.format("OMEGA.chatmessage.difficulty", { difficulty: this.data.difficulty });
                if (this.data.difficulty) {
                  this.data.formula = this.data.formula.concat(" - ", this.data.difficulty.toString());
                  this.data.formulaValue = this.data.formulaValue - this.data.difficulty;
                  this.data.applyModifiers.push(this.data.difficultyText);
                }
              }
              // Process to the roll
              await this.piocher();
              return(await this.showResult());
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("OMEGA.dialog.button.cancel"),
            callback: () => {},
          },
        },
        default: "roll",
        close: () => {},
      }).render(true));
    }
  }
  async piocher() {
    this.data.nbDiodes = await this.evaluerDiodesAPiocher(this.data.formulaValue);
    this.data.diodesResult = [];
    this.data.diodesSorties = [];
    this.data.diodesParCouleur = {
      rouge: 0,
      verte: 0,
      bleue: 0,
      blanche: 0,
      noire: 0,
    };
    for (let i = 0; i < this.data.nbDiodes; i++) {
      let newDiode = await this.piocherDiode();
      while (this.data.diodesSorties.includes(newDiode.value)) {
        newDiode = await this.piocherDiode();
      }
      await this.data.diodesResult.push(newDiode);
      await this.data.diodesSorties.push(newDiode.value);
      this.data.diodesParCouleur[newDiode.color] += 1;
    }
  }
  async evaluerDiodesAPiocher(formula) {
    if (formula) return Math.abs(formula);
    else return 1;
  }
  async piocherDiode() {
    const roll = new Roll("1d30", {}).roll({ async: false });
    let color = "blanche";
    if (roll.result < 4) color = "noire";
    else if (roll.result > 27) color = "rouge";
    else if (roll.result > 21) color = "verte";
    else if (roll.result > 15) color = "bleue";

    return {
      value: roll.result,
      color: color,
    };
  }
  async showResult() {
    let rerollButton = false;
    this.resultText = "Résultat final.";
    if ([ROLL_TYPE.SIMPLE, ROLL_TYPE.INITIATIVE].includes(this.rolltype)) {
      this.resultText = "";
    } else if (this.rolltype === ROLL_TYPE.CHANCE) {
      this.resultText = "";
      let modification = {};
      for (let diodecolor of ["noire", "blanche", "verte", "bleue", "rouge"]) {
        await setProperty(modification, "system.chance." + diodecolor, this.data.diodesParCouleur[diodecolor]);
      }
      await this.actor.update(modification);
    } else if (this.data.formulaValue === 1 && !this.isReroll) {
      rerollButton = true;
      this.playerCanReroll = true;
      this.resultText = "Vous pouvez choisir de remplacer cette diode par une autre prise au hasard.";
    } else if (this.data.formulaValue === -1 && !this.isReroll) {
      rerollButton = true;
      this.playerCanReroll = false;
      this.resultText = "La Matrice peut choisir de remplacer cette diode par une autre prise au hasard.";
    } else if (this.data.formulaValue > 1) {
      this.resultText = "Choisissez quelle diode indique le résultat de l'action.";
    } else if (this.data.formulaValue < -1) {
      this.resultText = "La Matrice choisit quelle diode indique le résultat de l'action.";
    }
    let armedata;
    if (this.rolltype === ROLL_TYPE.ATTACK) {
      let arme = this.actor.items.get(this.data.itemId);
      armedata = duplicate(arme.system.effetdiode);
    }

    const templateData = {
      owner: this.actor?.id,
      introText: this.introtext,
      actingCharName: this.data.actorname,
      actingCharImg: this.data.charImg,
      data: this.data,
      rerollButton: rerollButton,
      resultText: this.resultText,
      armedata: armedata,
    };

    const html = await renderTemplate("systems/omega/templates/chat/roll-result.html", templateData);
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({
        alias: game.user.name,
        actor: this.actor?.id,
      }),
      content: html,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    };
    this.chat = await ChatMessage.create(chatData);
    if (rerollButton) {
      if (this.playerCanReroll) this.chat.setFlag("world", "reRollUserId", game.user.id);
      this.chat.setFlag("world", "reRoll", templateData);
      this.chat.setFlag("world", "diodeData", { actorId: this.actor.id, rolltype: this.rolltype, program: this.program, data: this.data });
    }
    if (this.rolltype === ROLL_TYPE.INITIATIVE) {
      return(this.data);}
  }
  async reroll(event, message) {
    this.isReroll = true;

    // Get the message
    const messageId = message._id;
    const newMessage = game.messages.get(messageId);
    // Get the user who has sent the chat message
    const chatUserId = newMessage._source.user;

    // Get the chat data stored in the message's flag
    let templateData = newMessage.getFlag("world", "reRoll");
    templateData.rerollButton = false;
    if (newMessage.getFlag("world", "reRollUserId")) newMessage.unsetFlag("world", "reRollUserId");
    newMessage.unsetFlag("world", "reRoll");
    newMessage.unsetFlag("world", "diodeData");
    await this.piocher();
    templateData.data = this.data;
    templateData.resultText = "Nouvelle pioche effectuée.";
    const html = await renderTemplate("systems/omega/templates/chat/roll-result.html", templateData);
    // Update the chat message content
    await newMessage.update({ content: html });
  }
}
