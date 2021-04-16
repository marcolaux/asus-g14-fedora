const Me = imports.misc.extensionUtils.getCurrentExtension();
const PM = imports.ui.popupMenu;
var Menu = class Menu {
    constructor(menu) {
        let menuItems = {
            gfxHeadline: new PM.PopupMenuItem('Graphics Mode', { hover: false, can_focus: false, style_class: 'headline gfx' }),
            init_gfx: new PM.PopupMenuItem('Graphics mode not initialized', { hover: false, can_focus: false, style_class: 'none gfx-mode' }),
            seperator1: new PM.PopupSeparatorMenuItem(),
            fanHeadline: new PM.PopupMenuItem('Profile', { hover: false, can_focus: false, style_class: 'headline fan' }),
            init_profile: new PM.PopupMenuItem('Profiles not initialized', { hover: false, can_focus: false, style_class: 'none fan-mode' }),
        };
        for (const item in menuItems) {
            menu.addMenuItem(menuItems[item]);
            if (menuItems[item].style_class.includes('headline')) {
                menuItems[item].label.style_class = 'headline-label';
            }
        }
    }
}
//# sourceMappingURL=popup.js.map