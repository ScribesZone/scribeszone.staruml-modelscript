"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractGenerator = exports.GeneratorStatus = void 0;
var path = require("path");
var asts_1 = require("./asts");
var models_1 = require("./models");
var traces_1 = require("./traces");
var GeneratorStatus;
(function (GeneratorStatus) {
    GeneratorStatus["UNDEFINED"] = "undefined";
    GeneratorStatus["OK"] = "ok";
    GeneratorStatus["EXCEPTION"] = "exception";
    GeneratorStatus["PRECONDITION_FAILED"] = "precondition failed";
    GeneratorStatus["UNNAMED_PROJECT"] = "";
})(GeneratorStatus = exports.GeneratorStatus || (exports.GeneratorStatus = {}));
/*=========================================================================
*             Generators
* =========================================================================
 */
// TODO: add generation status
// TODO: add generation precondition handling
/**
 * AbstractGenerator.
 * This class serves as a base class for developer written generators.
 * A generator create some ASTCollection (possibly with only one AST).
 * Its contains convenience methods that make it simple to
 * open/write/save AST without knowing of AST and ASTCollections.
 * the details of the AS
 */
var AbstractGenerator = /** @class */ (function () {
    function AbstractGenerator(debug, eventFns) {
        if (debug === void 0) { debug = true; }
        if (eventFns === void 0) { eventFns = undefined; }
        this.astCollection = new asts_1.ASTCollection(this, debug, eventFns);
        this.status = GeneratorStatus.UNDEFINED;
        this.debug = debug;
        this.eventFns = eventFns;
        this.postGenerateFun = null;
        this.errorMessage = null;
    }
    // generate(): void {
    //     console.assert(arguments.length === 0)
    //     throw new Error('generate() is not implemented by generator')
    // }
    // TODO: move this function to misc module
    /**
     * Helper to compute easily output file base on
     * project file using its path and basename
     * (for instance /h/zarwinn/proj.mdj
     *
     * @param extension extension of the generated file.
     * @param relativeDirectory directory where the file as to be saved.
     * @param basename the name of the file. See below.
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
        // @tscheck
        // console.assert(
        //     typeof extension === 'string'
        //     && extension[0] === ".",
        //     extension)
        // console.assert(
        //     typeof relativeDirectory === 'string', relativeDirectory)
        // console.assert(
        //     basename === null
        //     || typeof basename === 'string', basename)
        var parts = path.parse(app.project.filename);
        var fileDirectory = path.join(parts.dir, relativeDirectory);
        var fileBasename = (basename ? basename : parts.name);
        var filename = path.join(fileDirectory, fileBasename + extension);
        return filename;
    };
    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods call
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------
    AbstractGenerator.prototype.openAST = function (filename, role, elements) {
        if (role === void 0) { role = "main"; }
        if (elements === void 0) { elements = []; }
        // @tscheck
        // console.assert(typeof filename === 'string', filename)
        // console.assert(typeof role === 'string', role)
        // console.assert(elements instanceof Array, elements)
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        return this.astCollection.openAST(filename, role, elements);
    };
    AbstractGenerator.prototype.reopenAST = function (ast) {
        this.astCollection.reopenAST(ast);
    };
    AbstractGenerator.prototype.checkCurrentAST = function () {
        if (this.astCollection.currentAST === null) {
            var message = "currentAST is null.";
            new traces_1.TraceErrorReporter('asts', message, this.eventFns).throw();
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
    AbstractGenerator.prototype.save = function () {
        this.checkCurrentAST();
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
        this.checkCurrentAST();
        return this.astCollection.currentAST.getPlainText();
    };
    AbstractGenerator.prototype.getLineNumberedText = function () {
        this.checkCurrentAST();
        return this.astCollection.currentAST.getLineNumberedText();
    };
    AbstractGenerator.prototype.getErrorMessage = function () {
        return this.errorMessage;
    };
    /**
     * Check a precondition for the doGenerate function to run.
     * Return true if the precondition is full filled otherwise
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
        this.checkCurrentAST();
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
//# sourceMappingURL=generators.js.map