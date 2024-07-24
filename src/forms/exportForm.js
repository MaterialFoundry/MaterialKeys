
import { compatibilityHandler } from "../compatibilityHandler.js";

export class exportConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = {};
        this.name = "";
        this.source = "";
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return compatibilityHandler('mergeObject', super.defaultOptions, {
            id: "materialKeys_export",
            title: "Material Keys: " + game.i18n.localize("MaterialKeys.ExportDialog.Title"),
            template: "./modules/MaterialKeys/templates/exportDialog.html",
            width: 500,
            height: "auto"
        });
    }

    setData(data,source) {
        this.data = data;
        this.source = source;
        this.name = source;
    }

    /**
     * Provide data to the template
     */
    getData() {
        return {
            source: this.source,
            name: this.name,
            content: this.source == "soundboard" ? game.i18n.localize("MaterialKeys.ExportDialog.SoundboardContent") : game.i18n.localize("MaterialKeys.ExportDialog.MacroboardContent")
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        this.download(this.data,formData.name)
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    download(data,name) {
        let dataStr = JSON.stringify(data);
        let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        let exportFileDefaultName = `${name}.json`;
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}