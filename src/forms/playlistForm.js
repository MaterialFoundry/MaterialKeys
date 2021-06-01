import {moduleName,enableModule,launchpad,playlistControl} from "../../MaterialKeys.js";
import {compatibleCore, getColor} from "../misc.js";

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
        let settings = game.settings.get(moduleName,'playlists');
        if (settings.colorOn == undefined) settings.colorOn = 87;
        if (settings.colorOff == undefined) settings.colorOff = 72;
        let selectedPlaylists = settings.selectedPlaylist;
        if (selectedPlaylists == undefined) selectedPlaylists = [];
        let selectedPlaylistMode = settings.playlistMode;
        if (selectedPlaylistMode == undefined) selectedPlaylistMode = [];
        let playMode = settings.playMode;
        if (playMode == undefined) playMode = 0;
        let playlistData = [];

        const playlistArray = compatibleCore("0.8.1") ? game.playlists.contents : game.playlists.entities;
        
        for (let i=0; i<8; i++){
            if (selectedPlaylists[i] == undefined) selectedPlaylists[i] = 'none';
            if (selectedPlaylistMode[i] == undefined) selectedPlaylistMode[i] = 0;
            let dataThis = {
                iteration: i+1,
                playlist: selectedPlaylists[i],
                playlistMode: selectedPlaylistMode[i],
                playlists: playlistArray
            }
            playlistData.push(dataThis);
        }

        this.data = {
            playMode: playMode,
            selectedPlaylist: selectedPlaylists,
            playlistMode: selectedPlaylistMode
        }
   
        return {
            playlists: playlistArray,
            playlistData: playlistData,
            playMode: playMode,
            colorOn:settings.colorOn,
            colorOff:settings.colorOff,
            colorOnRGB: getColor(settings.colorOn),
            colorOffRGB: getColor(settings.colorOff)
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
    }

    activateListeners(html) {
        super.activateListeners(html);  
        const playMode = html.find("select[name='playMode']");
        const selectedPlaylist = html.find("select[name='selectedPlaylist']");
        const playlistMode = html.find("select[name='playlistMode']");
        const colorPickerOn = html.find("button[name='colorPickerOn']");
        const colorPickerOnNr = html.find("input[name='colorOn']");
        const colorPickerOff = html.find("button[name='colorPickerOff']");
        const colorPickerOffNr = html.find("input[name='colorOff']");

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

        colorPickerOn.on('click',(event) => {
            let color = document.getElementById("colorOn").value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(null,1,color); 
        });

        colorPickerOnNr.on('change',(event) => {
            let settings = game.settings.get(moduleName,'playlists');
            settings.colorOn=event.target.value;
            document.getElementById("colorOn").style="flex:7; background-color:"+getColor(event.target.value); 
            this.updateSettings(settings,true);

        });

        colorPickerOff.on('click',(event) => {
            let color = document.getElementById("colorOff").value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(null,0,color);
            
        });

        colorPickerOffNr.on('change',(event) => {
            let settings = game.settings.get(moduleName,'playlists');
            settings.colorOff=event.target.value;
            document.getElementById("colorOff").style="flex:7; background-color:"+getColor(event.target.value); 
            this.updateSettings(settings,true);
        });
    }
    async updateSettings(settings){
        await game.settings.set(moduleName,'playlists', settings);
        if (enableModule) {
            playlistControl.playlistUpdate();
            playlistControl.volumeUpdate();
        }
        //this.render();
    }
    
}