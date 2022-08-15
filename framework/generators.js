"use strict";
/// <reference path="../../staruml-cli-examples/staruml/types/index.d.ts" />
/// <reference path="../../staruml-cli-examples/staruml/api.d.ts" />
// 
// declare var type : any
// declare var app : any
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractGenerator = exports.getProjectBasedFilename = exports.GeneratorStatus = void 0;
var path = require("path");
var asts_1 = require("./asts");
var traces_1 = require("./traces");
var models_1 = require("./models");
var GeneratorStatus;
(function (GeneratorStatus) {
    GeneratorStatus["UNDEFINED"] = "undefined";
    GeneratorStatus["OK"] = "ok";
    GeneratorStatus["EXCEPTION"] = "exception";
    GeneratorStatus["PRECONDITION_FAILED"] = "precondition failed";
    GeneratorStatus["UNNAMED_PROJECT"] = "";
})(GeneratorStatus = exports.GeneratorStatus || (exports.GeneratorStatus = {}));
/**
 * Helper to compute easily output file base on
 * project file using its path and basename
 * (for instance /h/zarwinn/proj.mdj)
 *
 * @param extension extension of the generated file.
 * @param relativeDirectory directory where the file as to be saved.
 * @param basename the name of the file. See below.
 *
 * relativeDirectory is appended to the path. Default to
 * "." so by default the output file will be in the same
 * directory.
 *
 * If set basename is the name of the output file,
 * otherwise the basename of the project is used.
 *
 * With projectFile being the path given above and f
 * this function :
 *
 *   f('.use') = /h/zarwinn/./proj.use
 *   f('.use','mod/a') = /h/zarwinn/mod/a/proj.use
 *   f('.java','mod/a', 'person') = /h/zarwinn/mod/a/person.java
 */
function getProjectBasedFilename(extension, relativeDirectory, basename) {
    if (relativeDirectory === void 0) { relativeDirectory = '.'; }
    if (basename === void 0) { basename = null; }
    console.assert(extension[0] === ".", extension);
    var parts = path.parse(app.project.filename);
    var fileDirectory = path.join(parts.dir, relativeDirectory);
    var fileBasename = (basename ? basename : parts.name);
    // noinspection UnnecessaryLocalVariableJS
    var filename = path.join(fileDirectory, fileBasename + extension);
    return filename;
}
exports.getProjectBasedFilename = getProjectBasedFilename;
// noinspection PointlessBooleanExpressionJS,UnreachableCodeJS
/**
 * AbstractGenerator.
 * This class serves as a base class for developer written generators.
 * A generator create a ASTCollection (possibly with only one AST).
 * Its contains convenience methods that make it simple to
 * open/write/save AST without knowing of AST and ASTCollections.
 * the details of the AS
 */
