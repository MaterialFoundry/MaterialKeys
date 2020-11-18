import * as MODULE from "../MaterialKeys.js";
import {launchpad} from "../MaterialKeys.js";

export class PlaylistControl{
    constructor(){
        this.playlistVolumeSelector = 0;
    }

    async playlistKeyPress(key){
        const playlistNr = (key % 10)-1;
        const playlist = this.getPlaylist(playlistNr);
        if (playlist == undefined) return;
        const playMode = game.settings.get(MODULE.moduleName,'playlistMethod');
        const trackNr = 8-Math.floor(key/10);

        if (trackNr == -1){
            if (playlist.playing == true)
                await playlist.stopAll();
            else 
                await playlist.playAll();
        }
        else {
            const screen = launchpad.keyMode - 70;
            const track = playlist.sounds[trackNr+8*screen];
            const playing = track.playing;
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
        this.playlistUpdate();
    }

    playlistUpdate(){  
        if (Math.floor(launchpad.keyMode/10) != 7) return;
        let color;
        let type;
        const maxTracks = this.getMaxTracks();
        type = (launchpad.keyMode == 70)? 1 : 2;
        color = (maxTracks>8)? 87 : 0;
        launchpad.setLED(69,type,color);
        type = (launchpad.keyMode == 71)? 1 : 2;
        color = (maxTracks>8)? 79 : 0;
        launchpad.setLED(59,type,color);
        type = (launchpad.keyMode == 72)? 1 : 2;
        color = (maxTracks>16)? 53 : 0;
        launchpad.setLED(49,type,color);
        type = (launchpad.keyMode == 73)? 1 : 2;
        color = (maxTracks>24)? 74 : 0;
        launchpad.setLED(39,type,color);

        const screen = launchpad.keyMode - 70;
        
        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            let led;
            if (playlist != undefined){
                const nrOfTracks = playlist.data.sounds.length;
                let tracksRemaining = nrOfTracks - 8*screen;
                if (tracksRemaining < 0) tracksRemaining = 0;
                for (let j=0; j<8; j++){
                    if (tracksRemaining > j){
                        led = 81-10*j+i;
                        if (playlist.data.sounds[j+8*screen].playing)
                            launchpad.setLED(led,0,87);
                        else
                            launchpad.setLED(led,0,72);
                    }
                }
                led = 91+i;
                if (playlist.playing == true)
                    launchpad.setLED(led,0,87);
                else
                    launchpad.setLED(led,0,72);
            }
        }
        launchpad.updateLEDs();
    }

    volumeKeyPress(key){
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
        const track = playlist._data.sounds[column+8*screen];
        if (track == undefined) return;
        row /= 7;
        const volume = AudioHelper.inputToVolume(1-row);
        playlist.updateEmbeddedEntity("PlaylistSound", {_id: track._id, volume: volume});
    }

    volumeUpdate(){
        if (Math.floor(launchpad.keyMode/10) != 6) return;
        let color;
        let type;
        const maxTracks = this.getMaxTracks();
        type = (launchpad.keyMode == 60)? 1 : 2;
        color = (maxTracks>8)? 87 : 0;
        launchpad.setLED(59,type,color);
        type = (launchpad.keyMode == 61)? 1 : 2;
        color = (maxTracks>8)? 79 : 0;
        launchpad.setLED(49,type,color);
        type = (launchpad.keyMode == 62)? 1 : 2;
        color = (maxTracks>16)? 53 : 0;
        launchpad.setLED(39,type,color);
        type = (launchpad.keyMode == 63)? 1 : 2;
        color = (maxTracks>24)? 74 : 0;
        launchpad.setLED(29,type,color);

        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            if (playlist != undefined){
                const led = 91+i;
                let mode = 0;
                if (this.playlistVolumeSelector == i) mode = 2;
                if (playlist.playing == true)
                    launchpad.setLED(led,mode,87);
                else
                    launchpad.setLED(led,mode,72);  
            } 
        }
        
        const screen = launchpad.keyMode - 60;
        const playlist = this.getPlaylist(this.playlistVolumeSelector);
        if (playlist != undefined){
            for (let i=0; i<8; i++){
                const track = playlist.data.sounds[i+8*screen];
                if (track == undefined) continue;
                const volume = AudioHelper.volumeToInput(track.volume)*7;
                let color = 72;
                if (track.playing) color = 87;
                for (let j=0; j<8; j++){
                    let led = 11+10*j+i;
                    if (j>volume) 
                        color = 0; 
                    launchpad.setLED(led,0,color);
                }
            }
        }
        launchpad.updateLEDs();
    }

    getPlaylist(num){
        const playlistId = game.settings.get(MODULE.moduleName,'selectedPlaylists')[num];
        const playlist = game.playlists.entities.find(p => p._id == playlistId);
        return playlist;
    }
    
    getMaxTracks(){
        let maxTracks = 0;
        for (let i=0; i<8; i++){
            const playlist = this.getPlaylist(i);
            if (playlist != undefined){
                const nrOfTracks = playlist.data.sounds.length;
                if (nrOfTracks > maxTracks) maxTracks = nrOfTracks;
            }
        }
        return maxTracks;
    }
}