import {moduleName,playlistControl,soundboard,visualFx,combatTracker,macroBoard,sendWS} from "../MaterialKeys.js";
import {getColor} from "./misc.js";
import {setEmulatorLED} from "./forms/emulator.js";

export class Launchpad{
    constructor() {
        this.keyMode = 80;
        this.ledBufferColor = [];
        this.ledBufferColor2 = [];
        this.ledBufferColor3 = [];
        this.ledBufferType = [];
        this.ledBufferName = [];
        for (let i=0; i<100; i++){
            this.ledBufferColor[i] = 0;
            this.ledBufferColor2[i] = 0;
            this.ledBufferColor3[i] = 0;
            this.ledBufferType[i] = 0;
            this.ledBufferName[i] = '';
        }
        this.colorPickerActive = false;
        this.colorPickerSel = 0;
        this.colorPickerKey = 0;
        this.colorPickerMode = 0;
        this.colorPickerTarget = 0;
        this.colorPickerScreen = 0;
    }

    keypress(data){
        const key = data.button;
        const state = data.state;

        if (this.colorPickerActive == true){
            if (key % 10 == 9){
                if (state == 0) return;
                let screen = 0;
                if (key == 89) screen = 0;
                else if (key == 79) screen = 1;
                else return;
                this.colorPicker(this.colorPickerKey,this.colorPickerMode,this.colorPickerTarget,screen);
            }
            else if (Math.floor(key/10) < 9) {
                const column = key % 10 - 1;
                const row = Math.floor(key/10) - 1;
                const value = row*8 + column + 64*this.colorPickerScreen;
                this.colorPickerUpdate(value)
            }
            return;
        }
        
        //Set keymode
        if (key % 10 == 9){
            if (state == 0) return;
            this.setMode(Math.floor(key/10));
        }
        //Macro board
        else if (Math.floor(this.keyMode/10) == 2){
            if (state == 0) return;
            macroBoard.keyPress(key);
        }
        //Audio Fx soudboard
        else if (Math.floor(this.keyMode/10) == 8){
            soundboard.keyPress(key,state);
        }
        //Playlist soundboard
        else if (Math.floor(this.keyMode/10) == 7){
            if (state == 0) return;
            playlistControl.playlistKeyPress(key);
        }
        //Playlist soundboard volume control
        else if (Math.floor(this.keyMode/10) == 6){
            if (state == 0) return;
            playlistControl.volumeKeyPress(key);
        }
        //Visual Fx board
        else if (this.keyMode == 5 || this.keyMode == 51){
            if (state == 0) return;
            visualFx.keyPress(key);
        }
        //Combat tracker
        else if (game.combat && this.keyMode == 4) { 
            if (state == 0) return;
            combatTracker.trackerKeyPress(key);
        }
        //Token Health tracker
        else if (Math.floor(this.keyMode/10) == 3){
            if (state == 0) return;
            combatTracker.hpKeyPress(key);
        }
    }

