import {moduleName,launchpad} from "../MaterialKeys.js";

export class MacroBoard{
    constructor(){
    }

    keyPress(key){
        if (launchpad.keyMode != 2) return;
        const column = (key % 10)-1;
        const row = 8-Math.floor(key/10);
        const nr = column+row*8;
        this.executeMacro(nr);
    }

    executeMacro(nr){
        const macroId = game.settings.get(moduleName,'macroSettings').macros[nr];
        const macro = game.macros.get(macroId);
        if (macro == null) return;
        if (game.settings.get(moduleName,'macroSettings').args != undefined) {
            const args = game.settings.get(moduleName,'macroSettings').args[nr];
            let furnaceEnabled = false;
            const furnace = game.modules.get("furnace");
            if (furnace != undefined && furnace.active) furnaceEnabled = true;
            if (furnaceEnabled) {
                const chatData = {
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker(),
                    content: "/'" + macro.name + "' " + args
                  };
                ChatMessage.create(chatData, {});
                return;
            }
        }

        macro.execute();
        
    }

    update(){
        if (launchpad.keyMode != 2) return;
        launchpad.setMainLEDs(0,0);

        for (let i=0; i<64; i++){
            const color = game.settings.get(moduleName,'macroSettings').color[i];

            const row = 8-Math.floor(i/8);
            const column = i % 8 + 1;
            const led = row*10+column;
            launchpad.setLED(led,0,color);
        }
        launchpad.updateLEDs(); 
    }
}