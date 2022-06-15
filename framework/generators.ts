declare var type : any
declare var app : any

import * as path from "path"

import * as staruml from './staruml'

import {
    AST,
    ASTCollection,
    Category,
    ASTTracedErrorReporter,
    Token, Line, ASTFuns
} from "./asts"
import { TracedError } from "./traces"
import { asString } from "./models"


export enum GeneratorStatus {
    UNDEFINED = "undefined",
    OK = "ok",
    EXCEPTION = "exception",
    PRECONDITION_FAILED = "precondition failed",
    UNNAMED_PROJECT = ''
}

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

export function getProjectBasedFilename(
        extension: string,
        relativeDirectory: string = '.',
        basename: string | null = null) {
    console.assert(extension[0] === ".", extension)
    const parts = path.parse(app.project.filename)
    const fileDirectory = path.join(parts.dir, relativeDirectory)
    const fileBasename = (basename ? basename : parts.name)
    // noinspection UnnecessaryLocalVariableJS
    const filename = path.join(
        fileDirectory,
        fileBasename + extension)
    return filename
}

/*=========================================================================
*             Generators
* =========================================================================
 */


export interface GeneratorFuns extends ASTFuns {
}


// noinspection PointlessBooleanExpressionJS,UnreachableCodeJS
/**
 * AbstractGenerator.
 * This class serves as a base class for developer written generators.
 * A generator create a ASTCollection (possibly with only one AST).
 * Its contains convenience methods that make it simple to
 * open/write/save AST without knowing of AST and ASTCollections.
 * the details of the AS
 */

export abstract class AbstractGenerator {
    public readonly astCollection: ASTCollection
    public status: GeneratorStatus
    public errorMessage: string |  null
    
    private readonly debug: boolean

    // TODO: move to private
    //      currently the generator write in eventFns, this should be fixed
    protected eventFns: any // TODO: to be typed

    private postGenerateFun: Function | null

    protected constructor(debug = true,
                          eventFns : GeneratorFuns = {} ) {
        this.astCollection = new ASTCollection(this, debug, eventFns)
        this.status = GeneratorStatus.UNDEFINED
        this.debug = debug
        this.eventFns = eventFns
        this.postGenerateFun = null
        this.errorMessage = null
    }

    /**
     * Check a precondition for the doGenerate function to run.
     * A particular generator could check for instance that
     * given staruml elements of a proper type are selected.
     * By default there is no precondition.
     *
     * Return true if the precondition is fulfilled otherwise
     * return as a string an error message.
     * @returns {string|boolean}
     */
    protected checkPrecondition() : string|boolean {
         return true
    }

    /**
     * Generate the code. This method must be written by developer
     * generator.
     */
    protected abstract generate(): void

    // TODO: move this function to misc module





    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods call
    // astCollection or currentAST methods.
    //---------------------------------------------------------------------

    protected openAST(
        filename: string,
        label: string = "",
        role: string = "main",
        elements: Array<staruml.Element> = []
    ) : AST  {
        console.assert(
            elements.every( element => element instanceof type.Model),
            elements)
        return this.astCollection.openAST(
            filename,
            label,
            role,
            elements)
    }

    protected reopenAST(ast) {
        this.astCollection.reopenAST(ast)
    }

    private checkCurrentAST() {
        if (this.astCollection.currentAST === null) {
            const message = "currentAST is null."
            new ASTTracedErrorReporter(  // TODO: emit a generator level error
                'asts',   // TODO: currently we have no event except at ast level
                message,
                this.eventFns).throw()
        }
    }

    protected write(
        text: string,
        category: Category = "default",
        element: staruml.Model | null = null
    ): void {
        this.checkCurrentAST()
        this.astCollection.currentAST!.write(text, category, element)
    }

    protected writeln(
        text?: string,
        category: Category = "default",
        element: staruml.Model | null = null
    ): void {
        this.checkCurrentAST()
        this.astCollection.currentAST!.writeln(text, category, element)
    }

    protected writeIdentifier(
        text: string,
        element : staruml.Model | null = null
    ): void {
        this.checkCurrentAST()
        this.astCollection.currentAST!.write(text, 'identifier1', element)
    }

    protected ruleCheck(callerArguments, signature) {
        // TODO
    }

    protected ruleEnd() {
        // TODO
    }


    protected save(): void {
        this.checkCurrentAST()
        this.astCollection.currentAST!.save()
    }

    protected end(): void {
        this.astCollection.end()
    }

    //---------------------------------------------------------------------
    // methods wrapping AST and ASTCollection
    // Provided from developer convenience. These methods calls
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



    private showError() {   // TODO: this should go elsewhere
        this.checkCurrentAST()
        if (this.errorMessage) {
            this.errorMessage.split('\n').reverse().forEach( line => {
                app.toast.error(line, 120)
            })
        }
        console.log('[GENERATOR]: Error: '+this.errorMessage)
    }

    // noinspection JSMethodCanBeStatic
    private showSuccess() {       // TODO: this should go elsewhere
        app.toast.info('file saved', 30)
    }

    // private getStatus() {
    //     return this.status
    // }

    isGenerationSuccessful() {
        return this.status === GeneratorStatus.OK
    }

    postGenerate(fun) {
        this.postGenerateFun = fun
    }

    public doGenerate() {
        if (! app.project.filename) {
            this.status = GeneratorStatus.UNNAMED_PROJECT
            this.errorMessage = "Project not saved. Generation cancelled."
            this.showError()
            return
        }
        const precondition = this.checkPrecondition()
        if ( precondition !== true) {
            this.status = GeneratorStatus.PRECONDITION_FAILED
            this.errorMessage = precondition as string
            this.showError()
            return
        }
        try {
            if (false) {  // TEST: change to test generation failure
                throw Error('FAKE GENERATION FAILURE')
            }
            this.generate()
            this.status = GeneratorStatus.OK
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
                this.status = GeneratorStatus.EXCEPTION
                this.showError()
                throw error
            } else {
                // unexpected error occurs
                this.errorMessage = (
                    "Generation fails with an exception:\n"
                    + error.message + '\n'
                    + "Use DevTools to see issues : Alt+Shift+T")
                this.status = GeneratorStatus.EXCEPTION
                this.showError()
                new ASTTracedErrorReporter( // TODO: fix this
                    'generator', error, this.eventFns).throw()
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



    /*
    This test function should be called from  somewhere in generator.js to
    test how errors are reported.
     */
    __testGenerateModel() {
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
            this.write('line1\nline2')
        }
        // TEST:
        // @tscheck
        // if (false) {
        //     this.write('while','kixword')
        // }
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

