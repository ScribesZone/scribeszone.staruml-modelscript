/**
 * DEMO ELP = Element list panel
 * This demp shows a list of elements
 */
// const electron = require('electron');
//
// // Module to control application life.
// const app = electron.app
declare var app

import {ElementListPanel} from "../framework/panels"

const VIEW_TOGGLE_DEMOELP = 'view.toggle.demoelp'

// Command in the "View" menu
// IMPORTANT: this constant comes from menus/menu-view.json
const TOGGLE_DEMOELP_COMMAND = 'demos:toggle.demoelp'

// Command in the "Tools" menu
// IMPORTANT: this constant comes from menus/menu-tools.json
const DEMO_ELP_COMMAND = 'demos:demoelp'

export class ElementListInterface {
    panel: any
    private updateCommand: any
    private toggleMenu: any
    private toggleCommand: any

    constructor() {
        console.log('DG: Installing ElementListInterface')
        this.updateCommand = DEMO_ELP_COMMAND
        this.toggleMenu = VIEW_TOGGLE_DEMOELP
        this.toggleCommand = TOGGLE_DEMOELP_COMMAND
        this.panel = new ElementListPanel(
            'Welcome ElementList',
            this.toggleMenu)
        app.commands.register(
            this.updateCommand,
            () => {
                this.updatePanelContent()
                this.panel.show()
            },
            undefined)
        app.commands.register(
            this.toggleCommand,
            () => {
                this.panel.toggle()
            },
            undefined)
    }

    updatePanelContent() {
        this.panel.clear()
        const classes = app.repository.select('@UMLClass')
        this.panel.setTitle(classes.length+ ' classes found')
        for (const class_ of classes) {
            this.panel.addElement(class_)
        }
    }
}
