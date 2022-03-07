"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var asts_1 = require("./asts");
var asString = require("./models").asString;
var traces_1 = require("./traces");
var generatorStatus = {
    UNDEFINED: "undefined",
    OK: "ok",
    EXCEPTION: "exception",
    PRECONDITION_FAILED: "precondition failed",
    UNAMED_PROJECT: ''
};
/*=========================================================================
*             Generators
* =========================================================================
 */
// TODO: add generation status
// TODO: add generation precondition handling
/**
 * This class serves as a base class for developer written generators.
 * Its contains convenience methods that make it simple to
 * open/write/save AST without knowing of AST and ASTCollections.
 * the details of the AS
 */
var AbstractGenerator = /** @class */ (function () {
    function AbstractGenerator(debug, eventFns) {
        if (debug === void 0) { debug = true; }
        if (eventFns === void 0) { eventFns = undefined; }
        this.debug = debug;
        this.eventFns = eventFns;
        this.astCollection = new asts_1.ASTCollection(this, debug, eventFns);
        this.postGenerateFun = null;
        this.status = generatorStatus.UNDEFINED;
        this.errorMessage = null;
    }
    /**
     * Generate the code. This method must be written by developer
     * generator.
     */
    AbstractGenerator.prototype.generate = function () {
        console.assert(arguments.length === 0);
        throw new Error('generate() is not implemented by generator');
    };
    // TODO: move this function to misc module
    /**
     * Helper to compute easily output file base on
     * project file using its path and basename
     * (for instance /h/zarwinn/proj.mdj
     *
     * relativeDirectory is appended to the path. Default to
     * "." so by default the output file will be in the same
     * directory.
     *
     * If set basename is the name of the output file.
     * Otherwise the basename of the project is used.
     *
     * With projectFile being the path given above and f
     * this function :
     *
     *   f('.use') = /h/zarwinn/./proj.use
     *   f('.use','mod/a') = /h/zarwinn/mod/a/proj.use
     *   f('.java','mod/a', 'person') = /h/zarwinn/mod/a/person.java
     */
    AbstractGenerator.prototype.getProjectBasedFilename = function (extension, relativeDirectory, basename) {
        if (relativeDirectory === void 0) { relativeDirectory = '.'; }
        if (basename === void 0) { basename = null; }
        console.assert(typeof extension === 'string'
            && extension[0] === ".", extension);
        console.assert(typeof relativeDirectory === 'string', relativeDirectory);
        console.assert(basename === null
            || typeof basename === 'string', basename);
        var parts = path.parse(app.project.filename);
        var fileDirectory = path.join(parts.dir, relativeDirectory);
        var fileBasename = (basename ? basename : parts.name);
        var filename = path.join(fileDirectory, fileBasename + extension);
        return filename;
    };
    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods calls
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------
    AbstractGenerator.prototype.openAST = function (filename, role, elements) {
        if (role === void 0) { role = "main"; }
        if (elements === void 0) { elements = []; }
        console.assert(typeof filename === 'string', filename);
        console.assert(typeof role === 'string', role);
        console.assert(elements instanceof Array, elements);
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        return this.astCollection.openAST(filename, role, elements);
    };
    AbstractGenerator.prototype.reopenAST = function (ast) {
        this.astCollection.reopenAST(ast);
    };
    AbstractGenerator.prototype.write = function (text, category, element) {
        if (category === void 0) { category = undefined; }
        if (element === void 0) { element = undefined; }
        this.astCollection.currentAST.write(text, category, element);
    };
    AbstractGenerator.prototype.writeln = function (text, category, element) {
        if (text === void 0) { text = undefined; }
        if (category === void 0) { category = undefined; }
        if (element === void 0) { element = undefined; }
        this.astCollection.currentAST.writeln(text, category, element);
    };
    AbstractGenerator.prototype.writeIdentifier = function (text, element) {
        this.astCollection.currentAST.write(text, 'identifier1', element);
    };
    AbstractGenerator.prototype.save = function () {
        this.astCollection.currentAST.save();
    };
    AbstractGenerator.prototype.end = function () {
        this.astCollection.end();
    };
    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods calls
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------
    AbstractGenerator.prototype.getPlainText = function () {
        return this.astCollection.currentAST.getPlainText();
    };
    AbstractGenerator.prototype.getLineNumberedText = function () {
        return this.astCollection.currentAST.getLineNumberedText();
    };
    AbstractGenerator.prototype.getErrorMessage = function () {
        return this.errorMessage;
    };
    /**
     * Check a precondition for the doGenerate function to run.
     * Return true if the precondition is full filled other wize
     * return as a string an error message.
     * @returns {string|boolean}
     */
    AbstractGenerator.prototype.checkPrecondition = function () {
        if (false) {
            return "TEST: FAKE PRECONDITION FAILURE MESSAGE"; // TEST:
        }
        return true;
    };
    AbstractGenerator.prototype.showError = function () {
        this.errorMessage.split('\n').reverse().forEach(function (line) {
            app.toast.error(line, 120);
        });
        console.log('[GENERATOR]: Error: ' + this.errorMessage);
    };
    AbstractGenerator.prototype.showSuccess = function () {
        app.toast.info('file saved', 30);
    };
    AbstractGenerator.prototype.getStatus = function () {
        return this.status;
    };
    AbstractGenerator.prototype.isGenerationSuccessful = function () {
        return this.status === generatorStatus.OK;
    };
    AbstractGenerator.prototype.postGenerate = function (fun) {
        this.postGenerateFun = fun;
    };
    AbstractGenerator.prototype.doGenerate = function () {
        if (!app.project.filename) {
            this.status = generatorStatus.UNAMED_PROJECT;
            this.errorMessage = "Project not saved. Generation cancelled.";
            this.showError();
            return;
        }
        var precondition = this.checkPrecondition();
        if (precondition !== true) {
            this.status = generatorStatus.PRECONDITION_FAILED;
            this.errorMessage = precondition;
            this.showError();
            return;
        }
        try {
            if (false) { // TEST: change to test generation failure
                throw Error('FAKE GENERATION FAILURE');
            }
            this.generate();
            this.status = generatorStatus.OK;
            this.showSuccess();
            if (this.debug) {
                console.log('[GENERATOR]: ASTCollection stats :', asString(this.astCollection.getStats()));
            }
        }
        catch (error) {
            if (error instanceof traces_1.TracedError) {
                // Deal with error already reported/generated by generator or writer
                this.errorMessage = ("Generation failed. An error was reported by "
                    + error.component + " component.\n"
                    + "Use DevTools for more information : Alt+Shift+T");
                this.status = generatorStatus.EXCEPTION;
                this.showError();
                throw error;
            }
            else {
                // unexpected error occurs
                this.errorMessage = ("Generation fails with an exception:\n"
                    + error.message + '\n'
                    + "Use DevTools to see issues : Alt+Shift+T");
                this.status = generatorStatus.EXCEPTION;
                this.showError();
                new traces_1.TraceErrorReporter('generator', error, this.eventFns).throw();
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
    AbstractGenerator.prototype.ruleCheck = function (callerArguments, signature) {
        // TODO
    };
    AbstractGenerator.prototype.ruleEnd = function () {
        // TODO
    };
    /*
    This test function should be called from  somewhere in generator.js to
    test how errors are reported.
     */
    AbstractGenerator.prototype.__testGenerateModel = function () {
        // TEST:
        if (false) {
            this.write(null);
        }
        // TEST
        if (false) {
            this.write([]);
        }
        // TEST:
        if (false) {
            this.write('line1\nline2');
        }
        // TEST:
        if (false) {
            this.write('while', 'kixword');
        }
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
exports.status = generatorStatus;
//# sourceMappingURL=generators.js.map