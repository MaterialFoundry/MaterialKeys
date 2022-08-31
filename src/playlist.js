import { moduleName, launchpad } from "../MaterialKeys.js";
import { compatibleCore } from "./misc.js";

export class PlaylistControl{
    constructor(){
        this.playlistVolumeSelector = 0;
    }

    async playlistKeyPress(key){
        const playlistNr = (key % 10)-1;
        const playlist = this.getPlaylist(playlistNr);
        if (playlist == undefined) return;

        const trackNr = 8-Math.floor(key/10);

        if (trackNr == -1){
            await this.playPlaylist(playlist,playlistNr);
        }
        else {
            const screen = launchpad.keyMode - 70;
            const track = playlist.sounds.contents[trackNr+8*screen];
            if (track != undefined)
                this.playTrack(track,playlist,playlistNr);
        }
        this.playlistUpdate();
    }

    playlistUpdate(){  
        if (Math.floor(launchpad.keyMode/10) != 7) return;
        let color;
        let type;
        let txt;
        const maxTracks = this.getMaxTracks();
        type = (launchpad.keyMode == 70)? 1 : 2;
        color = (maxTracks>8)? 87 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(69,type,color,0,0,txt);
        type = (launchpad.keyMode == 71)? 1 : 2;
        color = (maxTracks>8)? 79 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(59,type,color,0,0,txt);
        type = (launchpad.keyMode == 72)? 1 : 2;
        color = (maxTracks>16)? 53 : 0;
        txt = (maxTracks>16)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(49,type,color,0,0,txt);
        type = (launchpad.keyMode == 73)? 1 : 2;
        color = (maxTracks>24)? 74 : 0;
        txt = (maxTracks>24)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(39,type,color,0,0,txt);

        const screen = launchpad.keyMode - 70;

        let settings = game.settings.get(moduleName,'playlists');
        const colorOn = settings.colorOn ? settings.colorOn : 87;
        const colorOff = settings.colorOff ? settings.colorOff : 72;
        
        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            let led;
            if (playlist != undefined){
                const nrOfTracks = compatibleCore('10.0') ? playlist.sounds.size : playlist.data.sounds.size;
                let tracksRemaining = nrOfTracks - 8*screen;
                if (tracksRemaining < 0) tracksRemaining = 0;
                
                for (let j=0; j<8; j++){
                    if (tracksRemaining > j){
                        const track = playlist.sounds.contents[j+8*screen];
                        const txt = track.name;
                        led = 81-10*j+i;
                        if (track.playing)
                            launchpad.setLED(led,0,colorOn,0,0,txt);
                        else
                            launchpad.setLED(led,0,colorOff,0,0,txt);
                    }
                }
                led = 91+i;
                const txt = playlist.name;
                if (playlist.playing == true)
                    launchpad.setLED(led,0,colorOn,0,0,txt);
                else
                    launchpad.setLED(led,0,colorOff,0,0,txt);
            }
        }
        launchpad.updateLEDs();
    }

    async playPlaylist(playlist,playlistNr){
        if (playlist.playing) {
            playlist.stopAll();
            return;
        }
        let mode = game.settings.get(moduleName,'playlists').playlistMode[playlistNr];
        if (mode == 0) {
            mode = game.settings.get(moduleName,'playlists').playMode;
            if (mode == 2) await this.stopAll();
        }
        playlist.playAll();
    }
    
    async playTrack(track,playlist,playlistNr){
        let play;
        if (track.playing)
            play = false;
        else {
            play = true;
            let mode = game.settings.get(moduleName,'playlists').playlistMode[playlistNr];
            if (mode == 0) {
                mode = game.settings.get(moduleName,'playlists').playMode;
                if (mode == 1) await playlist.stopAll();
                else if (mode == 2) await this.stopAll();
            }
            else if (mode == 2) await playlist.stopAll();
        }
        if (play) await playlist.playSound(track);
        else await playlist.stopSound(track);
        
        playlist.update({playing: play});
    }

    stopAll(force=false){
        if (force){
            let playing = game.playlists.playing;
            for (let i=0; i<playing.length; i++){
                playing[i].stopAll();
            }
        }
        else {
            let playing = game.playlists.playing;
            let settings = game.settings.get(moduleName,'playlists');
            let selectedPlaylists = settings.selectedPlaylist;
            for (let i=0; i<playing.length; i++){
                const playlistNr = selectedPlaylists.findIndex(p => p == playing[i].id);
                const mode = settings.playlistMode[playlistNr];
                if (mode == 0) playing[i].stopAll();
            }
        }
    }

    async volumeKeyPress(key){
        if (Math.floor(launchpad.keyMode/10) != 6) return;
        const column = (key % 10)-1;
        let row = 8-Math.floor(key/10);
        if (row == -1){
            this.playlistVolumeSelector = column;
            launchpad.setMainLEDs(0,0);
            this.volumeUpdate(); 
            return;
        }
        const screen = launchpad.keyMode - 60;
        const playlist = this.getPlaylist(this.playlistVolumeSelector);
        const track = playlist.sounds.contents[column+8*screen];
        if (track == undefined) return;
        row /= 7;
        const volume = AudioHelper.inputToVolume(1-row);
        track.debounceVolume(volume);
    }

    volumeUpdate(){
        if (Math.floor(launchpad.keyMode/10) != 6) return;
        let color;
        let type;
        let txt;
        const maxTracks = this.getMaxTracks();
        type = (launchpad.keyMode == 60)? 1 : 2;
        color = (maxTracks>8)? 87 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(59,type,color,0,0,txt);
        type = (launchpad.keyMode == 61)? 1 : 2;
        color = (maxTracks>8)? 79 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(49,type,color,0,0,txt);
        type = (launchpad.keyMode == 62)? 1 : 2;
        color = (maxTracks>16)? 53 : 0;
        txt = (maxTracks>16)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(39,type,color,0,0,txt);
        type = (launchpad.keyMode == 63)? 1 : 2;
        color = (maxTracks>24)? 74 : 0;
        txt = (maxTracks>24)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(29,type,color,0,0,txt);

        let settings = game.settings.get(moduleName,'playlists');
        const colorOn = settings.colorOn ? settings.colorOn : 87;
        const colorOff = settings.colorOff ? settings.colorOff : 72;

        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            if (playlist != undefined){
                const led = 91+i;
                let mode = 0;
                const txt = playlist.name;
                if (this.playlistVolumeSelector == i) mode = 2;
                if (playlist.playing == true)
                    launchpad.setLED(led,mode,colorOn,0,0,txt);
                else
                    launchpad.setLED(led,mode,colorOff,0,0,txt);  
            } 
        }
        
        const screen = launchpad.keyMode - 60;
        const playlist = this.getPlaylist(this.playlistVolumeSelector);
        if (playlist != undefined){
            for (let i=0; i<8; i++){
                const track = playlist.sounds.contents[i+8*screen];
                if (track == undefined) continue;
                const trackVolume = track.volume/game.settings.get("core", "globalPlaylistVolume");
                const volume = Math.ceil(AudioHelper.volumeToInput(trackVolume)*7);
                let color = colorOff;
                let txt = '';
                if (track.playing) color = colorOn;
                for (let j=0; j<8; j++){
                    let led = 11+10*j+i;
                    if (j>volume) 
                        color = 0; 
                    if (j == 0) txt = track.name;
                    else txt = `${Math.ceil(j*100/7)}%`;
                    launchpad.setLED(led,0,color,0,0,txt);
                }
            }
        }
        launchpad.updateLEDs();
    }

    getPlaylist(num){
        let selectedPlaylists = game.settings.get(moduleName,'playlists').selectedPlaylist;
        if (selectedPlaylists != undefined) 
            return game.playlists.get(selectedPlaylists[num]);
        else return undefined;
    }
    
    getMaxTracks(){
        let maxTracks = 0;
        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            if (playlist != undefined){
                const nrOfTracks = compatibleCore('10.0') ? playlist.sounds.size : playlist.data.sounds.size;
                if (nrOfTracks > maxTracks) maxTracks = nrOfTracks;
            }
        }
        return maxTracks;
    }
}