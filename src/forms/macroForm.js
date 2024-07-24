import {moduleName,enableModule,launchpad,macroBoard} from "../../MaterialKeys.js";
import {getColor} from "../misc.js";
import {exportConfigForm} from "./exportForm.js";
import {importConfigForm} from "./importForm.js";
import { compatibilityHandler } from "../compatibilityHandler.js";

export class macroConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
        this.page = 0;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return compatibilityHandler('mergeObject', super.defaultOptions, {
            id: "materialKeys_macroConfig",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.MacroConfig"),
            template: "./modules/MaterialKeys/templates/macroConfig.html",
            classes: ["sheet"]
        });
    }
    
    /**
     * Provide data to the template
     */
    getData() {
        let settings = game.settings.get(moduleName,'macroSettings');
        if (settings.macros == undefined) settings.macros = [];
        if (settings.color == undefined) settings.color = [];
        if (settings.args == undefined) settings.args = [];

        let height = 145;
        let iteration = this.page*32;
        let macroData = [];

        for (let j=0; j<4; j++){
            let macroThis = [];
      
            for (let i=0; i<8; i++){
                if (settings.color[iteration] == undefined) settings.color[iteration] = 0;
                const dataThis = {
                    iteration: iteration+1,
                    macro: settings.macros[iteration],
                    color: settings.color[iteration],
                    colorRGB: getColor(settings.color[iteration]),
                    args: settings.args[iteration]
                }
                macroThis.push(dataThis);
                iteration++;
            }
            const data = {
                dataThis: macroThis,
            };
            macroData.push(data);
        }
       
        return {
            height: height,
            macros: game.macros,
            macroData: macroData,
            macroRange: `${this.page*32 + 1} - ${this.page*32 + 32}`,
            prevDisabled: this.page == 0 ? 'disabled' : '',
            totalMacros: Math.max(Math.ceil(settings.macros.length/32)*32, this.page*32 + 32)
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
       await game.settings.set(moduleName,'macroSettings',{
            macros: formData["macros"],
            color: formData["color"]
       });

        await game.settings.set(moduleName,'macroArgs', formData["args"]);
       
       launchpad.setMode(launchpad.keyMode,false);
       macroBoard.update();
    }

    activateListeners(html) {
        super.activateListeners(html);
        const navNext = html.find("button[id='materialKeys_navNext']");
        const navPrev = html.find("button[id='materialKeys_navPrev']");
        const clearAll = html.find("button[id='materialKeys_clearAll']");
        const clearPage = html.find("button[id='materialKeys_clearPage']");
        const importBtn = html.find("button[id='materialKeys_import']");
        const exportBtn = html.find("button[id='materialKeys_export']");
        const macro = html.find("select[name='macros']");
        const args = html.find("input[name='args']");
        const colorPicker = html.find("button[name='colorPicker']");
        const colorPickerNr = html.find("input[name='color']");

        importBtn.on('click', async(event) => {
            let importDialog = new importConfigForm();
            importDialog.setData('macroboard',this)
            importDialog.render(true);
        });

        exportBtn.on('click', async(event) => {
            const settings = game.settings.get(moduleName,'macroSettings');
            let exportDialog = new exportConfigForm();
            exportDialog.setData(settings,'macroboard')
            exportDialog.render(true);
        });

        navNext.on('click',async (event) => {
            if (this.page < 7) this.page++;
            this.render(true);
        });
        navPrev.on('click',async (event) => {
            this.page--;
            if (this.page < 0) this.page = 0;
            else {
                const totalMacros = game.settings.get('MaterialKeys','macroSettings').macros.length;
                if ((this.page + 2)*32 == totalMacros) {
                    let pageEmpty = this.getPageEmpty(totalMacros-32);
                    if (pageEmpty) {
                        await this.clearPage(totalMacros-32,true)
                    }
                }
            }
            this.render(true);
        });

        clearAll.on('click',async (event) => {
            const parent = this;

            let d = new Dialog({
                title: game.i18n.localize("MaterialKeys.ClearAll"),
                content: game.i18n.localize("MaterialKeys.ClearAll_Content"),
                buttons: {
                    continue: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("MaterialKeys.Continue"),
                    callback: async () => {
                        this.page = 0;
                        await parent.clearAllSettings();
                        parent.render(true);
                    }
                    },
                    cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("MaterialKeys.Cancel")
                    }
                },
                default: "cancel"
            });
            d.render(true);
        })

        clearPage.on('click',(event) => {
            const parent = this;

            let d = new Dialog({
                title: game.i18n.localize("MaterialKeys.ClearPage"),
                content: game.i18n.localize("MaterialKeys.ClearPage_Content"),
                buttons: {
                    continue: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("MaterialKeys.Continue"),
                    callback: async () => {
                        await parent.clearPage(parent.page*32)
                        parent.render(true);
                    }
                    },
                    cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("MaterialKeys.Cancel")
                    }
                },
                default: "cancel"
            });
            d.render(true);
        })

        macro.on("change", event => {
            let id = event.target.id.replace('materialKeys_macros','');
            let settings = game.settings.get(moduleName,'macroSettings');
            if (settings.macros == undefined) settings.macros = [];
            settings.macros[id-1]=event.target.value;
            this.updateSettings(settings);
        });

        args.on("change", event => {
            let id = event.target.id.replace('materialKeys_args','');
            let settings = game.settings.get(moduleName,'macroSettings');
            let args = settings.args;
            if (args == undefined) args = [];
            args[id-1]=event.target.value;
            settings.args = args;
            this.updateSettings(settings);
        });

        colorPicker.on('click',(event) => {
            const target = event.currentTarget.value;
            let color = document.getElementById("materialKeys_color"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            launchpad.colorPicker(target,0,color);
        });

        colorPickerNr.on('change',(event) => {
            let id = event.target.id.replace('materialKeys_color','')-1;
            let j = Math.floor(id/8);
            let i = id % 8;
            let settings = game.settings.get(moduleName,'macroSettings');
            settings.color[id]=event.target.value;
            this.updateSettings(settings,true);
        });
    }

    async updateSettings(settings,render=false){
        if (settings == 'clear'){
            let color = [];
            let args = [];
            let macros = [];
            for (let i=0; i<64; i++){
                color[i] = 0;
                args[i] = "";
                macros[i] = "none";
            }
            settings = {
                color: color,
                args: args,
                macros: macros
            };
        }
        await game.settings.set(moduleName,'macroSettings',settings);
        if (enableModule) macroBoard.update();
        if (render) this.render();
    }

    getPageEmpty(pageStart) {
        const settings = game.settings.get(moduleName,'macroSettings');
        let pageEmpty = true;
        for (let i=pageStart; i<pageStart+32; i++) {
            if (settings.macros[i] != undefined && settings.macros[i] != null && settings.macros[i] != "") {
                pageEmpty = false;
                break;
            }
        }
        return pageEmpty;
    }

    async clearPage(pageStart,remove=false) {
        const settings = game.settings.get(moduleName,'macroSettings');
        if (remove) {
            await settings.macros.splice(pageStart,32);
            await settings.color.splice(pageStart,32);
            if (settings.args != undefined) await settings.args.splice(pageStart,32);
        }
        else {
            for (let i=pageStart; i<pageStart+32; i++) {
                settings.macros[i] = null;
                settings.color[i] = 0;
                if (settings.args != undefined) settings.args[i] = null;
            }
        }
        await this.updateSettings(settings);
    }

    async clearAllSettings() {
        let settings = {
            macros: [],
            color: [],
            args: []
        };
        for (let i=0; i<32; i++) {
            settings.macros[i] = null;
            settings.color[i] = 0;
            settings.args[i] = null;
        }
        await this.updateSettings(settings);
    }
}