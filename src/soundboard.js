import {moduleName,launchpad} from "../MaterialKeys.js";
import {compatibleCore} from "./misc.js";

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
            if (this.activeSounds[soundNr] == false) play = true;
            this.prePlaySound(soundNr,repeat,play);
        }
    }

    update(){
        if (launchpad.keyMode != 8) return;
        launchpad.setMainLEDs(0,0);

        for (let i=0; i<64; i++){
            let mode = 0;
            
            let color = game.settings.get(moduleName,'soundboardSettings').colorOff[i];
            
            if (this.activeSounds[i] != false){
                mode = game.settings.get(moduleName,'soundboardSettings').toggle[i];
                if (mode == 0) color = game.settings.get(moduleName,'soundboardSettings').colorOn[i];
            }  
                
            const row = 8-Math.floor(i/8);
            const column = i % 8 + 1;
            const led = row*10+column;
            launchpad.setLED(led,mode,color,0,0);
        }
        launchpad.updateLEDs(); 
    }

    async prePlaySound(soundNr,repeat,play){  
        const soundBoardSettings = game.settings.get(moduleName,'soundboardSettings');
        let playlistId;
        if (soundBoardSettings.selectedPlaylists != undefined) playlistId = soundBoardSettings.selectedPlaylists[soundNr];
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

            if (compatibleCore("0.8.1")) {
                let newSound = new SoundNode(src);
                if(newSound.loaded == false) await newSound.load({autoplay:true});
                newSound.on('end', ()=>{
                    if (repeat == false) {
                        this.activeSounds[soundNr] = false;
                        this.update();
                    }
                });
                newSound.play({loop:repeat,volume:volume});
                this.activeSounds[soundNr] = newSound;
            }
            else {
                let howl = new Howl({src, volume, loop: repeat, onend: (id)=>{
                    if (repeat == false){
                        this.activeSounds[soundNr] = false;
                        this.update();
                    }
                },
                onstop: ()=>{
                    this.activeSounds[soundNr] = false;
                    this.update();
                }});
                howl.play();
                this.activeSounds[soundNr] = howl;
            }
        }
        else {
            this.activeSounds[soundNr].stop();
            this.activeSounds[soundNr] = false;
        }
        this.update();
    }
}