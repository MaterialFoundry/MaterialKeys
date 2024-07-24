import { launchpad } from "../MaterialKeys.js";
import { compatibilityHandler } from "./compatibilityHandler.js";

export class VisualFx{
    constructor(){
        this.visualFxState = [false,false,false,false,false,false,false,false,false,false,false,false,false];
        this.visualFxFilters = [false,false,false,false,false];
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
                canvas.scene.update({darkness: darkness}, {animateDarkness:500});
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

                //clear all effects
                if (row == 7) { 
                    const flags = canvas.scene.getFlag("fxmaster", "effects");
                    if (flags) {
                        const objKeys = Object.keys(flags);
                        for (let i = 0; i < objKeys.length; ++i) {
                            const effect = flags[objKeys[i]].type;
                            Hooks.call("fxmaster.switchParticleEffect", {
                                name: `core_${effect}`,
                                type: effect   
                            });
                        }
                    }
                    return;
                }

                //else toggle effect
                const effect = this.getVisualFxType(sel);

                const options = {
                    density: 0.25,
                    speed: 1,
                    direction: 15,
                    scale: 1,
                    color: "#000000",
                    applyColor: false
                }
    
                Hooks.call("fxmaster.switchParticleEffect", {
                    name: `core_${effect}`,
                    type: effect,
                    options,
                    });
            }
            else if (column == 4 && ((row > 0 && row < 6) || row == 7)){
                if (row == 7)
                    for (let i=0; i<4; i++) 
                        this.visualFxFilters[i] = false;
                else {
                    let state = true;
                    if (this.visualFxFilters[row-1]) state = false;
                    this.visualFxFilters[row-1] = state;
                }
                const filterNum = row-1;
                
                const filterLabels = ["lightning", "underwater","predator","oldfilm","bloom"];
                const filter = filterLabels[filterNum];

                let options = {color: {value:"#000000", apply:false}};
                if (filter == undefined) {
                    const activeFilters = Object.entries(FXMASTER.filters.filters).filter(f => (f[0] == 'core_lightning' || f[0] == 'core_underwater' || f[0] == 'core_predator' || f[0] == 'core_bloom' || f[0] == 'core_oldfilm'));
                    for (let filter of activeFilters)
                        FXMASTER.filters.removeFilter(filter[0]);
                }
                else {
                    if (filter == 'lightning') {
                        options.period = 500;
                        options.duration = 300;
                        options.brightness = 1.3;
                    }
                    else if (filter == 'underwater') {
                        options.speed = 0.3;
                        options.scale = 4;
                    }
                    else if (filter == 'predator') {
                        options.noise = 0.1;
                        options.speed = 0.02;
                    }
                    
                    else if (filter == 'bloom') {
                        options.blur = 1;
                        options.bloom = 0.1;
                        options.threshold = 0.5;
                    }
                    else if (filter == 'oldfilm') {
                        options.sepia = 0.3;
                        options.noise = 0.1;
                    }
                    FXMASTER.filters.switch(`core_${filter}`, filter, options);
                }
            }
        }  
    }
    
    update(){
        if (launchpad.keyMode != 5 && launchpad.keyMode != 51) return;
        
        launchpad.setMainLEDs(0,'static');
        
        let fxmasterEnabled = false;
        const fxmaster = game.modules.get("fxmaster");
        if (fxmaster != undefined && fxmaster.active) 
            fxmasterEnabled = true;

        if (launchpad.keyMode == 5){
            if (fxmasterEnabled){
                launchpad.setLED(49,'flashing',87,0,game.i18n.localize("MaterialKeys.Emulator.Overlays"));
                launchpad.setLED(39,'pulsing',72,0,game.i18n.localize("MaterialKeys.Emulator.WeatherFilters"));
                const fxmaster = canvas.scene.getFlag("fxmaster", "filters");
                launchpad.setLED(93,'static',0,0,game.i18n.localize("MaterialKeys.Emulator.Colorize"));
                let red = 1;
                let green = 1;
                let blue = 1;
                let hexColor = '#ffffff';
                if (fxmaster != undefined) {
                    let filters = fxmaster.core_color;
                    if (filters != undefined){
                        if (filters.type == "color"){
                            hexColor = canvas.scene.getFlag("fxmaster", "filters").core_color.options.color.value;
                            const color = Color.from(hexColor).rgb
                            red = color[0];
                            green = color[1];
                            blue = color[2];
                            this.colorizeColor.red = red;
                            this.colorizeColor.green = green;
                            this.colorizeColor.blue = blue;
                        }
                    }
                }
                launchpad.setLED(95,'rgb',hexColor);
                launchpad.setLED(96,'rgb',hexColor,0,game.i18n.localize("MaterialKeys.Emulator.Clear"));
                launchpad.setLED(97,'rgb',hexColor);
    
                red = Math.ceil(red*8);
                green = Math.ceil(green*8);
                blue = Math.ceil(blue*8);
                if (red == 0) red = 1;
                if (green == 0) green = 1;
                if (blue == 0) blue = 1;
                
                for (let i=0; i<8; i++){
                    let color = i/8+0.125;
                    if (red <= i) 
                        color = 0;
                    let led = 15 + 10*i;
                    launchpad.setLED(led,'rgb', `#${this.componentToHex(color)}0000`);
    
                    color = i/8+0.125;
                    if (green <= i)
                        color = 0;
                    led = 16 + 10*i;
                    launchpad.setLED(led,'rgb', `#00${this.componentToHex(color)}00`);
        
                    color = i/8+0.125;
                    if (blue <= i)
                        color = 0;
                    led = 17 + 10*i;
                    launchpad.setLED(led,'rgb', `#0000${this.componentToHex(color)}`);
                }
    
                //Colorize effects
                const colorizeLedColor = [53,45,37,27,21,13,9,5];
                const colorizeLabel = ['Magenta','DBlue','LBlue','DGreen','LGreen','Yellow','Orange','Red'];
                for (let i=1; i<9; i++){
                    const state = (this.colorizeState == i) ? 'pulsing' : 'static';
                    const led = 10*i + 3;
                    const txt = game.i18n.localize(`MaterialKeys.Emulator.Colors.${colorizeLabel[i-1]}`)
                    launchpad.setLED(led,state,colorizeLedColor[i-1],0,txt);
                }
            }
            /*
            * Darkness
            */
            const darkness = Math.floor(7-compatibilityHandler('sceneDarkness')*7);
            const darknessColor = ['#080808','#3e3e3e','#939393','#7c7c7c','#9b9b9b','#bababa','#d9d9d9','#ffffff'];
            launchpad.setLED(91,'static',0,0,game.i18n.localize("MaterialKeys.Emulator.Darkness"));
            for (let i=0; i<8; i++){
                const txt = `${Math.ceil(i*100/7)}%`;
                let color = darknessColor[i];
                if (darkness < i) 
                    color = darknessColor[0];
                const led = 11 + 10*i;
                launchpad.setLED(led, 'rgb',color, 0, txt);
            }
        }

        else if (launchpad.keyMode == 51 && fxmasterEnabled){
            launchpad.setLED(49,'pulsing',87,0,game.i18n.localize("MaterialKeys.Emulator.Overlays"));
            launchpad.setLED(39,'flashing',72,0,game.i18n.localize("MaterialKeys.Emulator.WeatherFilters"));
            //Weather effects
            for (let i=0; i<11; i++)
                this.visualFxState[i] = false;
            const flags = canvas.scene.getFlag("fxmaster", "effects");
            if (flags) {
                const objKeys = Object.keys(flags);
                for (let i = 0; i < objKeys.length; ++i) {
                    const weather = CONFIG.fxmaster.particleEffects[flags[objKeys[i]].type];
                    if (weather == undefined) continue;
    
                    if (weather.name === 'AutumnLeavesParticleEffect') this.visualFxState[0] = true;
                    else if (weather.name === 'RainParticleEffect') this.visualFxState[1] = true;
                    else if (weather.name === 'SnowParticleEffect') this.visualFxState[2] = true;
                    else if (weather.name === 'SnowstormParticleEffect') this.visualFxState[3] = true;
                    else if (weather.name === 'BubblesParticleEffect') this.visualFxState[4] = true;
                    else if (weather.name === 'CloudsParticleEffect') this.visualFxState[5] = true;
                    else if (weather.name === 'EmbersParticleEffect') this.visualFxState[6] = true;
                    else if (weather.name === 'RainSimpleParticleEffect') this.visualFxState[7] = true;
                    else if (weather.name === 'StarsParticleEffect') this.visualFxState[8] = true;
                    else if (weather.name === 'CrowsParticleEffect') this.visualFxState[9] = true;
                    else if (weather.name === 'BatsParticleEffect') this.visualFxState[10] = true;
                    else if (weather.name === 'FogParticleEffect') this.visualFxState[11] = true;
                    else if (weather.name === 'RainTopParticleEffect') this.visualFxState[12] = true;
                }
            }
            
            //VisualFx leds
            const fxLedColor = [127,79,90,90,3,71,84,79,81,99,97,1,79];
            const weatherEffects = CONFIG.fxmaster.particleEffects;
            const weatherLabel = [weatherEffects.leaves.label,weatherEffects.rain.label,weatherEffects.snow.label,weatherEffects.snowstorm.label
                ,weatherEffects.bubbles.label,weatherEffects.clouds.label,weatherEffects.embers.label,weatherEffects.rainsimple.label,
                weatherEffects.stars.label,weatherEffects.crows.label,weatherEffects.bats.label,weatherEffects.fog.label,
                weatherEffects.raintop.label]
            let stopState = 'static';
            for (let i=0; i<13; i++){
                const state = this.visualFxState[i] ? 'pulsing' : 'static';
                if (state) stopState = 'pulsing';
                let led;
                if (i < 5) led = 71-10*i;
                else if (i < 9) led = 72-10*(i-5);
                else led = 73-10*(i-9);
                launchpad.setLED(led,state,fxLedColor[i],0,game.i18n.localize(weatherLabel[i]));
            }
            launchpad.setLED(11,stopState,72);
            launchpad.setLED(12,stopState,72,0,game.i18n.localize("MaterialKeys.Emulator.Clear"));
            launchpad.setLED(13,stopState,72);
            
            //Filters
            const fxmaster = canvas.scene.getFlag("fxmaster", "filters");
            if (fxmaster == undefined)
                for (let i=0; i<4; i++)
                    this.visualFxFilters[i] = false;
            else {
                const objKeys = Object.keys(fxmaster);
                for (let i=0; i<objKeys.length; i++){
                    if (objKeys[i] == "core_lightning") this.visualFxFilters[0] = true;
                    else if (objKeys[i] == "core_underwater") this.visualFxFilters[1] = true;
                    else if (objKeys[i] == "core_predator") this.visualFxFilters[2] = true;
                    else if (objKeys[i] == "core_oldfilm") this.visualFxFilters[3] = true;
                    else if (objKeys[i] == "core_bloom") this.visualFxFilters[4] = true;
                }
            }
            stopState = 'static';
            const filterLedColor = [3,79,71,1,3];
            const filterLabels = ["lightning", "underwater","predator","oldfilm","bloom"]
            for (let i=0; i<5; i++){
                let mode = 'static';
                if (this.visualFxFilters[i]) mode = 'pulsing';
                if (mode) stopState = 'pulsing';
                launchpad.setLED(75-10*i, mode, filterLedColor[i], 0, game.i18n.localize(CONFIG.fxmaster.filterEffects[filterLabels[i]].label));
            }
            launchpad.setLED(15,stopState,72,0,game.i18n.localize("MaterialKeys.Emulator.Clear"));

            launchpad.setLED(92,'static',0,0,game.i18n.localize("MaterialKeys.Emulator.WeatherEffects"));
            launchpad.setLED(95,'static',0,0,game.i18n.localize("MaterialKeys.Emulator.Filters"));
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

    async setColorize(){
        const colors = this.rgbToHex(this.colorizeColor.red,this.colorizeColor.green,this.colorizeColor.blue);

        const color = {
            core_color: {
                type: "color",
                options: {
                    color: {
                        value: colors,
                        apply: true
                    }
                }
            }
        }
        canvas.scene.setFlag("fxmaster", "filters", color);
    }

    componentToHex(c) {
        var hex = Math.ceil((255*c)).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      
      rgbToHex(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
      }
}
    
