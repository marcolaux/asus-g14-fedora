const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Popup = Me.imports.modules.popup;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;
const MessageTray = imports.ui.messageTray;
var Title = 'AsusNB Control';
var Button = class Button {
    constructor() {
        this.AsusNb_Indicator = new Lang.Class({
            Name: 'asus-nb-gex.indicator',
            Extends: PanelMenu.Button,
            _init: function () {
                this.parent(null, 'AsusNbPanel');
                this.add_actor(new St.Icon({ style_class: 'panel-icon' }));
                this.popupMenu = new Popup.Menu(this.menu);
            }
        });
    }
    create() {
        this.indicator = new this.AsusNb_Indicator();
        Main.panel.addToStatusArea('asus-nb-gex.panel', this.indicator, 1, Main.panel._rightBox);
        Main.panel.statusArea['asus-nb-gex.panel'].style_class = 'panel-icon white';
    }
    destroy() {
        if (this.indicator !== null) {
            this.indicator.destroy();
            this.indicator = null;
        }
    }
}
var Actions = class Actions {
    static notify(msg = Title, details, icon, panelIcon = "") {
        let source = new MessageTray.Source(msg, icon);
        Main.messageTray.add(source);
        let notification = new MessageTray.Notification(source, msg, details);
        notification.setTransient(true);
        source.showNotification(notification);
        if (panelIcon !== "")
            Main.panel.statusArea['asus-nb-gex.panel'].style_class = 'panel-icon ' + panelIcon;
    }
    static updateGfxMode(vendor, power) {
        Log.info(`(panel) new mode: ${vendor}:${power}`);
        let menuItems = Main.panel.statusArea['asus-nb-gex.panel'].menu._getMenuItems();
        menuItems.forEach((mi) => {
            if (mi.style_class.includes('gfx-mode')) {
                if (mi.style_class.includes(vendor)) {
                    mi.style_class = mi.style_class + ' active';
                    mi.label.set_text(mi.label.text + '  🗸');
                }
                else if (mi.style_class.includes('active')) {
                    mi.style_class = mi.style_class.split('active').join(' ');
                    mi.label.set_text(mi.label.text.substr(0, mi.label.text.length - 3));
                }
            }
        });
    }
}
//# sourceMappingURL=panel.js.map