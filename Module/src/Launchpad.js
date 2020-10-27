import * as MODULE from "../MaterialKeys.js";
//import { filterManager } from ".../fxmaster/filters/FilterManager.js";

export class Launchpad{
    constructor() {
        this.keyMode = 8;
        this.controlledPlaylists = [];
        this.combatState = 0;
        this.combatantsLengthOld = 0;
        this.playlistVolumeSelector = 0;
        this.visualFxState = [false,false,false,false,false,false,false,false,false,false,false,false,false];
        this.visualFxFilters = [false,false,false,false];
        this.colorizeColors = [
            {red: 1,green: 0,blue: 0},
            {red: 1,green: 0.5,blue: 0},
            {red: 1,green: 1,blue: 0},
            {red: 0,green: 1,blue: 0},
            {red: 0,green: 0.4,blue: 0},
            {red: 0,green: 1,blue: 1},
            {red: 0,green: 0,blue: 1},
            {red: 1,green: 0,blue: 1}
        ];
        this.colorizeColor = {red: 0, green: 0, blue: 0};
        //this.soundBoardPlaying = [];
        this.activeSounds = [];
        for (let i=0; i<64; i++)
            this.activeSounds[i] = false;
        this.ledBufferColor = [];
        this.ledBufferColor2 = [];
        this.ledBufferColor3 = [];
        this.ledBufferType = []
        for (let i=0; i<100; i++){
            this.ledBufferColor[i] = 0;
            this.ledBufferColor2[i] = 0;
            this.ledBufferColor3[i] = 0;
            this.ledBufferType[i] = 0;
        }
    }

    colorPicker(key,on,target = 0){
        let msg = "{\"T\":\"CP\",\"K\":"+key+",\"M\":"+on+",\"O\":"+target+"}";
        MODULE.sendWS(msg);
    }

    setBrightness(brightness){
        let msg = "{\"T\":\"B\",\"D\":"+brightness+"}";
        MODULE.sendWS(msg);
    }

    keypress(data){
        let key = data.B;
        //Set keymode
        if (key % 10 == 9){
            if (data.S == 0) return;
           this.setMode(Math.floor(key/10));
            
        }
        //Macro board
        else if (this.keyMode == 2){
            if (data.S == 0) return;
            this.macroBoard(key);
        }

        //Audio Fx soudboard
        else if (this.keyMode == 8){
            this.audioSoundboard(key,data.S);
        }
        
        //Playlist soundboard
        else if (Math.floor(this.keyMode/10) == 7){
            if (data.S == 0) return;
            this.playTrack(key);
        }
        //Playlist soundboard volume control
        else if (Math.floor(this.keyMode/10) == 6){
            if (data.S == 0) return;
            this.playlistVolume(key);
        }
        
        //Visual Fx board
        else if (this.keyMode == 5 || this.keyMode == 51){
            if (data.S == 0) return;
            this.visualFxUpdate(key);
        }

        //Combat tracker
        else if (game.combat && this.keyMode == 4) { 
            if (data.S == 0) return;
            this.combatTrackerUpdate(key);
        }

        //Token Health tracker
        else if (Math.floor(this.keyMode/10) == 3){
            if (data.S == 0) return;
            this.HpTracker(key);
        }
        
    }


    getPlaylist(num){
        let playlistId = game.settings.get(MODULE.moduleName,'selectedPlaylists')[num];
        let playlist = game.playlists.entities.find(p => p._id == playlistId);
        return playlist;
    }


/*
 * Play the track corresponding with the pressed key
 */
    async playTrack(key){
        let playlistNr = (key % 10)-1;
        let playlist = this.getPlaylist(playlistNr);
        if (playlist == undefined) return;
        let playMode = game.settings.get(MODULE.moduleName,'playlistMethod');
        let trackNr = 8-Math.floor(key/10);

        if (trackNr == -1){
            if (playlist.playing == true)
                await playlist.stopAll();
            else 
                await playlist.playAll();
        }
        else {
            let screen = this.keyMode - 70;
            let track = playlist.sounds[trackNr+8*screen];
            let playing = track.playing;
            if (playing == false){
                if (playMode == 1) await playlist.stopAll();
                else if (playMode == 2){
                    for (let i=0; i<8; i++){
                        let playlistTemp = this.getPlaylist(i);
                        if (playlistTemp != undefined) await playlistTemp.stopAll();
                    }
                        
                }
            } 
            await playlist.updateEmbeddedEntity("PlaylistSound", {_id: track._id, playing: !playing});
            playlist.update({playing: !playing});
        }
        this.updatePlaylist();
    }

