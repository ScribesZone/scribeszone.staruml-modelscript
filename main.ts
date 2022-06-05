declare var app

require('./framework/misc')

/**
 * Disaply console output during code generation. This is not good looking
 * since the result is displayed in the console with filenames and so on.
 */
const ENABLE_CONSOLE_OUTPUT_DISPLAY = false /* display in the code in console windows */

/**
 * Show syntax coloring output. This is currently not good since it goes
 * in the same place where other output is displayed. What is more
 * all sources generated are in the same place as well. We should have
 * a drop down menu to select the file to be displayed for instance.
 */
const ENABLE_CODE_INTERFACE = false

const ENABLE_PROCESSOR = true


import { CustomPanel }      from "./framework/panels"
import { CodeInterface }    from "./framework/renderer"

import { Beautifier }       from "./beautifier"
import { CheckerRegistry }  from "./checker"
import { USEOCLGenerator }  from "./generator"
import { USEOCLProcessor }  from "./processor"


const EXTENSION = {
    "id": 'useocl',
    "title": 'USE OCL'
}

//------------- COMMANDS -------------------------------------------
// const TOGGLE_COMPILATION_COMMAND = EXTENSION.id+':toggle.compilation'
const TOGGLE_CONSOLE_COMMAND = EXTENSION.id+':toggle.console'
const GENERATE_COMMAND = EXTENSION.id+':generate'
const BEAUTIFY_COMMAND = EXTENSION.id+':beautify'


// TODO: Rename -> Compilation/Code/Console. Not clear currently


// class CompilationInterface {
//     private toggleCommand: string;
//     private panel: any;
//
//     constructor(toggleCommand) {
//         this.toggleCommand = toggleCommand
//         this.panel = new CustomPanel(
//             'compilation',
//             EXTENSION.title+' compilation',
//             true)
//         app.commands.register(
//             this.toggleCommand,
//             () => {
//                 this.panel.toggle()
//             })
//     }
//
//     getPanel() {
//         return this.panel
//     }
// }

function addOnElementClickBehavior() {
    $('[element_ref]').click( (event) => {
        const element_id = (
            event.currentTarget.attributes['element_ref'].value)
        console.log('searching element '+element_id)
        const element = app.repository.get(element_id)
        console.log(element)
        if (element) {
            console.log('selecting')
            app.modelExplorer.select(element, true)
        } else {
            console.error('[DEBUG]: element "'+element_id+'" not found')
        }
    })
}

class HardwiredConsoleOutput {

    private panel_selector: string;

    constructor() {
        this.panel_selector = '#panel-useocl-zone'
    }

    append(html) {
        $(this.panel_selector).append(html)
    }

    newSectionHeader(html) {
        this.append(
            `<div class="section">${html}</div>`)
    }

    newFileSectionHeader(message, filename) {
        this.newSectionHeader(`Generating ${message}... (${filename})`)
    }


}


class ConsoleInterface {
    private readonly generateCommand: string
    private readonly beautifyCommand: string
    private readonly toggleCommand: string
//    compilationPanel: any
    private readonly consolePanel: any
    private readonly hardwiredConsoleOutput: HardwiredConsoleOutput;

