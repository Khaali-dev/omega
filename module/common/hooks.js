import { Diodes } from "./roll.js";

export default function registerHooks() {
  Hooks.once("ready", () => {
    _showUserGuide();
  });

  Hooks.on("createActor", async (document, options, userId) => {
    if (game.user.isGM) {
      let createChanges = {};
      mergeObject(createChanges, {
        "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      });
      if (document.type === "advancedsynth") {
        createChanges.token.vision = true;
        createChanges.token.actorLink = true;
        if (document.img === 'icons/svg/mystery-man.svg') {
          createChanges.img = 'systems/omega/assets/image/robot.svg';
        }
      }
      else if (document.type === "synthetique") {
        if (document.img === 'icons/svg/mystery-man.svg') {
          createChanges.img = 'systems/omega/assets/image/robot.svg';
        }
      }
      else if (document.type === "vaisseau") {
        if (document.img === 'icons/svg/mystery-man.svg') {
          createChanges.img = 'systems/omega/assets/image/spaceship.svg';
        }
      }
      document.update(createChanges);
    }
  });

  Hooks.on("renderChatMessage", (message, html, data) => {
    html.find(".repiocher").click((ev) => reroll(ev, data.message));
  });

  function reroll(eventData, message) {
    // Get the message
    const messageId = message._id;
    const newMessage = game.messages.get(messageId);
    let userId = newMessage.getFlag("world", "reRollUserId");

    if (!game.user.isGM && game.user._id !== userId) return;

    let flagData = newMessage.getFlag("world", "diodeData");
    let diode = new Diodes(flagData.actor, flagData.rolltype, flagData.program, flagData.data);
    diode.reroll(eventData, message);
  }

  async function _showUserGuide() {
    if (game.user.isGM) {
      const newVer = game.system.version;
      const userGuideJournalName = "Présentation du Système Oméga";
      const userGuideCompendiumLabel = "systemuserguidefr";

      let currentVer = "0";
      let oldUserGuide = game.journal.getName(userGuideJournalName);
      if (oldUserGuide !== undefined && oldUserGuide !== null && oldUserGuide.getFlag("omega", "ver") !== undefined) {
        currentVer = oldUserGuide.getFlag("omega", "ver");
      }
      if (newVer === currentVer) {
        // Up to date
        return;
      }

      let newReleasePack = game.packs.find((p) => p.metadata.name === userGuideCompendiumLabel);
      if (newReleasePack === null || newReleasePack === undefined) {
        console.log("No conpendium found for the system guide");
        return;
      }
      await newReleasePack.getIndex();

      let newUserGuide = newReleasePack.index.find((j) => j.name === userGuideJournalName);
      if (newUserGuide === undefined || newUserGuide === null) {
        console.log("No system guide found in the conpendium");
        return;
      }

      // Don't delete until we have new release Pack
      if (oldUserGuide !== null && oldUserGuide !== undefined) {
        await oldUserGuide.delete();
      }

      await game.journal.importFromCompendium(newReleasePack, newUserGuide._id);
      let newReleaseJournal = game.journal.getName(newUserGuide.name);

      await newReleaseJournal.setFlag("omega", "ver", newVer);

      // Show journal
      await newReleaseJournal.sheet.render(true, { sheetMode: "text" });
    }
  }
}