    getMaxTracks(){
        let maxTracks = 0;
        for (let i=0; i<8; i++){
            let playlist = this.getPlaylist(i);
            if (playlist != undefined){
                let nrOfTracks = playlist.data.sounds.length;
                if (nrOfTracks > maxTracks) maxTracks = nrOfTracks;
            }
        }
        return maxTracks;
    }

    updatePlaylist(){  
        if (Math.floor(this.keyMode/10) != 7) return;
        let color;
        let type;
        let maxTracks = this.getMaxTracks();
        type = (this.keyMode == 70)? 1 : 2;
        color = (maxTracks>8)? 87 : 0;
        this.setLED(69,type,color);
        type = (this.keyMode == 71)? 1 : 2;
        color = (maxTracks>8)? 79 : 0;
        this.setLED(59,type,color);
        type = (this.keyMode == 72)? 1 : 2;
        color = (maxTracks>16)? 53 : 0;
        this.setLED(49,type,color);
        type = (this.keyMode == 73)? 1 : 2;
        color = (maxTracks>24)? 74 : 0;
        this.setLED(39,type,color);

        let screen = this.keyMode - 70;
        
        for (let i=0; i<8; i++){
            let playlist = this.getPlaylist(i);
            let led;
            if (playlist != undefined){
                let nrOfTracks = playlist.data.sounds.length;
                let tracksRemaining = nrOfTracks - 8*screen;
                if (tracksRemaining < 0) tracksRemaining = 0;
                for (let j=0; j<8; j++){
                    if (tracksRemaining > j){
                        led = 81-10*j+i;
                        if (playlist.data.sounds[j+8*screen].playing)
                            this.setLED(led,0,87);
                        else
                            this.setLED(led,0,72);
                    }
                }
                led = 91+i;
                if (playlist.playing == true)
                    this.setLED(led,0,87);
                else
                    this.setLED(led,0,72);
            }
        }
        
        this.updateLEDs();
    }

    playSound(soundNr,repeat,play){  
        
        let trackId = game.settings.get(MODULE.moduleName,'soundboardSettings').sounds[soundNr];
        let volume = game.settings.get(MODULE.moduleName,'soundboardSettings').volume[soundNr]/100;
        volume = AudioHelper.inputToVolume(volume);
        if (trackId == "" || trackId == undefined) return;
        let payload = {
            "msgType": "playSound", 
            "trackNr": soundNr,
            "repeat": repeat,
            "play": play,
            "volume": volume
        };
        game.socket.emit(`module.MaterialKeys`, payload);
        if (play){
            let trackId = game.settings.get(MODULE.moduleName,'soundboardSettings').sounds[soundNr];
            let playlistId = game.settings.get(MODULE.moduleName,'soundboardSettings').playlist;
            let sounds = game.playlists.entities.find(p => p._id == playlistId).data.sounds;
            let sound = sounds.find(p => p._id == trackId);
            if (sound == undefined){
                this.activeSounds[soundNr] = false;
                return;
            }
            volume *= game.settings.get("core", "globalInterfaceVolume");
            let src = sound.path;

            let howl = new Howl({src, volume, loop: repeat, onend: (id)=>{
                if (repeat == false){
                    this.activeSounds[soundNr] = false;
                    this.audioSoundboardUpdate();
                }
            },
            onstop: (id)=>{
                this.activeSounds[soundNr] = false;
                this.audioSoundboardUpdate();
            }});
            howl.play();
            this.activeSounds[soundNr] = howl;
        }
        else {
            this.activeSounds[soundNr].stop();
        }
        this.audioSoundboardUpdate();
    }

    audioSoundboard(key,state){
        if (this.keyMode != 8) return;
        let column = (key % 10)-1;
        let row = 8-Math.floor(key/10);
        let soundNr = column+row*8;
        
        const mode = game.settings.get(MODULE.moduleName,'soundboardSettings').mode[soundNr];
        
        if (state == false){
            //if 'hold'
            if (mode == 2){
                
                //this.soundBoardPlaying[soundNr] = false;
                this.playSound(soundNr,false,false);
            }
        }
        else {
            let repeat = false;
            if (mode > 0) repeat = true;
            let play = false;
            if (this.activeSounds[soundNr] == false) play = true;
            //this.soundBoardPlaying[soundNr] = !this.soundBoardPlaying[soundNr];
            this.playSound(soundNr,repeat,play);
        }
    }

