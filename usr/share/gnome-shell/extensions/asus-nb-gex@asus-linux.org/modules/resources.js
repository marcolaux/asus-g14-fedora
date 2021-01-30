const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const GLib = imports.gi.GLib;
var File = class File {
    static DBus(name) {
        let file = `${Me.path}/resources/dbus/${name}.xml`;
        try {
            let [_ok, bytes] = GLib.file_get_contents(file);
            if (!_ok)
                Log.warn(`Couldn't read contents of "${file}"`);
            return _ok ? imports.byteArray.toString(bytes) : null;
        }
        catch (e) {
            Log.error(`Failed to load "${file}"`);
        }
    }
}
//# sourceMappingURL=resources.js.map