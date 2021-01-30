const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.gfx_mode_dbus;
var Client = class Client {
    constructor() {
        this.connector = null;
        this.connected = false;
        try {
            this.connector = new DBus.GfxMode("org-asuslinux-gfx-2.0.5");
        }
        catch {
            Log.error(`GfxMode client initialization failed!`);
        }
    }
    getCurrentMode() {
        return this.connector.getCurrentMode();
    }
    start() {
        Log.info(`Starting GfxMode client...`);
        try {
            this.connector.start();
            this.connected = true;
        }
        catch {
            Log.error(`GfxMode client start failed!`);
        }
    }
    stop() {
        Log.info(`Stopping GfxMode client...`);
        if (this.connected) {
            this.connected = false;
            this.connector.stop();
        }
    }
}
//# sourceMappingURL=gfx_mode.js.map