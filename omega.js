import { OMEGA, LOG_HEAD, ROLL_TYPE } from "./module/common/config.js";
import { Diodes } from "./module/common/roll.js";

import preloadTemplates from "./module/common/templates.js";
import registerHandlebarsHelpers from "./module/common/helpers.js";
import registerSystemSettings from './module/common/settings.js';
import registerHooks from './module/common/hooks.js';

import OmegaBaseActor from "./module/actor/base-actor.js";
import OmegaBaseItem from "./module/item/base-item.js";

import OmegaCombat from "./module/combat/combat.js"
import OmegaCombatTracker from "./module/combat/combat-tracker.js"
import OmegaCombatant from "./module/combat/combatant.js"

import AdvancedSynthSheet from "./module/actor/sheet/advancedsynth-sheet.js";
import SynthetiqueSheet from "./module/actor/sheet/synthetique-sheet.js";
import OrganiqueSheet from "./module/actor/sheet/organique-sheet.js";
import VaisseauSheet from "./module/actor/sheet/vaisseau-sheet.js";
import OmegaBaseItemSheet from "./module/item/sheet/base-sheet.js";

Hooks.once("init", function(){

    console.log(LOG_HEAD + "Initializing Omega System");

    CONFIG.Item.documentClass = OmegaBaseItem;
    CONFIG.Actor.documentClass = OmegaBaseActor;
    CONFIG.Combat.documentClass = OmegaCombat;
    CONFIG.ui.combat = OmegaCombatTracker;
    CONFIG.Combatant.documentClass = OmegaCombatant;
    
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('omega', OmegaBaseItemSheet, {makeDefault: true });
    /*Items.registerSheet('omega', WeaponSheet, {label: "WeaponSheet", makeDefault: true, types: ['arme']});*/

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('omega', AdvancedSynthSheet, {types: ['advancedsynth'], makeDefault: true });
    Actors.registerSheet('omega', OrganiqueSheet, {types: ['organique'], makeDefault: true });
    Actors.registerSheet('omega', SynthetiqueSheet, {types: ['synthetique'], makeDefault: true });
    Actors.registerSheet('omega', VaisseauSheet, {types: ['vaisseau'], makeDefault: true });
    
    game.omega = {
        config: OMEGA
    }
;
	// Preload Handlebars Templates
	preloadTemplates();

	// Register Handlebars Helpers
	registerHandlebarsHelpers();

	// Register System Settings
	registerSystemSettings();

	// Register Hooks
	registerHooks();

});

Hooks.on('init', () => {
  initControlButtons();
});

async function initControlButtons() {

    CONFIG.Canvas.layers.omega = { layerClass: ControlsLayer, group: "primary" };
  
    Hooks.on("getSceneControlButtons", (btns) => {
      let menu = [];
  
        menu.push({
          name: "piocherdiodes",
          title: "Piocher des diodes",
          icon: "fas fa-sack",
          button: true,
          onClick: () => {
            let data = {};
            let diodes = new Diodes(undefined, ROLL_TYPE.SIMPLE, undefined, data);
            diodes.openDialog();
          },
        }
        )
        btns.push({
          name: "omega",
          title: "Oméga",
          icon: "fas fa-microchip",
          layer: "omega",
          tools: menu
        });
    });
  }