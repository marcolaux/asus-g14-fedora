const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const Resources = Me.imports.modules.resources;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
var Profile = class Profile {
    constructor(xml) {
        this.sourceId = null;
        this.asusLinuxProxy = null;
        this.connected = false;
        this.lastState = '';
        this.profileDesc = new Array();
        this.profileIcons = {
            'boost': 'asusctl-gex-red',
            'normal': 'asusctl-gex-yellow',
            'silent': 'asusctl-gex-green'
        };
        this.profileColor = {
            'boost': 'red',
            'normal': 'yellow',
            'silent': 'green'
        };
        this.xml = Resources.File.DBus(xml);
    }
    getProfileNames() {
        if (this.connected) {
            try {
                return this.asusLinuxProxy.ProfileNamesSync();
            }
            catch (e) {
                Log.error(e);
            }
        }
    }
    setProfile(mode) {
        if (this.connected) {
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
                this.updateProfile(curActiveProfile);
            }
            catch (e) {
                Log.error(e);
            }
            finally {
                return this.connected ? GLib.SOURCE_CONTINUE : GLib.SOURCE_REMOVE;
            }
        }
        else {
            return GLib.SOURCE_REMOVE;
        }
    }
    updateProfile(curState) {
        if (curState !== '' && this.lastState !== curState) {
            let message = `${((this.lastState === '') ? 'initial' : 'changed')} profile: ${curState}`;
            Panel.Actions.updateMode('fan-mode', curState);
            if (this.lastState !== '') {
                Panel.Actions.notify(Panel.Title, message, this.profileIcons[curState], this.profileColor[curState]);
            }
            else {
                Main.panel.statusArea['asusctl-gex.panel'].style_class = `panel-icon ${this.profileColor[curState]}`;
            }
            this.lastState = curState;
        }
    }
    start() {
        Log.info(`Starting Profile DBus client...`);
        try {
            let _asusLinuxProxy = Gio.DBusProxy.makeProxyWrapper(this.xml);
            this.asusLinuxProxy = new _asusLinuxProxy(Gio.DBus.system, 'org.asuslinux.Daemon', '/org/asuslinux/Profile');
            this.connected = true;
            try {
                this.sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, this.poller.bind(this));
            }
            catch (e) {
                Log.error(e);
            }
        }
        catch (e) {
            Log.error(`Profile DBus initialization failed!`);
            Log.error(e);
        }
    }
    stop() {
        Log.info(`Stopping Profile DBus client...`);
        if (this.connected) {
            this.sourceId = null;
            this.connected = false;
            this.asusLinuxProxy = null;
            this.lastState = '';
        }
    }
}
//# sourceMappingURL=profile_dbus.js.map