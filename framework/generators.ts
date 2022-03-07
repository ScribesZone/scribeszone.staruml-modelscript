declare var type : any
declare var app : any

import * as path from "path"
import { ASTCollection } from "./asts"
const { asString } = require("./models")
import { TraceErrorReporter, TracedError } from './traces'


const generatorStatus = {
    UNDEFINED : "undefined",
    OK : "ok",
    EXCEPTION : "exception",
    PRECONDITION_FAILED : "precondition failed",
    UNAMED_PROJECT : ''
}


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
class AbstractGenerator {
    private debug: boolean
    private eventFns: any
    private astCollection: any
    private postGenerateFun: any
    private status: string
    private errorMessage: any

    constructor(debug = true,
                eventFns = undefined) {
        this.debug = debug
        this.eventFns = eventFns
        this.astCollection = new ASTCollection(this, debug, eventFns)
        this.postGenerateFun = null
        this.status = generatorStatus.UNDEFINED
        this.errorMessage = null
    }

    /**
     * Generate the code. This method must be written by developer
     * generator.
     */
    generate() {
        console.assert(arguments.length === 0)
        throw new Error('generate() is not implemented by generator')
    }



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
    getProjectBasedFilename(
            extension,
            relativeDirectory = '.',
            basename = null) {
        console.assert(
            typeof extension === 'string'
            && extension[0] === ".",
            extension)
        console.assert(
            typeof relativeDirectory === 'string', relativeDirectory)
        console.assert(
            basename === null
            || typeof basename === 'string', basename)
        const parts = path.parse(app.project.filename)
        const fileDirectory = path.join(parts.dir, relativeDirectory)
        const fileBasename = (basename ? basename : parts.name)
        const filename = path.join(
            fileDirectory,
            fileBasename + extension)
        return filename
    }

    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods calls
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------

    openAST(filename, role="main", elements= []) {
        console.assert(typeof filename === 'string', filename)
        console.assert(typeof role === 'string', role)
        console.assert(elements instanceof Array, elements)
        console.assert(
            elements.every( element => element instanceof type.Model),
            elements)
        return this.astCollection.openAST(
            filename,
            role,
            elements)
    }

    reopenAST(ast) {
        this.astCollection.reopenAST(ast)
    }

    write(text, category=undefined, element=undefined) {
        this.astCollection.currentAST.write(text, category, element)
    }

    writeln(text=undefined, category=undefined, element=undefined) {
        this.astCollection.currentAST.writeln(text, category, element)
    }

    writeIdentifier(text, element) {
        this.astCollection.currentAST.write(text, 'identifier1', element)
    }

    save() {
        this.astCollection.currentAST.save()
    }

    end() {
        this.astCollection.end()
    }

    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods calls
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------





    getPlainText() {
        return this.astCollection.currentAST.getPlainText()
    }

    getLineNumberedText() {
        return this.astCollection.currentAST.getLineNumberedText()
    }

    getErrorMessage() {
        return this.errorMessage
    }

    /**
     * Check a precondition for the doGenerate function to run.
     * Return true if the precondition is full filled other wize
     * return as a string an error message.
     * @returns {string|boolean}
     */
    checkPrecondition() {
        if (false) {
            return "TEST: FAKE PRECONDITION FAILURE MESSAGE" // TEST:
        }
        return true
    }

    showError() {
        this.errorMessage.split('\n').reverse().forEach( line => {
                app.toast.error(line, 120);
            }
        )
        console.log('[GENERATOR]: Error: '+this.errorMessage)
    }

    showSuccess() {
        app.toast.info('file saved', 30)
    }

    getStatus() {
        return this.status
    }

    isGenerationSuccessful() {
        return this.status === generatorStatus.OK
    }

    postGenerate(fun) {
        this.postGenerateFun = fun
    }

    doGenerate() {
        if (! app.project.filename) {
            this.status = generatorStatus.UNAMED_PROJECT
            this.errorMessage = "Project not saved. Generation cancelled."
            this.showError()
            return
        }
        const precondition = this.checkPrecondition()
        if ( precondition !== true) {
            this.status = generatorStatus.PRECONDITION_FAILED
            this.errorMessage = precondition
            this.showError()
            return
        }
        try {
            if (false) {  // TEST: change to test generation failure
                throw Error('FAKE GENERATION FAILURE')
            }
            this.generate()
            this.status = generatorStatus.OK
            this.showSuccess()
            if (this.debug) {
                console.log('[GENERATOR]: ASTCollection stats :',
                    asString(this.astCollection.getStats()))
            }
        } catch (error) {
            if (error instanceof TracedError) {
                // Deal with error already reported/generated by generator or writer
                this.errorMessage = (
                    "Generation failed. An error was reported by "
                    + error.component + " component.\n"
                    + "Use DevTools for more information : Alt+Shift+T")
                this.status = generatorStatus.EXCEPTION
                this.showError()
                throw error
            } else {
                // unexpected error occurs
                this.errorMessage = (
                    "Generation fails with an exception:\n"
                    + error.message + '\n'
                    + "Use DevTools to see issues : Alt+Shift+T")
                this.status = generatorStatus.EXCEPTION
                this.showError()
                new TraceErrorReporter('generator', error, this.eventFns).throw()
            }
        }

        if (this.postGenerateFun) {
            if (this.debug) {
                console.log('[GENERATORS]: Calling post generation function')
            }
            const that = this
            this.postGenerateFun(that)
        }

    }

    ruleCheck(callerArguments, signature) {
        // TODO
    }

    ruleEnd() {
        // TODO
    }


    /*
    This test function should be called from  somewhere in generator.js to
    test how errors are reported.
     */
    __testGenerateModel() {
        // TEST:
        if (false) {
            this.write(null)
        }
        // TEST
        if (false) {
            this.write([])
        }
        // TEST:
        if (false) {
            this.write('line1\nline2')
        }
        // TEST:
        if (false) {
            this.write('while','kixword')
        }
        // TEST:
        if (false) {
            this.write('person','identifier1','not an element')
        }
        // TEST:
        if (false) {
            // undefined_ref
        }
        // TEST:
        if (false) {
            // "test".forEach()
        }
    }
}

exports.AbstractGenerator = AbstractGenerator
exports.status = generatorStatus