    setMode(mode,iterate=true){
        if (mode > 10) mode = Math.floor(mode/10);
        this.setMainLEDs(0,0);
        /*
         * No function yet on 1
         */
        if (mode == 1){
            this.setControlKeys(mode,87,0);
        }
        /*
         * Macro board
         */
        if (mode == 2){
            if (Math.floor(this.keyMode/10) != 2 || iterate == false) this.keyMode = 20;
            else this.keyMode++;

            const maxMacros = game.settings.get('MaterialKeys','macroSettings').macros.length;
            if (this.keyMode > 19 + Math.ceil(maxMacros/64) || this.keyMode > 23) this.keyMode = 20;
            let color;
            if (this.keyMode == 20) color = 87;
            else if (this.keyMode == 21) color = 79;
            else if (this.keyMode == 22) color = 53;
            else if (this.keyMode == 23) color = 74;
            this.setControlKeys(mode,color,0);

            macroBoard.update();
        }
        /*
         * HP tracker
        */
        else if (mode == 3){
            if (Math.floor(this.keyMode/10) != 3) this.keyMode = 31;
            else this.keyMode++;
            let hpTrackerPages;
            if (game.combat) hpTrackerPages = Math.ceil(game.combat.combatants.length/8);
            if (this.keyMode > 30+hpTrackerPages || this.keyMode > 34) this.keyMode = 31;
            let color;
            if (this.keyMode == 31) color = 87;
            else if (this.keyMode == 32) color = 79;
            else if (this.keyMode == 33) color = 53;
            else if (this.keyMode == 34) color = 74;
            this.setControlKeys(mode,color,0);
            if (game.combat) combatTracker.hpUpdate(game.combat);
        }
        /*
         * Combat tracker
        */
        if (mode == 4){
            this.keyMode = mode;
            this.setControlKeys(mode,87,0);
            combatTracker.trackerUpdate(game.combat);
            if (game.combat) combatTracker.updateTokens(game.combat);
        }
        /*
         * Visual Fx Board
        */
        else if (mode == 5){
            if (this.keyMode == 5){
                this.keyMode = 51;
                this.setControlKeys(mode,72,0);
            }
            else {
                this.keyMode = 5;
                this.setControlKeys(mode,87,0);
            }
            visualFx.update();
        }
        /*
         * Playlist Volume Control
        */
        else if (mode == 6) {
            if (Math.floor(this.keyMode/10) != 6) this.keyMode = 60;
            else this.keyMode++;
            const maxTracks = playlistControl.getMaxTracks();
            if (this.keyMode > 59 + Math.ceil(maxTracks/8) || this.keyMode > 63) this.keyMode = 60;
            let color;
            if (this.keyMode == 60) color = 87;
            else if (this.keyMode == 61) color = 79;
            else if (this.keyMode == 62) color = 53;
            else if (this.keyMode == 63) color = 74;
            this.setControlKeys(mode,color,0);
            playlistControl.volumeUpdate();
        }
        /*
         * Playlist Control
        */
        else if (mode == 7) {
            if (Math.floor(this.keyMode/10) != 7) this.keyMode = 70;
            else this.keyMode++;
            const maxTracks = playlistControl.getMaxTracks();
            if (this.keyMode > 69 + Math.ceil(maxTracks/8) || this.keyMode > 73) this.keyMode = 70;
            let color;
            if (this.keyMode == 70) color = 87;
            else if (this.keyMode == 71) color = 79;
            else if (this.keyMode == 72) color = 53;
            else if (this.keyMode == 73) color = 74;
            this.setControlKeys(mode,color,0);
            playlistControl.playlistUpdate();
        }
        /* 
         * Audio Fx soundboard
         */
        else if (mode == 8){
            if (Math.floor(this.keyMode/10) != 8 || iterate == false) this.keyMode = 80;
            else this.keyMode++;

            const maxSounds = game.settings.get(moduleName,'soundboardSettings').volume.length;
            if (this.keyMode > 79 + Math.ceil(maxSounds/64) || this.keyMode > 83) this.keyMode = 80;
            let color;
            if (this.keyMode == 80) color = 87;
            else if (this.keyMode == 81) color = 79;
            else if (this.keyMode == 82) color = 53;
            else if (this.keyMode == 83) color = 74;
            this.setControlKeys(mode,color,0);
            soundboard.update();
        }
        this.updateLEDs();
    }
    
    updateLEDs(){
        let msg = "";
        for (let i=11; i<100; i++) {
            if (i>11) msg += ";";
            msg += i+","+this.ledBufferType[i]+","+this.ledBufferColor[i];
            if (this.ledBufferType[i] == 1) msg += ","+this.ledBufferColor2[i];
            else if (this.ledBufferType[i] == 3) msg += ","+this.ledBufferColor2[i]+","+this.ledBufferColor3[i];
            setEmulatorLED(i,this.ledBufferType[i],this.ledBufferColor[i],this.ledBufferColor2[i],this.ledBufferColor3[i],this.ledBufferName[i])
        }
        const data = {
            target: "MIDI",
            type: "LED",
            data: msg
        }
        sendWS(JSON.stringify(data));
    }
    
    setLED(led,type,color,color2=0,color3=0,name=""){
        this.ledBufferColor[led] = color;
        this.ledBufferColor2[led] = color2;
        this.ledBufferColor3[led] = color3;
        this.ledBufferType[led] = type;
        this.ledBufferName[led] = name;
    }
    
    setMainLEDs(color,type,name=""){
        for (let i=11; i<99; i++) {
            if (i % 10 == 9) continue;
            this.ledBufferColor[i] = color;
            this.ledBufferType[i] = type;
            this.ledBufferName[i] = name;
        }
    }
    
    setControlKeys(keyMode,color,type,name=""){
        for (let i=0; i<8; i++) {
            const led = i*10+19;
            let newColor = 0;
            if (i == keyMode-1) newColor = color; 
            this.ledBufferColor[led] = newColor;
            this.ledBufferType[led] = type;
            this.ledBufferName[led] = name;
        }
    }
    