    audioSoundboardUpdate(){
        if (this.keyMode != 8) return;
        this.setMainLEDs(0,0);

        for (let i=0; i<64; i++){
            let mode = 0;
            
            let color = game.settings.get(MODULE.moduleName,'soundboardSettings').colorOff[i];
            
            if (this.activeSounds[i] != false){
                mode = game.settings.get(MODULE.moduleName,'soundboardSettings').toggle[i];
                if (mode == 0) color = game.settings.get(MODULE.moduleName,'soundboardSettings').colorOn[i];
            }  
                
            let row = 8-Math.floor(i/8);
            let column = i % 8 + 1;
            let led = row*10+column;
            this.setLED(led,mode,color,0,0);
        }
        this.updateLEDs(); 
    }

    getVisualFxType(num){
        let type;
        if (num == 0) type = 'leaves';
        else if (num == 1) type = 'rain';
        else if (num == 2) type = 'snow';
        else if (num == 3) type = 'snowstorm';
        else if (num == 4) type = 'bubbles';
        else if (num == 5) type = 'clouds';
        else if (num == 6) type = 'embers';
        else if (num == 7) type = 'rainsimple';
        else if (num == 8) type = 'stars';
        else if (num == 9) type = 'crows';
        else if (num == 10) type = 'bats';
        else if (num == 11) type = 'fog';
        else if (num == 12) type = 'raintop';
        return type;
    }

    getFilterName(num){
        let type;
        if (num == 0) type = "core_underwater";
        else if (num == 1) type = "core_predator";
        else if (num == 2) type = "core_oldfilm";
        else if (num == 3) type = "core_bloom";
        return type;
    }
    getFilterType(num){
        let type;
        if (num == 0) type = "underwater";
        else if (num == 1) type = "predator";
        else if (num == 2) type = "oldfilm";
        else if (num == 3) type = "bloom";
        return type;
    }

    visualFxUpdate(key){
        if (this.keyMode != 5 && this.keyMode != 51) return;
        let column = (key % 10)-1;
        let row = 8-Math.floor(key/10);
        if (this.keyMode == 5){
            if (column == 0 && row >= 0){
                let darkness = row/7;
                canvas.scene.update({darkness: darkness});
            }
            else if (column == 2 && row >= 0){
                row = 8 - row;
                this.colorizeColor.red = this.colorizeColors[8-row].red;
                this.colorizeColor.green = this.colorizeColors[8-row].green;
                this.colorizeColor.blue = this.colorizeColors[8-row].blue;
                this.setColorize();
            }
            else if (column > 3 && column < 7){
                if (row == -1) {
                    this.colorizeColor.red = 1;
                    this.colorizeColor.green = 1;
                    this.colorizeColor.blue = 1;
                    this.setColorize();
                    return;
                }
                let color = (7-row)/7;
                if (column == 4) this.colorizeColor.red = color;
                else if (column == 5) this.colorizeColor.green = color;
                else if (column == 6) this.colorizeColor.blue = color;
                this.setColorize();
            }
            
        }
        else if (this.keyMode == 51){
            if ((column < 3) && row >= 0){
                let sel = (row - 1) + 5*(column);
                if (sel > 9) sel--;
                if (row < 1 || row == 6 || (row == 5 && column > 0)) return;
                else if (column < 3 && row == 7) 
                    for (let i=0; i<13; i++)
                        this.visualFxState[i] = false;
                else this.visualFxState[sel] = !this.visualFxState[sel];
                    
                let effects = {};
                for (let i=0; i<13; i++){
                    if (this.visualFxState[i] == false) continue;
                    let type = this.getVisualFxType(i);
                    effects[randomID()] = {
                    type: type,
                    options: {
                        density: 50,
                        speed: 50,
                        scale: 50,
                        tint: "#000000",
                        direction: 50,
                        apply_tint: false
                    }
                    };
                }
                canvas.scene.unsetFlag("fxmaster", "effects").then(() => {
                canvas.scene.setFlag("fxmaster", "effects", effects);
                });
            }
            else if (column == 4 && ((row > 1 && row < 6) || row == 7)){
                if (row == 7){
                    for (let i=0; i<4; i++) this.visualFxFilters[i] = false;
                }
                else {
                    let state = true;
                    if (this.visualFxFilters[row-2]) state = false;
                    this.visualFxFilters[row-2] = state;
                }
                
                let filters = {};
                let core_color = canvas.scene.getFlag("fxmaster", "filters").core_color;
                if (core_color != undefined){
                    filters["core_color"] = core_color;
                }
                for (let i=0; i<4; i++){
                    if (this.visualFxFilters[i] == false) continue;
                    let name = this.getFilterName(i);
                    filters[name] = {
                        type: this.getFilterType(i)
                    };
                }
                canvas.scene.unsetFlag("fxmaster", "filters").then(() => {
                    canvas.scene.setFlag("fxmaster", "filters", filters);
                });
            }
        }  
    }