var AbstractGenerator = /** @class */ (function () {
    function AbstractGenerator(debug, eventFns) {
        if (debug === void 0) { debug = true; }
        if (eventFns === void 0) { eventFns = {}; }
        this.astCollection = new asts_1.ASTCollection(this, debug, eventFns);
        this.status = GeneratorStatus.UNDEFINED;
        this.debug = debug;
        this.eventFns = eventFns;
        this.postGenerateFun = null;
        this.errorMessage = null;
    }
    /**
     * Check a precondition for the doGenerate function to run.
     * A particular generator could check for instance that
     * given staruml elements of a proper type are selected.
     * By default, there is no precondition.
     *
     * Return true if the precondition is fulfilled otherwise
     * return as a string an error message.
     * @returns {string|boolean}
     */
    AbstractGenerator.prototype.checkPrecondition = function () {
        return true;
    };
    // TODO: move this function to misc module
    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods call
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------
    AbstractGenerator.prototype.openAST = function (filename, label, role, elements) {
        if (label === void 0) { label = ""; }
        if (role === void 0) { role = "main"; }
        if (elements === void 0) { elements = []; }
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        return this.astCollection.openAST(filename, label, role, elements);
    };
    AbstractGenerator.prototype.reopenAST = function (ast) {
        this.astCollection.reopenAST(ast);
    };
    AbstractGenerator.prototype.checkCurrentAST = function () {
        if (this.astCollection.currentAST === null) {
            var message = "currentAST is null.";
            new asts_1.ASTTracedErrorReporter(// TODO: emit a generator level error
            'asts', // TODO: currently we have no event except at ast level
            message, this.eventFns).throw();
        }
    };
    AbstractGenerator.prototype.write = function (text, category, element) {
        if (category === void 0) { category = "default"; }
        if (element === void 0) { element = null; }
        this.checkCurrentAST();
        this.astCollection.currentAST.write(text, category, element);
    };
    AbstractGenerator.prototype.writeln = function (text, category, element) {
        if (category === void 0) { category = "default"; }
        if (element === void 0) { element = null; }
        this.checkCurrentAST();
        this.astCollection.currentAST.writeln(text, category, element);
    };
    AbstractGenerator.prototype.writeIdentifier = function (text, element) {
        if (element === void 0) { element = null; }
        this.checkCurrentAST();
        this.astCollection.currentAST.write(text, 'identifier1', element);
    };
    AbstractGenerator.prototype.ruleCheck = function (callerArguments, signature) {
        // TODO
    };
    AbstractGenerator.prototype.ruleEnd = function () {
        // TODO
    };
    AbstractGenerator.prototype.save = function () {
        this.checkCurrentAST();
        this.astCollection.currentAST.save();
    };
    AbstractGenerator.prototype.end = function () {
        this.astCollection.end();
    };
    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods call
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------
    // public getPlainText(): string {
    //     this.checkCurrentAST()
    //     return this.astCollection.currentAST!.getPlainText()
    // }
    // getLineNumberedText(): string {
    //     this.checkCurrentAST()
    //     return this.astCollection.currentAST!.getLineNumberedText()
    // }
    // private getErrorMessage(): string | null {
    //     return this.errorMessage
    // }
    AbstractGenerator.prototype.showError = function () {
        this.checkCurrentAST();
        if (this.errorMessage) {
            this.errorMessage.split('\n').reverse().forEach(function (line) {
                app.toast.error(line, 120);
            });
        }
        console.log('[GENERATOR]: Error: ' + this.errorMessage);
    };
    // noinspection JSMethodCanBeStatic
    AbstractGenerator.prototype.showSuccess = function () {
        app.toast.info('file saved', 30);
    };
    // private getStatus() {
    //     return this.status
    // }
    AbstractGenerator.prototype.isGenerationSuccessful = function () {
        return this.status === GeneratorStatus.OK;
    };
    AbstractGenerator.prototype.postGenerate = function (fun) {
        this.postGenerateFun = fun;
    };
    AbstractGenerator.prototype.doGenerate = function () {
        if (!app.project.filename) {
            this.status = GeneratorStatus.UNNAMED_PROJECT;
            this.errorMessage = "Project not saved. Generation cancelled.";
            this.showError();
            return;
        }
        var precondition = this.checkPrecondition();
        if (precondition !== true) {
            this.status = GeneratorStatus.PRECONDITION_FAILED;
            this.errorMessage = precondition;
            this.showError();
            return;
        }
        try {
            if (false) { // TEST: change to test generation failure
                throw Error('FAKE GENERATION FAILURE');
            }
            this.generate();
            this.status = GeneratorStatus.OK;
            this.showSuccess();
            if (this.debug) {
                console.log('[GENERATOR]: ASTCollection stats :', (0, models_1.asString)(this.astCollection.getStats()));
            }
        }
        catch (error) {
            if (error instanceof traces_1.TracedError) {
                // Deal with error already reported/generated by generator or writer
                this.errorMessage = ("Generation failed. An error was reported by "
                    + error.component + " component.\n"
                    + "Use DevTools for more information : Alt+Shift+T");
                this.status = GeneratorStatus.EXCEPTION;
                this.showError();
                throw error;
            }
            else {
                // unexpected error occurs
                this.errorMessage = ("Generation fails with an exception:\n"
                    + error.message + '\n'
                    + "Use DevTools to see issues : Alt+Shift+T");
                this.status = GeneratorStatus.EXCEPTION;
                this.showError();
                new asts_1.ASTTracedErrorReporter(// TODO: fix this
                'generator', error, this.eventFns).throw();
            }
        }
        if (this.postGenerateFun) {
            if (this.debug) {
                console.log('[GENERATORS]: Calling post generation function');
            }
            var that = this;
            this.postGenerateFun(that);
        }
    };
    /*
    This test function should be called from  somewhere in generator.js to
    test how errors are reported.
     */
    AbstractGenerator.prototype.__testGenerateModel = function () {
        // TEST:
        // @tscheck
        // if (false) {
        //     this.write(null)
        // }
        // TEST
        // @tscheck
        // if (false) {
        //     this.write([])
        // }
        // TEST:
        if (false) {
            this.write('line1\nline2');
        }
        // TEST:
        // @tscheck
        // if (false) {
        //     this.write('while','kixword')
        // }
        // TEST:
        if (false) {
            this.write('person', 'identifier1', 'not an element');
        }
        // TEST:
        if (false) {
            // undefined_ref
        }
        // TEST:
        if (false) {
            // "test".forEach()
        }
    };
    return AbstractGenerator;
}());
exports.AbstractGenerator = AbstractGenerator;
//# sourceMappingURL=generators.js.map