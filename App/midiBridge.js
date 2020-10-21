//Sets the port of the websocket
const port = 3001;

const DEBUG = false;

let WSconnected = false;

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: port });

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('Websocket on: '+add+':'+port);
  })

//Stores all compatible Midi devices. id should be a string that occurs in the detected input and output name, and does not occur in any other inputs and outputs
const midiDevices = [
    {
        name: 'Launchpad Mini Mk3',
        id: '(LPMiniMK3 MIDI)',
        sysExHeader: [0xF0,0x00,0x20,0x29,0x02,0x0D]
    },
    {
        name: 'Launchpad Mk2',
        id: '(LPMK2 MIDI)',
        sysExHeader: [0xF0,0x00,0x20,0x29,0x02,0x18]
    }];
/*
 * Do when a new websocket connection is made
 */
wss.on('connection', function (ws) {
    WSconnected = true;

    console.log('Foundry VTT connected');
    
    //Send currently connected MIDI device name to Foundry
    let deviceName = 'null'
    if (midi.connected) deviceName = midiDevices[midi.midiDeviceSelected].name;
    wss.broadcast("{\"T\":\"C\",\"D\":\""+deviceName+"\"}");
    
    //Set ping interval
    const id = setInterval(function () {
        ws.send("{\"T\":\"P\"}")
    }, 1000);

    //If a message is received, send this to analyzeWS()
    ws.on('message', function incoming(data) {
        analyzeWS(data);
      });

    //If connection is closed, stop ping interval
    ws.on('close', function () {
      console.log('Foundry VTT disconnected');
      clearInterval(id);
    });  
});

/*
 * Broadcast message over websocket to all connected clients
 */
wss.broadcast = function broadcast(msg) {
    if (DEBUG) console.log("SENDING OVER WS: ",msg);
    wss.clients.forEach(function each(client) {
        client.send(msg);
     });
 };

 /*
  * Analyze received data
  */
function analyzeWS(msg){
    let data = JSON.parse(msg);
    if (DEBUG) console.log("RECEIVED FROM WS: ",data);
    midi.colorPickerActive = false;
    //If led data is received, and a midi device is connected
    if (data.T == 'L' && midi.connected) 
        midi.updateLeds(data);
    
    //If brightness data is received
    else if (data.T == 'B' && midi.connected) 
        midi.setBrightness(data.D);
    
    //Start colorPicker
    else if (data.T == 'CP' && midi.connected){
        midi.colorPickerKey = data.K;
        midi.colorPickerOn = data.M;
        midi.colorPickerCurrent = data.O;
        midi.colorPicker(0);  
    }
}

class Midi{
    constructor(){
        this.input;                     //Stores the MIDI input
        this.output;                    //Stores the MIDI output
        this.inputName;                 //Stores the input name
        this.outputName;                //Stores the output name
        this.connected = false;         //Is a device currently connected             
        this.inputs = null;             //List of connected inputs
        this.outputs = null;            //List of connected outputs
        this.midiDeviceSelected = 0;    //Currently selected device (from midiDevices[])
        this.colorPickerActive = false;
        this.colorPickerSel = 0;
        this.colorPickerKey = 0;
        this.colorPickerOn = 0;
        this.colorPickerCurrent = 0;
        
        //Start searching for midi devices
        this.searchMidi();
    }
    
    /*
     * Prints a list of the found MIDI inputs and outputs
     */
    midiFoundMsg(){
        console.log("\n--------------------------------------------------------------");
        if (this.inputs.length == 0) console.log("No MIDI inputs found");
        else {
            console.log("MIDI inputs found:");
            for (let i=0; i<this.inputs.length; i++)
                console.log(this.inputs[i]);
        }
        console.log("");
        if (this.outputs.length == 0) console.log("No MIDI outputs found");
        else {
            console.log("MIDI outputs found:");
            for (let i=0; i<this.outputs.length; i++)
                console.log(this.outputs[i]);
        }
        console.log("--------------------------------------------------------------\n");
    }

