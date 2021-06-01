import {registerSettings} from "./src/settings.js";
import {Launchpad} from "./src/Launchpad.js";
import {PlaylistControl} from "./src/playlist.js";
import {SoundboardControl} from "./src/soundboard.js";
import {VisualFx} from "./src/visualFx.js";
import {CombatTracker} from "./src/combatTracker.js";
import {MacroBoard} from "./src/macroBoard.js";
import {compatibleCore,soundboardCheatSheet,macroCheatSheet} from "./src/misc.js";
import {newEmulator} from "./src/forms/emulator.js";
export const moduleName = "MaterialKeys";
export const launchpad = new Launchpad();
export const playlistControl = new PlaylistControl();
export const soundboard = new SoundboardControl();
export const visualFx = new VisualFx();
export const combatTracker = new CombatTracker();
export const macroBoard = new MacroBoard();

//Websocket variables
var ws;                         //Websocket variable
let wsOpen = false;             //Bool for checking if websocket has ever been opened => changes the warning message if there's no connection
let wsInterval;                 //Interval timer to detect disconnections
let WSconnected = false;

//Other global variables
export let enableModule;
let activeSounds = [];

//CONFIG.debug.hooks = true

/**
 * Analyzes the message received from the IR tracker.
 * If coordinates are received, scale the coordinates to the in-game coordinate system, find the token closest to those coordinates, and either take control of a new token or update the position of the image of that token
 * If no coordinates are received, move token to last recieved position
 * 
 * @param {*} msg Message received from the IR tracker
 */
async function analyzeWSmessage(msg){
    //console.log(msg);
    const data = JSON.parse(msg);
    //console.log(data);
    if (data.target != 'MK') return;
    
    if (data.type == 'key'){
        launchpad.keypress(data);
    }
    else if (data.type == 'connected'){
        const connectedDevice = data.data;
        if (connectedDevice == 'null') ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.NoMidi"));
        else {
            ui.notifications.notify("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.MidiConnect")+" "+connectedDevice);
            launchpad.setBrightness(game.settings.get(moduleName,'brightness'));
            launchpad.setMode(8,false);
        }
    }
};

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

Hooks.once('ready', ()=>{
    enableModule = (game.settings.get(moduleName,'Enable') && game.user.isGM) ? true : false;
    if (enableModule) 
        startWebsocket();

    game.socket.on(`module.MaterialKeys`, (payload) =>{
        // console.log(payload);
        if (payload.msgType == "playSound") soundboard.playSound(payload.trackNr,payload.src,payload.play,payload.repeat,payload.volume); 
    });
});

Hooks.on('closeApplication', (form)=>{
    if (enableModule == false) return;
    if (form.id == "playlist-config" && WSconnected){
        launchpad.setMainLEDs(0,0);
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
        const btnSoundboard = $(
            `<button id="MaterialKeys_SBcheatsheet" data-action="MaterialKeys_SBcheatsheet" title="Material Keys: "+${game.i18n.localize("MaterialKeys.SBcheatSheet")}>
                <i></i> ${game.i18n.localize("MaterialKeys.SBcheatSheet")}
            </button>`
        );
        const btnMacroboard = $(
            `<button id="MaterialKeys_SBcheatsheet" data-action="MaterialKeys_MBcheatsheet" title="Material Keys: "+${game.i18n.localize("MaterialKeys.MBcheatSheet")}>
                <i></i> ${game.i18n.localize("MaterialKeys.MBcheatSheet")}
            </button>`
        );

        const btnEmulator = $(
            `<button id="MaterialKeys_Emulator" data-action="MaterialKeys_Emulator" title="Material Keys: "+${game.i18n.localize("MaterialKeys.Emulator")}>
                <i></i> ${game.i18n.localize("MaterialKeys.Emulator.Title")}
            </button>`
        );

        const setupButton = compatibleCore('0.8.6') ? html.find("button[data-action='setup']") : html.find("div[id='settings-game']");
        setupButton.after(label);
        //label.after(btnMacroboard);
        //label.after(btnSoundboard);
        label.after(btnEmulator);
        
    
        btnSoundboard.on("click", event => {
            let dialog = new soundboardCheatSheet();
            dialog.render(true)
        });

        btnMacroboard.on("click", event => {
            let dialog = new macroCheatSheet();
            dialog.render(true)
        });

        btnEmulator.on("click", event => {
            newEmulator();
        });
    });

/**
 * Start a new websocket
 * Start a 10s interval, if no connection is made, run resetWS()
 * If connection is made, set interval to 1.5s to check for disconnects
 * If message is received, reset the interval, and send the message to analyzeWSmessage()
 */
function startWebsocket() {
    //ip = game.settings.get(moduleName,'IP');
    const address = game.settings.get(moduleName,'address');
    ws = new WebSocket('ws://'+address+'/');

    ws.onmessage = function(msg){
       // console.log(msg);
        analyzeWSmessage(msg.data);
        clearInterval(wsInterval);
        wsInterval = setInterval(resetWS, 5000);
    }

    ws.onopen = function() {
        messageCount = 0;
        WSconnected = true;
        const msg = {
            target: "server",
            module: "MK"
        }
        sendWS(JSON.stringify(msg));
        //launchpad.setMode(8);
        const address = game.settings.get(moduleName,'address');
        ui.notifications.info("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.WSConnect")+" "+address);
        wsOpen = true;
        clearInterval(wsInterval);
        wsInterval = setInterval(resetWS, 5000);
    }
  
    clearInterval(wsInterval);
    wsInterval = setInterval(resetWS, 10000);
}
let messageCount = 0;
/**
 * Try to reset the websocket if a connection is lost
 */
function resetWS(){
    const maxMessages = game.settings.get(moduleName, 'nrOfConnMessages');
    if (maxMessages == 0 || maxMessages > messageCount) {
        messageCount++;
        const countString = maxMessages == 0 ? "" : " (" + messageCount + "/" + maxMessages + ")";
        if (wsOpen) {
            ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.WSDisconnect"));
            wsOpen = false;
            messageCount = 0;
        }
        else ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.WSCantConnect") + countString);
    }
    
    WSconnected = false;
    startWebsocket();
}

export function sendWS(txt){
    if (WSconnected) ws.send(txt);
}