import {registerSettings} from "./src/settings.js";
import {Launchpad} from "./src/Launchpad.js";
import {PlaylistControl} from "./src/playlist.js";
import {SoundboardControl} from "./src/soundboard.js";
import {VisualFx} from "./src/visualFx.js";
import {CombatTracker} from "./src/combatTracker.js";
import {MacroBoard} from "./src/macroBoard.js";
import {soundboardCheatSheet,macroCheatSheet} from "./src/misc.js";
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
            launchpad.setMode(launchpad.keyMode);
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
    
    for (let i=0; i<64; i++)
            activeSounds[i] = false;

    game.socket.on(`module.MaterialKeys`, (payload) =>{
        // console.log(payload);
        if (payload.msgType == "playSound") soundboard.playSound(payload.trackNr,payload.src,payload.play,payload.repeat,payload.volume); 
    });
    if (game.user.isGM == false) return;
    const soundBoardSettings = game.settings.get(moduleName,'soundboardSettings');
    const macroSettings = game.settings.get(moduleName, 'macroSettings');
    let array = [];
    for (let i=0; i<64; i++) array[i] = "";
    let arrayVolume = [];
    for (let i=0; i<64; i++) arrayVolume[i] = "50";
    let arrayZero = [];
    for (let i=0; i<64; i++) arrayZero[i] = "0";

    if (macroSettings.color == undefined){
        game.settings.set(moduleName,'macroSettings',{
            macros: array,
            color: arrayZero
        });
    }
    if (soundBoardSettings.colorOff == undefined){
        game.settings.set(moduleName,'soundboardSettings',{
            playlist: "",
            sounds: array,
            colorOn: arrayZero,
            colorOff: arrayZero,
            mode: arrayZero,
            toggle: arrayZero,
            volume: arrayVolume
        });
    }
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
            `<div id="MaterialKeys">
                    <h4>Material Keys</h4>
                </div>
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

        const setupButton = html.find("button[data-action='setup']");
        setupButton.after(label);
        label.after(btnMacroboard);
        label.after(btnSoundboard);
        
    
        btnSoundboard.on("click", event => {
            let dialog = new soundboardCheatSheet();
            dialog.render(true)
        });

        btnMacroboard.on("click", event => {
            let dialog = new macroCheatSheet();
            dialog.render(true)
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
        WSconnected = true;
        const msg = {
            target: "server",
            module: "MK"
        }
        sendWS(JSON.stringify(msg));
        launchpad.setMode(8);
        const address = game.settings.get(moduleName,'address');
        ui.notifications.info("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.WSConnect")+" "+address);
        wsOpen = true;
        clearInterval(wsInterval);
        wsInterval = setInterval(resetWS, 5000);
    }
  
    clearInterval(wsInterval);
    wsInterval = setInterval(resetWS, 10000);
}

/**
 * Try to reset the websocket if a connection is lost
 */
function resetWS(){
    if (wsOpen) ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.WSDisconnect"));
    else ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.WSCantConnect"));
    WSconnected = false;
    startWebsocket();
}

export function sendWS(txt){
    if (WSconnected) ws.send(txt);
}