import {moduleName,launchpad} from "../MaterialKeys.js";

export class MacroBoard{
    constructor(){
    }

    keyPress(key){
        if (Math.floor(launchpad.keyMode/10) != 2) return;
        const page = launchpad.keyMode - 20;

        const column = (key % 10)-1;
        const row = 8-Math.floor(key/10);
        const nr = column+row*8+64*page;
        this.executeMacro(nr);
    }

    executeMacro(nr){
        const macroId = game.settings.get(moduleName,'macroSettings').macros[nr];
        const macro = game.macros.get(macroId);
        if (macro == null) return;

        const args = game.settings.get(moduleName,'macroSettings').args[nr];
        if (args == undefined || args == '') {
            macro.execute();
            return;
        }

        let argument;
        try {
            argument = JSON.parse(args)
            macro.execute(argument);
        } catch (err) {
            console.error(err);
            ui.notifications.warn("Material Keys: "+game.i18n.localize("MaterialKeys.Macroboard.InvalidArgs"));
        }
    }

    update(){
        if (Math.floor(launchpad.keyMode/10) != 2) return;
        launchpad.setMainLEDs(0,'static');

        let color;
        let mode;
        let txt;

        const macroSettings = game.settings.get('MaterialKeys','macroSettings');
        let maxMacros = 0;
        if (macroSettings.macros != undefined) maxMacros = macroSettings.macros.length;
        
        mode = (launchpad.keyMode == 20)? 'flashing' : 'pulsing';
        color = (maxMacros>64)? 87 : 0;
        txt = (maxMacros>64)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(69,mode,color,0,txt);
        mode = (launchpad.keyMode == 21)? 'flashing' : 'pulsing';
        color = (maxMacros>64)? 79 : 0;
        txt = (maxMacros>64)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(59,mode,color,0,txt);
        mode = (launchpad.keyMode == 22)? 'flashing' : 'pulsing';
        color = (maxMacros>128)? 53 : 0;
        txt = (maxMacros>128)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(49,mode,color,0,txt);
        mode = (launchpad.keyMode == 23)? 'flashing' : 'pulsing';
        color = (maxMacros>192)? 74 : 0;
        txt = (maxMacros>192)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(39,mode,color,0,txt);

        const page = launchpad.keyMode - 20;

        for (let i=64*page; i<64*page+64; i++){
            const color = macroSettings.color == undefined ? 0 : macroSettings.color[i];
            const macroId = macroSettings.macros == undefined ? 0 : macroSettings.macros[i];
            const macro = macroId == undefined ? undefined : game.macros.get(macroId);
            
            const txt = (macro == undefined) ? "" : macro.name;

            let ledIteration = i - 64*page;
            const row = 8-Math.floor(ledIteration/8);
            const column = ledIteration % 8 + 1;
            const led = row*10+column;
            launchpad.setLED(led,'static',color,0,txt);
        }
        launchpad.updateLEDs(); 
    }
}