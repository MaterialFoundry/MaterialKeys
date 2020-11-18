import * as MODULE from "../MaterialKeys.js";
import {launchpad} from "../MaterialKeys.js";

export class VisualFx{
    constructor(){
        this.visualFxState = [false,false,false,false,false,false,false,false,false,false,false,false,false];
        this.visualFxFilters = [false,false,false,false];
        this.colorizeColors = [
            {red: 1,green: 0,blue: 0},
            {red: 1,green: 0.5,blue: 0},
            {red: 1,green: 1,blue: 0},
            {red: 0,green: 1,blue: 0},
            {red: 0,green: 0.4,blue: 0},
            {red: 0,green: 1,blue: 1},
            {red: 0,green: 0,blue: 1},
            {red: 1,green: 0,blue: 1}
        ];
        this.colorizeColor = {red: 0, green: 0, blue: 0};
    }

    keyPress(key){
        if (launchpad.keyMode != 5 && launchpad.keyMode != 51) return;
        const column = (key % 10)-1;
        let row = 8-Math.floor(key/10);
        if (launchpad.keyMode == 5){
            if (column == 0 && row >= 0){
                const darkness = row/7;
                canvas.scene.update({darkness: darkness});
            }
            else if (column == 2 && row >= 0){
                row = 8 - row;
                this.colorizeColor.red = this.colorizeColors[8-row].red;
                this.colorizeColor.green = this.colorizeColors[8-row].green;
                this.colorizeColor.blue = this.colorizeColors[8-row].blue;
                this.setColorize();
            }
            else if (column > 3 && column < 7){
                if (row == -1) {
                    this.colorizeColor.red = 1;
                    this.colorizeColor.green = 1;
                    this.colorizeColor.blue = 1;
                    this.setColorize();
                    return;
                }
                const color = (7-row)/7;
                if (column == 4) this.colorizeColor.red = color;
                else if (column == 5) this.colorizeColor.green = color;
                else if (column == 6) this.colorizeColor.blue = color;
                this.setColorize();
            }  
        }
        else if (launchpad.keyMode == 51){
            if ((column < 3) && row >= 0){
                let sel = (row - 1) + 5*(column);
                if (sel > 9) sel--;
                if (row < 1 || row == 6 || (row == 5 && column > 0)) return;
                else if (column < 3 && row == 7) 
                    for (let i=0; i<13; i++)
                        this.visualFxState[i] = false;
                else this.visualFxState[sel] = !this.visualFxState[sel];
                    
                let effects = {};
                for (let i=0; i<13; i++){
                    if (this.visualFxState[i] == false) continue;
                    const type = this.getVisualFxType(i);
                    effects[randomID()] = {
                        type: type,
                        options: {
                            density: 50,
                            speed: 50,
                            scale: 50,
                            tint: "#000000",
                            direction: 50,
                            apply_tint: false
                        }
                    };
                }
                canvas.scene.unsetFlag("fxmaster", "effects").then(() => {
                    canvas.scene.setFlag("fxmaster", "effects", effects);
                });
            }
            else if (column == 4 && ((row > 1 && row < 6) || row == 7)){
                if (row == 7)
                    for (let i=0; i<4; i++) 
                        this.visualFxFilters[i] = false;
                else {
                    let state = true;
                    if (this.visualFxFilters[row-2]) state = false;
                    this.visualFxFilters[row-2] = state;
                }
                
                let filters = {};
                const core_color = canvas.scene.getFlag("fxmaster", "filters").core_color;
                if (core_color != undefined)
                    filters["core_color"] = core_color;
                for (let i=0; i<4; i++){
                    if (this.visualFxFilters[i] == false) continue;
                    const name = this.getFilterName(i);
                    filters[name] = {
                        type: this.getFilterType(i)
                    };
                }
                canvas.scene.unsetFlag("fxmaster", "filters").then(() => {
                    canvas.scene.setFlag("fxmaster", "filters", filters);
                });
            }
        }  
    }
    
