"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./framework/misc');
var INCLUDE_ELP_DEMO = false;
var INCLUDE_DBMODELGEN_DEMO = false;
var ENABLE_CODE_INTERFACE = false;
var ENABLE_PROCESSOR = true;
var ENABLE_CONSOLE_OUTPUT_DISPLAY = false;
var CustomPanel = require("./framework/panels").CustomPanel;
var Beautifier = require("./beautifier").Beautifier;
var CheckerRegistry = require("./checker").CheckerRegistry;
var USEOCLGenerator = require("./generator").USEOCLGenerator;
var USEOCLProcessor = require("./processor").USEOCLProcessor;
var renderer_1 = require("./framework/renderer");
var EXTENSION = {
    "id": 'useocl',
    "title": 'USE OCL'
};
//------------- COMMANDS -------------------------------------------
// const TOGGLE_COMPILATION_COMMAND = EXTENSION.id+':toggle.compilation'
var TOGGLE_CONSOLE_COMMAND = EXTENSION.id + ':toggle.console';
var GENERATE_COMMAND = EXTENSION.id + ':generate';
var BEAUTIFY_COMMAND = EXTENSION.id + ':beautify';
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
    $('[element_ref]').click(function (event) {
        var element_id = (event.currentTarget.attributes['element_ref'].value);
        console.log('searching element ' + element_id);
        var element = app.repository.get(element_id);
        console.log(element);
        if (element) {
            console.log('selecting');
            app.modelExplorer.select(element, true);
        }
        else {
            console.error('[DEBUG]: element "' + element_id + '" not found');
        }
    });
}
var HardwiredConsoleOutput = /** @class */ (function () {
    function HardwiredConsoleOutput() {
        this.panel_selector = '#panel-useocl-zone';
    }
    HardwiredConsoleOutput.prototype.append = function (html) {
        $(this.panel_selector).append(html);
    };
    HardwiredConsoleOutput.prototype.newSectionHeader = function (html) {
        this.append("<div class=\"section\">".concat(html, "</div>"));
    };
    HardwiredConsoleOutput.prototype.newFileSectionHeader = function (message, filename) {
        this.newSectionHeader("Generating ".concat(message, "... (").concat(filename, ")"));
    };
    return HardwiredConsoleOutput;
}());
var ConsoleInterface = /** @class */ (function () {
    function ConsoleInterface(/*compilationPanel,*/ beautifyCommand, generateCommand, toggleCommand) {
        // At this level the model is not available yet. Try :
        //   console.log('DG: ConsoleInterface', app.repository.select('@UMLClass'))
        var _this = this;
        //        this.compilationPanel = compilationPanel
        this.generateCommand = generateCommand;
        this.beautifyCommand = beautifyCommand;
        this.toggleCommand = toggleCommand;
        this.consolePanel = new CustomPanel(EXTENSION.id, EXTENSION.title + ' console', true);
        this.hardwiredConsoleOutput = new HardwiredConsoleOutput();
        app.commands.register(this.beautifyCommand, function () {
            var beautifier = new Beautifier();
            beautifier.doBeautify();
        });
        app.commands.register(this.generateCommand, function () {
            var debug_generator = app.preferences.get('useocl.generation.debug');
            var checker = new CheckerRegistry(debug_generator, {
                // TODO: encapsulate references to panel
                // #panel-useocl-zone should be a parameter
                onError: function (checker_error) {
                    _this.hardwiredConsoleOutput.append('<div class="checker error">'
                        + checker_error
                        + "</div>");
                    //
                    // $('#panel-useocl-zone')
                    //     .append(
                    //         '<div class="checker error">'
                    //         + checker_error
                    //         +`</div>`)
                }
            });
            var use_modelscript_artefact_structure = (app.preferences.get('useocl.generation.structure'));
            var generator = new USEOCLGenerator(use_modelscript_artefact_structure, debug_generator, {
                // TODO: encapsulate references to panel
                // #panel-useocl-zone should be a parameter
                afterToken: function (token) {
                    if (ENABLE_CONSOLE_OUTPUT_DISPLAY) {
                        _this.hardwiredConsoleOutput.append(token.text);
                        //$('#panel-useocl-zone').append(token.text)
                    }
                },
                afterLine: function (new_line) {
                    if (ENABLE_CONSOLE_OUTPUT_DISPLAY) {
                        _this.hardwiredConsoleOutput.append('\n');
                        // $('#panel-useocl-zone').append('\n')
                    }
                },
                onError: function (traced_error) {
                    _this.hardwiredConsoleOutput.append('<H2>***ERROR***</H2>'
                        + traced_error.fullMessage()
                        + '\n\n'
                        + 'See DevTools console for more information (Alt-Shift-T)');
                    // $('#panel-useocl-zone')
                    //     //.addClass("error")
                    //     .append(
                    //         '<H1>***ERROR***</H1>'
                    //         + traced_error.fullMessage()
                    //         + '\n\n'
                    //         + 'See DevTools console for more information (Alt-Shift-T)'
                    // )
                },
                onFileGeneration: function (message, filename) {
                    _this.hardwiredConsoleOutput.newFileSectionHeader(message, filename);
                },
                onSaveFile: function (nb_of_lines) {
                    _this.hardwiredConsoleOutput.append("<div>".concat(nb_of_lines, " lines generated.</div>"));
                    // $('#panel-useocl-zone').append(
                    //     `<div>${nb_of_lines} lines generated.</div>`)
                }
            });
            //generator.createCodeInterface(this.panel)
            _this.consolePanel.show();
            _this.consolePanel.setText('<div></div>');
            _this.hardwiredConsoleOutput.newSectionHeader('Checking models ...');
            // this.consolePanel.setText('<div class="section">Checking model ...</div>')
            checker.doCheck();
            // this.consolePanel.setText('Generating USE OCL files ...\n\n')
            generator.doGenerate();
            addOnElementClickBehavior();
            // DEMO: this code is working properly
            // generator.postGenerate((gen) => {
            //     console.log('DEMO: OK', gen.getFileExtension())
            // })
            // DG: this.consolePanel.setText('DG:HOLA PANEL')
            if (generator.isGenerationSuccessful()) {
                if (ENABLE_CODE_INTERFACE) {
                    var codeInterface = new renderer_1.CodeInterface(_this.consolePanel);
                    // TODO: make a multi-AST interface
                    // Currently only the last AST is displayed
                    // CodeInterface should take the astCollection instead
                    codeInterface.build(generator.astCollection.currentAST);
                }
                if (ENABLE_PROCESSOR) {
                    var debug_processor = app.preferences.get('useocl.compilation.debug');
                    var processor = new USEOCLProcessor(generator, debug_processor);
                    if (processor.isProcessorEnabled()) {
                        // if (this.compilationPanel) {
                        //     this.compilationPanel.show()
                        //     const command = processor.getProcessorCommand()
                        //     this.compilationPanel.setText(
                        //         'Executing "' + command + '\" ...')
                        // }
                        // processor.setCompilationPanel(this.compilationPanel)
                        processor.doProcess();
                        // processor.postProcess(() => {
                        //         if (debug_processor) {
                        //             console.log('[PROCESSOR] Postprocessor of result : ', processor.result)
                        //         }
                        //         this.compilationPanel.setText(
                        //             processor.result.getText())
                        //     }
                        // )
                    }
                    else {
                        // this.compilationPanel.setText(
                        //     'USEOCL Processor disabled.\n'
                        //     + 'You can enable it using the menu "File > Preferences > USE OCL ..."')
                        // this.compilationPanel.hide()
                    }
                }
            }
            else {
                _this.consolePanel.setHTML(generator.getErrorMessage());
            }
        }, undefined);
        app.commands.register(this.toggleCommand, function () {
            _this.consolePanel.toggle();
        }, undefined);
    }
    return ConsoleInterface;
}());
function init() {
    // At this level the model is not available yet :
    //      console.log('DG: Init', app.repository.select('@UMLClass'))
    // const compilation_interface = new CompilationInterface(
    //     TOGGLE_COMPILATION_COMMAND)
    new ConsoleInterface(
    // compilation_interface.getPanel(),
    BEAUTIFY_COMMAND, GENERATE_COMMAND, TOGGLE_CONSOLE_COMMAND);
    /*---------------------------------------------------------------------
     *               DEMO ELP : ELEMENT LIST PANEL
     *---------------------------------------------------------------------
     */
    if (INCLUDE_ELP_DEMO) {
        var ElementListInterface = require("./demos/demo_elp").ElementListInterface;
        new ElementListInterface();
    }
    /*--------------------------------------------------------------------
    *               DEMO DBMODELGEN : Generator of a db model
    *---------------------------------------------------------------------
    * This demo shows how to create a database data model
    */
    if (INCLUDE_DBMODELGEN_DEMO) {
        var DemoDBModelGenerator_1 = require("./demos/demo_dbmodelgen").DemoDBModelGenerator;
        new DemoDBModelGenerator_1();
    }
}
exports.init = init;
//# sourceMappingURL=main.js.map