    setColorize(){
        let core_color = {};
        let color = {};
        let colors = this.colorizeColor;
        core_color = {
            type: "color",
            options: colors
        }
        color = {
            core_color: core_color
        }
        canvas.scene.setFlag("fxmaster", "filters", color);
    }

    visualFx(){
        if (this.keyMode != 5 && this.keyMode != 51) return;
        
        this.setMainLEDs(0,0);
        
        let fxmasterEnabled = false;
        let fxmaster = game.modules.get("fxmaster");
        if (fxmaster != undefined && fxmaster.active) fxmasterEnabled = true;

        if (this.keyMode == 5){

            if (fxmasterEnabled){
                let fxmaster = canvas.scene.getFlag("fxmaster", "filters");
            
                let red = 1;
                let green = 1;
                let blue = 1;
                if (fxmaster != undefined) {
                    let filters = fxmaster.core_color;
                    if (filters != undefined){
                        if (filters.type == "color"){
                            red = filters.options.red;
                            green = filters.options.green;
                            blue = filters.options.blue;
                            this.colorizeColor.red = red;
                            this.colorizeColor.green = green;
                            this.colorizeColor.blue = blue;
                        }
                    }
                }
                this.setLED(95,3,Math.ceil(red*127),Math.ceil(green*127),Math.ceil(blue*127));
                this.setLED(96,3,Math.ceil(red*127),Math.ceil(green*127),Math.ceil(blue*127));
                this.setLED(97,3,Math.ceil(red*127),Math.ceil(green*127),Math.ceil(blue*127));
                
                red = Math.ceil(red*8);
                green = Math.ceil(green*8);
                blue = Math.ceil(blue*8);
                if (red == 0) red = 1;
                if (green == 0) green = 1;
                if (blue == 0) blue = 1;
                
                for (let i=0; i<8; i++){
                    let color = i*15+7;
                    if (red <= i) 
                        color = 0;
                    let led = 15 + 10*i;
                    this.setLED(led,3,color,0,0);
    
                    color = i*15+7;
                    if (green <= i)
                        color = 0;
                    led = 16 + 10*i;
                    this.setLED(led,3,0,color,0);
        
                    color = i*15+7;
                    if (blue <= i)
                        color = 0;
                    led = 17 + 10*i;
                    this.setLED(led,3,0,0,color);
                }
    
                //Colorize effects
                let colorizeLedColor = [53,45,37,27,21,13,9,5];
                for (let i=1; i<9; i++){
                    let state = (this.colorizeState == i) ? 2 : 0;
                    let led = 10*i + 3;
                    this.setLED(led,state,colorizeLedColor[i-1]);
                }
            }
            /*
            * Darkness
            */
            let darkness = Math.floor(7-canvas.scene.data.darkness*7);
            let darknessColor = [7,17,27,47,67,87,107,127];
            for (let i=0; i<8; i++){
                let color = darknessColor[i];
                if (darkness < i) 
                    color = 0;
                let led = 11 + 10*i;
                this.setLED(led,3,color,color,color);
            }
        }

        else if (this.keyMode == 51 && fxmasterEnabled){
            //Weather effects
            for (let i=0; i<11; i++)
                this.visualFxState[i] = false;
            let flags = canvas.scene.getFlag("fxmaster", "effects");
            if (flags) {
                let objKeys = Object.keys(flags);
                for (let i = 0; i < objKeys.length; ++i) {
                    let weather = CONFIG.weatherEffects[flags[objKeys[i]].type];
                    if (weather.label === 'Autumn Leaves') this.visualFxState[0] = true;
                    else if (weather.label === 'Rain') this.visualFxState[1] = true;
                    else if (weather.label === 'Snow') this.visualFxState[2] = true;
                    else if (weather.label === 'Snowstorm') this.visualFxState[3] = true;
                    else if (weather.label === 'Bubbles') this.visualFxState[4] = true;
                    else if (weather.label === 'Clouds') this.visualFxState[5] = true;
                    else if (weather.label === 'Embers') this.visualFxState[6] = true;
                    else if (weather.label === 'Rain without splash') this.visualFxState[7] = true;
                    else if (weather.label === 'Stars') this.visualFxState[8] = true;
                    else if (weather.label === 'Crows') this.visualFxState[9] = true;
                    else if (weather.label === 'Bats') this.visualFxState[10] = true;
                    else if (weather.label === 'Fog') this.visualFxState[11] = true;
                    else if (weather.label === 'Topdown Rain') this.visualFxState[12] = true;
                }
            }
            //VisualFx leds
            let fxLedColor = [127,79,90,90,3,71,84,79,81,99,97,1,79];
            let stopState = 0;
            for (let i=0; i<13; i++){
                let state = this.visualFxState[i] ? 2 : 0;
                if (state) stopState = 2;
                let led;
                if (i < 5) led = 71-10*i;
                else if (i < 9) led = 72-10*(i-5);
                else led = 73-10*(i-9);
                this.setLED(led,state,fxLedColor[i]);
            }
            this.setLED(11,stopState,72);
            this.setLED(12,stopState,72);
            this.setLED(13,stopState,72);
            
            //Filters
            let fxmaster = canvas.scene.getFlag("fxmaster", "filters");
            if (fxmaster == undefined)
                for (let i=0; i<4; i++)
                    this.visualFxFilters[i] = false;
            else {
                let objKeys = Object.keys(fxmaster);
                for (let i=0; i<objKeys.length; i++){
                    if (objKeys[i] == "core_underwater") this.visualFxFilters[0] = true;
                    else if (objKeys[i] == "core_predator") this.visualFxFilters[1] = true;
                    else if (objKeys[i] == "core_oldfilm") this.visualFxFilters[2] = true;
                    else if (objKeys[i] == "core_bloom") this.visualFxFilters[3] = true;
                }
            }
            stopState = 0;
            let filterLedColor = [79,71,1,3]
            for (let i=0; i<4; i++){
                let mode = 0;
                if (this.visualFxFilters[i]) mode = 2;
                if (mode) stopState = 2;
                this.setLED(65-10*i,mode,filterLedColor[i]);
            }

            this.setLED(15,stopState,72);
        }
        
        this.updateLEDs();  
    }

