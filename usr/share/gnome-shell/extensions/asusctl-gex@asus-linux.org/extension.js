const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PM = imports.ui.popupMenu;
const Log = Me.imports.modules.log;
const Profile = Me.imports.modules.profile;
const GfxMode = Me.imports.modules.gfx_mode;
const Panel = Me.imports.modules.panel;
var Extension = class Extension {
    constructor() {
        Log.info(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
        this.panelButton = new Panel.Button();
        this.profile = new Profile.Client();
        this.gfxMode = new GfxMode.Client();
    }
    enable() {
        Log.info(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
        this.panelButton.create();
        this.profile.start();
        this.gfxMode.start();
        if (this.profile.connected) {
            let menu = Main.panel.statusArea['asusctl-gex.panel'].menu;
            let menuItems = menu._getMenuItems();
            menuItems.forEach((mi) => {
                if (mi.style_class.includes('fan-mode') && mi.style_class.includes('none')) {
                    mi.destroy();
                    Log.info('Available Power Profiles: ' + this.profile.connector.profileDesc.toString());
                    if (this.profile.connector.profileDesc.length > 0) {
                        let menuItems = {};
                        this.profile.connector.profileDesc.forEach((el) => {
                            menuItems[el] = new PM.PopupMenuItem(el, { style_class: `${el} callmode-${el} fan-mode` });
                        });
                        for (const item in menuItems) {
                            menu.addMenuItem(menuItems[item]);
                            menuItems[item].connect('activate', () => { this.profile.connector.setProfile(item); });
                        }
                    }
                }
            });
        }
        if (this.gfxMode.connected) {
            let iGPU = this.gfxMode.getIGPU();
            let menu = Main.panel.statusArea['asusctl-gex.panel'].menu;
            let menuItems = menu._getMenuItems();
            menuItems.forEach((mi) => {
                if (mi.style_class.includes('gfx-mode') && mi.style_class.includes('none')) {
                    mi.destroy();
                    let vendor = this.gfxMode.connector.getGfxMode();
                    Log.info(`Current Graphics Mode is ${this.gfxMode.connector.gfxLabels[vendor]}`);
                    let menuItems = {};
                    for (const key in this.gfxMode.connector.gfxLabels) {
                        menuItems[key] = new PM.PopupMenuItem(this.gfxMode.connector.gfxLabels[key], { style_class: this.gfxMode.connector.gfxLabels[key] + ' gfx-mode ' + iGPU });
                    }
                    let position = 1;
                    for (const item in menuItems) {
                        if (item == vendor) {
                            menuItems[item].style_class = `${menuItems[item].style_class} active`;
                            menuItems[item].label.set_text(`${menuItems[item].label.text}  ✔`);
                        }
                        menu.addMenuItem(menuItems[item], position);
                        menuItems[item].connect('activate', () => {
                            this.gfxMode.connector.setGfxMode(item);
                        });
                        position++;
                    }
                    let gpuPowerItem = new PM.PopupMenuItem('dedicated GPU: on', { style_class: 'gpupower on' });
                    menu.addMenuItem(gpuPowerItem, 1);
                }
            });
        }
    }
    disable() {
        Log.info(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
        this.profile.stop();
        this.gfxMode.stop();
        this.panelButton.destroy();
    }
}
function init() {
    ext = new Extension();
    return ext;
}
//# sourceMappingURL=extension.js.map