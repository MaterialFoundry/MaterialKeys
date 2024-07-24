import { getColor } from "../misc.js";
import { launchpad } from "../../MaterialKeys.js";
import { compatibilityHandler } from "../compatibilityHandler.js";

let emulator;
let blinkArray = [];
let fadeArray = [];

export async function newEmulator() {
    emulator = await new emulatorForm();
    await emulator.render(true);
    launchpad.setMode(launchpad.keyMode,false);
    setTimeout(function() {launchpad.updateLEDs(); }, 100);
    setInterval(function() {setEmulatorBlink() }, 250);
    setInterval(function() {setEmulatorFade() }, 40);
}

export function setEmulatorLED(led,mode,color,color2,name,color3) {
    if (led % 10 == 0) return;
    const emulatorElement = document.getElementById('materialKeys_emulator');
    if (emulatorElement == undefined) return;
    let btn = document.getElementById(`materialKeys_emulator_mainKeys-${led}`);
    if (btn == undefined || btn == null) return
    const newColor = (mode == 'rgb') ? color : getColor(color);

    if (mode == 'flashing') blinkArray[led] = {
        element: btn,
        state: 0,
        color1: getColor(color),
        color2: getColor(color2)
    }
    else blinkArray[led] = undefined;

    if (mode == 'pulsing' && color != 0) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(getColor(color));
        fadeArray[led] = {
            element: btn,
            state: 0,
            count: 0,
            red: parseInt(result[1], 16),
            green: parseInt(result[2], 16),
            blue: parseInt(result[3], 16)
        }
    }
    else fadeArray[led] = undefined;

    btn.style.backgroundColor = newColor;
    btn.innerHTML=name;
}

function setEmulatorBlink() {
    for (let i=0; i<blinkArray.length; i++) {
        const e = blinkArray[i];
        if (e == undefined) continue;
        if (e.state == 0) {
            e.state = 1;
            e.element.style.backgroundColor = e.color1;
        }
        else {
            e.state = 0;
            e.element.style.backgroundColor = e.color2;
        }
    }
}

function setEmulatorFade() {
    for (let i=0; i<fadeArray.length; i++) {
        const e = fadeArray[i];
        if (e == undefined) continue;
        const color = `rgb(${e.count*e.red/30+63} ${e.count*e.green/30+63} ${e.count*e.blue/30+63})`;
        if (e.state) {
            e.count--;
            if (e.count <= 0) e.state = 0;
        }
        else {
            e.count++;
            if (e.count >= 20) e.state = 1;
        }
        e.element.style.backgroundColor = color;
    }
}

class emulatorForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    static get defaultOptions() {
        return compatibilityHandler('mergeObject', super.defaultOptions, {
            id: "materialKeys_emulator",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Emulator.Title"),
            template: "./modules/MaterialKeys/templates/emulator.html",
            classes: ["sheet"]
        });
    }

    getData() {
        let keys = [];

        for (let i=9; i>0; i--) {
            let row = [];
            for (let j=1; j<11; j++) {
                let background = ((i == 9 || j == 9)) ? '#000000' : '#666666';
                const visible = (i==9 && j ==9) ? 'hidden' : 'visible';
                let cls = "materialKeys_emulator_mainKeys";
                let name = '';
                let color = '#3f3f3f';
                if (j == 10) {
                    if (i == 8)         name = game.i18n.localize("MaterialKeys.Emulator.Soundboard");
                    else if (i == 7)    name = game.i18n.localize("MaterialKeys.Emulator.Playlist");
                    else if (i == 6)    name = game.i18n.localize("MaterialKeys.Emulator.Volume");
                    else if (i == 5)    name = game.i18n.localize("MaterialKeys.Emulator.Visual");
                    else if (i == 4)    name = game.i18n.localize("MaterialKeys.Emulator.Combat");
                    else if (i == 3)    name = game.i18n.localize("MaterialKeys.Emulator.Token");
                    else if (i == 2)    name = game.i18n.localize("MaterialKeys.Emulator.Macro");
                    else if (i == 1)    name = game.i18n.localize("MaterialKeys.Emulator.Soundscape");
                    cls = 'materialKeys_emulator_catLabel';
                    background = '#000000';
                    color = '#000000';
                }
                row.push({
                    iteration: 10*i+j,
                    name,
                    color,
                    visible,
                    background,
                    cls
                });
            }
            keys.push({row:row});
        }
        
        return {
            keys
        } 
    }

    async activateListeners(html) {
        super.activateListeners(html);
        const mainKeys = html.find("button[name='mainKeys']");

        mainKeys.on('click',(event) => {
            let id = event.target.id.replace('materialKeys_emulator_mainKeys-','');
            launchpad.keypress({button:id,state:1});
        });
    }
}