    update(){
        if (launchpad.keyMode != 5 && launchpad.keyMode != 51) return;
        
        launchpad.setMainLEDs(0,0);
        
        let fxmasterEnabled = false;
        const fxmaster = game.modules.get("fxmaster");
        if (fxmaster != undefined && fxmaster.active) 
            fxmasterEnabled = true;

        if (launchpad.keyMode == 5){
            if (fxmasterEnabled){
                const fxmaster = canvas.scene.getFlag("fxmaster", "filters");
                let red = 1;
                let green = 1;
                let blue = 1;
                if (fxmaster != undefined) {
                    let filters = fxmaster.core_color;
                    if (filters != undefined){
                        if (filters.type == "color"){
                            red = filters.options.red;
                            green = filters.options.green;
                            blue = filters.options.blue;
                            this.colorizeColor.red = red;
                            this.colorizeColor.green = green;
                            this.colorizeColor.blue = blue;
                        }
                    }
                }
                launchpad.setLED(95,3,Math.ceil(red*127),Math.ceil(green*127),Math.ceil(blue*127));
                launchpad.setLED(96,3,Math.ceil(red*127),Math.ceil(green*127),Math.ceil(blue*127));
                launchpad.setLED(97,3,Math.ceil(red*127),Math.ceil(green*127),Math.ceil(blue*127));
                
                red = Math.ceil(red*8);
                green = Math.ceil(green*8);
                blue = Math.ceil(blue*8);
                if (red == 0) red = 1;
                if (green == 0) green = 1;
                if (blue == 0) blue = 1;
                
                for (let i=0; i<8; i++){
                    let color = i*15+7;
                    if (red <= i) 
                        color = 0;
                    let led = 15 + 10*i;
                    launchpad.setLED(led,3,color,0,0);
    
                    color = i*15+7;
                    if (green <= i)
                        color = 0;
                    led = 16 + 10*i;
                    launchpad.setLED(led,3,0,color,0);
        
                    color = i*15+7;
                    if (blue <= i)
                        color = 0;
                    led = 17 + 10*i;
                    launchpad.setLED(led,3,0,0,color);
                }
    
                //Colorize effects
                const colorizeLedColor = [53,45,37,27,21,13,9,5];
                for (let i=1; i<9; i++){
                    const state = (this.colorizeState == i) ? 2 : 0;
                    const led = 10*i + 3;
                    launchpad.setLED(led,state,colorizeLedColor[i-1]);
                }
            }
            /*
            * Darkness
            */
            const darkness = Math.floor(7-canvas.scene.data.darkness*7);
            const darknessColor = [7,17,27,47,67,87,107,127];
            for (let i=0; i<8; i++){
                let color = darknessColor[i];
                if (darkness < i) 
                    color = 0;
                const led = 11 + 10*i;
                launchpad.setLED(led,3,color,color,color);
            }
        }

        else if (launchpad.keyMode == 51 && fxmasterEnabled){
            //Weather effects
            for (let i=0; i<11; i++)
                this.visualFxState[i] = false;
            const flags = canvas.scene.getFlag("fxmaster", "effects");
            if (flags) {
                const objKeys = Object.keys(flags);
                for (let i = 0; i < objKeys.length; ++i) {
                    const weather = CONFIG.weatherEffects[flags[objKeys[i]].type];
                    if (weather.label === 'Autumn Leaves') this.visualFxState[0] = true;
                    else if (weather.label === 'Rain') this.visualFxState[1] = true;
                    else if (weather.label === 'Snow') this.visualFxState[2] = true;
                    else if (weather.label === 'Snowstorm') this.visualFxState[3] = true;
                    else if (weather.label === 'Bubbles') this.visualFxState[4] = true;
                    else if (weather.label === 'Clouds') this.visualFxState[5] = true;
                    else if (weather.label === 'Embers') this.visualFxState[6] = true;
                    else if (weather.label === 'Rain without splash') this.visualFxState[7] = true;
                    else if (weather.label === 'Stars') this.visualFxState[8] = true;
                    else if (weather.label === 'Crows') this.visualFxState[9] = true;
                    else if (weather.label === 'Bats') this.visualFxState[10] = true;
                    else if (weather.label === 'Fog') this.visualFxState[11] = true;
                    else if (weather.label === 'Topdown Rain') this.visualFxState[12] = true;
                }
            }
            //VisualFx leds
            const fxLedColor = [127,79,90,90,3,71,84,79,81,99,97,1,79];
            let stopState = 0;
            for (let i=0; i<13; i++){
                const state = this.visualFxState[i] ? 2 : 0;
                if (state) stopState = 2;
                let led;
                if (i < 5) led = 71-10*i;
                else if (i < 9) led = 72-10*(i-5);
                else led = 73-10*(i-9);
                launchpad.setLED(led,state,fxLedColor[i]);
            }
            launchpad.setLED(11,stopState,72);
            launchpad.setLED(12,stopState,72);
            launchpad.setLED(13,stopState,72);
            
            //Filters
            const fxmaster = canvas.scene.getFlag("fxmaster", "filters");
            if (fxmaster == undefined)
                for (let i=0; i<4; i++)
                    this.visualFxFilters[i] = false;
            else {
                const objKeys = Object.keys(fxmaster);
                for (let i=0; i<objKeys.length; i++){
                    if (objKeys[i] == "core_underwater") this.visualFxFilters[0] = true;
                    else if (objKeys[i] == "core_predator") this.visualFxFilters[1] = true;
                    else if (objKeys[i] == "core_oldfilm") this.visualFxFilters[2] = true;
                    else if (objKeys[i] == "core_bloom") this.visualFxFilters[3] = true;
                }
            }
            stopState = 0;
            const filterLedColor = [79,71,1,3]
            for (let i=0; i<4; i++){
                let mode = 0;
                if (this.visualFxFilters[i]) mode = 2;
                if (mode) stopState = 2;
                launchpad.setLED(65-10*i,mode,filterLedColor[i]);
            }
            launchpad.setLED(15,stopState,72);
        }
        launchpad.updateLEDs();  
    }

    getVisualFxType(num){
        let type;
        if (num == 0) type = 'leaves';
        else if (num == 1) type = 'rain';
        else if (num == 2) type = 'snow';
        else if (num == 3) type = 'snowstorm';
        else if (num == 4) type = 'bubbles';
        else if (num == 5) type = 'clouds';
        else if (num == 6) type = 'embers';
        else if (num == 7) type = 'rainsimple';
        else if (num == 8) type = 'stars';
        else if (num == 9) type = 'crows';
        else if (num == 10) type = 'bats';
        else if (num == 11) type = 'fog';
        else if (num == 12) type = 'raintop';
        return type;
    }

    getFilterName(num){
        let type;
        if (num == 0) type = "core_underwater";
        else if (num == 1) type = "core_predator";
        else if (num == 2) type = "core_oldfilm";
        else if (num == 3) type = "core_bloom";
        return type;
    }

    getFilterType(num){
        let type;
        if (num == 0) type = "underwater";
        else if (num == 1) type = "predator";
        else if (num == 2) type = "oldfilm";
        else if (num == 3) type = "bloom";
        return type;
    }

    setColorize(){
        let core_color = {};
        let color = {};
        let colors = this.colorizeColor;
        core_color = {
            type: "color",
            options: colors
        }
        color = {
            core_color: core_color
        }
        canvas.scene.setFlag("fxmaster", "filters", color);
    }
}
    
