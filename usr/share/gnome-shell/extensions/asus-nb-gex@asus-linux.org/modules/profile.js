const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.profile_dbus;
var ProfileColor = ['yellow', 'red', 'green', 'blue', 'orange', 'white', 'reboot', 'restartx'];
var ProfileDescr = ['normal', 'boost', 'silent', '_1', '_2', '_3'];
var ProfileIcons = ['asus_notif_yellow', 'asus_notif_red', 'asus_notif_green', '_1', '_2', '_3'];
var Client = class Client {
    constructor() {
        this.connector = null;
        this.connected = false;
        try {
            this.connector = new DBus.Profile("org-asuslinux-profile-2.0.5");
        }
        catch {
            Log.error(`Profile client initialization failed!`);
        }
    }
    start() {
        Log.info(`Starting Profile client...`);
        try {
            this.connector.start();
            this.connected = true;
        }
        catch (e) {
            Log.error(e);
        }
    }
    stop() {
        Log.info(`Stopping Profile client...`);
        if (this.connected) {
            this.connected = false;
            this.connector.stop();
        }
    }
}
//# sourceMappingURL=profile.js.map