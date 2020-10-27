import {registerSettings} from "./src/settings.js";
import {Launchpad} from "./src/Launchpad.js";
export const moduleName = "MaterialKeys";
export const launchpad = new Launchpad();
export var colorPickerTarget;
export var colorPickerWait = false;
export var colorPickerColor;
//var exec = require('child_process').execFile;

export function setColorPickerTarget(val){
    colorPickerTarget = val;
}
export function setcolorPickerWait(val){
    colorPickerWait = val;
}

//Websocket variables
var ws;                         //Websocket variable
let wsOpen = false;             //Bool for checking if websocket has ever been opened => changes the warning message if there's no connection
let wsInterval;                 //Interval timer to detect disconnections
let WSconnected = false;

//Other global variables
let enableModule;
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
    let data = JSON.parse(msg);
    
    //console.log(data);
    if (data.T == 'K'){
        launchpad.keypress(data);
    }
    else if (data.T == 'C'){
        let connectedDevice = data.D;
        if (connectedDevice == 'null') ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.NoMidi"));
        else {
            ui.notifications.notify("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.MidiConnect")+" "+connectedDevice);
            launchpad.setBrightness(game.settings.get(moduleName,'brightness'));
            launchpad.setMode(launchpad.keyMode);
        }
    }
    else if (data.T == 'CP'){

        if (document.getElementById("macro-config") != null) {
            document.getElementById("color"+data.K).value=data.B;
            let row = 8 - Math.floor(data.K/10);
            let column = data.K % 10 - 1;
            let led = 8*row + column;
            let color = game.settings.get(moduleName,'macroSettings').color;
            color[led] = data.B.toString();
            let settings = game.settings.get(moduleName,'macroSettings');
                settings.color = color;
                await game.settings.set(moduleName,'macroSettings',settings);
            launchpad.setMode(launchpad.keyMode);
        }
        else if (document.getElementById("soundboard-config") != null) {
            let row = 8 - Math.floor(data.K/10);
            let column = data.K % 10 - 1;
            let led = 8*row + column;
            
            if (data.M == 0){
                document.getElementById("colorOff"+data.K).value=data.B;
                let color = game.settings.get(moduleName,'soundboardSettings').colorOff;
                color[led] = data.B.toString();
                let settings = game.settings.get(moduleName,'soundboardSettings');
                settings.colorOff = color;
                await game.settings.set(moduleName,'soundboardSettings',settings);
            }
            else {
                document.getElementById("colorOn"+data.K).value=data.B;  
                let color = game.settings.get(moduleName,'soundboardSettings').colorOn;
                color[led] = data.B.toString();
                let settings = game.settings.get(moduleName,'soundboardSettings');
                settings.colorOn = color;
                await game.settings.set(moduleName,'soundboardSettings',settings);
            }
            launchpad.setMode(launchpad.keyMode);
        }
    }
};

export function playTrack(soundNr,play,repeat,volume){
    if (play){
        let trackId = game.settings.get(moduleName,'soundboardSettings').sounds[soundNr];
        let playlistId = game.settings.get(moduleName,'soundboardSettings').playlist;
        let sounds = game.playlists.entities.find(p => p._id == playlistId).data.sounds;
        let sound = sounds.find(p => p._id == trackId);
        if (sound == undefined){
            activeSounds[soundNr] = false;
            return;
        }
        volume *= game.settings.get("core", "globalInterfaceVolume");
        let src = sound.path;

        let howl = new Howl({src, volume, loop: repeat, onend: (id)=>{
            if (repeat == false){
                activeSounds[soundNr] = false;
            }
        },
        onstop: (id)=>{
            activeSounds[soundNr] = false;
        }});
        howl.play();
        activeSounds[soundNr] = howl;
   }
   else {
       activeSounds[soundNr].stop();
   }
}

Hooks.on('renderPlaylistDirectory', (playlistDirectory)=>{
    if (enableModule == false) return;
    if (WSconnected) {
        launchpad.updatePlaylist();
        launchpad.playlistVolumeUpdate();
    }
});

Hooks.on('updateScene',()=>{
    if (enableModule == false) return;
    if (WSconnected) launchpad.visualFx();
})

Hooks.on('renderCombatTracker', (a,b,combat)=>{
    if (enableModule == false) return;
    if (WSconnected){
        launchpad.combatTracker(combat.combat);
        if (combat.hasCombat)
            launchpad.updateTrackerTokens(combat.combat);
        else
        launchpad.updateTrackerTokens(null);
        launchpad.updateHpTracker(combat.combat);
    }
});

Hooks.once('init', ()=>{
    //CONFIG.debug.hooks = true;
    registerSettings(); //in ./src/settings.js
})

Hooks.once('ready', ()=>{
    enableModule = (game.settings.get(moduleName,'Enable') && game.user.isGM) ? true : false;
    if (enableModule) {
        startWebsocket();
    }
    
    for (let i=0; i<64; i++)
            activeSounds[i] = false;
        game.socket.on(`module.MaterialKeys`, (payload) =>{
            //console.log(payload);
            if (payload.msgType != "playSound") return;
            playTrack(payload.trackNr,payload.play,payload.repeat,payload.volume);
         
         
     });
     if (game.user.isGM == false) return;
    let soundBoardSettings = game.settings.get(moduleName,'soundboardSettings');
    let macroSettings = game.settings.get(moduleName, 'macroSettings');
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
        launchpad.updatePlaylist();
        launchpad.playlistVolumeUpdate();
    }
});

Hooks.on('updatePlaylistSound',()=>{
    
});

/**
 * Start a new websocket
 * Start a 10s interval, if no connection is made, run resetWS()
 * If connection is made, set interval to 1.5s to check for disconnects
 * If message is received, reset the interval, and send the message to analyzeWSmessage()
 */
function startWebsocket() {
    //ip = game.settings.get(moduleName,'IP');
    let address = game.settings.get(moduleName,'address');
    ws = new WebSocket('ws://'+address+'/');

    ws.onmessage = function(msg){
       // console.log(msg);
        analyzeWSmessage(msg.data);
        clearInterval(wsInterval);
        wsInterval = setInterval(resetWS, 5000);
    }

    ws.onopen = function() {
        WSconnected = true;
        launchpad.setMode(8);
        let address = game.settings.get(moduleName,'address');
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

function checkCombat(){
    if (game.combat) 
        return game.combat.started;
    else return false; 
}

export function getFromJSONArray(data,i){
    if (i>8) return 'nul';
    let val;
    if (i == 0) val = data.a;
    else if (i == 1) val = data.a;
    else if (i == 2) val = data.c;
    else if (i == 3) val = data.d;
    else if (i == 4) val = data.e;
    else if (i == 5) val = data.f;
    else if (i == 6) val = data.g;
    else if (i == 7) val = data.h;
    return val;
}

export function setToJSONArray(data,i,val){
    if (i>8) return 'nul';
    if (i == 0) data.a = val;
    else if (i == 1) data.b = val;
    else if (i == 2) data.c = val;
    else if (i == 3) data.d = val;
    else if (i == 4) data.e = val;
    else if (i == 5) data.f = val;
    else if (i == 6) data.g = val;
    else if (i == 7) data.h = val;
}