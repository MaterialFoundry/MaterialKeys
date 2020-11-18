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
     * Playlist soundboard
     */
    game.settings.register(MODULE.moduleName,'playlistMethod', {
        name: "Playlist play method",
        scope: "world",
        config: false,
        type:Number,
        default:0,
        choices:["Default","One track per playlist","One track in total"],
    });

    game.settings.registerMenu(MODULE.moduleName, 'playlistConfigMenu',{
        name: "MaterialKeys.Sett.PlaylistConfig",
        label: "MaterialKeys.Sett.PlaylistConfig",
        type: playlistConfigForm,
        restricted: true
    });

    game.settings.register(MODULE.moduleName, 'selectedPlaylists', {
        name: "selectedPlaylists",
        scope: "world",
        type: Object,
        default: {a: "None",b: "None",c: "none",d: "none",e: "none",f: "none",g: "none",h: "none"},
        config: false
    });

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

    game.settings.register(MODULE.moduleName, 'macroArgs', {
        name: "macroArgs",
        scope: "world",
        type: Object,
        config: false
    });
}