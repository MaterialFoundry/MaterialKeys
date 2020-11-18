import * as MODULE from "../MaterialKeys.js";
import {launchpad} from "../MaterialKeys.js";

export class SoundboardControl{
    constructor(){
        this.activeSounds = [];
        for (let i=0; i<64; i++)
            this.activeSounds[i] = false;
    }

    keyPress(key,state){
        if (launchpad.keyMode != 8) return;
        const column = (key % 10)-1;
        const row = 8-Math.floor(key/10);
        const soundNr = column+row*8;
        
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

    update(){
        if (launchpad.keyMode != 8) return;
        launchpad.setMainLEDs(0,0);

        for (let i=0; i<64; i++){
            let mode = 0;
            
            let color = game.settings.get(MODULE.moduleName,'soundboardSettings').colorOff[i];
            
            if (this.activeSounds[i] != false){
                mode = game.settings.get(MODULE.moduleName,'soundboardSettings').toggle[i];
                if (mode == 0) color = game.settings.get(MODULE.moduleName,'soundboardSettings').colorOn[i];
            }  
                
            const row = 8-Math.floor(i/8);
            const column = i % 8 + 1;
            const led = row*10+column;
            launchpad.setLED(led,mode,color,0,0);
        }
        launchpad.updateLEDs(); 
    }

    playSound(soundNr,repeat,play){  
        const trackId = game.settings.get(MODULE.moduleName,'soundboardSettings').sounds[soundNr];
        let volume = game.settings.get(MODULE.moduleName,'soundboardSettings').volume[soundNr]/100;
        volume = AudioHelper.inputToVolume(volume);
        if (trackId == "" || trackId == undefined) return;
        const payload = {
            "msgType": "playSound", 
            "trackNr": soundNr,
            "repeat": repeat,
            "play": play,
            "volume": volume
        };
        game.socket.emit(`module.MaterialKeys`, payload);
        if (play){
            const playlistId = game.settings.get(MODULE.moduleName,'soundboardSettings').playlist;
            const sounds = game.playlists.entities.find(p => p._id == playlistId).data.sounds;
            const sound = sounds.find(p => p._id == trackId);
            if (sound == undefined){
                this.activeSounds[soundNr] = false;
                return;
            }
            volume *= game.settings.get("core", "globalInterfaceVolume");
            const src = sound.path;

            let howl = new Howl({src, volume, loop: repeat, onend: (id)=>{
                if (repeat == false){
                    this.activeSounds[soundNr] = false;
                    this.update();
                }
            },
            onstop: (id)=>{
                this.activeSounds[soundNr] = false;
                this.update();
            }});
            howl.play();
            this.activeSounds[soundNr] = howl;
        }
        else {
            this.activeSounds[soundNr].stop();
        }
        this.update();
    }
}