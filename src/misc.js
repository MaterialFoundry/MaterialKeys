import * as MODULE from "../MaterialKeys.js";
import {launchpad,soundboard,macroBoard,playlistControl} from "../MaterialKeys.js";

export class playlistConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "playlist-config",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.PlaylistConfig"),
            template: "./modules/MaterialKeys/templates/playlistConfig.html",
            classes: ["sheet"],
            width: 500
        });
    }

    /**
     * Provide data to the template
     */
    getData() {
        let settings = game.settings.get(MODULE.moduleName,'playlists');
        let selectedPlaylists = settings.selectedPlaylist;
        if (selectedPlaylists == undefined) selectedPlaylists = [];
        let selectedPlaylistMode = settings.playlistMode;
        if (selectedPlaylistMode == undefined) selectedPlaylistMode = [];
        let playMode = settings.playMode;
        if (playMode == undefined) playMode = 0;
        let playlistData = [];
        
        for (let i=0; i<8; i++){
            if (selectedPlaylists[i] == undefined) selectedPlaylists[i] = 'none';
            if (selectedPlaylistMode[i] == undefined) selectedPlaylistMode[i] = 0;
            let dataThis = {
                iteration: i+1,
                playlist: selectedPlaylists[i],
                playlistMode: selectedPlaylistMode[i],
                playlists: game.playlists.entities
            }
            playlistData.push(dataThis);
        }

        this.data = {
            playMode: playMode,
            selectedPlaylist: selectedPlaylists,
            playlistMode: selectedPlaylistMode
        }

        return {
            playlists: game.playlists.entities,
            playlistData: playlistData,
            playMode: playMode
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
       // await game.settings.set(MODULE.moduleName,'selectedPlaylists', formData["selectedPlaylist"]);
       // await game.settings.set(MODULE.moduleName,'playlistMethod',formData["playMethod"]);
    }

    activateListeners(html) {
        super.activateListeners(html);  
        const playMode = html.find("select[name='playMode']");
        const selectedPlaylist = html.find("select[name='selectedPlaylist']");
        const playlistMode = html.find("select[name='playlistMode']");

        playMode.on("change", event => {
            this.data.playMode=event.target.value;
            this.updateSettings(this.data);
        });

        selectedPlaylist.on("change", event => {
            let id = event.target.id.replace('playlist','');
            this.data.selectedPlaylist[id-1]=event.target.value;
            this.updateSettings(this.data);
        });

        playlistMode.on("change", event => {
            let id = event.target.id.replace('playlistMode','');
            this.data.playlistMode[id-1]=event.target.value;
            this.updateSettings(this.data);
        });
    }
    async updateSettings(settings){
        await game.settings.set(MODULE.moduleName,'playlists', settings);
        if (MODULE.enableModule) {
            playlistControl.playlistUpdate();
            playlistControl.volumeUpdate();
        }
        //this.render();
    }
    
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class soundboardConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "soundboard-config",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.SoundboardConfig"),
            template: "./modules/MaterialKeys/templates/soundboardConfig.html",
            classes: ["sheet"],
            width: 1400,
            height: 720
        });
    }
    
    getArray(data){
        let array = [data.a,data.b,data.c,data.d,data.e,data.f,data.g,data.h];
        return array;
    }

    /**
     * Provide data to the template
     */
    getData() {
        let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
        let playlists = [];
        playlists.push({id:"none",name:game.i18n.localize("MaterialKeys.None")});
        playlists.push({id:"FP",name:game.i18n.localize("MaterialKeys.FilePicker")})
        for (let i=0; i<game.playlists.entities.length; i++){
            playlists.push({id:game.playlists.entities[i]._id,name:game.playlists.entities[i].name});
        }
        if (settings.sounds == undefined) settings.sounds = [];
        if (settings.colorOn == undefined) settings.colorOn = [];
        if (settings.colorOff == undefined) settings.colorOff = [];
        if (settings.mode == undefined) settings.mode = [];
        if (settings.volume == undefined) settings.volume = [];
        if (settings.name == undefined) settings.name = [];
        if (settings.selectedPlaylists == undefined) settings.selectedPlaylists = [];
        if (settings.src == undefined) settings.src = [];
        if (settings.toggle == undefined) settings.toggle = [];

        let soundData = [];
        let iteration = 0;

        for (let j=0; j<8; j++){
            let soundsThis = [];
            for (let i=0; i<8; i++){
                let selectedPlaylist;
                let sounds = [];
                if (settings.volume[iteration] == undefined) settings.volume[iteration] = 50;
                if (settings.selectedPlaylists[iteration]==undefined) {
                    if (settings.sounds[iteration] != undefined && settings.sounds[iteration] != "") {
                        selectedPlaylist = game.settings.get(MODULE.moduleName,'soundboardSettings').playlist;
                        const pl = game.playlists.entities.find(p => p._id == selectedPlaylist);
                        selectedPlaylist = pl._id;
                        settings.selectedPlaylists[iteration]=selectedPlaylist;
                        this.updateSettings(settings);
                        sounds = pl.sounds;
                    }
                    else
                        selectedPlaylist = 'none';
                }
                else if (settings.selectedPlaylists[iteration] == 'none' || settings.selectedPlaylists[iteration] == '') selectedPlaylist = 'none';
                else if (settings.selectedPlaylists[iteration] == 'FP') selectedPlaylist = 'FP';
                else {
                    const pl = game.playlists.entities.find(p => p._id == settings.selectedPlaylists[iteration]);
                    selectedPlaylist = pl._id;
                    sounds = pl.sounds;
                }
                let styleSS = "";
                let styleFP ="display:none";
                if (selectedPlaylist == 'FP') {
                    styleSS = 'display:none';
                    styleFP = ''
                }
                
                const dataThis = {
                    iteration: iteration+1,
                    playlists: playlists,
                    selectedPlaylist: selectedPlaylist,
                    sound: settings.sounds[iteration],
                    sounds: sounds,
                    srcPath: settings.src[iteration],
                    colorOn: settings.colorOn[iteration],
                    colorOff: settings.colorOff[iteration],
                    mode: settings.mode[iteration],
                    volume: settings.volume[iteration],
                    name: settings.name[iteration],
                    styleSS: styleSS,
                    styleFP: styleFP,
                    toggle: settings.toggle[iteration]
                }
                soundsThis.push(dataThis);
                iteration++;
            }
            const data = {
                dataThis: soundsThis,
            };
            soundData.push(data);
        }
        
        return {
            soundData: soundData
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
  
    }

    async activateListeners(html) {
        super.activateListeners(html);
        const nameField = html.find("input[name='namebox']");
        const playlistSelect = html.find("select[name='playlist']");
        const soundSelect = html.find("select[name='sounds']");
        const soundFP = html.find("input[name2='soundSrc']");
        const colorToggle = html.find("select[name='toggle'");
        const colorPickerOn = html.find("button[name='colorPickerOn']");
        const colorPickerOnNr = html.find("input[name='colorOn']");
        const colorPickerOff = html.find("button[name='colorPickerOff']");
        const colorPickerOffNr = html.find("input[name='colorOff']");
        const playMode = html.find("select[name='mode']");
        const volumeSlider = html.find("input[name='volume']");
        const clearAll = html.find("button[name='clearAll']");

        nameField.on("change",event => {
            let id = event.target.id.replace('name','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.name[id]=event.target.value;
            this.updateSettings(settings);
        });

        playlistSelect.on("change", event => {
            let id = event.target.id.replace('playlists','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.selectedPlaylists[id]=event.target.value;
            this.updateSettings(settings,true);
        });
        
        soundSelect.on("change",event => {
            let id = event.target.id.replace('soundSelect','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.sounds[id]=event.target.value;
            this.updateSettings(settings);
        });
        
        soundFP.on("change",event => {
            let id = event.target.id.replace('srcPath','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.src[id]=event.target.value;
            this.updateSettings(settings);
        });

        colorToggle.on("change",event => {
            let id = event.target.id.replace('toggle','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.toggle[id]=event.target.value;
            this.updateSettings(settings);
        });

        colorPickerOn.on('click',(event) => {
            const target = event.currentTarget.value;
            let color = document.getElementById("colorOn"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(target,1,color); 
        });

        colorPickerOnNr.on('change',(event) => {
            let id = event.target.id.replace('colorOn','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.colorOn[id]=event.target.value;
            this.updateSettings(settings);
        });

        colorPickerOff.on('click',(event) => {
            const target = event.currentTarget.value;
            let color = document.getElementById("colorOff"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(target,0,color);
            
        });

        colorPickerOffNr.on('change',(event) => {
            let id = event.target.id.replace('colorOff','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.colorOff[id]=event.target.value;
            this.updateSettings(settings);
        });
        
        playMode.on("change",event => {
            let id = event.target.id.replace('playmode','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.mode[id]=event.target.value;
            this.updateSettings(settings);
        });

        volumeSlider.on('change', event => {
            let id = event.target.id.replace('volume','')-1;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.volume[id]=event.target.value;
            this.updateSettings(settings); 
        });
        
        clearAll.on('click',(event) => {
            let d = new Dialog({
                title: game.i18n.localize("MaterialKeys.ClearData"),
                content: "<p>"+game.i18n.localize("MaterialKeys.ClearDataContent")+"</p>",
                buttons: {
                 yes: {
                  icon: '<i class="fas fa-check"></i>',
                  label: game.i18n.localize("MaterialKeys.Yes"),
                  callback: () => this.updateSettings('clear',true)
                 },
                 no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: game.i18n.localize("MaterialKeys.No")
                 }
                },
                default: "no"
               });
               d.render(true);
            this.render();
        });
    }
    async updateSettings(settings,render=false){
        if (settings == 'clear'){
            console.log("Clearing soundboard configuration")
            let colorOff = [];
            let colorOn = [];
            let mode = [];
            let name = [];
            let selectedPlaylists = [];
            let sounds = [];
            let src = [];
            let toggle = [];
            let volume = [];
            for (let i=0; i<64; i++){
                colorOff[i] = "";
                colorOn[i] = "";
                mode[i] = 0;
                name[i] = "";
                selectedPlaylists[i] = "none";
                sounds[i] = "";
                src[i] = "";
                toggle[i] = 0;
                volume[i] = 50;
            }
            settings = {
                colorOff: colorOff,
                colorOn: colorOn,
                mode: mode,
                name: name,
                selectedPlaylists: selectedPlaylists,
                sounds: sounds,
                src: src,
                toggle: toggle,
                volume: volume
            };
        }
        await game.settings.set(MODULE.moduleName,'soundboardSettings',settings);
        if (MODULE.enableModule) {
            launchpad.setMode(MODULE.launchpad.keyMode);
            soundboard.update();
        }
        if (render) this.render();
    }
    
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class macroConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "macro-config",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.MacroConfig"),
            template: "./modules/MaterialKeys/templates/macroConfig.html",
            classes: ["sheet"],
            width: 1400,
            height: 720
        });
    }
    
    /**
     * Provide data to the template
     */
    getData() {
        let settings = game.settings.get(MODULE.moduleName,'macroSettings');
        if (settings.macros == undefined) settings.macros = [];
        if (settings.color == undefined) settings.color = [];
        if (settings.args == undefined) settings.args = [];
        let macroData = [];

        let furnaceEnabled = false;
        const furnace = game.modules.get("furnace");
        if (furnace != undefined && furnace.active) furnaceEnabled = true;
        let height = 95;
        if (furnaceEnabled) height += 50;

        let iteration = 0;
        for (let j=0; j<8; j++){
            let macroThis = [];
      
            for (let i=0; i<8; i++){
                const dataThis = {
                    iteration: iteration+1,
                    macro: settings.macros[iteration],
                    color: settings.color[iteration],
                    macros:game.macros,
                    args: settings.args[iteration],
                    furnace: furnaceEnabled
                }
                macroThis.push(dataThis);
                iteration++;
            }
            const data = {
                dataThis: macroThis,
            };
            macroData.push(data);
        }

        return {
            height: height,
            macroData: macroData,
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
       await game.settings.set(MODULE.moduleName,'macroSettings',{
            macros: formData["macros"],
            color: formData["color"]
       });

        let furnace = game.modules.get("furnace");
        if (furnace != undefined && furnace.active) 
            await game.settings.set(MODULE.moduleName,'macroArgs', formData["args"]);
       
       launchpad.setMode(MODULE.launchpad.keyMode);
       macroBoard.update();
    }

    activateListeners(html) {
        super.activateListeners(html);
        const macro = html.find("select[name='macros']");
        const args = html.find("input[name='args']");
        const colorPicker = html.find("button[name='colorPicker']");
        const colorPickerNr = html.find("input[name='color']");
        const clearAll = html.find("button[name='clearAll']")

        macro.on("change", event => {
            let id = event.target.id.replace('macros','');
            let settings = game.settings.get(MODULE.moduleName,'macroSettings');
            settings.macros[id-1]=event.target.value;
            this.updateSettings(settings);
        });

        args.on("change", event => {
            let id = event.target.id.replace('args','');
            let settings = game.settings.get(MODULE.moduleName,'macroSettings');
            settings.args[id-1]=event.target.value;
            this.updateSettings(settings);
        });

        colorPicker.on('click',(event) => {
            const target = event.currentTarget.value;
            let color = document.getElementById("color"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(target,0,color);
        });

        colorPickerNr.on('change',(event) => {
            let id = event.target.id.replace('color','')-1;
            let j = Math.floor(id/8);
            let i = id % 8;
            let settings = game.settings.get(MODULE.moduleName,'macroSettings');
            settings.color[id]=event.target.value;
            this.updateSettings(settings);
        });

        clearAll.on('click',(event) => {
            let d = new Dialog({
                title: game.i18n.localize("MaterialKeys.ClearData"),
                content: "<p>"+game.i18n.localize("MaterialKeys.ClearDataContent")+"</p>",
                buttons: {
                 yes: {
                  icon: '<i class="fas fa-check"></i>',
                  label: game.i18n.localize("MaterialKeys.Yes"),
                  callback: () => this.updateSettings('clear',true)
                 },
                 no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: game.i18n.localize("MaterialKeys.No")
                 }
                },
                default: "no"
               });
               d.render(true);
            this.render();
        });
    }

    async updateSettings(settings,render=false){
        if (settings == 'clear'){
            console.log("Clearing macro board configuration")
            let color = [];
            let args = [];
            let macros = [];
            for (let i=0; i<64; i++){
                color[i] = 0;
                args[i] = "";
                macros[i] = "none";
            }
            settings = {
                color: color,
                args: args,
                macros: macros
            };
        }
        await game.settings.set(MODULE.moduleName,'macroSettings',settings);
        if (MODULE.enableModule) macroBoard.update();
        if (render) this.render();
    }
}