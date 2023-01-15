import { ROLL_TYPE } from "./config.js";

export class Diodes {
  /**
   * Tirage de diodes
   * @param actor The actor which performs the action
   * @param rolltype the type of roll (program, weapon)
   * @param program  The program (skill) : '{Value , label, group, reference}
   * @param data
   *        item  the weapon used
   *        mod  modifier to the roll
   */

  constructor(actor, rolltype, program, data) {
    this.actor = actor;
    this.rolltype = rolltype;
    this.program = program;
    this.data = data;
    this.isReroll = false;
  }

  async openDialog() {
    this.data.isAttack = this.rolltype === ROLL_TYPE.ATTACK ? true : false;
    let namesForText = { actorname: this.actor.name, program: game.i18n.localize(this.program.label) };
    if (this.data.isAttack && !this.data.weapon) return;
    this.data.introText = game.i18n.format("OMEGA.dialog.introtext." + this.rolltype, namesForText);
    const html = await renderTemplate("systems/omega/templates/chat/roll-dialog.html", {
      actor: this.actor,
      program: this.program,
      type: this.rollType,
      action: this.data,
      isAttack: this.data.isAttack,
      weapon: this.data?.weapon,
      introText: this.data.introText,
      charImg: this.actor.img,
      isPlayer: this.actor.isPlayer(),
    });

    // Display the action panel
    await new Dialog({
      title: "Tirage de diode",
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("OMEGA.dialog.button.roll"),
          callback: async (html) => {
            this.data.formula = this.program.value.toString();
            this.data.formulaValue = this.program.value;

            this.data.applyModifiers = [];

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

            // Process to the roll
            await this.piocher();
            await this.showResult();
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
    }).render(true);
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
    if (this.data.formulaValue === 1 && !this.isReroll) {
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

    const html = await renderTemplate("systems/omega/templates/chat/roll-result.html", {
      owner: this.actor.id,
      introText: this.introtext,
      actingCharName: this.actor.name,
      actingCharImg: this.actor.img,
      data: this.data,
      rerollButton: rerollButton,
      resultText: this.resultText,
    });
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({
        alias: game.user.name,
        actor: this.actor.id,
      }),
      content: html,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    };
    this.chat = await ChatMessage.create(chatData);
  }
}
