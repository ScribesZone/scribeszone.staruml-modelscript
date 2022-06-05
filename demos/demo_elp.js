"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementListInterface = void 0;
var panels_1 = require("../framework/panels");
var VIEW_TOGGLE_DEMOELP = 'view.toggle.demoelp';
// Command in the "View" menu
// IMPORTANT: this constant comes from menus/menu-view.json
var TOGGLE_DEMOELP_COMMAND = 'demos:toggle.demoelp';
// Command in the "Tools" menu
// IMPORTANT: this constant comes from menus/menu-tools.json
var DEMO_ELP_COMMAND = 'demos:demoelp';
var ElementListInterface = /** @class */ (function () {
    function ElementListInterface() {
        var _this = this;
        console.log('DG: Installing ElementListInterface');
        this.updateCommand = DEMO_ELP_COMMAND;
        this.toggleMenu = VIEW_TOGGLE_DEMOELP;
        this.toggleCommand = TOGGLE_DEMOELP_COMMAND;
        this.panel = new panels_1.ElementListPanel('Welcome ElementList', this.toggleMenu);
        app.commands.register(this.updateCommand, function () {
            _this.updatePanelContent();
            _this.panel.show();
        }, undefined);
        app.commands.register(this.toggleCommand, function () {
            _this.panel.toggle();
        }, undefined);
    }
    ElementListInterface.prototype.updatePanelContent = function () {
        this.panel.clear();
        var classes = app.repository.select('@UMLClass');
        this.panel.setTitle(classes.length + ' classes found');
        for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
            var class_ = classes_1[_i];
            this.panel.addElement(class_);
        }
    };
    return ElementListInterface;
}());
exports.ElementListInterface = ElementListInterface;
//# sourceMappingURL=demo_elp.js.map