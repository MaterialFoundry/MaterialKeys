import * as MODULE from "../MaterialKeys.js";
import { playlistConfigForm, soundboardConfigForm, macroConfigForm } from "./misc.js";


export const registerSettings = function() {
    /**
     * Main settings
     */

    //Enabled the module
    game.settings.register(MODULE.moduleName,'Enable', {
        name: "MaterialKeys.Sett.Enable",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: x => window.location.reload()
    });

    game.settings.register(MODULE.moduleName, "brightness", {
        name: "MaterialKeys.Sett.Brightness",
        hint: "MaterialKeys.Sett.Brightness_Hint",
        scope: "world",
        config: true,
        type: Number,
        range: {min: 0, max: 127, step: 1},
        default: 127,
        onChange: () => {
            MODULE.launchpad.setBrightness(game.settings.get(MODULE.moduleName,'brightness'))
        }
      });

    /**
     * Sets the name of the target client (who has the TV connected)
     */
    game.settings.register(MODULE.moduleName,'address', {
        name: "MaterialKeys.Sett.MidiAddr",
        hint: "MaterialKeys.Sett.MidiAddrHint",
        scope: "world",
        config: true,
        default: "localhost:3001",
        type: String,
        onChange: x => window.location.reload()
    });

    /**
     * Playlists
     */
    game.settings.register(MODULE.moduleName, 'playlists', {
        name: "selectedPlaylists",
        scope: "world",
        type: Object,
        default: {},
        config: false
    });
    
    game.settings.registerMenu(MODULE.moduleName, 'playlistConfigMenu',{
        name: "MaterialKeys.Sett.PlaylistConfig",
        label: "MaterialKeys.Sett.PlaylistConfig",
        type: playlistConfigForm,
        restricted: true
    });

    /**
     * Soundboard
     */
    game.settings.registerMenu(MODULE.moduleName, 'soundboardConfigMenu',{
        name: "MaterialKeys.Sett.SoundboardConfig",
        label: "MaterialKeys.Sett.SoundboardConfig",
        type: soundboardConfigForm,
        restricted: true
    });

    game.settings.register(MODULE.moduleName, 'soundboardSettings', {
        name: "soundboardSettings",
        scope: "world",
        type: Object,
        default: "None",
        config: false
    });
  
    /**
     * Macro board
     */
    game.settings.registerMenu(MODULE.moduleName, 'macroConfigMenu',{
        name: "MaterialKeys.Sett.MacroConfig",
        label: "MaterialKeys.Sett.MacroConfig",
        type: macroConfigForm,
        restricted: true
    });

    game.settings.register(MODULE.moduleName, 'macroSettings', {
        name: "macroSettings",
        scope: "world",
        type: Object,
        config: false
    });
}