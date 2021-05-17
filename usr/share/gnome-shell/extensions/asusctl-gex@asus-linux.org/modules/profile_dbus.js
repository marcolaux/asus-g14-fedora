const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const Resources = Me.imports.modules.resources;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
var Profile = class Profile {
    constructor(xml) {
        this.sourceId = null;
        this.asusLinuxProxy = null;
        this.connected = false;
        this.lastState = '';
        this.profileDesc = new Array();
        this.profileIcons = {
            'boost': 'rog-red',
            'normal': 'rog-yellow',
            'silent': 'rog-green'
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
                Log.error(`Profile DBus getting power profile names failed!`);
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
                Log.error(`Profile DBus set power profile failed!`);
                Log.error(e);
            }
        }
    }
    poller() {
        if (this.connected) {
            try {
                let curActiveProfile = this.asusLinuxProxy.ActiveProfileNameSync().toString().trim();
                if (curActiveProfile !== this.lastState) {
                    this.updateProfile(curActiveProfile);
                    this.lastState = curActiveProfile;
                }
            }
            catch (e) {
                Log.error(`Profile DBus getting current power profile name failed!`);
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
                Panel.Actions.notify(Panel.Title, message, this.profileColor[curState]);
            }
            ext.panelButton.indicator.style_class = `${ext.panelButton.indicator._defaultClasses} ${curState} ${ext.gfxMode.connector.gfxLabels[ext.gfxMode.connector.lastState]} ${ext.gfxMode.connector.powerLabel[ext.gfxMode.connector.lastStatePower]} ${ext.gfxMode.igpu}`;
            Log.info(ext.panelButton.indicator.style_class);
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
                Log.error(`Profile DBus Poller initialization failed!`);
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