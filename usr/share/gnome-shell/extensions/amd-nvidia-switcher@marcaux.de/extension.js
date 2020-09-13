/*
 * This file is part of AMD Nvidia Indicator Gnome Shell Extension.
 *
 * Bumblebee Indicator Gnome Shell Extension is free software; you can
 * redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 * Author: Marco Laux <contact@marcaux.de>
 *
 */

const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;

const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Local = ExtensionUtils.getCurrentExtension();

function ExtensionController(extensionMeta) {
    return {
        extension: new indicator(extensionMeta),

        enable: function() {
            this.extension.enable();
        },

        disable: function() {
            this.extension.disable();
        }
    }
}

function indicator(extensionMeta) {
    this._init(extensionMeta);
}

indicator.prototype = {
    _init: function(extensionMeta) {
        // let provider = new Gtk.CssProvider();
        // provider.load_from_resource(`${this.resource_base_path}/styles.css`);
        // Gtk.StyleContext.add_provider_for_screen(
        //     Gdk.Screen.get_default(),
        //     provider,
        //     Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        // );

        let activeIcon = this._getIcon(extensionMeta.path + '/images/nvidia.svg');
        let unactiveIcon  = this._getIcon(extensionMeta.path + '/images/amd.svg');
        this._icons = [unactiveIcon, activeIcon];

        let lockFile = '/etc/asus_nvidia';
        this._lockMonitor = Gio.File.new_for_path(lockFile);
        this._lock = this._lockMonitor.monitor_file(Gio.FileMonitorFlags.NONE, null);

        this.button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: true,
                          track_hover: true });
        this.button.set_child(this._icons[0]);

		this.button.connect('button-press-event', this._callScript);
		
        if (this._lockMonitor.query_exists(null)){
        	this._setButtonIcon(true);
        }
    },

	_callScript: function(lockfile){
        // GLib.spawn_command_line_sync( "systemctl start asusgpuswitch.service" );
        let subprocess = new Gio.Subprocess({
            argv: 'systemctl start asusgpuswitch.service'.split(' '),
            flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
        });

        subprocess.init(null);
        subprocess.communicate_utf8_async(null, null, function(source, resource) {
            let status = source.get_exit_status(),
                [, stdout, stderr] = source.communicate_utf8_finish(resource);

            if (typeof callback === 'function')
                callback.call(this, {
                    status: status,
                    stdin: command,
                    stdout: stdout,
                    stderr: stderr,
                });
        }.bind(this));
		return 0;
	},

    _getIcon: function(path) {
        let gicon = Gio.Icon.new_for_string(path);
        return new St.Icon({ gicon: gicon, style_class: 'system-status-icon' });
    },

    _statusChanged: function(monitor, a_file, other_file, event_type) {
        if (event_type == Gio.FileMonitorEvent.CREATED) {
            this._setButtonIcon(true);
        } else if (event_type ==  Gio.FileMonitorEvent.DELETED) {
            this._setButtonIcon(false);
        }
    },

    _setButtonIcon: function(active) {
        let iconIndex = active ? 1 : 0;
        this.button.set_child(this._icons[iconIndex]);
    },

    enable: function() {
        this._lock.id = this._lock.connect('changed', Lang.bind(this, this._statusChanged));
        Main.panel._rightBox.insert_child_at_index(this.button, 0);
    },

    disable: function() {
        this._lock.disconnect(this._lock.id);
        Main.panel._rightBox.remove_child(this.button);
    }
}

function init(extensionMeta) {
    return new ExtensionController(extensionMeta);
}
