const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const Resources = Me.imports.modules.resources;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
var GfxMode = class GfxMode {
    constructor(xml) {
        this.asusLinuxProxy = null;
        this.connected = false;
        this.lastState = '';
        this.xml = Resources.File.DBus(xml);
    }
    getGfxMode() {
        if (this.connected)
            return `${this.asusLinuxProxy.VendorSync()}`;
    }
    setGfxMode(mode) {
        if (this.connected)
            Log.info('setting ' + mode);
        return `${this.asusLinuxProxy.SetVendorSync(mode)}`;
    }
    start() {
        Log.info(`Starting GfxMode DBus client...`);
        try {
            let _asusLinuxProxy = Gio.DBusProxy.makeProxyWrapper(this.xml);
            this.asusLinuxProxy = new _asusLinuxProxy(Gio.DBus.system, "org.asuslinux.Daemon", "/org/asuslinux/Gfx");
            this.connected = true;
        }
        catch {
            Log.error("GfxMode DBus initialization failed!");
        }
        if (this.connected) {
            let vendor = this.asusLinuxProxy.VendorSync().toString().trim();
            let power = this.asusLinuxProxy.PowerSync().toString().trim();
            Log.info(`Initial GfxMode is ${vendor} ${power}`);
            try {
                Panel.Actions.updateGfxMode(vendor, power);
            }
            catch (e) {
                Log.error(e);
            }
            this.asusLinuxProxy.connectSignal("NotifyAction", (proxy_ = null, name_, value) => {
                if (proxy_) {
                    Log.info(`[dbus${name_}]: The GfxMode changed, new GfxMode is ${value}`);
                    this.lastState = value;
                    let msg = `The GfxMode changed, new GfxMode is ${value}`;
                    if (value == 'reboot') {
                        msg = 'The GfxMode changed, please reboot to apply the changes.';
                    }
                    else if (value == 'restartx') {
                        msg = 'The GfxMode changed, please restart your display manager to apply the changes.';
                    }
                    Panel.Actions.notify(Panel.Title, msg, 'system-reboot-symbolic', value);
                    Main.panel.statusArea['asus-nb-gex.panel'].style_class = 'panel-icon ' + value;
                }
            });
        }
    }
    stop() {
        Log.info(`Stopping GfxMode DBus client...`);
        if (this.connected) {
            this.connected = false;
            this.asusLinuxProxy = null;
        }
    }
}
//# sourceMappingURL=gfx_mode_dbus.js.map