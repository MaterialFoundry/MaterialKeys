import {moduleName,enableModule,launchpad,soundboard} from "../../MaterialKeys.js";
import {getColor} from "../misc.js";
import {exportConfigForm} from "./exportForm.js";
import {importConfigForm} from "./importForm.js";
import { compatibilityHandler } from "../compatibilityHandler.js";

export class soundboardConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
        this.settings = {};
        this.page = 0;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return compatibilityHandler('mergeObject', super.defaultOptions, {
            id: "materialKeys_soundboardConfig",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.SoundboardConfig"),
            template: "./modules/MaterialKeys/templates/soundboardConfig.html",
            classes: ["sheet"]
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
        //Get the settings
        this.settings = game.settings.get(moduleName,'soundboardSettings');

        //Check if all settings are defined
        if (this.settings.sounds == undefined) this.settings.sounds = [];
        if (this.settings.colorOn == undefined) this.settings.colorOn = [];
        if (this.settings.colorOff == undefined) this.settings.colorOff = [];
        if (this.settings.mode == undefined) this.settings.mode = [];
        if (this.settings.volume == undefined) this.settings.volume = [];
        if (this.settings.name == undefined) this.settings.name = [];
        if (this.settings.selectedPlaylists == undefined) this.settings.selectedPlaylists = [];
        if (this.settings.src == undefined) this.settings.src = [];
        if (this.settings.toggle == undefined) this.settings.toggle = [];
        game.settings.set(moduleName,'soundboardSettings',this.settings)

        //Create the playlist array
        let playlists = [];
        playlists.push({id:"none",name:game.i18n.localize("MaterialKeys.None")});
        playlists.push({id:"FP",name:game.i18n.localize("MaterialKeys.FilePicker")})

        const playlistArray = game.playlists.contents;
        for (let playlist of playlistArray) 
            playlists.push({id: playlist.id, name: playlist.name})

        let iteration = this.page*16;  //Sound number
        let soundData = []; //Stores all the data for each sound

        //Fill sounddata
        for (let j=0; j<2; j++){
            let soundsThis = [];            //Stores row data
            for (let i=0; i<8; i++){
                //Each iteration gets the data for each sound

                //If the volume is undefined for this sound, define it and set it to its default value
                if (this.settings.volume[iteration] == undefined) this.settings.volume[iteration] = 50;

                //Get the selected playlist and the sounds of that playlist
                let selectedPlaylist;
                let sounds = [];
                if (this.settings.selectedPlaylists[iteration]==undefined) {
                    if (this.settings.sounds[iteration] != undefined && this.settings.sounds[iteration] != "") {
                        selectedPlaylist = game.settings.get(moduleName,'soundboardSettings').playlist;
                        const pl = playlistArray.find(p => p.id == selectedPlaylist);
                        if (pl == undefined){
                            selectedPlaylist = 'none';
                            sounds = [];
                        }
                        else {
                            sounds = pl.sounds;
                            selectedPlaylist = pl._id;
                            this.settings.selectedPlaylists[iteration]=selectedPlaylist;
                        } 
                        this.updateSettings(settings); 
                    }
                    else
                        selectedPlaylist = 'none';
                }
                else if (this.settings.selectedPlaylists[iteration] == 'none' || this.settings.selectedPlaylists[iteration] == '') selectedPlaylist = 'none';
                else if (this.settings.selectedPlaylists[iteration] == 'FP') selectedPlaylist = 'FP';
                else {
                    const pl = playlistArray.find(p => p.id == this.settings.selectedPlaylists[iteration]);
                    if (pl == undefined){
                        selectedPlaylist = 'none';
                        sounds = [];
                    }
                    else {
                        //Add the sound name and id to the sounds array
                        for (let sound of pl.sounds.contents)
                            sounds.push({
                                name: sound.name,
                                id: sound.id
                            });

                        //Get the playlist id
                        selectedPlaylist = pl.id;
                    }  
                }
                let styleSS = "";
                let styleFP ="display:none";
                if (selectedPlaylist == 'FP') {
                    styleSS = 'display:none';
                    styleFP = ''
                }
               
                if (this.settings.colorOn[iteration] == undefined) this.settings.colorOn[iteration] = 0;
                if (this.settings.colorOff[iteration] == undefined) this.settings.colorOff[iteration] = 0;
                const dataThis = {
                    iteration: iteration+1,
                    selectedPlaylist: selectedPlaylist,
                    sound: this.settings.sounds[iteration],
                    sounds: sounds,
                    srcPath: this.settings.src[iteration],
                    colorOn: this.settings.colorOn[iteration],
                    colorOff: this.settings.colorOff[iteration],
                    colorOnRGB: getColor(this.settings.colorOn[iteration]),
                    colorOffRGB: getColor(this.settings.colorOff[iteration]),
                    mode: this.settings.mode[iteration],
                    volume: this.settings.volume[iteration],
                    name: this.settings.name[iteration],
                    styleSS: styleSS,
                    styleFP: styleFP,
                    toggle: this.settings.toggle[iteration] == '' ? 'static' : this.settings.toggle[iteration]
                }
                soundsThis.push(dataThis);
                iteration++;
            }
            const data = {
                dataThis: soundsThis
            };
            soundData.push(data);
        }

        game.settings.set(moduleName,'soundboardSettings',this.settings);
        
        return {
            soundData: soundData,
            playlists,
            soundRange: `${this.page*16 + 1} - ${this.page*16 + 16}`,
            prevDisabled: this.page == 0 ? 'disabled' : '',
            totalSounds: this.settings.volume.length
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
        const navNext = html.find("button[id='materialKeys_navNext']");
        const navPrev = html.find("button[id='materialKeys_navPrev']");
        const clearAll = html.find("button[id='materialKeys_clearAll']");
        const clearPage = html.find("button[id='materialKeys_clearPage']");
        const importBtn = html.find("button[id='materialKeys_import']");
        const exportBtn = html.find("button[id='materialKeys_export']");
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

        importBtn.on('click', async(event) => {
            let importDialog = new importConfigForm();
            importDialog.setData('soundboard',this)
            importDialog.render(true);
        });

        exportBtn.on('click', async(event) => {
            const settings = game.settings.get(moduleName,'soundboardSettings');
            let exportDialog = new exportConfigForm();
            exportDialog.setData(settings,'soundboard')
            exportDialog.render(true);
        });

        navNext.on('click',async (event) => {
            if (this.page < 15) this.page++;
            this.render(true);
        });
        navPrev.on('click',async (event) => {
            this.page--;
            if (this.page < 0) this.page = 0;
            else {
                const totalSounds = this.settings.volume.length;
                if ((this.page + 2)*16 == totalSounds) {
                    let pageEmpty = this.getPageEmpty(totalSounds-16);
                    if (pageEmpty) {
                        await this.clearPage(totalSounds-16,true)
                    }
                }
            }
            this.render(true);
        });

        clearAll.on('click',async (event) => {
            const parent = this;

            let d = new Dialog({
                title: game.i18n.localize("MaterialKeys.ClearAll"),
                content: game.i18n.localize("MaterialKeys.ClearAll_Content"),
                buttons: {
                    continue: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("MaterialKeys.Continue"),
                    callback: async () => {
                        this.page = 0;
                        await parent.clearAllSettings();
                        parent.render(true);
                    }
                    },
                    cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("MaterialKeys.Cancel")
                    }
                },
                default: "cancel"
            });
            d.render(true);
        })

        clearPage.on('click',(event) => {
            const parent = this;

            let d = new Dialog({
                title: game.i18n.localize("MaterialKeys.ClearPage"),
                content: game.i18n.localize("MaterialKeys.ClearPage_Content"),
                buttons: {
                    continue: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("MaterialKeys.Continue"),
                    callback: async () => {
                        await parent.clearPage(parent.page*16)
                        parent.render(true);
                    }
                    },
                    cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("MaterialKeys.Cancel")
                    }
                },
                default: "cancel"
            });
            d.render(true);
        })

        nameField.on("change",event => {
            let id = event.target.id.replace('materialKeys_name','')-1;
            this.settings.name[id]=event.target.value;
            this.updateSettings(this.settings);
        });

        playlistSelect.on("change", event => {
            //Get the sound number
            const iteration = event.target.id.replace('materialKeys_playlists','');

            //Get the selected playlist and the sounds of that playlist
            let selectedPlaylist;
            //let sounds = [];
            if (event.target.value==undefined) selectedPlaylist = 'none';
            else if (event.target.value == 'none') selectedPlaylist = 'none';
            else if (event.target.value == 'FP') {
                selectedPlaylist = 'FP';

                //Show the file picker
                document.querySelector(`#materialKeys_fp${iteration}`).style='';
                
                //Hide the sound selector
                document.querySelector(`#materialKeys_ss${iteration}`).style='display:none';
            }
            else {
                //Hide the file picker
                document.querySelector(`#materialKeys_fp${iteration}`).style='display:none';
                
                //Show the sound selector
                document.querySelector(`#materialKeys_ss${iteration}`).style='';

                const playlistArray = game.playlists.contents;
                const pl = playlistArray.find(p => p.id == event.target.value)
                selectedPlaylist = pl.id;

                //Get the sound select element
                let SSpicker = document.getElementById(`materialKeys_soundSelect${iteration}`);

                //Empty ss element
                SSpicker.options.length=0;

                //Create new options and append them
                let optionNone = document.createElement('option');
                optionNone.value = "";
                optionNone.innerHTML = game.i18n.localize("MaterialKeys.None");
                SSpicker.appendChild(optionNone);

                for (let sound of pl.sounds.contents) {
                    let newOption = document.createElement('option');
                    newOption.value = sound.id;
                    newOption.innerHTML = sound.name;
                    SSpicker.appendChild(newOption);
                } 
            }
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.selectedPlaylists[iteration-1]=event.target.value;
            this.updateSettings(settings);
        });
        
        soundSelect.on("change",event => {
            let id = event.target.id.replace('materialKeys_soundSelect','')-1;
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.sounds[id]=event.target.value;
            this.updateSettings(settings);
        });
        
        soundFP.on("change",event => {
            let id = event.target.id.replace('materialKeys_srcPath','')-1;
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.src[id]=event.target.value;
            this.updateSettings(settings);
        });

        colorToggle.on("change",event => {
            let id = event.target.id.replace('materialKeys_toggle','')-1;
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.toggle[id]=event.target.value;
            this.updateSettings(settings);
        });

        colorPickerOn.on('click',(event) => {
            const target = event.currentTarget.value;
            let color = document.getElementById("materialKeys_colorOn"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(target,1,color); 
        });

        colorPickerOnNr.on('change',(event) => {
            let id = event.target.id.replace('materialKeys_colorOn','')-1;
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.colorOn[id]=event.target.value;
            this.updateSettings(settings,true);
        });

        colorPickerOff.on('click',(event) => {
            const target = event.currentTarget.value;
            let color = document.getElementById("materialKeys_colorOff"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(target,0,color);
            
        });

        colorPickerOffNr.on('change',(event) => {
            let id = event.target.id.replace('materialKeys_colorOff','')-1;
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.colorOff[id]=event.target.value;
            this.updateSettings(settings,true);
        });
        
        playMode.on("change",event => {
            let id = event.target.id.replace('materialKeys_playmode','')-1;
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.mode[id]=event.target.value;
            this.updateSettings(settings);
        });

        volumeSlider.on('change', event => {
            let id = event.target.id.replace('materialKeys_volume','')-1;
            let settings = game.settings.get(moduleName,'soundboardSettings');
            settings.volume[id]=event.target.value;
            this.updateSettings(settings); 
        });
    }
    async updateSettings(settings,render=false){
        await game.settings.set(moduleName,'soundboardSettings',settings);
        if (enableModule) {
            launchpad.setMode(launchpad.keyMode,false);
            soundboard.update();
        }
        if (render) this.render();
    }

    getPageEmpty(pageStart) {
        let pageEmpty = true;
        for (let i=pageStart; i<pageStart+16; i++) {
            const name = this.settings.name[i];
            const playlist = this.settings.selectedPlaylists[i];
            const sound = this.settings.sounds[i];
            if ((name != "" && name != null) || playlist != undefined || sound != undefined) {
                pageEmpty = false;
                break;
            }
        }
        return pageEmpty;
    }

    async clearPage(pageStart,remove=false) {
        if (remove) {
            await this.settings.sounds.splice(pageStart,16);
            await this.settings.colorOn.splice(pageStart,16);
            await this.settings.colorOff.splice(pageStart,16);
            await this.settings.mode.splice(pageStart,16);
            await this.settings.volume.splice(pageStart,16);
            await this.settings.name.splice(pageStart,16);
            await this.settings.selectedPlaylists.splice(pageStart,16);
            await this.settings.src.splice(pageStart,16);
            await this.settings.toggle.splice(pageStart,16);
        }
        else {
            for (let i=pageStart; i<pageStart+16; i++) {
                this.settings.sounds[i] = null;
                this.settings.colorOn[i] = null;
                this.settings.colorOff[i] = null;
                this.settings.mode[i] = null;
                this.settings.volume[i] = null;
                this.settings.name[i] = null;
                this.settings.selectedPlaylists[i] = null;
                this.settings.src[i] = null;
                this.settings.toggle[i] = null;
            }
        }
        
        await this.updateSettings(this.settings);
    }

    async clearAllSettings() {
        let array = [];
        for (let i=0; i<16; i++) array[i] = "";
        let arrayVolume = [];
        for (let i=0; i<16; i++) arrayVolume[i] = "50";
        let arrayZero = [];
        for (let i=0; i<16; i++) arrayZero[i] = 0;
        let toggleArray = [];
        for (let i=0; i<16; i++) toggleArray[i] = "static";
    
        const settings = {
            playlist: "",
            sounds: array,
            colorOn: arrayZero,
            colorOff: arrayZero,
            mode: arrayZero,
            toggle: toggleArray,
            volume: arrayVolume,
            name: array
        };
        await this.updateSettings(settings);
    }
    
}