    playlistVolume(key){
        if (Math.floor(this.keyMode/10) != 6) return;
        let column = (key % 10)-1;
        let row = 8-Math.floor(key/10);
        if (row == -1){
            this.playlistVolumeSelector = column;
            this.setMainLEDs(0,0);
            this.playlistVolumeUpdate(); 
            return;
        }
        let screen = this.keyMode - 60;
        let playlist = this.getPlaylist(this.playlistVolumeSelector);
        let track = playlist._data.sounds[column+8*screen];
        if (track == undefined) return;
        row /= 7;
        const volume = AudioHelper.inputToVolume(1-row);
        playlist.updateEmbeddedEntity("PlaylistSound", {_id: track._id, volume: volume});
    }

    playlistVolumeUpdate(){
        if (Math.floor(this.keyMode/10) != 6) return;
        let color;
        let type;
        let maxTracks = this.getMaxTracks();
        type = (this.keyMode == 60)? 1 : 2;
        color = (maxTracks>8)? 87 : 0;
        this.setLED(59,type,color);
        type = (this.keyMode == 61)? 1 : 2;
        color = (maxTracks>8)? 79 : 0;
        this.setLED(49,type,color);
        type = (this.keyMode == 62)? 1 : 2;
        color = (maxTracks>16)? 53 : 0;
        this.setLED(39,type,color);
        type = (this.keyMode == 63)? 1 : 2;
        color = (maxTracks>24)? 74 : 0;
        this.setLED(29,type,color);

        for (let i=0; i<8; i++){
            let playlist = this.getPlaylist(i);
            if (playlist != undefined){
                let led = 91+i;
                let mode = 0;
                if (this.playlistVolumeSelector == i) mode = 2;
                if (playlist.playing == true)
                    this.setLED(led,mode,87);
                else
                    this.setLED(led,mode,72);  
            } 
        }
        
        let screen = this.keyMode - 60;
        let playlist = this.getPlaylist(this.playlistVolumeSelector);
        if (playlist != undefined){
            for (let i=0; i<8; i++){
                let track = playlist.data.sounds[i+8*screen];
                if (track == undefined) continue;
                let volume = AudioHelper.volumeToInput(track.volume)*7;
                let color = 72;
                if (track.playing) color = 87;
                for (let j=0; j<8; j++){
                    let led = 11+10*j+i;
                    if (j>volume) 
                        color = 0; 
                    this.setLED(led,0,color);
                }
            }
        }
        this.updateLEDs();
    }

