import {launchpad} from "../MaterialKeys.js";

export class CombatTracker{
    constructor(){
        this.combatantsLengthOld = 0;
        this.combatState = 0;
    }

    updateTokens(combat){
        if (launchpad.keyMode != 4) return;
        if (combat != null){
            let combatants = combat.combatants.contents;
            if (combatants.length > 0){
                let initiativeOrder = combat.turns;
                let oldCombatants = 0;
                if (this.combatantsLengthOld > combatants.length){
                    oldCombatants = this.combatantsLengthOld-combatants.length;
                    for (let i=0; i<this.combatantsLengthOld; i++){
                        let j = i + initiativeOrder.length;
                        if (i>7) j = i-18;
                        if (i>15) j = i-36;
                        if (i>23) j = i-54;
                        if (i>31) break;
                        let led = 81+j;
                        launchpad.setLED(led,0,0);
                    }     
                }
                for (let i=0; i<initiativeOrder.length; i++){
                    let token = initiativeOrder[i].token.data;
                    let color;
                    const disposition = token.disposition;
                    if (disposition == 1) color = 87;
                    else if (disposition == 0) color = 74;
                    else if (disposition == -1) color = 72;
                    let type = 0;
                    const currentCombatantId = combat.combatant.token.id;
                    if (combat.started && token._id == currentCombatantId) type = 2;
                    let j = i;
                    if (i>7) j = i-18;
                    if (i>15) j = i-36;
                    if (i>23) j = i-54;
                    if (i>31) break;
                    let led = 81+j;
                    if (initiativeOrder[i].defeated)
                        launchpad.setLED(led,type,3,0,0,token.name);
                    else
                        launchpad.setLED(led,type,color,0,0,token.name);
                }
                
                this.combatantsLengthOld = combatants.length;
                launchpad.updateLEDs();
                return;
            }
        }
        if (this.combatantsLengthOld > 0){
            for (let i=0; i<this.combatantsLengthOld; i++){
                let j = i;
                if (i>7) j = i-18;
                if (j>15) j = i-28;
                let led = 81+j;
                launchpad.setLED(led,0,0);
            } 
            launchpad.updateLEDs();    
        }
    }

    trackerKeyPress(key){
        if(key == 14 || key == 15 || key == 24 || key == 25 || key == 34 || key == 35){
            if (game.combat.started == false) game.combat.startCombat();
            else game.combat.endCombat();
        }
        else if (key == 11 || key == 12 || key == 21 || key == 22 || key == 31 || key == 32){
            game.combat.previousTurn();
        }
        else if (key == 17 || key == 18 || key == 27 || key == 28 || key == 37 || key == 38){
            game.combat.nextTurn();
        }
        else {
            let selected = key - 81;
            if (selected < 0) selected += 18;
            if (selected < 0) selected += 18;
            
            let token = game.combat.turns[selected].token.data;
            if (token != undefined){
                let tokenId = token._id;
                let tokens = canvas.tokens.children[0].children;
                for (let i=0; i<tokens.length; i++){
                    if (tokens[i].id == tokenId) {
                        tokens[i].control();
                        break;
                    }
                }
                canvas.animatePan({x: token.x, y: token.y, speed: 2000});
            }
        }
    }

    trackerUpdate(combat){
        if (launchpad.keyMode != 4) return;
        if (combat != undefined){
            let combatants = combat.combatants.contents;
            if (combatants.length > 0){
                if (combat.started)
                    this.combatState = 2; 
                else 
                    this.combatState = 1;
                this.updateTokens(combat);    
            }
            else 
                this.combatState = 0;
        }
        else 
            this.combatState = 0;

        let mode = 2;
        let color = 87;
        let modeArrows = 2;
        let colorArrows = 72;

        if (this.combatState == 0){
            launchpad.setMainLEDs(0,0);
        }
        if (this.combatState == 1) {
            mode = 0;
        }
        else if (this.combatState == 2){
            mode = 0;
            color = 72;
            modeArrows = 0;
            colorArrows = 87;
        }
        launchpad.setLED(14,mode,color);
        launchpad.setLED(15,mode,color);
        launchpad.setLED(24,mode,color);
        launchpad.setLED(25,mode,color);
        launchpad.setLED(34,mode,color);
        launchpad.setLED(35,mode,color);
        launchpad.setArrow(17,'right',colorArrows,modeArrows);
        launchpad.setArrow(11,'left',colorArrows,modeArrows);

        launchpad.updateLEDs();
    }

