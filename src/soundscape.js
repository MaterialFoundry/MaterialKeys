import {moduleName,launchpad} from "../MaterialKeys.js";

export class Soundscape{
    constructor(){
        this.mode = 'volume';
        for (let i=0; i<8; i++) {
            this.channelData.push({
                volume: 1,
                mute: false,
                solo: false,
                link: false,
                playing: false,
                pan: 1
            })
        }
        for (let i=0; i<25; i++) {
            this.soundboardData.push({
                active: false,
                name: ''
            })
        }
    }

    masterData = {
        volume:1,
        mute:false
    }
    channelData = [];
    soundboardData = [];
    soundboardVolume = 1;
    playing = false;

    newData(data) {
        if (data.msgType == 'start') {
            this.playing = true;
            if (data.channel == undefined) for (let i=0; i<8; i++) this.channelData[i].playing = true;
            else this.channelData[data.channel].playing = true;
        }
        else if (data.msgType == 'stop') {
            
            if (data.channel == undefined) {
                for (let i=0; i<8; i++) this.channelData[i].playing = false;
                this.playing = false;
            }
            else {
                this.channelData[data.channel].playing = false;
                let check = 0;
                for (let i=0; i<8; i++) if (this.channelData[data.channel].playing) check++;
                if (check == 0) this.playing = false;
            }
        }
        else if (data.msgType == 'setVolume') {
            if (data.channelNr == 'master') this.masterData.volume = data.volume;
            else if (data.channelNr < 100) this.channelData[data.channelNr].volume = data.volume;
            else return;
        }
        else if (data.msgType == 'setMute') {
            if (data.channelNr == 'master') this.masterData.mute = data.mute;
            else if (data.channelNr < 100) this.channelData[data.channelNr].mute = data.mute;
            else return;
        }
        else if (data.msgType == 'setSolo' && data.channelNr < 100) this.channelData[data.channelNr].solo = data.solo;
        else if (data.msgType == 'setLink' && data.channelNr < 100) this.channelData[data.channelNr].link = data.link;
        else if (data.msgType == 'setSoundboardVolume') this.soundboardVolume = data.volume;
        else if (data.msgType == 'sbSoundConfig') {
            const channel = data.channel - 100;
            const active = data.data.sourceArray == undefined ? false : true;
            this.soundboardData[channel].active = active;
            this.soundboardData[channel].name = data.data.name;
        }
        else return;
        this.update(launchpad.keyMode);
    }

    keyPress(key){

        if (key == 98 && this.playing) {
            const payload = {
                "msgType": "stop",
                "channelNr": undefined
            };
            Hooks.call('setSoundscape',payload);
        }
        else if (key == 98 && this.playing == false) {
            const payload = {
                "msgType": "start",
                "channelNr": undefined
            };
            Hooks.call('setSoundscape',payload);
        }

        else if (Math.floor(key/10) == 9) {
            if (key == 91) this.mode = 'volume';
            else if (key == 92) this.mode = 'channel';
            else if (key == 93) this.mode = 'master';
            else if (key == 94) this.mode = 'soundboard';

            else return;
            this.update(launchpad.keyMode);
        }
            
        else if (this.mode == 'volume') {
            const channel = key % 10 - 1;
            const volume = Math.floor(125*(Math.floor(key/10)-1)/7)/100;
            const payload = {
                "msgType": "setVolume",
                "channelNr": channel,
                volume
            };
            Hooks.call('setSoundscape',payload);
        }

        else if (this.mode == 'channel') {
            const mode = Math.floor(key/10);
            const channel = key % 10 - 1;
            const data = this.channelData[channel];
            let msgType, mute, solo, link, playing;
            if (mode == 4) {    //mute
                msgType = 'mute';
                mute = !data.mute;
            }
            else if (mode == 3) {   //solo
                msgType = 'solo';
                solo = !data.solo;
            }
            else if (mode == 2) {   //link
                msgType = 'link';
                link = !data.link;
            }
            else if (mode == 1) {   //play
                msgType = 'play';
                playing = !data.playing;
            }
            else return;
            const payload = {
                "msgType": "setChannel",
                "channelNr": channel,
                mute,
                solo,
                link,
                playing
            };
            Hooks.call('setSoundscape',payload);
        }

        else if (this.mode == 'master') {
            if (key % 10 != 1) return;
            const volume = Math.floor(125*(Math.floor(key/10)-1)/7)/100;
            const payload = {
                "msgType": "setVolume",
                "channelNr": 'master',
                volume
            };
            Hooks.call('setSoundscape',payload);
        }

        else if (this.mode == 'soundboard') {
            //play sound
            if (key % 10 < 6 && Math.floor(key / 10) > 3) {
                const channel = 5*(8-Math.floor(key/10)) + key % 10 - 1;
                const payload = {
                    "msgType": "playSoundboard",
                    "channelNr": channel
                };
                Hooks.call('setSoundscape',payload);
            }
            //stop soundboard sounds
            else if (key == 88) {
                const payload = {
                    "msgType": "stopSoundboard"
                };
                Hooks.call('setSoundscape',payload);
            }
            //soundboard volume
            else if (Math.floor(key/10) == 1) {
                const volume = Math.floor(125*(key%10-1)/7)/100;
                const payload = {
                    "msgType": "setSoundboardVolume",
                    volume
                };
                Hooks.call('setSoundscape',payload);
            }
        }
       
    }