    updateTrackerTokens(combat){
        if (this.keyMode != 4) return;
        if (combat != null){
            let combatants = combat.combatants;
            if (combatants.length > 0){
                let initiativeOrder = combat.turns;
                let oldCombatants = 0;
                if (this.combatantsLengthOld > combatants.length){
                    oldCombatants = this.combatantsLengthOld-combatants.length;
                    for (let i=0; i<this.combatantsLengthOld; i++){
                        let j = i + initiativeOrder.length;
                        if (i>7) j = i-18;
                        if (i>15) j = i-36;
                        if (i>23) j = i-54;
                        if (i>31) break;
                        let led = 81+j;
                        this.setLED(led,0,0);
                    }     
                }
                for (let i=0; i<initiativeOrder.length; i++){
                    let token = initiativeOrder[i].token;
                    let color;
                    if (token.disposition == 1) color = 87;
                    else if (token.disposition == 0) color = 74;
                    else if (token.disposition == -1) color = 72;
                    let type = 0;
                    if (combat.started && token._id == combat.combatant.tokenId) type =2;
                    let j = i;
                    if (i>7) j = i-18;
                    if (i>15) j = i-36;
                    if (i>23) j = i-54;
                    if (i>31) break;
                    let led = 81+j;
                    
                    if (initiativeOrder[i].defeated)
                        this.setLED(led,type,3);
                    else
                        this.setLED(led,type,color);
                }
                
                this.combatantsLengthOld = combatants.length;
                this.updateLEDs();
                return;
            }
        }
        if (this.combatantsLengthOld > 0){
            for (let i=0; i<this.combatantsLengthOld; i++){
                let j = i;
                if (i>7) j = i-18;
                if (j>15) j = i-28;
                let led = 81+j;
                this.setLED(led,0,0);
            } 
            this.updateLEDs();    
        }
    }
    combatTrackerUpdate(key){
        if(key == 14 || key == 15 || key == 24 || key == 25 || key == 34 || key == 35){
            if (game.combat.started == false) game.combat.startCombat();
            else game.combat.endCombat();
        }
        else if (key == 11 || key == 12 || key == 21 || key == 22 || key == 31 || key == 32){
            game.combat.previousTurn();
        }
        else if (key == 17 || key == 18 || key == 27 || key == 28 || key == 37 || key == 38){
            game.combat.nextTurn();
        }
        else {
            let selected = key - 81;
            if (selected < 0) selected += 18;
            if (selected < 0) selected += 18;
            
            let token = game.combat.turns[selected].token;
            if (token != undefined){
                let tokenId = token._id;
                let tokens = canvas.tokens.children[0].children;
                for (let i=0; i<tokens.length; i++){
                    if (tokens[i].id == tokenId){
                        tokens[i].name;
                        tokens[i].control();
                    }    
                }
                canvas.animatePan({x: token.x, y: token.y, speed: 2000});
            }
        }
    }

