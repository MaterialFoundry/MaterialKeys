
export class importConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = {};
        this.name = "";
        this.source = "";
        this.parent;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "materialKeys_import",
            title: "Material Keys: " + game.i18n.localize("MaterialKeys.ImportDialog.Title"),
            template: "./modules/MaterialKeys/templates/importDialog.html",
            width: 500,
            height: "auto"
        });
    }

    setData(source,parent) {
        this.source = source;
        this.name = source;
        this.parent = parent;
    }

    /**
     * Provide data to the template
     */
    getData() {
        return {
            source: this.source,
            name: this.name,
            content: this.source == "soundboard" ? game.i18n.localize("MaterialKeys.ImportDialog.SoundboardContent") : game.i18n.localize("MaterialKeys.ImportDialog.MacroboardContent")
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        await this.parent.updateSettings(this.data);
        this.parent.render(true);
    }

    activateListeners(html) {
        super.activateListeners(html);

        const upload = html.find("input[id='materialKeys_uploadJson']");

        upload.on('change',(event) => {
            event.preventDefault();
            this.readJsonFile(event.target.files[0]); 
        })
    }

    readJsonFile(jsonFile) {
        var reader = new FileReader(); 
        reader.addEventListener('load', (loadEvent) => { 
          try { 
            let json = JSON.parse(loadEvent.target.result); 
            this.data = json;
          } catch (error) { 
            console.error(error); 
          } 
        }); 
        reader.readAsText(jsonFile); 
    } 
}