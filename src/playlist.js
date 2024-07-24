import { moduleName, launchpad } from "../MaterialKeys.js";
import { compatibilityHandler } from "./compatibilityHandler.js";

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
        let mode;
        let txt;
        const maxTracks = this.getMaxTracks();
        mode = (launchpad.keyMode == 70)? 'flashing' : 'pulsing';
        color = (maxTracks>8)? 87 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(69,mode,color,0,txt);
        mode = (launchpad.keyMode == 71)? 'flashing' : 'pulsing';
        color = (maxTracks>8)? 79 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(59,mode,color,0,txt);
        mode = (launchpad.keyMode == 72)? 'flashing' : 'pulsing';
        color = (maxTracks>16)? 53 : 0;
        txt = (maxTracks>16)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(49,mode,color,0,txt);
        mode = (launchpad.keyMode == 73)? 'flashing' : 'pulsing';
        color = (maxTracks>24)? 74 : 0;
        txt = (maxTracks>24)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(39,mode,color,0,txt);

        const screen = launchpad.keyMode - 70;

        let settings = game.settings.get(moduleName,'playlists');
        const colorOn = settings.colorOn ? settings.colorOn : 87;
        const colorOff = settings.colorOff ? settings.colorOff : 72;
        
        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            let led;
            if (playlist != undefined){
                const nrOfTracks = playlist.sounds.size;
                let tracksRemaining = nrOfTracks - 8*screen;
                if (tracksRemaining < 0) tracksRemaining = 0;
                
                for (let j=0; j<8; j++){
                    if (tracksRemaining > j){
                        const track = playlist.sounds.contents[j+8*screen];
                        const txt = track.name;
                        led = 81-10*j+i;
                        if (track.playing)
                            launchpad.setLED(led,'static',colorOn,0,txt);
                        else
                            launchpad.setLED(led,'static',colorOff,0,txt);
                    }
                }
                led = 91+i;
                const txt = playlist.name;
                if (playlist.playing == true)
                    launchpad.setLED(led,'static',colorOn,0,txt);
                else
                    launchpad.setLED(led,'static',colorOff,0,txt);
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
        
        if (track.playing)
            playlist.stopSound(track);
        else {
            let playlistMode = game.settings.get(moduleName,'playlists').playlistMode[playlistNr];
            let globalMode = game.settings.get(moduleName,'playlists').playMode;

            if (playlistMode == 1 || (playlistMode == 0 && globalMode == 0)) { //unrestricted
                await playlist.update({
                    playing: true,
                    sounds: [
                        {_id: track.id, playing: true}
                    ]
                });
            }
            else if ((playlistMode == 0 && globalMode == 1) || playlistMode == 2) { //one track per playlist
                playlist.playSound(track);
            }
            else if (playlistMode == 0 && globalMode == 2) { //one track in total
                await this.stopAll();
                playlist.playSound(track);
            }
        }
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
            launchpad.setMainLEDs(0,'static');
            this.volumeUpdate(); 
            return;
        }
        const screen = launchpad.keyMode - 60;
        const playlist = this.getPlaylist(this.playlistVolumeSelector);
        const track = playlist.sounds.contents[column+8*screen];
        if (track == undefined) return;
        row /= 7;
        const volume = compatibilityHandler('audioHelper').inputToVolume(1-row);
        track.debounceVolume(volume);
        const elmnt = document.getElementById("currently-playing").querySelectorAll(`[data-playlist-id=${playlist.id}][data-sound-id=${track.id}]`)[0].querySelector("input");
        elmnt.value = volume;
    }

    volumeUpdate(){
        if (Math.floor(launchpad.keyMode/10) != 6) return;
        let color;
        let mode;
        let txt;
        const maxTracks = this.getMaxTracks();
        mode = (launchpad.keyMode == 60)? 'flashing' : 'pulsing';
        color = (maxTracks>8)? 87 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(59,mode,color,0,txt);
        mode = (launchpad.keyMode == 61)? 'flashing' : 'pulsing';
        color = (maxTracks>8)? 79 : 0;
        txt = (maxTracks>8)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(49,mode,color,0,txt);
        mode = (launchpad.keyMode == 62)? 'flashing' : 'pulsing';
        color = (maxTracks>16)? 53 : 0;
        txt = (maxTracks>16)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(39,mode,color,0,txt);
        mode = (launchpad.keyMode == 63)? 'flashing' : 'pulsing';
        color = (maxTracks>24)? 74 : 0;
        txt = (maxTracks>24)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(29,mode,color,0,txt);

        let settings = game.settings.get(moduleName,'playlists');
        const colorOn = settings.colorOn ? settings.colorOn : 87;
        const colorOff = settings.colorOff ? settings.colorOff : 72;

        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            if (playlist != undefined){
                const led = 91+i;
                let mode = 'static';
                const txt = playlist.name;
                if (this.playlistVolumeSelector == i) mode = 'pulsing';
                if (playlist.playing == true)
                    launchpad.setLED(led,mode,colorOn,0,txt);
                else
                    launchpad.setLED(led,mode,colorOff,0,txt);  
            } 
        }
        
        const screen = launchpad.keyMode - 60;
        const playlist = this.getPlaylist(this.playlistVolumeSelector);
        if (playlist != undefined){
            for (let i=0; i<8; i++){
                const track = playlist.sounds.contents[i+8*screen];
                if (track == undefined) continue;
                const volume = Math.ceil(compatibilityHandler('audioHelper').volumeToInput(track.volume)*7);
                let color = colorOff;
                let txt = '';
                if (track.playing) color = colorOn;
                for (let j=0; j<8; j++){
                    let led = 11+10*j+i;
                    if (j>volume) 
                        color = 0; 
                    if (j == 0) txt = track.name;
                    else txt = `${Math.ceil(j*100/7)}%`;
                    launchpad.setLED(led,'static',color,0,txt);
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
                const nrOfTracks = playlist.sounds.size;
                if (nrOfTracks > maxTracks) maxTracks = nrOfTracks;
            }
        }
        return maxTracks;
    }
}