    combatTracker(combat){
        if (this.keyMode != 4) return;
        if (combat != undefined){
            let combatants = combat.combatants;
            if (combatants.length > 0){
                if (combat.started)
                    this.combatState = 2; 
                else 
                    this.combatState = 1;
                this.updateTrackerTokens(combat);    
            }
            else 
                this.combatState = 0;
        }
        else 
            this.combatState = 0;

        let mode = 2;
        let color = 87;
        let modeArrows = 2;
        let colorArrows = 72;
        if (this.combatState == 0){
            this.setMainLEDs(0,0);
        }
        if (this.combatState == 1) {
            mode = 0;
        }
        else if (this.combatState == 2){
            mode = 0;
            color = 72;
            modeArrows = 0;
            colorArrows = 87;
        }
        this.setLED(14,mode,color);
        this.setLED(15,mode,color);
        this.setLED(24,mode,color);
        this.setLED(25,mode,color);
        this.setLED(34,mode,color);
        this.setLED(35,mode,color);
        this.setArrow(17,'right',colorArrows,modeArrows);
        this.setArrow(11,'left',colorArrows,modeArrows);

        this.updateLEDs();
    }
    
    HpTracker(key){
        if (Math.floor(this.keyMode/10) != 3) return;
        let page = this.keyMode % 10-1;
        let selected = key % 10 - 1 + 8 * page;
        let token = game.combat.turns[selected].token;
        if (token != undefined){
            let tokenId = token._id;
            let tokens = canvas.tokens.children[0].children;
            for (let i=0; i<tokens.length; i++){
                if (tokens[i].id == tokenId){
                    tokens[i].name;
                    tokens[i].control();
                }    
            }
            canvas.animatePan({x: token.x, y: token.y, speed: 2000});
        }
    }

    updateHpTracker(combat){
        if (Math.floor(this.keyMode/10) != 3) return;
        let hpTrackerPages;
        if (game.combat) hpTrackerPages = Math.ceil(game.combat.combatants.length/8);
        let color;
        let type;
        type = (this.keyMode == 31)? 1 : 2;
        color = (hpTrackerPages>1)? 87 : 0;
        this.setLED(79,type,color);
        type = (this.keyMode == 32)? 1 : 2;
        color = (hpTrackerPages>1)? 79 : 0;
        this.setLED(69,type,color);
        type = (this.keyMode == 33)? 1 : 2;
        color = (hpTrackerPages>2)? 53 : 0;
        this.setLED(59,type,color);
        type = (this.keyMode == 34)? 1 : 2;
        color = (hpTrackerPages>3)? 74 : 0;
        this.setLED(49,type,color);

        let page = this.keyMode % 10-1;
        let combatants = combat.combatants;
        
        this.setMainLEDs(0,0);
        if (combatants.length > 0){
            let initiativeOrder = combat.turns;
        
            for (let i=0; i<8; i++){
                let nr = i+8*page;
                if (nr >= initiativeOrder.length) break;
                let token = initiativeOrder[nr].token;
                let color;

                if (token.disposition == 1) color = 87;
                else if (token.disposition == 0) color = 74;
                else if (token.disposition == -1) color = 72;
                
                let type = 0;
                if (combat.started && token._id == combat.combatant.tokenId) type = 2;
                let j = i;
                if (i>7) j = i-18;
                if (j>15) j = i-28;
                
               
                let led = 91+i;

                if (initiativeOrder[nr].defeated)
                    this.setLED(led,type,3);
                else
                    this.setLED(led,type,color);
                
                token = canvas.tokens.children[0].children.find(p => p.id == token._id);
                let leds = 0;

                let hp = token.actor.data.data.attributes.hp.value;
                let hpMax = token.actor.data.data.attributes.hp.max;
                if (hp == 0 || initiativeOrder[nr].defeated) leds = 0;
                else leds = Math.ceil(8*hp/hpMax);

                for (let j=0; j<8; j++){
                    let led = 11+10*j+i;
                    if (j>=leds) 
                        color = 0; 
                    this.setLED(led,type,color);
                }
            }
            this.combatantsLengthOld = combatants.length;
        }
        this.updateLEDs();
    }

    macroBoard(key){
        if (this.keyMode != 2) return;
        let column = (key % 10)-1;
        let row = 8-Math.floor(key/10);
        let nr = column+row*8;

        let macroId = game.settings.get(MODULE.moduleName,'macroSettings').macros[nr];
        const macro = game.macros.get(macroId);
        if (macro == null) return;
        const args = game.settings.get(MODULE.moduleName,'macroArgs')[nr];
        let furnaceEnabled = false;
        let furnace = game.modules.get("furnace");
        if (furnace != undefined && furnace.active) furnaceEnabled = true;
        if (furnaceEnabled == false) macro.execute();
        else {
            let chatData = {
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(),
                content: "/'" + macro.name + "' " + args
              };
            ChatMessage.create(chatData, {});
        }
    }

