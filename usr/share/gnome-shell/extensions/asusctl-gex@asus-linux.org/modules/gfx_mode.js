const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.gfx_mode_dbus;
const GLib = imports.gi.GLib;
var Client = class Client {
    constructor(panelButton = null) {
        this.panelButton = null;
        this.igpu = 'intel';
        this.connector = null;
        this.connected = false;
        this.panelButton = panelButton;
        try {
            this.connector = new DBus.GfxMode("org-asuslinux-gfx-3.0.0");
        }
        catch (e) {
            Log.error(`GfxMode client initialization failed!`);
            Log.error(e);
        }
    }
    getCurrentMode() {
        return this.connector.getCurrentMode();
    }
    getIGPU() {
        try {
            let isAMD = GLib.file_test('/sys/bus/pci/drivers/amdgpu', GLib.FileTest.EXISTS);
            Log.info(`integrated GPU: AMD`);
            this.igpu = isAMD ? 'amd' : 'intel';
            return this.igpu;
        }
        catch (e) {
            Log.info(`integrated GPU: Intel`);
            return 'intel';
        }
    }
    start() {
        Log.info(`Starting GfxMode client...`);
        try {
            this.connector.start();
            this.connected = true;
        }
        catch (e) {
            Log.error(`GfxMode client start failed!`);
            Log.error(e);
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