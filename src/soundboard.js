import {moduleName,launchpad} from "../MaterialKeys.js";
import {compatibleCore} from "./misc.js";

export class SoundboardControl{
    constructor(){
        this.activeSounds = [];
        this.page = 0;
    }

    keyPress(key,state){
        if (Math.floor(launchpad.keyMode/10) != 8) return;
        
        if (key == 91) {    //Stop all
            for (let i=0; i<this.activeSounds.length; i++) {
                if (this.activeSounds[i] != undefined){
                    this.prePlaySound(i,false,false);
                }
            }
            return;
        }

        const page = launchpad.keyMode - 80;
        
        const column = (key % 10)-1;
        const row = 8-Math.floor(key/10);
        const soundNr = column+row*8+64*page;
        
        const mode = game.settings.get(moduleName,'soundboardSettings').mode[soundNr];
        
        if (state == false){
            //if 'hold'
            if (mode == 2)
                this.prePlaySound(soundNr,false,false);
        }
        else {
            let repeat = false;
            if (mode > 0) repeat = true;
            let play = false;
            if (this.activeSounds[soundNr] == undefined) play = true;
            this.prePlaySound(soundNr,repeat,play);
        }
    }

    update(){
        if (Math.floor(launchpad.keyMode/10) != 8) return;
        launchpad.setMainLEDs(0,0);

        launchpad.setLED(91,0,72,0,0, game.i18n.localize("MaterialKeys.Emulator.StopAll"));

        let color;
        let type;
        let txt;
        const maxSounds = game.settings.get(moduleName,'soundboardSettings').volume.length;
        
        type = (launchpad.keyMode == 80)? 1 : 2;
        color = (maxSounds>64)? 87 : 0;
        txt = (maxSounds>64)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(79,type,color,0,0,txt);
        type = (launchpad.keyMode == 81)? 1 : 2;
        color = (maxSounds>64)? 79 : 0;
        txt = (maxSounds>64)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(69,type,color,0,0, txt);
        type = (launchpad.keyMode == 82)? 1 : 2;
        color = (maxSounds>128)? 53 : 0;
        txt = (maxSounds>128)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(59,type,color,0,0,txt);
        type = (launchpad.keyMode == 83)? 1 : 2;
        color = (maxSounds>192)? 74 : 0;
        txt = (maxSounds>192)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(49,type,color,0,0,txt);

        const page = launchpad.keyMode - 80;

        for (let i=64*page; i<64*page+64; i++){
            let mode = 0;
            
            let color = game.settings.get(moduleName,'soundboardSettings').colorOff[i];
            if (this.activeSounds[i] != undefined){
                mode = game.settings.get(moduleName,'soundboardSettings').toggle[i];
                if (mode == undefined) mode = 0;
                if (mode == 0) color = game.settings.get(moduleName,'soundboardSettings').colorOn[i];
            }  
            
            let ledIteration = i - 64*page;
            const row = 8-Math.floor(ledIteration/8);
            const column = ledIteration % 8 + 1;
            const led = row*10+column;
            launchpad.setLED(led,mode,color,0,0,game.settings.get(moduleName,'soundboardSettings').name[i]);
        }
        launchpad.updateLEDs(); 
    }

    async prePlaySound(soundNr,repeat,play){  
        const soundBoardSettings = game.settings.get(moduleName,'soundboardSettings');
        const playlistId = (soundBoardSettings.selectedPlaylists != undefined) ? soundBoardSettings.selectedPlaylists[soundNr] : undefined;
        let src;
        if (playlistId == "" || playlistId == undefined) return;
        if (playlistId == 'none') return;
        else if (playlistId == 'FP') {
            src = soundBoardSettings.src[soundNr];
            const ret = await FilePicker.browse("data", src, {wildcard:true});
            const files = ret.files;
            if (files.length == 1) src = files;
            else {
                let value = Math.floor(Math.random() * Math.floor(files.length));
                src = files[value];
            }
        }
        else {
            const soundId = soundBoardSettings.sounds[soundNr];
            const sounds = game.playlists.get(playlistId).sounds;
            if (sounds == undefined) return;
            const sound = compatibleCore("0.8.1") ? sounds.find(p => p.id == soundId) : sounds.find(p => p._id == soundId);
            if (sound == undefined) return;
            src = sound.path;
        }
   
        let volume = game.settings.get(moduleName,'soundboardSettings').volume[soundNr]/100;
        volume = AudioHelper.inputToVolume(volume);
        
        let payload = {
            "msgType": "playSound", 
            "trackNr": soundNr,
            "src": src,
            "repeat": repeat,
            "play": play,
            "volume": volume
        };
        game.socket.emit(`module.MaterialKeys`, payload);

        this.playSound(soundNr,src,play,repeat,volume);
    }

    async playSound(soundNr,src,play,repeat,volume){
        if (play){
            volume *= game.settings.get("core", "globalAmbientVolume");

            if (compatibleCore("0.8.6")) {
                let newSound = new Sound(src);
                if(newSound.loaded == false) await newSound.load({autoplay:true});
                newSound.on('end', ()=>{
                    if (repeat == false) {
                        this.activeSounds[soundNr] = undefined;
                        this.update();
                    }
                });
                newSound.play({loop:repeat,volume:volume});
                this.activeSounds[soundNr] = newSound;
            }
            else {
                let howl = new Howl({src, volume, loop: repeat, onend: (id)=>{
                    if (repeat == false){
                        this.activeSounds[soundNr] = undefined;
                        this.update();
                    }
                },
                onstop: ()=>{
                    this.activeSounds[soundNr] = undefined;
                    this.update();
                }});
                howl.play();
                this.activeSounds[soundNr] = howl;
            }
        }
        else {
            if (this.activeSounds[soundNr] != undefined) this.activeSounds[soundNr].stop();
            this.activeSounds[soundNr] = undefined;
        }
        this.update();
    }
}