import {moduleName,launchpad,marcoArgumentsEnabled} from "../MaterialKeys.js";
import { compatibleCore } from "./misc.js";

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
        const args = game.settings.get(moduleName,'macroSettings')?.args[nr];
        if (!marcoArgumentsEnabled || args == undefined || args == '') {
            macro.execute();
        }
        else {
            const args = game.settings.get(moduleName,'macroSettings').args[nr];
            if (compatibleCore('11.0')) {
                let argument;
                try {
                    argument = JSON.parse(args)
                    macro.execute(argument);
                } catch (err) {
                    console.error(err)
                }
            }
            else {
                const chatData = {
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker(),
                    content: "/amacro '" + macro.name + "' " + args
                  };
                ChatMessage.create(chatData, {});
            }
        }
    }

    update(){
        if (Math.floor(launchpad.keyMode/10) != 2) return;
        launchpad.setMainLEDs(0,0);

        let color;
        let type;
        let txt;
        const maxMacros = game.settings.get('MaterialKeys','macroSettings').macros.length;
        
        type = (launchpad.keyMode == 20)? 1 : 2;
        color = (maxMacros>64)? 87 : 0;
        txt = (maxMacros>64)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(69,type,color,0,0,txt);
        type = (launchpad.keyMode == 21)? 1 : 2;
        color = (maxMacros>64)? 79 : 0;
        txt = (maxMacros>64)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(59,type,color,0,0,txt);
        type = (launchpad.keyMode == 22)? 1 : 2;
        color = (maxMacros>128)? 53 : 0;
        txt = (maxMacros>128)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(49,type,color,0,0,txt);
        type = (launchpad.keyMode == 23)? 1 : 2;
        color = (maxMacros>192)? 74 : 0;
        txt = (maxMacros>192)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(39,type,color,0,0,txt);

        const page = launchpad.keyMode - 20;

        for (let i=64*page; i<64*page+64; i++){
            const color = game.settings.get(moduleName,'macroSettings').color[i];
            const macroId = game.settings.get(moduleName,'macroSettings').macros[i];
            const macro = game.macros.get(macroId);
            
            const txt = (macro == undefined) ? "" : macro.name;

            let ledIteration = i - 64*page;
            const row = 8-Math.floor(ledIteration/8);
            const column = ledIteration % 8 + 1;
            const led = row*10+column;
            launchpad.setLED(led,0,color,0,0,txt);
        }
        launchpad.updateLEDs(); 
    }
}