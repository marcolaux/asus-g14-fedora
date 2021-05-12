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
        this.gfxLabels = {
            1: 'integrated',
            2: 'compute',
            3: 'vfio',
            4: 'hybrid',
            0: 'nvidia'
        };
        this.powerLabel = {
            0: 'suspended',
            1: 'active',
            2: 'off'
        };
        this.userAction = {
            0: 'logout',
            1: 'reboot',
            2: 'none'
        };
        this.xml = Resources.File.DBus(xml);
    }
    getGfxMode() {
        let currentMode = false;
        if (this.connected) {
            try {
                currentMode = this.asusLinuxProxy.VendorSync();
            }
            catch (e) {
                Log.error('Graphics Mode DBus: get current mode failed!');
                Log.error(e);
            }
        }
        return currentMode;
    }
    setGfxMode(mode) {
        let newMode = false;
        if (this.connected) {
            try {
                newMode = this.asusLinuxProxy.SetVendorSync(mode);
            }
            catch (e) {
                Log.error('Graphics Mode DBus switching failed!');
                Log.error(e);
            }
        }
        return newMode;
    }
    start() {
        Log.info(`Starting Graphics Mode DBus client...`);
        try {
            let _asusLinuxProxy = Gio.DBusProxy.makeProxyWrapper(this.xml);
            this.asusLinuxProxy = new _asusLinuxProxy(Gio.DBus.system, 'org.asuslinux.Daemon', '/org/asuslinux/Gfx');
            this.connected = true;
        }
        catch (e) {
            Log.error('Graphics Mode DBus initialization failed!');
            Log.error(e);
        }
        if (this.connected) {
            let vendor = this.asusLinuxProxy.VendorSync().toString().trim();
            let power = this.asusLinuxProxy.PowerSync().toString().trim();
            Log.info(`Initial Graphics Mode is ${this.gfxLabels[vendor]}. Power State at the moment is ${this.powerLabel[power]} (this can change on hybrid and compute mode)`);
            try {
                Panel.Actions.updateMode('gfx-mode', vendor, power);
            }
            catch (e) {
                Log.error(`Update Panel Graphics mode failed!`);
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