    /*
     * Checks the connection to the midi device every second
     */
    searchMidi(){
        //Get the MIDI inputs and outputs
        let inputs = easymidi.getInputs();
        let outputs = easymidi.getOutputs();

        //If no previous inputs and outputs have been stored, store these
        if (this.inputs == null && this.outputs == null) {
            this.inputs = inputs;
            this.outputs = outputs;
            this.midiFoundMsg();
        }
        let newFound = false;
        let disconnect = 0;
        
        //Check if there is any change in the inputs and outputs compared to the last iteration
        if (inputs.length != this.inputs.length) 
            newFound = true;
        for (let i=0; i<this.inputs.length; i++){
            if (inputs[i] != this.inputs[i]) 
                newFound = true;
            if (inputs[i] == this.inputName) 
                disconnect++;
        }
        if (outputs.length != this.outputs.length) 
            newFound = true;
        for (let i=0; i<this.outputs.length; i++){
            if (outputs[i] != this.outputs[i]) 
                newFound = true;
            if (outputs[i] == this.outputName)
                disconnect++;
        }
        
        //If previously selected device is no longer found, notify user and Foundry
        if (disconnect < 2 && this.connected) {
            console.log("\nMIDI device disconnected");
            midi.close();
            this.connected = false; 

            if (WSconnected){
                wss.broadcast("{\"T\":\"C\",\"D\":\"null\"}");
            }
        }

        //If new devices are found, print midi devices
        if (newFound) {
            this.inputs = inputs;
            this.outputs = outputs;
            this.midiFoundMsg();
        }

        //If currently not connected to a midi device, check if any of the found inputs and outputs correspond with any device set in midiDevices. If so, connect to that device
        let conCheck = 0;
        let input = undefined;
        let output = undefined;
        if (this.connected == false){
            for (let i=0; i<this.inputs.length; i++)
                for (let j=0; j<midiDevices.length; j++)
                    if (this.inputs[i].includes(midiDevices[j].id)){
                        this.midiDeviceSelected = j;
                        conCheck++;
                        this.inputName = this.inputs[i];
                        input = inputs[i];
                        break;
                    }
            for (let i=0; i<this.outputs.length; i++)
                if (this.outputs[i].includes(midiDevices[this.midiDeviceSelected].id)){
                    conCheck++;
                    this.outputName = this.outputs[i];
                    output = outputs[i];
                    break;
                }
            if (conCheck == 2){
                if (input != undefined && output != undefined)
                    this.connect(input,output);
            }
        }

        //Repeat the search every 2 seconds to check for disconnections or new connections
        setTimeout(() => this.searchMidi(),2000);  
    }

    /*
     * Open connection to midi device
     */
    connect(input,output){
        this.connected = true; 

        //Print connection details
        console.log("\n--------------------------------------------------------------");
        console.log("Connecting to:");
        console.log("Name: "+midiDevices[this.midiDeviceSelected].name);
        console.log("Input: "+input);
        console.log("Out: "+output);
        console.log("--------------------------------------------------------------\n");
        
        //Store name of connected input and output
        this.inputName = input;
        this.outputName = output;

        //Open the input and connections
        this.input = new easymidi.Input(input);
        this.output = new easymidi.Output(output);

        //Set to programming mode
        this.setToProgramming();

        //Send connection data to Foundry
        if (WSconnected){
            let deviceName = midiDevices[this.midiDeviceSelected].name;
            wss.broadcast("{\"T\":\"C\",\"D\":\""+deviceName+"\"}");
        }

        //********************************************************************************************************************************** */
        //Register 'note on' and 'control change' callbacks for the Launchpad Mini Mk3, send keypress data to Foundry
        if (midiDevices[this.midiDeviceSelected].name == "Launchpad Mini Mk3") {
            this.input.on('noteon', function (msg) {
                if (midi.colorPickerActive){
                    if (msg.velocity == 0) return;
                    let row = Math.floor(msg.note/10) - 1;
                    let column = msg.note % 10 - 1;
                    let color = column + row*8 + midi.colorPickerSel*64;
                    let sendMsg = {
                        "T": "CP",
                        "B": color,
                        "K": midi.colorPickerKey,
                        "M": midi.colorPickerOn
                    }
                    if (WSconnected){
                        wss.broadcast(JSON.stringify(sendMsg));
                    }
                    midi.colorPickerActive = false;
                }
                else {
                    let state = 0;
                    if (msg.velocity == 127) state = 1;
                    let sendMsg = {
                        "T": "K",
                        "B": msg.note,
                        "S": state
                    }
                    if (WSconnected){
                        wss.broadcast(JSON.stringify(sendMsg));
                    }
                }
            });
            this.input.on('cc', function (msg) {
                if (midi.colorPickerActive){
                    let mode = midi.colorPickerSel;
                    if (msg.value == 0) return;
                    if (msg.controller == 89) mode++;
                    else return;
                    if (mode > 1) mode = 0;
                    midi.colorPicker(mode);
                }
                else {
                    let state = 0;
                    if (msg.value == 127) state = 1;
                    let sendMsg = {
                        "T": "K",
                        "B": msg.controller,
                        "S": state
                    }
                    if (WSconnected){
                        wss.broadcast(JSON.stringify(sendMsg));
                    }
                }
            });
        }
    }