    macroUpdate(){
        if (this.keyMode != 2) return;
        this.setMainLEDs(0,0);

        for (let i=0; i<64; i++){
            let color = game.settings.get(MODULE.moduleName,'macroSettings').color[i];
                         
            let row = 8-Math.floor(i/8);
            let column = i % 8 + 1;
            let led = row*10+column;
            this.setLED(led,0,color);
        }
        this.updateLEDs(); 
    }


    setMode(mode){
        this.setMainLEDs(0,0);

        /*
         * Macro board
         */
        if (mode == 2){
            this.keyMode = mode;
            this.setControlKeys(mode,87,0);
            this.macroUpdate();
        }
        /*
         * Combat tracker
        */
        if (mode == 4){
            this.keyMode = mode;
            this.setControlKeys(mode,87,0);
            this.combatTracker(game.combat);
            //MODULE.sendWS("COMBAT 1");
            if (game.combat) this.updateTrackerTokens(game.combat);
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
            if (game.combat) this.updateHpTracker(game.combat);
        }
        
        //Visual Fx board
        else if (mode == 5){
            if (this.keyMode == 5){
                this.keyMode = 51;
                this.setControlKeys(mode,72,0);
            }
            else {
                this.keyMode = 5;
                this.setControlKeys(mode,87,0);
            }
            this.visualFx();
        }
        /*
         * Playlist Volume Control
        */
        else if (mode == 6) {
            if (Math.floor(this.keyMode/10) != 6) this.keyMode = 60;
            else this.keyMode++;
            let maxTracks = this.getMaxTracks();
            if (this.keyMode > 59 + Math.ceil(maxTracks/8) || this.keyMode > 63) this.keyMode = 60;
            let color;
            if (this.keyMode == 60) color = 87;
            else if (this.keyMode == 61) color = 79;
            else if (this.keyMode == 62) color = 53;
            else if (this.keyMode == 63) color = 74;
            this.setControlKeys(mode,color,0);
            this.playlistVolumeUpdate();
        }
        /*
         * Playlist Soundboard
        */
        else if (mode == 7) {
            if (Math.floor(this.keyMode/10) != 7) this.keyMode = 70;
            else this.keyMode++;
            let maxTracks = this.getMaxTracks();
            if (this.keyMode > 69 + Math.ceil(maxTracks/8) || this.keyMode > 73) this.keyMode = 70;
            let color;
            if (this.keyMode == 70) color = 87;
            else if (this.keyMode == 71) color = 79;
            else if (this.keyMode == 72) color = 53;
            else if (this.keyMode == 73) color = 74;
            this.setControlKeys(mode,color,0);
            this.updatePlaylist();
        }
            
        //Audio Fx soundboard
        else if (mode == 8){
            this.keyMode = mode;
            this.setControlKeys(mode,87,0);
            this.audioSoundboardUpdate();
        }
        this.updateLEDs();
    }
    
    updateLEDs(){
        let msg = "{\"T\":\"L\",\"D\":\"";
        for (let i=11; i<100; i++) {
            if (i>11) msg += ";";
            msg += i+","+this.ledBufferType[i]+","+this.ledBufferColor[i];
            if (this.ledBufferType[i] == 1) msg += ","+this.ledBufferColor2[i];
            else if (this.ledBufferType[i] == 3) msg += ","+this.ledBufferColor2[i]+","+this.ledBufferColor3[i];
        }
        msg+= "\"}"
        MODULE.sendWS(msg);
    }
    
    setLED(led,type,color,color2=0,color3=0){
        this.ledBufferColor[led] = color;
        this.ledBufferColor2[led] = color2;
        this.ledBufferColor3[led] = color3;
        this.ledBufferType[led] = type;
    }
    
    setMainLEDs(color,type){
        for (let i=11; i<99; i++) {
            if (i % 10 == 9) continue;
            this.ledBufferColor[i] = color;
            this.ledBufferType[i] = type;
        }
    }
    
    setControlKeys(keyMode,color,type){
        for (let i=0; i<8; i++) {
            let led = i*10+19;
            let newColor = 0;
            if (i == keyMode-1) newColor = color; 
            this.ledBufferColor[led] = newColor;
            this.ledBufferType[led] = type;
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
    
    
    
}