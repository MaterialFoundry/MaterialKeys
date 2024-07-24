import {registerSettings} from "./src/settings.js";
import {Launchpad} from "./src/Launchpad.js";
import {PlaylistControl} from "./src/playlist.js";
import {SoundboardControl} from "./src/soundboard.js";
import {VisualFx} from "./src/visualFx.js";
import {CombatTracker} from "./src/combatTracker.js";
import {MacroBoard} from "./src/macroBoard.js";
import {Soundscape} from "./src/soundscape.js";
import {newEmulator} from "./src/forms/emulator.js";
import { startWebsocket, WSconnected } from "./src/websocket.js";
import { compatibilityInit } from "./src/compatibilityHandler.js";

export const moduleName = "MaterialKeys";
export const launchpad = new Launchpad();
export const playlistControl = new PlaylistControl();
export const soundboard = new SoundboardControl();
export const visualFx = new VisualFx();
export const combatTracker = new CombatTracker();
export const macroBoard = new MacroBoard();
export const soundscape = new Soundscape();

//Other global variables
export let enableModule;
let activeSounds = [];

//CONFIG.debug.hooks = true

Hooks.on("soundscape", (data) => {
    soundscape.newData(data);
});

Hooks.on('renderPlaylistDirectory', (playlistDirectory)=>{
    if (enableModule == false) return;
    if (WSconnected) {
        playlistControl.playlistUpdate();
        playlistControl.volumeUpdate();
    }
});

Hooks.on('updateScene',()=>{
    if (enableModule == false) return;
    if (WSconnected) visualFx.update();
})

Hooks.on('renderCombatTracker', (a,b,combat)=>{
    if (enableModule == false) return;
    if (WSconnected){
        combatTracker.trackerUpdate(combat.combat);
        if (combat.hasCombat)
            combatTracker.updateTokens(combat.combat);
        else
            combatTracker.updateTokens(null);
            combatTracker.hpUpdate(combat.combat);
    }
});

Hooks.on('updateActor', ()=>{
    if (enableModule == false) return;
    if (WSconnected){
        combatTracker.trackerUpdate(game.combat);
        if (game.combat != null)
            combatTracker.updateTokens(game.combat);
        else
            combatTracker.updateTokens(null);
            combatTracker.hpUpdate(game.combat);
    }
})

Hooks.once('init', ()=>{
    //CONFIG.debug.hooks = true;
    registerSettings(); //in ./src/settings.js
})

Hooks.once('ready', async()=>{
    compatibilityInit();
    enableModule = (game.settings.get(moduleName,'Enable') && game.user.isGM) ? true : false;
    if (enableModule) {
        startWebsocket();
        //Get the settings
        let soundboardSettings = game.settings.get(moduleName,'soundboardSettings');
        if (Object.prototype.toString.call(game.settings.get(moduleName,'soundboardSettings')) === "[object String]") {
            soundboardSettings = {};
            //Check if all settings are defined
            if (soundboardSettings.sounds == undefined) soundboardSettings.sounds = [];
            if (soundboardSettings.colorOn == undefined) soundboardSettings.colorOn = [];
            if (soundboardSettings.colorOff == undefined) soundboardSettings.colorOff = [];
            if (soundboardSettings.mode == undefined) soundboardSettings.mode = [];
            if (soundboardSettings.volume == undefined) soundboardSettings.volume = [];
            if (soundboardSettings.name == undefined) soundboardSettings.name = [];
            if (soundboardSettings.selectedPlaylists == undefined) soundboardSettings.selectedPlaylists = [];
            if (soundboardSettings.src == undefined) soundboardSettings.src = [];
            if (soundboardSettings.toggle == undefined) soundboardSettings.toggle = [];
            game.settings.set(moduleName,'soundboardSettings',soundboardSettings)
        }

        let macroSettings = game.settings.get(moduleName,'macroSettings');
        if (Object.prototype.toString.call(game.settings.get(moduleName,'macroSettings')) === "[object String]") {
            macroSettings = {};
            if (macroSettings.macros == undefined) macroSettings.macros = [];
            if (macroSettings.color == undefined) macroSettings.color = [];
            if (macroSettings.args == undefined) macroSettings.args = [];
            game.settings.set(moduleName,'macroSettings',macroSettings)
        }
    }

    game.socket.on(`module.MaterialKeys`, (payload) =>{
        // console.log(payload);
        if (payload.msgType == "playSound") soundboard.playSound(payload.trackNr,payload.src,payload.play,payload.repeat,payload.volume); 
    });
});

Hooks.on('closeApplication', (form)=>{
    if (enableModule == false) return;
    if (form.id == "playlist-config" && WSconnected){
        launchpad.setMainLEDs(0,'static');
        playlistControl.playlistUpdate();
        playlistControl.volumeUpdate();
    }
});

Hooks.on("renderSettings", (app, html) => {

    /**
     * Create label and button in setup screen
     */
        const label = $(
            `<h2>Material Keys</h2>
                `
        );

        const btnEmulator = $(
            `<button id="MaterialKeys_Emulator" data-action="MaterialKeys_Emulator" title="Material Keys: "+${game.i18n.localize("MaterialKeys.Emulator")}>
                <i></i> ${game.i18n.localize("MaterialKeys.Emulator.Title")}
            </button>`
        );

        const setupButton = html.find("button[data-action='setup']");
        setupButton.after(label);
        label.after(btnEmulator);

        btnEmulator.on("click", event => {
            newEmulator();
        });
    });

Hooks.on("updatePlaylistSound", (sound, volume, diff, id) => {
    playlistControl.volumeUpdate();
});
