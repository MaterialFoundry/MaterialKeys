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
                        if (pl == undefined){
                            selectedPlaylist = 'none';
                            sounds = [];
                        }
                        else {
                            sounds = pl.sounds;
                            selectedPlaylist = pl._id;
                            settings.selectedPlaylists[iteration]=selectedPlaylist;
                        } 
                        this.updateSettings(settings); 
                    }
                    else
                        selectedPlaylist = 'none';
                }
                else if (settings.selectedPlaylists[iteration] == 'none' || settings.selectedPlaylists[iteration] == '') selectedPlaylist = 'none';
                else if (settings.selectedPlaylists[iteration] == 'FP') selectedPlaylist = 'FP';
                else {
                    const pl = game.playlists.entities.find(p => p._id == settings.selectedPlaylists[iteration]);
                    if (pl == undefined){
                        selectedPlaylist = 'none';
                        sounds = [];
                    }
                    else {
                        sounds = pl.sounds;
                        selectedPlaylist = pl._id;
                    } 
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
                    colorOnRGB: getColor(settings.colorOn[iteration]),
                    colorOffRGB: getColor(settings.colorOff[iteration]),
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
            this.updateSettings(settings,true);
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
            this.updateSettings(settings,true);
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
                    colorRGB: getColor(settings.color[iteration]),
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
            this.updateSettings(settings,true);
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class soundboardCheatSheet extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "soundboard-cheatsheet",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.SBcheatSheet"),
            template: "./modules/MaterialKeys/templates/soundboardCheatSheet.html",
            classes: ["sheet"],
            
        });
    }

    getData() {
        let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');

        if (settings.colorOn == undefined) settings.colorOn = [];
        if (settings.colorOff == undefined) settings.colorOff = [];
        if (settings.mode == undefined) settings.mode = [];
        if (settings.name == undefined) settings.name = [];

        let soundData = [];
        let iteration = 0;

        for (let j=0; j<8; j++){
            let soundsThis = [];
            for (let i=0; i<8; i++){
                const dataThis = {
                    iteration: iteration+1,
                    name: settings.name[iteration],
                    color: getColor(settings.colorOff[iteration])
                }
                soundsThis.push(dataThis);
                iteration++;
            }
            soundData.push({dataThis: soundsThis});
        }
        
        return {
            soundData: soundData
        } 
    }

    async activateListeners(html) {
        super.activateListeners(html);
        const soundBox = html.find("button[name='soundBox']");

        soundBox.on('click',(event) => {
            let id = event.target.id.replace('soundBox','')-1;
            const mode = game.settings.get(MODULE.moduleName,'soundboardSettings').mode[id];
            let repeat = false;
            if (mode > 0) repeat = true;
            let play = false;
            if (soundboard.activeSounds[id] == false) play = true;
            soundboard.playSound(id,repeat,play);
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class macroCheatSheet extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "macro-cheatsheet",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.MBcheatSheet"),
            template: "./modules/MaterialKeys/templates/macroCheatSheet.html",
            classes: ["sheet"], 
        });
    }

    getData() {
        let settings = game.settings.get(MODULE.moduleName,'macroSettings');
        if (settings.macros == undefined) settings.macros = [];
        if (settings.color == undefined) settings.color = [];
        let macroData = [];
        let iteration = 0;

        for (let j=0; j<8; j++){
            let macroThis = [];
            for (let i=0; i<8; i++){
                let name;
                const macroId = settings.macros[iteration];
                const macro = game.macros.get(macroId);
                if (macro == null) name = '';
                else name = macro.name;
                const dataThis = {
                    iteration: iteration+1,
                    name: name,
                    color: getColor(settings.color[iteration])
                }
                macroThis.push(dataThis);
                iteration++;
            }
            macroData.push({dataThis: macroThis});
        }
        return {
            macroData: macroData
        } 
    }

    async activateListeners(html) {
        super.activateListeners(html);
        const macroBox = html.find("button[name='macroBox']");

        macroBox.on('click',(event) => {
            let id = event.target.id.replace('macroBox','')-1;
            macroBoard.executeMacro(id);
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function getColor(val){
    let color;

    let rgb = [0xff,0xff,0xff];

    let valNew1 = val%4;
    let valNew2 = Math.floor(val/4);

    if (valNew2 > 0 && valNew2 < 15) {
        if      (valNew2 == 1)  rgb = [0xff,0x00,0x00];
        else if (valNew2 == 2)  rgb = [0xff,0x7f,0x00];
        else if (valNew2 == 3)  rgb = [0xff,0xff,0x00];
        else if (valNew2 == 4)  rgb = [0x7f,0xff,0x3f];
        else if (valNew2 == 5)  rgb = [0x00,0xff,0x00];
        else if (valNew2 == 6)  rgb = [0x3f,0xff,0x7f];
        else if (valNew2 == 7)  rgb = [0x3f,0xff,0xbf];
        else if (valNew2 == 8)  rgb = [0x00,0xff,0xbf];
        else if (valNew2 == 9)  rgb = [0x00,0xff,0xff];
        else if (valNew2 == 10) rgb = [0x00,0x7f,0xff];
        else if (valNew2 == 11) rgb = [0x00,0x00,0xff];
        else if (valNew2 == 12) rgb = [0x7f,0x00,0xff];
        else if (valNew2 == 13) rgb = [0xbf,0x00,0xff];
        else if (valNew2 == 14) rgb = [0xff,0x00,0xff];

        let factor = 1;
        if (valNew1 == 0) {
            factor = 1;
            for (let i=0; i<3; i++)
                if (rgb[i] == 0) rgb[i] = 0x7f;
        }
        else if (valNew1 == 1) factor = 1;
        else if (valNew1 == 2) factor = 0.75;
        else if (valNew1 == 3) factor = 0.50;

        rgb[0] = Math.ceil(rgb[0] * factor);
        rgb[1] = Math.ceil(rgb[1] * factor);
        rgb[2] = Math.ceil(rgb[2] * factor);

        let red = rgb[0].toString(16);
        if (red == '0') red = '00';
        let green = rgb[1].toString(16);
        if (green == '0') green = '00';
        let blue = rgb[2].toString(16);
        if (blue == '0') blue = '00';

        color = '#' + red + green + blue;
    }
    else if (val == 0) color = '#3f3f3f';
    else if (val == 1) color = '#7f7f7f';
    else if (val == 2) color = '#bfbfbf';
    else if (val == 3) color = '#ffffff';

    else {
        const colors = [        //modified from https://github.com/mohayonao/launch-pad-color/blob/master/misc/create060to119.js
            "#f04115", "#bf6100", "#b18c00", "#859708",
            // 64..127
            "#50a027", "#009d8e", "#0079c0", "#0000ff", "#2d50a4", "#6247b0", "#7b7b7b", "#4f3b5c",
            "#ff0000", "#bfbb64", "#a6c000", "#78c823", "#34c500", "#00c0af", "#00a2f1", "#527de7",
            "#8868e7", "#a447af", "#b93b69", "#975731", "#f86c00", "#befd00", "#82ff5d", "#00ff00",
            "#00ffa5", "#52ffe8", "#00e9ff", "#89c4ff", "#91a5ff", "#b989ff", "#da67e7", "#ff2cd6",
            "#ffa601", "#fff200", "#e3f600", "#dcc500", "#bf9e5f", "#88b57b", "#86c2ba", "#9ab3c5",
            "#84a5c3", "#c78b7a", "#f43c7f", "#ff93a5", "#ffa36f", "#ffef9a", "#d2e594", "#bad16f",
            "#574896", "#d3fee0", "#ccf1f9", "#b9c0e4", "#cdbae5", "#d0d0d0", "#dfe6e5", "#ffffff",
            "#f2210a", "#b31807", "#acf20a", "#7fb307", "#f2db0a", "#b3a107", "#f27e0a", "#b35d07"
        ];
        color = colors[val-60];
    }
    return color;
}
