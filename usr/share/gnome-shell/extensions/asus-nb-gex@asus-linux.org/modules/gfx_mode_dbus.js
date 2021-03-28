const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const Resources = Me.imports.modules.resources;
const Gio = imports.gi.Gio;
var GfxMode = class GfxMode {
    constructor(xml) {
        this.asusLinuxProxy = null;
        this.connected = false;
        this.lastState = '';
        this.userAction = {
            0: 'logout',
            1: 'reboot',
            2: 'none'
        };
        this.xml = Resources.File.DBus(xml);
    }
    getGfxMode() {
        if (this.connected)
            return `${this.asusLinuxProxy.VendorSync()}`;
    }
    setGfxMode(mode) {
        if (this.connected)
            Log.info('setting ' + mode);
        return this.asusLinuxProxy.SetVendorSync(mode);
    }
    start() {
        Log.info(`Starting Graphics Mode DBus client...`);
        try {
            let _asusLinuxProxy = Gio.DBusProxy.makeProxyWrapper(this.xml);
            this.asusLinuxProxy = new _asusLinuxProxy(Gio.DBus.system, "org.asuslinux.Daemon", "/org/asuslinux/Gfx");
            this.connected = true;
        }
        catch (e) {
            Log.error("Graphics Mode DBus initialization failed!");
            Log.error(e);
        }
        if (this.connected) {
            let vendor = this.asusLinuxProxy.VendorSync().toString().trim();
            let power = this.asusLinuxProxy.PowerSync().toString().trim();
            Log.info(`Initial Graphics Mode is ${vendor} ${power}`);
            try {
                Panel.Actions.updateMode('gfx-mode', vendor, power);
            }
            catch (e) {
                Log.error(e);
            }
            this.asusLinuxProxy.connectSignal("NotifyAction", (proxy_ = null, name_, value) => {
                if (proxy_) {
                    Log.info(`[dbus${name_}]: The Graphics Mode has changed.`);
                    let msg = `The Graphics Mode has changed.`;
                    if (value !== 2) {
                        msg = `The Graphics Mode has changed. Please ${this.userAction[value]} to apply the changes.`;
                    }
                    Panel.Actions.notify(Panel.Title, msg, 'system-reboot-symbolic', this.userAction[value], this.userAction[value]);
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