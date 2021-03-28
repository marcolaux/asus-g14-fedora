const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Popup = Me.imports.modules.popup;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;
const MessageTray = imports.ui.messageTray;
const GLib = imports.gi.GLib;
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
    static spawnCommandLine(command) {
        try {
            GLib.spawn_command_line_async(command);
        }
        catch (e) {
            Log.error(e);
        }
    }
    static notify(msg = Title, details, icon, panelIcon = "", action = "") {
        let source = new MessageTray.Source(msg, icon);
        Main.messageTray.add(source);
        let notification = new MessageTray.Notification(source, msg, details);
        notification.setTransient(true);
        if (action == 'reboot') {
            notification.addAction('Reboot Now!', () => { this.spawnCommandLine('systemctl reboot'); });
        }
        else if (action == 'logout') {
            notification.addAction('Log Out Now!', () => { this.spawnCommandLine('gnome-session-quit'); });
        }
        source.showNotification(notification);
        if (panelIcon !== "")
            Main.panel.statusArea['asus-nb-gex.panel'].style_class = 'panel-icon ' + panelIcon;
    }
    static updateMode(selector, vendor, value = '') {
        Log.info(`(panel) new ${selector} mode: ${vendor}:${value}`);
        let menuItems = Main.panel.statusArea['asus-nb-gex.panel'].menu._getMenuItems();
        menuItems.forEach((mi) => {
            if (mi.style_class.includes(selector)) {
                if (mi.style_class.includes(vendor)) {
                    mi.style_class = mi.style_class + ' active';
                    mi.label.set_text(mi.label.text + '  ✔');
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