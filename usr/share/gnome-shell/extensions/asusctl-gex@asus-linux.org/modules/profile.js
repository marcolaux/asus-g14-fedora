const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.profile_dbus;
var Client = class Client {
    constructor() {
        this.connector = null;
        this.connected = false;
        try {
            this.connector = new DBus.Profile("org-asuslinux-profile-3.0.0");
        }
        catch (e) {
            Log.error(`Profile client initialization failed!`);
            Log.error(e);
        }
    }
    start() {
        Log.info(`Starting Profile client...`);
        try {
            this.connector.start();
            let profileNames = this.connector.getProfileNames();
            this.connector.profileDesc = profileNames.toString().split(',');
            this.connected = true;
        }
        catch (e) {
            Log.error(`Profile start failed!`);
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