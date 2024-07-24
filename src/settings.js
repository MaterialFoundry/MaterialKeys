import {moduleName,launchpad} from "../MaterialKeys.js";
import {macroConfigForm} from "./forms/macroForm.js";
import {soundboardConfigForm} from "./forms/soundboardForm.js";
import {playlistConfigForm} from "./forms/playlistForm.js";
import { compatibilityHandler } from "./compatibilityHandler.js";


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
        config: false,
        default: {}
    });
}

export class helpMenu extends FormApplication {
    constructor(data, options) {
        open("https://materialfoundry.github.io/MaterialKeys/");
        return;
    }

    static get defaultOptions() {
        return;
    }

    getData() {
        return;
    }

    async _updateObject(event, formData) {
    }
  
    activateListeners(html) {
        super.activateListeners(html); 
    }
  }