import { OMEGA, LOG_HEAD } from "./module/common/config.js";

import preloadTemplates from "./module/common/templates.js";
import registerHandlebarsHelpers from "./module/common/helpers.js";
import registerSystemSettings from './module/common/settings.js';
import registerHooks from './module/common/hooks.js';

import OmegaBaseActor from "./module/actor/base-actor.js";
import OmegaBaseItem from "./module/item/base-item.js";

import PlayerSheet from "./module/actor/sheet/player-sheet.js";
import OmegaBaseItemSheet from "./module/item/sheet/base-sheet.js";

Hooks.once("init", function(){

    console.log(LOG_HEAD + "Initializing Omega System");

    CONFIG.Item.documentClass = OmegaBaseItem;
    CONFIG.Actor.documentClass = OmegaBaseActor;
    
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('omega', OmegaBaseItemSheet, {makeDefault: true });
    /*Items.registerSheet('omega', WeaponSheet, {label: "WeaponSheet", makeDefault: true, types: ['weapon']});*/

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('omega', PlayerSheet, {types: ['player'], makeDefault: true });
    //Actors.registerSheet('omega', NpcSheet, {types: ['npc'], makeDefault: true });
    
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