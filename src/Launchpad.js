import {moduleName,playlistControl,soundboard,visualFx,combatTracker,macroBoard,soundscape} from "../MaterialKeys.js";
import { sendWS } from "./websocket.js";
import {getColor} from "./misc.js";
import {setEmulatorLED} from "./forms/emulator.js";

export class Launchpad{
    constructor() {
        this.keyMode = 80;

        this.ledBuffer = [];
        for (let i=0; i<100; i++){
            this.ledBuffer[i] = {
                button: i,
                mode: 'static',
                color: 0,
                color2: 0
            }
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
        //Soundscape
        else if (this.keyMode == 1) { 
            if (state == 0) return;
            soundscape.keyPress(key);
        }
    }

    setMode(mode,iterate=true){
        if (mode > 10) mode = Math.floor(mode/10);
       
        this.setMainLEDs(0,'static');
        /*
         * Soundscape
         */
        if (mode == 1){
            this.keyMode = mode
            this.setControlKeys(mode,87);
            soundscape.update(mode);
        }
        /*
         * Macro board
         */
        if (mode == 2){
            if (Math.floor(this.keyMode/10) != 2 || iterate == false) this.keyMode = 20;
            else this.keyMode++;

            let maxMacros = game.settings.get('MaterialKeys','macroSettings').macros?.length;
            if (maxMacros == undefined) maxMacros = 32;
            if (this.keyMode > 19 + Math.ceil(maxMacros/64) || this.keyMode > 23) this.keyMode = 20;
            let color;
            if (this.keyMode == 20) color = 87;
            else if (this.keyMode == 21) color = 79;
            else if (this.keyMode == 22) color = 53;
            else if (this.keyMode == 23) color = 74;
            this.setControlKeys(mode,color);

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
            this.setControlKeys(mode,color);
            if (game.combat) combatTracker.hpUpdate(game.combat);
        }
        /*
         * Combat tracker
        */
        if (mode == 4){
            this.keyMode = mode;
            this.setControlKeys(mode,87);
            combatTracker.trackerUpdate(game.combat);
            if (game.combat) combatTracker.updateTokens(game.combat);
        }
        /*
         * Visual Fx Board
        */
        else if (mode == 5){
            if (this.keyMode == 5){
                this.keyMode = 51;
                this.setControlKeys(mode,72);
            }
            else {
                this.keyMode = 5;
                this.setControlKeys(mode,87);
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
            this.setControlKeys(mode,color);
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
            this.setControlKeys(mode,color);
            playlistControl.playlistUpdate();
        }
        /* 
         * Audio Fx soundboard
         */
        else if (mode == 8){
            if (Math.floor(this.keyMode/10) != 8 || iterate == false) this.keyMode = 80;
            else this.keyMode++;

            let maxSounds = game.settings.get(moduleName,'soundboardSettings').volume?.length;
            if (maxSounds == undefined) maxSounds = 16;
            if (this.keyMode > 79 + Math.ceil(maxSounds/64) || this.keyMode > 83) this.keyMode = 80;
            let color;
            if (this.keyMode == 80) color = 87;
            else if (this.keyMode == 81) color = 79;
            else if (this.keyMode == 82) color = 53;
            else if (this.keyMode == 83) color = 74;
            this.setControlKeys(mode,color);
            soundboard.update();
        }
        this.updateLEDs();
    }
    
    updateLEDs(){
        let data = [];
        for (let i=11; i<100; i++) {
            if (i % 10 == 0) continue;
            data.push({
                button: i,
                mode: this.ledBuffer[i].mode,
                color: this.ledBuffer[i].color,
                color2: this.ledBuffer[i].color2
            })
            setEmulatorLED(i, this.ledBuffer[i].mode, this.ledBuffer[i].color, this.ledBuffer[i].color2, this.ledBuffer[i].name);
        }
        const dataToSend = {
            target: "MaterialKeys_Device",
            source: "MaterialKeys_Foundry",
            userId: game.userID,
            event: "updateAllLEDs",
            payload: data
        }
        sendWS(JSON.stringify(dataToSend));
    }
    
    //Store LED data in buffer
    setLED(led, mode, color, color2=0, name=""){
        this.ledBuffer[led] = {
            button: led,
            mode,
            color,
            color2,
            name
        }
    }
    
    setMainLEDs(color,mode,name=""){
        for (let i=11; i<99; i++) {
            if (i % 10 == 0 || i % 10 == 9) continue;
            this.ledBuffer[i] = {
                button: i,
                mode,
                color,
                name
            }
        }
    }
    
    setControlKeys(keyMode, color, name=""){
        for (let i=0; i<8; i++) {
            const led = i*10 + 19;
            this.ledBuffer[led] = {
                button: led,
                mode: 'static',
                color: i == keyMode-1 ? color : 0,
                name
            }
        }
    }
    
    setArrow(location,dir,color,mode){
        if (dir == "right") dir = 0;
        else if (dir == "left") dir = 1;
        else if (dir == "up") dir = 2;
        else if (dir == "down") dir = 3;

        if (dir == 0){
            this.setLED(location,mode,color);
            this.setLED(location + 11,mode,color);
            this.setLED(location + 20,mode,color);
        }
        else if (dir == 1){
            this.setLED(location + 1,mode,color);
            this.setLED(location + 10,mode,color);
            this.setLED(location + 21,mode,color);
        }
        else if (dir == 2){
            this.setLED(location,mode,color);
            this.setLED(location + 2,mode,color);
            this.setLED(location + 11,mode,color);
        }
        else if (dir == 3){
            this.setLED(location + 1,mode,color);
            this.setLED(location + 10,mode,color);
            this.setLED(location + 12,mode,color);
        }
    }

    setBrightness(brightness){
        const data = {
            target: "MaterialKeys_Device",
            source: "MaterialKeys_Foundry",
            userId: game.userID,
            event: "setBrightness",
            payload: brightness
        }
        
        sendWS(JSON.stringify(data));
    }

    colorPicker(key,mode,target = 0,screen = 0){
        this.colorPickerKey = key;
        this.colorPickerMode = mode;
        this.colorPickerTarget = target;
        this.colorPickerActive = true;
        this.colorPickerScreen = screen;
    
        let data = [];
        let color = screen*64;

        for (let i=11; i<100; i++) {
            if (i % 10 == 0) continue;
            if (i % 10 == 9) {
                data.push({
                    button: i,
                    mode: (i == 89 && screen == 0) ? 'pulsing' : (i == 79 && screen == 1) ? 'pulsing' : 'static',
                    color: (i == 89) ? 87 : (i == 79) ? 72 : 0
                });
                continue;
            }
            data.push({
                button: i,
                mode: (color == target) ? 'pulsing' : 'static',
                color: color++
            });
        }

        const dataToSend = {
            target: "MaterialKeys_Device",
            source: "MaterialKeys_Foundry",
            userId: game.userID,
            event: "updateAllLEDs",
            payload: data
        }
        sendWS(JSON.stringify(dataToSend));
    }

    async colorPickerUpdate(value){
        this.colorPickerActive = false;
        if (document.getElementById("materialKeys_macroConfig") != null) {
            let element = document.getElementById("materialKeys_color"+this.colorPickerKey);
            element.value=value;
            element.style="flex:4; background-color:"+getColor(value);
            let settings = game.settings.get(moduleName,'macroSettings');
            if (settings.color == undefined) settings.color = [];
            settings.color[this.colorPickerKey-1] = value;
            await game.settings.set(moduleName,'macroSettings',settings);
            this.setMode(this.keyMode,false);
        }
        
        else if (document.getElementById("materialKeys_soundboardConfig") != null) {
            if (this.colorPickerMode == 0){
                let element = document.getElementById("materialKeys_colorOff"+this.colorPickerKey);
                element.value=value;
                element.style="flex:4; background-color:"+getColor(value);  
                let settings = game.settings.get(moduleName,'soundboardSettings');
                settings.colorOff[this.colorPickerKey-1] = value;
                await game.settings.set(moduleName,'soundboardSettings',settings);
                soundboard.update();
            }
            else {
                let element = document.getElementById("materialKeys_colorOn"+this.colorPickerKey);
                element.value=value;
                element.style="flex:4; background-color:"+getColor(value);
                let settings = game.settings.get(moduleName,'soundboardSettings');
                settings.colorOn[this.colorPickerKey-1] = value;
                await game.settings.set(moduleName,'soundboardSettings',settings);
                soundboard.update();
            }
            this.setMode(this.keyMode,false);
        }
        else if (document.getElementById("materialKeys_playlistConfig") != null) {
            if (this.colorPickerMode == 0){
                let element = document.getElementById("materialKeys_colorOff");
                element.value=value;
                element.style="flex:7; background-color:"+getColor(value);  
                let settings = game.settings.get(moduleName,'playlists');
                settings.colorOff = value;
                await game.settings.set(moduleName,'playlists',settings);
                playlistControl.playlistUpdate();
            }
            else {
                let element = document.getElementById("materialKeys_colorOn");
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