    hpKeyPress(key){
        if (Math.floor(launchpad.keyMode/10) != 3) return;
        let page = launchpad.keyMode % 10-1;
        let selected = key % 10 - 1 + 8 * page;

        let token = game.combat.turns[selected].token.data;
        if (token != undefined){
            let tokenId = token._id;
            let tokens = canvas.tokens.children[0].children;
            for (let i=0; i<tokens.length; i++){
                if (tokens[i].id == tokenId) {
                    tokens[i].control();
                    break;
                }
            }
            canvas.animatePan({x: token.x, y: token.y, speed: 2000});
        }
    }

    hpUpdate(combat){
        if (Math.floor(launchpad.keyMode/10) != 3) return;
        let hpTrackerPages;
        let combatants;
        if (game.combat) {
            combatants = game.combat.combatants.contents;
            hpTrackerPages = Math.ceil(combatants.length/8);
        }
        
        let color;
        let type;
        let txt;
        
        type = (launchpad.keyMode == 31)? 1 : 2;
        color = (hpTrackerPages>1)? 87 : 0;
        txt = (hpTrackerPages>1)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 1` : '';
        launchpad.setLED(79,type,color,0,0,txt);
        type = (launchpad.keyMode == 32)? 1 : 2;
        color = (hpTrackerPages>1)? 79 : 0;
        txt = (hpTrackerPages>1)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 2` : '';
        launchpad.setLED(69,type,color,0,0,txt);
        type = (launchpad.keyMode == 33)? 1 : 2;
        color = (hpTrackerPages>2)? 53 : 0;
        txt = (hpTrackerPages>2)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 3` : '';
        launchpad.setLED(59,type,color,0,0,txt);
        type = (launchpad.keyMode == 34)? 1 : 2;
        color = (hpTrackerPages>3)? 74 : 0;
        txt = (hpTrackerPages>3)? `${game.i18n.localize("MaterialKeys.Emulator.Page")} 4` : '';
        launchpad.setLED(49,type,color,0,0,txt);

        let page = launchpad.keyMode % 10-1;
        
        launchpad.setMainLEDs(0,0);
        if (combatants.length > 0){
            let initiativeOrder = combat.turns;
        
            for (let i=0; i<8; i++){
                let nr = i+8*page;
                if (nr >= initiativeOrder.length) break;
                let token = initiativeOrder[i].token.data;
                let color;
                const disposition = token.disposition;
                if (disposition == 1) color = 87;
                else if (disposition == 0) color = 74;
                else if (disposition == -1) color = 72;
                
                let type = 0;
                const currentCombatantId = combat.combatant.token.id;
                if (combat.started && token.id == currentCombatantId) type = 2;
                let j = i;
                if (i>7) j = i-18;
                if (j>15) j = i-28;
                
                let led = 91+i;

                token = canvas.tokens.children[0].children.find(p => p.id == token._id);
                let hp = token.actor.data.data.attributes.hp.value;
                let hpMax = token.actor.data.data.attributes.hp.max;
                if (hp == null) hp = 0;
                if (hpMax == null) hpMax = 0;
                const txt = `${token.name} - ${hp}/${hpMax}`;

                if (initiativeOrder[nr].defeated)
                    launchpad.setLED(led,type,3,0,0,txt);
                else
                    launchpad.setLED(led,type,color,0,0,txt);
                
                let leds = 0;

                if (hp == 0 || initiativeOrder[nr].defeated) leds = 0;
                else leds = Math.ceil(8*hp/hpMax);

                for (let j=0; j<8; j++){
                    let led = 11+10*j+i;
                    if (j>=leds) 
                        color = 0; 
                    launchpad.setLED(led,type,color,0,0,`${Math.ceil(j*100/7)}%`);
                }
            }
            this.combatantsLengthOld = combatants.length;
        }
        launchpad.updateLEDs();
    }
}
