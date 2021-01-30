const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const ProfileBase = Me.imports.modules.profile;
const ByteArray = imports.byteArray;
const GLib = imports.gi.GLib;
var Profile = class Profile {
    constructor() {
        this.sourceId = null;
        this.enabled = false;
        this.lastState = -1;
    }
    poller() {
        try {
            let curState = parseInt(ByteArray.toString(GLib.file_get_contents("/sys/devices/platform/asus-nb-wmi/throttle_thermal_policy")[1]), 10);
            if (curState !== undefined && !isNaN(curState) && this.lastState !== curState) {
                let message = ((this.lastState === -1) ? 'initial' : 'changed') + ' fan-mode: ' + ProfileBase.ProfileDescr[curState];
                this.lastState = curState;
                Panel.Actions.notify(Panel.Title, message, ProfileBase.ProfileIcons[curState], ProfileBase.ProfileColor[curState]);
            }
        }
        finally {
            return this.enabled ? GLib.SOURCE_CONTINUE : false;
        }
    }
    start() {
        Log.info(`Starting Poller client...`);
        try {
            this.sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, this.poller.bind(this));
            this.enabled = true;
        }
        catch {
            Log.error(`Poller client start() failed!`);
        }
    }
    stop() {
        Log.info(`Stopping Poller client...`);
        try {
            this.enabled = false;
            if (this.sourceId !== null) {
            }
        }
        catch {
            Log.error(`Poller client stop() failed!`);
        }
    }
}
//# sourceMappingURL=profile_poller.js.map