    /*
     * Midi send SysEx
     */
    sendSysEx(data){
        if (DEBUG) console.log("SENDING SYSEX TO MIDI DEVICE: ",data);
        this.output.send('sysex',data);
    }

    /*
     * Close the midi input and output
     */
    close(){
        if (this.input != undefined)
            this.input.close();
        if (this.output != undefined)
            this.output.close();
    }

    //********************************************************************************************************************************** */
    /*
     * Set the launchkey to programming mode
     */
    setToProgramming(){
        //Set Launchpad Mini Mk3 to programming mode
        if (midiDevices[this.midiDeviceSelected].name == "Launchpad Mini Mk3")
            this.sendSysEx([0xF0, 0x00, 0x20, 0x29, 0x02, 0x0D, 0x0E, 0x01, 0xF7]);
    }

    //********************************************************************************************************************************** */
    /*
     * Set the LED brightness level
     */
    setBrightness(brightness){
        //Set brightness of Launchpad Mini Mk3
        if (midiDevices[this.midiDeviceSelected].name == "Launchpad Mini Mk3"){
            let data = [];
            let header = midiDevices[midi.midiDeviceSelected].sysExHeader;
            for (let i=0; i<header.length; i++)//
                data[i] = header[i];
            data[header.length] = 0x08;
            data[header.length+1] = brightness;
            data[header.length+2] = 0xF7;
            this.sendSysEx(data);
        }
    }

    //********************************************************************************************************************************** */
    colorPicker(mode){
        this.colorPickerActive = true;
        this.colorPickerSel = mode;
        let msg = "";
        let counter = mode*64;
        
        for (let i=11; i<100; i++){
            if (i>11) msg += ';';
            if (i % 10 == 9) {
                let color = 0;
                let type = 0;
                if (i == 89) {
                    if (mode == 0) color = 87;
                    else color = 72;
                    type = 2;
                }
                msg += i+','+type+','+color;
            }
            else if (i % 10 == 0){}
            else if (Math.floor(i/10) == 9){
                msg += i+',0,0';
            }
            else {
                if (counter == this.colorPickerCurrent) msg += i+',2,'+counter;
                else msg += i+',0,'+counter;
                counter++;
            }
        }
        let data = {D:msg}
        this.updateLeds(data);
    }
    
    /*
    * Update LED data
    */
    updateLeds(data){
        //Update leds for the Launchpad Mini Mk3
        if (midiDevices[this.midiDeviceSelected].name == "Launchpad Mini Mk3") {
            let dataNew = data.D;
            let ledArray = dataNew.split(";");
            let dataSend = [];
            let header = midiDevices[this.midiDeviceSelected].sysExHeader;
            for (let i=0; i<header.length; i++)//
                dataSend[i] = header[i];
            let counter = header.length;
            dataSend[counter] = 0x03;
            counter++;
            for (let i=0; i<400; i++){
                if (ledArray[i] == undefined) break;
                let array = ledArray[i].split(",");
                let led = parseInt(array[0]);
                let color = parseInt(array[2]);
                let type = parseInt(array[1]);
                dataSend[counter] = type;
                dataSend[counter+1] = led;
                if (color > 127) color = 0;
                dataSend[counter+2] = color;
                counter += 3;
                if (type == 1 || type == 3){
                    let color = parseInt(array[3]);
                    if (color > 127) color = 0;
                    dataSend[counter] = color;
                    counter++;
                }
                if (type == 3){
                    let color = parseInt(array[4]);
                    if (color > 127) color = 0;
                    dataSend[counter] = color;
                    counter++;
                }
            }
            dataSend[counter] = 0xF7;
            this.sendSysEx(dataSend);
        }
    }
}

const easymidi = require('easymidi');
var midi = new Midi();

