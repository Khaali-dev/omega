/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export default async function preloadTemplates() {

    return loadTemplates([
        //Actors
        "systems/omega/templates/actor/advancedsynth.html",
        "systems/omega/templates/actor/organique.html",
        "systems/omega/templates/actor/synthetique.html",
        "systems/omega/templates/actor/vaisseau.html",
        "systems/omega/templates/actor/tab/chassis.html",
        "systems/omega/templates/actor/tab/combat.html",
        "systems/omega/templates/actor/tab/equipement.html",
        "systems/omega/templates/actor/tab/notes.html",
        "systems/omega/templates/actor/tab/personnalite.html",
        "systems/omega/templates/actor/tab/avantages.html",
        "systems/omega/templates/actor/tab/programmes.html",
        "systems/omega/templates/actor/tab/vaisseau-pont.html",
        "systems/omega/templates/actor/tab/equipage.html",
        //Items
        "systems/omega/templates/item/chassis.html",
        "systems/omega/templates/item/extension.html",
        "systems/omega/templates/item/arme.html",
        "systems/omega/templates/item/equipement.html",
        "systems/omega/templates/item/avantage.html",
        //Other
        "systems/omega/templates/chat/roll-dialog.html",
        "systems/omega/templates/chat/roll-result.html"
    ]);

};