    constructor(/*compilationPanel,*/  beautifyCommand, generateCommand, toggleCommand) {

        // At this level the model is not available yet. Try :
        //   console.log('DG: ConsoleInterface', app.repository.select('@UMLClass'))

//        this.compilationPanel = compilationPanel
        this.generateCommand = generateCommand
        this.beautifyCommand = beautifyCommand
        this.toggleCommand = toggleCommand
        this.consolePanel = new CustomPanel(
            EXTENSION.id,
            EXTENSION.title+' console',
            true)

        this.hardwiredConsoleOutput = new HardwiredConsoleOutput()

        app.commands.register(
            this.beautifyCommand,
            () => {
                const beautifier = new Beautifier()
                beautifier.doBeautify()
            }
        )
        app.commands.register(
            this.generateCommand,
            () => {
                const debug_generator = app.preferences.get(
                    'useocl.generation.debug')
                const checker = new CheckerRegistry(
                    debug_generator,
                    {
                        // TODO: encapsulate references to panel
                        // #panel-useocl-zone should be a parameter
                        onError : (checker_error) => {
                            this.hardwiredConsoleOutput.append('<div class="checker error">'
                                    + checker_error
                                    +`</div>`)
                            //
                            // $('#panel-useocl-zone')
                            //     .append(
                            //         '<div class="checker error">'
                            //         + checker_error
                            //         +`</div>`)
                        }
                    }
                )
                const use_modelscript_artefact_structure = (
                    app.preferences.get(
                            'useocl.generation.structure')
                )
                const generator = new USEOCLGenerator(
                    use_modelscript_artefact_structure,
                    debug_generator,
                    {
                        // TODO: encapsulate references to panel
                        // #panel-useocl-zone should be a parameter
                        afterToken :
                            (token) => {
                                if (ENABLE_CONSOLE_OUTPUT_DISPLAY) {
                                    this.hardwiredConsoleOutput.append(token.text)
                                    //$('#panel-useocl-zone').append(token.text)
                                }
                        },
                        afterLine :
                            (new_line) => {
                                if (ENABLE_CONSOLE_OUTPUT_DISPLAY) {
                                    this.hardwiredConsoleOutput.append('\n')
                                    // $('#panel-useocl-zone').append('\n')
                                }
                        },
                        onError : (traced_error) => {
                            this.hardwiredConsoleOutput.append(
                                    '<H2>***ERROR***</H2>'
                                    + traced_error.fullMessage()
                                    + '\n\n'
                                    + 'See DevTools console for more information (Alt-Shift-T)')
                            // $('#panel-useocl-zone')
                            //     //.addClass("error")
                            //     .append(
                            //         '<H1>***ERROR***</H1>'
                            //         + traced_error.fullMessage()
                            //         + '\n\n'
                            //         + 'See DevTools console for more information (Alt-Shift-T)'
                            // )
                        },
                        onFileGeneration : (message, filename) => {
                            this.hardwiredConsoleOutput.newFileSectionHeader(message, filename)
                        },
                        onSaveFile : (nb_of_lines) => {
                            this.hardwiredConsoleOutput.append(
                                `<div>${nb_of_lines} lines generated.</div>`
                            )
                            // $('#panel-useocl-zone').append(
                            //     `<div>${nb_of_lines} lines generated.</div>`)
                        }
                    })
                //generator.createCodeInterface(this.panel)
                this.consolePanel.show()
                this.consolePanel.setText('<div></div>')




                this.hardwiredConsoleOutput.newSectionHeader('Checking models ...')
                // this.consolePanel.setText('<div class="section">Checking model ...</div>')
                checker.doCheck()
                // this.consolePanel.setText('Generating USE OCL files ...\n\n')
                generator.doGenerate()
                addOnElementClickBehavior()

                // DEMO: this code is working properly
                // generator.postGenerate((gen) => {
                //     console.log('DEMO: OK', gen.getFileExtension())
                // })
                // DG: this.consolePanel.setText('DG:HOLA PANEL')



                if (generator.isGenerationSuccessful()) {

                    if (ENABLE_CODE_INTERFACE) {
                        const codeInterface = new CodeInterface(this.consolePanel)
                        // TODO: make a multi-AST interface
                        // Currently only the last AST is displayed
                        // CodeInterface should take the astCollection instead
                        codeInterface.build(generator.astCollection.currentAST)
                    }

                    if (ENABLE_PROCESSOR) {
                        const debug_processor = app.preferences.get(
                            'useocl.compilation.debug')
                        const processor = new USEOCLProcessor(generator, debug_processor)
                        if (processor.isProcessorEnabled()) {
                            // if (this.compilationPanel) {
                            //     this.compilationPanel.show()
                            //     const command = processor.getProcessorCommand()
                            //     this.compilationPanel.setText(
                            //         'Executing "' + command + '\" ...')
                            // }
                            // processor.setCompilationPanel(this.compilationPanel)
                            processor.doProcess()
                            // processor.postProcess(() => {
                            //         if (debug_processor) {
                            //             console.log('[PROCESSOR] Postprocessor of result : ', processor.result)
                            //         }
                            //         this.compilationPanel.setText(
                            //             processor.result.getText())
                            //     }
                            // )
                        } else {
                            // this.compilationPanel.setText(
                            //     'USEOCL Processor disabled.\n'
                            //     + 'You can enable it using the menu "File > Preferences > USE OCL ..."')
                            // this.compilationPanel.hide()
                        }
                    }
                } else {
                    this.consolePanel.setHTML(generator.getErrorMessage())
                }


            },
            undefined)
        app.commands.register(
            this.toggleCommand,
            () => {
                this.consolePanel.toggle()
            },
            undefined)
    }
}


function init() {
    // At this level the model is not available yet :
    //      console.log('DG: Init', app.repository.select('@UMLClass'))
    // const compilation_interface = new CompilationInterface(
    //     TOGGLE_COMPILATION_COMMAND)
    new ConsoleInterface(
        // compilation_interface.getPanel(),
        BEAUTIFY_COMMAND,
        GENERATE_COMMAND,
        TOGGLE_CONSOLE_COMMAND)


}

exports.init = init
