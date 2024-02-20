import { ROLL_TYPE } from "./config.js";

export class Diodes {
  /**
   * Tirage de diodes
   * @param actor L'acteur qui agit
   * @param rolltype le type de tirage  (ROLL_TYPE)
   * @param program  Le programme utilisé : '{Value , label, reference}
   * @param data
   *        itemId  L'id de l'arme si attaque
   *        malusDegatsSubis  le malus au actions du aux dégâts subis
   *        mod  modificateur au jet
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

    // Si rollMode n'est pas défini, on prend celui par défaut (celui du chat)
    let visibilityMode = this.data.rollMode ?? game.settings.get('core', 'rollMode');

    // Visibilité des jet des PNJs en fonction de l'option choisie
    if (game.user.isGM) {
      let visibilityChoice = game.settings.get("omega", "visibiliteJetsPNJ");
      if (visibilityChoice === "public") visibilityMode = "publicroll";
      else if (visibilityChoice === "private") visibilityMode = "gmroll";
      else if (visibilityChoice === "depends") visibilityMode = game.settings.get('core', 'rollMode');
    }
    this.data.rollMode = visibilityMode;

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
          if(arme.system.precision && arme.system.precision !=="0"){
            this.program.value += parseInt(arme.system.precision, 10);
          }
        }
      }
      let prepareintrotext = this.actor.estOrganique() ? "organique" : "";
      if(this.actor.estVaisseau()){prepareintrotext="vaisseau"};
      if(this.actor.estVaisseau() && (this.rolltype!==ROLL_TYPE.INITIATIVE)){
        prepareintrotext = "equipage.".concat(this.program.reference);
        namesForText.equipagename = this.actor.system.equipage[this.program.reference].name;
      }
      this.data.introText = game.i18n.format("OMEGA.dialog.introtext." + this.rolltype + prepareintrotext, namesForText);
      this.data.malusText = this.data.malusDegatsSubis ? game.i18n.format("OMEGA.dialog.malustext", { malus: this.data.malusDegatsSubis.toString() }) : "";
      this.actorname = this.actor.name;
      this.data.charImg = this.actor.img;
      this.data.estAdvancedSynth = this.actor.estAdvancedSynth();
    }

    if ([ROLL_TYPE.CHANCE, ROLL_TYPE.INITIATIVE].includes(this.rolltype)) {
      this.data.formula = this.program.value.toString();
      this.data.formulaValue = this.program.value;
      await this.piocher();
      return await this.showResult();
    } else {
      const html = await renderTemplate("systems/omega/templates/chat/roll-dialog.html", {
        actorname: this.data.actorname,
        program: this.program,
        type: this.rollType,
        action: this.data,
        isAttack: this.data.isAttack,
        arme: this.data?.arme,
        introText: this.data.introText,
        malusText: this.data.malusText,
        charImg: this.data.charImg,
        estAdvancedSynth: this.data.estAdvancedSynth,
      });
      return await new Dialog({
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

                // Modificateur dégâts subis
                if (this.data.malusDegatsSubis) {
                  this.data.formula = this.data.formula.concat(" - ", this.data.malusDegatsSubis.toString());
                  this.data.formulaValue = this.data.formulaValue - this.data.malusDegatsSubis;
                  this.data.applyModifiers.push(game.i18n.format("OMEGA.chatmessage.malusDegatsSubis", { malusDegatsSubis: this.data.malusDegatsSubis.toString() }));
                }
                
                // Modificateur libre
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

                // Difficulté
                const difficulty = html.find("#difficulty")[0].value;
                this.data.difficulty = parseInt(difficulty);
                this.data.difficultyText = game.i18n.format("OMEGA.chatmessage.difficulty", { difficulty: this.data.difficulty });
                if (this.data.difficulty) {
                  this.data.formula = this.data.formula.concat(" - ", this.data.difficulty.toString());
                  this.data.formulaValue = this.data.formulaValue - this.data.difficulty;
                  this.data.applyModifiers.push(this.data.difficultyText);
                }
              }
              // Piocher les diodes
              await this.piocher();
              // afficher le résultat
              return await this.showResult();
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
  }
  
  /**
   * Piocher le nombre de diodes selon data.formulaValue et les placer
   * @param actor L'acteur qui agit
   * @param rolltype le type de tirage  (ROLL_TYPE)
   * @param program  Le programme utilisé : '{Value , label, reference}
   * @param data
   *        itemId  L'id de l'arme si attaque
   *        malusDegatsSubis  le malus au actions du aux dégâts subis
   *        mod  modificateur au jet
   */
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
    const bag = Array.from(Array(30).keys()).map(i => i + 1); // Sac contient 1..30.

    // Mélanger le sac (algorithme Fisher-Yates).
    for (let i = bag.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1)); // Nombre aléatoire entre 0 et i.
      const temp = bag[i];
      bag[i] = bag[r];
      bag[r] = temp;
    }
    
    for (let i = 0; i < this.data.nbDiodes; i++) {
      const value = bag.pop(); // Lire et retirer une diode.
      const color = await this.couleur(value); // Récupérer la couleur à partir de la valeur pioché.
      this.data.diodesResult.push({ value: value, color: color });
      console.log({ value: value, color: color });
      this.data.diodesSorties.push(value);
      this.data.diodesParCouleur[color] += 1;
    }
  }
  async evaluerDiodesAPiocher(formula) {
    if (formula) return Math.abs(formula);
    else return 1;
  }
  async couleur(value) {
    if (value < 4) return "noire";
    else if (value > 27) return "rouge";
    else if (value > 21) return "verte";
    else if (value > 15) return "bleue";
    return "blanche";
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
      if(arme.type === "regroupement"){
        const updates = {"_id": this.data.itemId, "system.tireffectue" : true};
        this.actor.updateEmbeddedDocuments('Item', [updates]);
      }
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

    // Si rollMode n'est pas défini, on prend celui par défaut (celui du chat)
    let visibilityMode = this.data.rollMode ?? game.settings.get('core', 'rollMode');

    // Le joueur a choisi de chuchoter au le MJ
    if (this.data.isWhisper) visibilityMode = "gmroll";

    switch (visibilityMode) {
      case "gmroll":
        chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
        break;
      case "blindroll":
        chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
        chatData.blind = true;
        break;
      case "selfroll":
        chatData.whisper = [game.user.id];
        break;
    }

    chatData.rollMode = visibilityMode;

    this.chat = await ChatMessage.create(chatData);
    if (rerollButton) {
      if (this.playerCanReroll) this.chat.setFlag("world", "reRollUserId", game.user.id);
      this.chat.setFlag("world", "reRoll", templateData);
      this.chat.setFlag("world", "diodeData", { actorId: this.actor.id, rolltype: this.rolltype, program: this.program, data: this.data });
    }
    if (this.rolltype === ROLL_TYPE.INITIATIVE) {
      return this.data;
    }
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