    update(mode){
        if (launchpad.keyMode != 1) return;
        launchpad.setMainLEDs(0,'static');
        
        const settings = game.settings.get(moduleName,'playlists');
        const colorOn = settings.colorOn ? settings.colorOn : 87;
        const colorOff = settings.colorOff ? settings.colorOff : 72;

        launchpad.setLED(91,'static',colorOff,0,game.i18n.localize("MaterialKeys.Soundscape.Volume"));
        launchpad.setLED(92,'static',colorOff,0,game.i18n.localize("MaterialKeys.Soundscape.Channel"));
        launchpad.setLED(93,'static',colorOff,0,game.i18n.localize("MaterialKeys.Soundscape.Master"));
        launchpad.setLED(94,'static',colorOff,0,game.i18n.localize("MaterialKeys.Soundscape.Soundboard"));
        const color = this.playing ? colorOn : colorOff;
        launchpad.setLED(98,'static',color,0,game.i18n.localize("MaterialKeys.Soundscape.Play"));

        //set Volume
        if (this.mode == 'volume') {
            launchpad.setLED(91,'static',colorOn,0,game.i18n.localize("MaterialKeys.Soundscape.Volume"));
            
            //each channel
            for (let i=0; i<8; i++) {
                const volume = Math.round(7*this.channelData[i].volume/1.25)+1;
                for (let j=0; j<8; j++) {
                    let color = this.channelData[i].playing ? colorOn : colorOff;
                    if (volume <= j) 
                        color = 0;
                    const led = 11+i + 10*j;
                    const txt = j == 0 ? `Ch${i+1}` : '';
                    launchpad.setLED(led,'static',color,0,txt);
                }
            }
        }
        //channel
        else if (this.mode == 'channel') {
            launchpad.setLED(92,'static',colorOn,0,game.i18n.localize("MaterialKeys.Soundscape.Channel"));
            //each channel
            for (let i=0; i<8; i++) {
                let color;

                color = this.channelData[i].mute ? '#ff0000' : '#110000';
                launchpad.setLED(11+i + 30,'rgb',color,0,'mute');

                color = this.channelData[i].solo ? '#ffff00' : '#111100';
                launchpad.setLED(11+i + 20,'rgb',color,0,'solo');

                color = this.channelData[i].link ? '#0000ff' : '#000011';
                launchpad.setLED(11+i + 10,'rgb',color,0,'link');

                color = this.channelData[i].playing ? '#00ff00' : '#001100';
                launchpad.setLED(11+i,'rgb',color,0,'playing');

            }
        }
        //master
        else if (this.mode == 'master') {
            launchpad.setLED(93,'static',colorOn,0,game.i18n.localize("MaterialKeys.Soundscape.Master"));
            
            const volume = Math.round(7*this.masterData.volume/1.25)+1;
            for (let i=0; i<8; i++) {
                let color = colorOn;
                if (volume <= i) 
                    color = 0;
                const led = 11 + 10*i;
                const txt = i == 0 ? `Master` : '';
                launchpad.setLED(led,'static',color,0,txt);
            }
        }
        else {
            launchpad.setLED(94,'static',colorOn,0,game.i18n.localize("MaterialKeys.Soundscape.Soundboard"));
            launchpad.setLED(88,'static',colorOff,0,game.i18n.localize("MaterialKeys.Soundscape.StopSoundboard"));
            
            //Set soundboard sounds
            for (let i=0; i<25; i++) {
                const color = this.soundboardData[i].active ? colorOn : 7;
                const txt = this.soundboardData[i].name;
                const row = 8 - Math.floor(i/5);
                const column = i-5*Math.floor(i/5)+1;
                const led = 10*row + column;
                launchpad.setLED(led,'static',color,0,txt);
            }

            //Set soundboard volume
            const volume = Math.round(7*this.soundboardVolume/1.25)+1;
            for (let i=0; i<8; i++) {
                let color = colorOn;
                if (volume <= i) 
                    color = 0;
                const led = 11+i;
                const txt = i == 0 ? `Vol` : '';
                launchpad.setLED(led,'static',color,0,txt);
            }
        }
        launchpad.updateLEDs();
    }
}