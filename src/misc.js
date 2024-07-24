import {moduleName, soundboard, macroBoard} from "../MaterialKeys.js";
import { compatibilityHandler } from "./compatibilityHandler.js";

export function compareVersions(checkedVersion, requiredVersion) {
    requiredVersion = requiredVersion.split(".");
    checkedVersion = checkedVersion.split(".");
    
    for (let i=0; i<3; i++) {
        requiredVersion[i] = isNaN(parseInt(requiredVersion[i])) ? 0 : parseInt(requiredVersion[i]);
        checkedVersion[i] = isNaN(parseInt(checkedVersion[i])) ? 0 : parseInt(checkedVersion[i]);
    }
    
    if (checkedVersion[0] > requiredVersion[0]) return false;
    if (checkedVersion[0] < requiredVersion[0]) return true;
    if (checkedVersion[1] > requiredVersion[1]) return false;
    if (checkedVersion[1] < requiredVersion[1]) return true;
    if (checkedVersion[2] > requiredVersion[2]) return false;
    return true;
}
  
export function compatibleCore(compatibleVersion){
    const split = compatibleVersion.split(".");
    if (split.length == 1) compatibleVersion = `${compatibleVersion}.0`;
    let coreVersion = game.version;
    return compareVersions(compatibleVersion, coreVersion);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class soundboardCheatSheet extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    static get defaultOptions() {
        return compatibilityHandler('mergeObject', super.defaultOptions, {
            id: "soundboard-cheatsheet",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.SBcheatSheet"),
            template: "./modules/MaterialKeys/templates/soundboardCheatSheet.html",
            classes: ["sheet"]
        });
    }

    getData() {
        let settings = game.settings.get(moduleName,'soundboardSettings');

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
            const mode = game.settings.get(moduleName,'soundboardSettings').mode[id];
            let repeat = false;
            if (mode > 0) repeat = true;
            let play = false;
            if (soundboard.activeSounds[id] == false) play = true;
            soundboard.prePlaySound(id,repeat,play);
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
        return compatibilityHandler('mergeObject', super.defaultOptions, {
            id: "macro-cheatsheet",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.MBcheatSheet"),
            template: "./modules/MaterialKeys/templates/macroCheatSheet.html",
            classes: ["sheet"]
        });
    }

    getData() {
        let settings = game.settings.get(moduleName,'macroSettings');
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
    if (color == undefined) color = '#3f3f3f';
    return color;
}

