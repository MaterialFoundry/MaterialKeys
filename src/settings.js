import {moduleName,launchpad} from "../MaterialKeys.js";
import {macroConfigForm} from "./forms/macroForm.js";
import {soundboardConfigForm} from "./forms/soundboardForm.js";
import {playlistConfigForm} from "./forms/playlistForm.js";


export const registerSettings = function() {
    /**
     * Main settings
     */

    //Enabled the module
    game.settings.register(moduleName,'Enable', {
        name: "MaterialKeys.Sett.Enable",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: x => window.location.reload()
    });

    game.settings.register(moduleName, "brightness", {
        name: "MaterialKeys.Sett.Brightness",
        hint: "MaterialKeys.Sett.Brightness_Hint",
        scope: "world",
        config: true,
        type: Number,
        range: {min: 0, max: 127, step: 1},
        default: 127,
        onChange: () => {
            launchpad.setBrightness(game.settings.get(moduleName,'brightness'))
        }
      });

    /**
     * Sets the name of the target client (who has the TV connected)
     */
    game.settings.register(moduleName,'address', {
        name: "MaterialKeys.Sett.MidiAddr",
        hint: "MaterialKeys.Sett.MidiAddrHint",
        scope: "world",
        config: true,
        default: "localhost:3001",
        type: String,
        onChange: x => window.location.reload()
    });

    game.settings.register(moduleName, 'nrOfConnMessages', {
        name: "MaterialKeys.Sett.NrOfConnMessages",
        hint: "MaterialKeys.Sett.NrOfConnMessagesHint",
        default: 5,
        type: Number,
        scope: 'client',
        range: { min: 0, max: 100, step: 1 },
        config: true
    
    });

    /*
     * Create the Help button
     */
    game.settings.registerMenu(moduleName, 'helpMenu',{
        name: "MaterialKeys.Sett.Help",
        label: "MaterialKeys.Sett.Help",
        type: helpMenu,
        restricted: false
    });

    /**
     * Playlists
     */
    game.settings.register(moduleName, 'playlists', {
        name: "selectedPlaylists",
        scope: "world",
        type: Object,
        default: {},
        config: false
    });
    
    game.settings.registerMenu(moduleName, 'playlistConfigMenu',{
        name: "MaterialKeys.Sett.PlaylistConfig",
        label: "MaterialKeys.Sett.PlaylistConfig",
        type: playlistConfigForm,
        restricted: true
    });

    /**
     * Soundboard
     */
    game.settings.registerMenu(moduleName, 'soundboardConfigMenu',{
        name: "MaterialKeys.Sett.SoundboardConfig",
        label: "MaterialKeys.Sett.SoundboardConfig",
        type: soundboardConfigForm,
        restricted: true
    });

    game.settings.register(moduleName, 'soundboardSettings', {
        name: "soundboardSettings",
        scope: "world",
        type: Object,
        default: "None",
        config: false
    });
  
    /**
     * Macro board
     */
    game.settings.registerMenu(moduleName, 'macroConfigMenu',{
        name: "MaterialKeys.Sett.MacroConfig",
        label: "MaterialKeys.Sett.MacroConfig",
        type: macroConfigForm,
        restricted: true
    });

    game.settings.register(moduleName, 'macroSettings', {
        name: "macroSettings",
        scope: "world",
        type: Object,
        config: false
    });
}

export class helpMenu extends FormApplication {
    constructor(data, options) {
        super(data, options);
    }
  
    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "helpMenu",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.Help"),
            template: "./modules/MaterialKeys/templates/helpMenu.html",
            width: "500px"
        });
    }
  
    /**
     * Provide data to the template
     */
    getData() {
      
        return {
           
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
        
    }
  }