    setArrow(location,dir,color,type){
        if (dir == "right") dir = 0;
        else if (dir == "left") dir = 1;
        else if (dir == "up") dir = 2;
        else if (dir == "down") dir = 3;

        if (dir == 0){
            this.setLED(location,type,color);
            this.setLED(location + 11,type,color);
            this.setLED(location + 20,type,color);
        }
        else if (dir == 1){
            this.setLED(location + 1,type,color);
            this.setLED(location + 10,type,color);
            this.setLED(location + 21,type,color);
        }
        else if (dir == 2){
            this.setLED(location,type,color);
            this.setLED(location + 2,type,color);
            this.setLED(location + 11,type,color);
        }
        else if (dir == 3){
            this.setLED(location + 1,type,color);
            this.setLED(location + 10,type,color);
            this.setLED(location + 12,type,color);
        }
    }

    setBrightness(brightness){
        const data = {
            target: "MIDI",
            type: "Brightness",
            data: brightness
        }
        sendWS(JSON.stringify(data));
    }

    colorPicker(key,mode,target = 0,screen = 0){
        this.colorPickerKey = key;
        this.colorPickerMode = mode;
        this.colorPickerTarget = target;
        this.colorPickerActive = true;
        this.colorPickerScreen = screen;
        let msg = "";
        let counter = screen*64;
        
        for (let i=11; i<100; i++){
            if (i>11) msg += ';';
            if (i % 10 == 9) {
                let color = 0;
                let type = 0;
                if (i == 89) {
                    if (screen == 0) type = 2;
                    color = 87;
                }
                else if (i == 79){
                    if (screen == 1) type = 2;
                    color = 72;
                }
                msg += i+','+type+','+color;
            }
            else if (i % 10 == 0){}
            else if (Math.floor(i/10) == 9){
                msg += i+',0,0';
            }
            else {
                if (counter == target) msg += i+',2,'+counter;
                else msg += i+',0,'+counter;
                counter++;
            }
        }
        const data = {
            target: "MIDI",
            type: "LED",
            data: msg
        }
        sendWS(JSON.stringify(data));
    }

    async colorPickerUpdate(value){
        this.colorPickerActive = false;
        if (document.getElementById("macro-config") != null) {
            let element = document.getElementById("color"+this.colorPickerKey);
            element.value=value;
            element.style="flex:4; background-color:"+getColor(value);
            let settings = game.settings.get(moduleName,'macroSettings');
            settings.color[this.colorPickerKey-1] = value;
            await game.settings.set(moduleName,'macroSettings',settings);
            this.setMode(this.keyMode,false);
        }
        
        else if (document.getElementById("soundboard-config") != null) {
            if (this.colorPickerMode == 0){
                let element = document.getElementById("colorOff"+this.colorPickerKey);
                element.value=value;
                element.style="flex:4; background-color:"+getColor(value);  
                let settings = game.settings.get(moduleName,'soundboardSettings');
                settings.colorOff[this.colorPickerKey-1] = value;
                await game.settings.set(moduleName,'soundboardSettings',settings);
                soundboard.update();
            }
            else {
                let element = document.getElementById("colorOn"+this.colorPickerKey);
                element.value=value;
                element.style="flex:4; background-color:"+getColor(value);
                let settings = game.settings.get(moduleName,'soundboardSettings');
                settings.colorOn[this.colorPickerKey-1] = value;
                await game.settings.set(moduleName,'soundboardSettings',settings);
                soundboard.update();
            }
            this.setMode(this.keyMode,false);
        }
        else if (document.getElementById("playlist-config") != null) {
            if (this.colorPickerMode == 0){
                let element = document.getElementById("colorOff");
                element.value=value;
                element.style="flex:7; background-color:"+getColor(value);  
                let settings = game.settings.get(moduleName,'playlists');
                settings.colorOff = value;
                await game.settings.set(moduleName,'playlists',settings);
                playlistControl.playlistUpdate();
            }
            else {
                let element = document.getElementById("colorOn");
                element.value=value;
                element.style="flex:7; background-color:"+getColor(value);
                let settings = game.settings.get(moduleName,'playlists');
                settings.colorOn = value;
                await game.settings.set(moduleName,'playlists',settings);
                playlistControl.playlistUpdate();
            }
            if (Math.floor(this.keyMode/10) == 7) this.keyMode = 7;
            this.setMode(this.keyMode,false);
        }
    }
}