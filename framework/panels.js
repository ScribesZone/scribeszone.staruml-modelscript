"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementListPanel = exports.CustomPanel = void 0;
var fs = require("fs");
var path = require("path");
/**

This module defines two kinds of panels :

* `CustomPanel` defines general purpose panels
* `ElementListPanel`s contains a list of clickable element panels

CustomPanel
-----------

A custom panel can be shown/hidden thanks to:

* a staruml "View" item menu,
* a toggle button in the toolbar

View menu toogle
''''''''''''''''

A common pattern is to add a toggle item in the staruml
menu with the name of the panel with a checkbox that
indicates if the panel is shown or not.

NOTE: it seems that there is a bug so that the checkbox
is not synchronised after some time.

Before creating a new panel make sure that the menu to
toggle the panel (staruml "View" menu) is declared in
`/menus/menu_view.json` file.

WARNING : In the example below {{ID}} and {{TITLE}} must
be replaced by "useocl" and "USE OCL" for instance.

    menus/menu-view.json

        {
          "id": "view",
          "submenu": [
            {
              "type": "separator"
            },
            {
              "label": "{{TITLE]} Console",
              "id": "view.{{ID]}.console",
              "type": "checkbox",
              "command": "{{ID]}:toggle.console"
            }
          ]
        }

Toolbar button toogle
'''''''''''''''''''''

The panel can be toggled via a toolbar button. In order to do so
the following file should be changed:

    stylesheets/
        icon-{{ID}}.svg       -- change value
        style.css             -- change content

*/
// TODO: check why console is in this suffix
var TOGGLE_COMMAND_SUFFIX = ':toggle.console';
var PANEL_TEMPLATE_FILE = 'panel-template.html';
// TODO: make this class more abstract
// TODO: extract toolbar for tooglle
// TODO: extract TogglePanel with toggle menu and toolbar  icon
var CustomPanel = /** @class */ (function () {
    function CustomPanel(id, title, hasToolbarButton, isEditable) {
        if (hasToolbarButton === void 0) { hasToolbarButton = true; }
        if (isEditable === void 0) { isEditable = false; }
        this.id = id;
        this.title = title;
        this.hasToolbarButton = hasToolbarButton;
        this.isEditable = isEditable;
        this.panel = undefined;
        this.$panel = undefined;
        this.$contentContainer = undefined;
        this._addBottomPanel();
        this._addToolbarButton();
        this.setText('Welcome to the ' + this.title + '\n');
    }
    CustomPanel.prototype._addBottomPanel = function () {
        var _this = this;
        // create the panel from template file
        var panel_filename = path.join(__dirname, '..', 'panels', PANEL_TEMPLATE_FILE);
        var panel_template = fs.readFileSync(panel_filename, "utf8");
        var panel_html = (panel_template
            // @ts-ignore replaceAll
            .replaceAll("{{id}}", this.id)
            .replaceAll("{{title}}", this.title)
            .replaceAll("{{editable}}", this.isEditable));
        // add the template to staruml bottom
        this.$panel = $(panel_html);
        this.panel = app.panelManager.createBottomPanel(this.id, this.$panel, 5); // Does not seems to be used
        // add behavior to the close button of the panel
        var $close = this.$panel.find(".close");
        $close.click(function () {
            _this.hide();
        });
        // add a reference to the actual content container
        this.$contentContainer = document.getElementById('panel-' + this.id + '-zone');
    };
    CustomPanel.prototype._addToolbarButton = function () {
        if (this.hasToolbarButton) {
            var template = "<a id='toolbar-{{id}}' href='#' title='{{title}}'></a>";
            // @ts-ignore   TODO .replaceAll
            var html = template.replaceAll("{{title}}", this.title).replaceAll("{{id}}", this.id);
            this.$button = $(html);
            $("#toolbar .buttons").append(this.$button);
            var toggle_command_1 = this.id + TOGGLE_COMMAND_SUFFIX;
            this.$button.click(function () {
                app.commands.execute(toggle_command_1);
            });
        }
    };
    // TODO: Check why the label has console in it
    CustomPanel.prototype._updateToggleMenus = function () {
        // const label = "view."+this.id+".console"
        app.menu.updateStates(null, null, {
            // @ts-ignore TODO
            label: this.panel.isVisible()
        });
    };
    CustomPanel.prototype.show = function () {
        // @ts-ignore TODO
        this.panel.show();
        this.$button.addClass("selected");
        this._updateToggleMenus();
        // app.preferences.set(PREFERENCE_KEY, true);
    };
    CustomPanel.prototype.hide = function () {
        // @ts-ignore TODO
        this.panel.hide();
        this.$button.removeClass("selected");
        this._updateToggleMenus();
        // app.preferences.set(PREFERENCE_KEY, false);
    };
    CustomPanel.prototype.toggle = function () {
        // @ts-ignore TODO
        if (this.panel.isVisible()) {
            this.hide();
        }
        else {
            this.show();
        }
    };
    CustomPanel.prototype.getContentContainer = function () {
        return this.$contentContainer;
    };
    CustomPanel.prototype.setHTML = function (content) {
        this.getContentContainer().innerHTML = content;
    };
    CustomPanel.prototype.setText = function (content) {
        this.getContentContainer().innerHTML = content;
    };
    return CustomPanel;
}());
exports.CustomPanel = CustomPanel;
// FIXME: toogle indicator in menu not working
var ElementListPanel = /** @class */ (function () {
    function ElementListPanel(title, toggleMenu) {
        if (toggleMenu === void 0) { toggleMenu = undefined; }
        var _this = this;
        var templateFile = path.join(__dirname, '..', 'panels', 'panel-element-list.html');
        this.toggleMenu = toggleMenu;
        this.elementListPanelTemplate = (fs.readFileSync(templateFile, 'utf8'));
        // TODO: check if the undefined vars are really necessary
        this.$elementListPanel = undefined;
        this.$listView = undefined;
        this.$titleLabel = undefined;
        this.$panelCloseButton = undefined;
        this.panel = undefined;
        this.dataSource = new kendo.data.DataSource();
        this.$elementListPanel = $(this.elementListPanelTemplate);
        this.$titleLabel = this.$elementListPanel.find('.title');
        this.$titleLabel.html(title);
        this.$panelCloseButton = this.$elementListPanel.find('.close');
        this.$listView = this.$elementListPanel.find('.listview');
        this.panel = (app.panelManager.createBottomPanel('?', this.$elementListPanel, 29));
        // @ts-ignore TODO
        this.$panelCloseButton.click(function () {
            // @ts-ignore TODO
            _this.panel.hide();
        });
        // @ts-ignore TODO
        this.$listView.kendoListView({
            dataSource: this.dataSource,
            template: "<div><span><span class='k-sprite #=elementIcon#'></span>#:elementName#</span></div>",
            selectable: true,
            change: function () {
                var data = this.dataSource.view();
                var item = data[this.select().index()];
                var element = app.repository.get(item.elementId);
                if (element) {
                    app.modelExplorer.select(element, true);
                }
            }
        });
    }
    ElementListPanel.prototype.setTitle = function (title) {
        this.$titleLabel.html(title);
    };
    ElementListPanel.prototype.clear = function () {
        this.dataSource.data([]);
    };
    ElementListPanel.prototype.addElement = function (element) {
        this.dataSource.add({
            elementId: element._id,
            elementIcon: element.getNodeIcon(),
            elementName: element.getPathname()
        });
    };
    ElementListPanel.prototype._updateMenu = function () {
        // const label = this.toggleMenu // FIXME: not working
        app.menu.updateStates(null, null, {
            // @ts-ignore TODO
            label: this.panel.isVisible()
        });
    };
    ElementListPanel.prototype.show = function () {
        // @ts-ignore TODO
        this.panel.show();
        if (this.toggleMenu) {
            this._updateMenu();
        }
    };
    ElementListPanel.prototype.hide = function () {
        // @ts-ignore TODO
        this.panel.hide();
        if (this.toggleMenu) {
            this._updateMenu();
        }
    };
    ElementListPanel.prototype.toggle = function () {
        // @ts-ignore TODO
        if (this.panel.isVisible()) {
            this.hide();
        }
        else {
            this.show();
        }
    };
    return ElementListPanel;
}());
exports.ElementListPanel = ElementListPanel;
