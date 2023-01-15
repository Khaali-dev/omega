export default function registerSystemSettings() {

    const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);
/*
    game.settings.register('omega', 'numberOfPlayers', {
        name: 'OMEGA.options.numberofplayers.name',
        hint: 'OMEGA.options.numberofplayers.hint',
        scope: 'world',
        config: true,
        default: "two",
        type: String,
        choices: {
            "two" : 'OMEGA.options.numberofplayers.two',
            "three" : 'OMEGA.options.numberofplayers.three',
            "four" : 'OMEGA.options.numberofplayers.four',
            "five" : 'OMEGA.options.numberofplayers.five'
        },
        onChange: () => setAllActorsHealthToMax(),
    });*/
}