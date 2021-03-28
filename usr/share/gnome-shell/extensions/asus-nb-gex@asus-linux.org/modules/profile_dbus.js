const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const ProfileBase = Me.imports.modules.profile;
const Resources = Me.imports.modules.resources;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const ByteArray = imports.byteArray;
var Profile = class Profile {
    constructor(xml) {
        this.sourceId = null;
        this.enabled = false;
        this.asusLinuxProxy = null;
        this.connected = false;
        this.lastState = -1;
        this.xml = Resources.File.DBus(xml);
    }
    setProfile(mode) {
        if (this.connected) {
            Log.error(mode);
            try {
                GLib.spawn_command_line_async(`asusctl profile ${mode}`);
            }
            catch (e) {
                Log.error(e);
            }
        }
    }
    poller() {
        if (this.connected) {
            try {
                let curActiveProfile = this.asusLinuxProxy.ActiveProfileNameSync().toString().trim();
                let curState = ProfileBase.ProfileDescr.indexOf(`${curActiveProfile}`);
                this.updateProfile(curState);
            }
            catch (e) {
                Log.error(e);
            }
            finally {
                return this.enabled ? GLib.SOURCE_CONTINUE : GLib.SOURCE_REMOVE;
            }
        }
        else {
            return GLib.SOURCE_REMOVE;
        }
    }
    updateProfile(curState) {
        if (curState !== -1 && this.lastState !== curState) {
            let curActiveProfileName = ProfileBase.ProfileDescr[curState];
            let message = ((this.lastState === -1) ? 'initial' : 'changed') + ' profile: ' + ProfileBase.ProfileDescr[curState];
            Panel.Actions.updateMode('fan-mode', curActiveProfileName);
            if (this.lastState !== -1) {
                Panel.Actions.notify(Panel.Title, message, ProfileBase.ProfileIcons[curState], ProfileBase.ProfileColor[curState]);
            }
            else {
                Main.panel.statusArea['asus-nb-gex.panel'].style_class = 'panel-icon ' + ProfileBase.ProfileColor[curState];
            }
            this.lastState = curState;
        }
    }
    start() {
        Log.info(`Starting Profile DBus client...`);
        try {
            let _asusLinuxProxy = Gio.DBusProxy.makeProxyWrapper(this.xml);
            this.asusLinuxProxy = new _asusLinuxProxy(Gio.DBus.system, "org.asuslinux.Daemon", "/org/asuslinux/Profile");
            this.connected = true;
            this.enabled = true;
            try {
                this.sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, this.poller.bind(this));
            }
            catch (e) {
                Log.error(e);
            }
        }
        catch (e) {
            Log.error("Profile DBus initialization failed!");
            Log.error(e);
            Log.info(`Starting Profile file watcher (workaround)...`);
            let lockFile = '/sys/devices/platform/asus-nb-wmi/throttle_thermal_policy';
            try {
                this.lockMonitor = Gio.File.new_for_path(lockFile);
                this.lock = this.lockMonitor.monitor_file(Gio.FileMonitorFlags.NONE, null);
                if (this.lockMonitor.query_exists(null)) {
                    this.updateProfile(parseInt(ByteArray.toString(GLib.file_get_contents(lockFile)[1]), 10));
                }
                this.enabled = true;
            }
            catch (e) {
                Log.error(e);
            }
        }
    }
    stop() {
        Log.info(`Stopping Profile DBus client...`);
        this.enabled = false;
        if (this.connected) {
            this.sourceId = null;
            this.connected = false;
            this.asusLinuxProxy = null;
            this.lastState = -1;
        }
    }
}
//# sourceMappingURL=profile_dbus.js.map