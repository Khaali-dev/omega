export default function registerSystemSettings() {

    game.settings.register("omega", "visibiliteJetsPNJ", {
      name: "Visibilité de la pioche des PNJs",
      hint: "Détermine si la pioche du MJ est visible par les joueurs : toujours, jamais, ou selon le paramétrage du chat du MJ.",
      scope: "world",
      config: true,
      type: String,
      choices: {
        private: "Privés : Seul le MJ voit leur résultat",
        public: "Publics : Tout le monde voit leur résultat",      
        depends: "En fonction du réglage variable de la fenêtre de chat du MJ",
      },
      default: "private",
    });

    const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);
}