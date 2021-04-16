const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
function init() {
    Log.info(`initializing ${Me.metadata.name} Preferences`);
}
function buildPrefsWidget() {
    let prefsWidget = new Gtk.Label({
        label: `${Me.metadata.name} version ${Me.metadata.version}`,
        visible: true
    });
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
        let window = prefsWidget.get_toplevel();
        let headerBar = window.get_titlebar();
        headerBar.title = `${Me.metadata.name} Preferences`;
    });
    return prefsWidget;
}
//# sourceMappingURL=prefs.js.map