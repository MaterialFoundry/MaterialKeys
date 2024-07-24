import { launchpad, moduleName } from "../MaterialKeys.js";

//Websocket variables
var ws;                         //Websocket variable
let wsOpen = false;             //Bool for checking if websocket has ever been opened => changes the warning message if there's no connection
let wsInterval;                 //Interval timer to detect disconnections
export let WSconnected = false;

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
    if (data.target != 'MaterialKeys_Foundry') return;
    
    if (data.type == 'key'){
        launchpad.keypress(data);
    }
    else if (data.type == 'deviceConnected'){
        ui.notifications.notify("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.MidiConnect"));
        //launchpad.setBrightness(game.settings.get(moduleName,'brightness'));
        launchpad.setMode(8,false);
    }
    else if (data.type == 'deviceDisconnected') {
        ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Notifications.MidiDisconnect"));
    }
};

/**
 * Start a new websocket
 * Start a 10s interval, if no connection is made, run resetWS()
 * If connection is made, set interval to 1.5s to check for disconnects
 * If message is received, reset the interval, and send the message to analyzeWSmessage()
 */
export function startWebsocket() {
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
            target: "MaterialCompanion",
            source: "MaterialKeys_Foundry",
            sourceTarget: "MaterialKeys_Device",
            type: "connected",
            userId: game.userId,
            userName: game.user.name,
            version: game.modules.get(moduleName).version
        }
        sendWS(JSON.stringify(msg));
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
    //console.log("WS transmit",txt)
    if (WSconnected) ws.send(txt);
}