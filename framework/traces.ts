/**
 * This module aims at creating errors by searching the last function
 * in the call stack in a given module. This makes it easier to detect
 * error and improving their accuracy. CURRENTLY THE FILE IS NOT GIVEN
 * AS A PARAMETER, THIS MODULE IS CURRENTLY USED FOR
 *  transformation developers modify are changing only the
 * "generators.js" file the idea is to search in the stack trace where was
 * the last location in this file.
 */

import * as fs from "fs"

function numberOrNull(value: string) {
    const x = parseInt(value)
    return (isNaN(x) ? null : x)
}

interface RawLocation {
    class_: string
    function_: string
    fileBasename: string
    filePath: string
    lineNumber : string
    columnNumber : string
}

// noinspection UnnecessaryLocalVariableJS
/**
 * A traced location in source code with more details.
 */
export class TracedLocation {
    public readonly class_: string
    public readonly function_: string
    public readonly filePath: string
    public readonly fileBasename: string
    public readonly lineNumber: number | null
    public readonly columnNumber: number | null
    public readonly codeLine: string | null

    private readonly options: any

    constructor(options: RawLocation | null) {
        this.options = options
        if (options !== null) {
            this.class_ = options['class_']
            this.function_ = options['function_']
            this.filePath = options['filePath']
            this.fileBasename = options['fileBasename']
            this.lineNumber = numberOrNull(options['lineNumber'])
            this.columnNumber = numberOrNull(options['columnNumber'])
            this.codeLine = this._getCodeLine()
        }
    }

    isDefined(): boolean {
        return (this.options)
    }

    private _getCodeLine(): string | null {
        if (this.filePath && this.lineNumber) {
            try {
                const file_content = fs.readFileSync(this.filePath, 'utf8')
                const line = file_content.split('\n')[this.lineNumber-1]
                return line
            } catch(error) {
                // ignore all exceptions in this block
                return null
            }
        } else {
            return null
        }
    }

    getLineSpec(): string {
        if (this.isDefined()) {
            return (
                this.fileBasename
                + (
                    this.lineNumber
                    ? (
                        ":" + this.lineNumber
                        + (this.columnNumber
                            ? ':'+this.columnNumber
                            : ''))
                    : '')
                + (
                    this.function_
                    ? (" " + this.function_ + '()')
                    : '')
            )
        } else {
            return ''
        }
    }

    getPositionDescription(header): string {
        if (this.isDefined()) {
            const code_line = this.codeLine
            return (
                ( header ? header+'\n' : '')
                + '>>> ' + this.getLineSpec()
                + (code_line ? '\n>>> '+code_line : ''))
        } else {
            return ""
        }
    }

}

/**
 * Extract from the stack the last known location in the fileTraced file.
 * If an error object (javascript Error(...)) is not provided then create
 * an Error just to get the trace. This error is not thrown.
 * The implementation is quite ugly but this is the only way (?) to get
 * this information since .caller attribute has been removed in strict mode.
 * Based on https://stackoverflow.com/questions/29572466/how-do-you-find-out-the-caller-function-in-javascript-when-use-strict-is-enabled
 *
 * Example
 * -------
 *
 * see https://regex101.com/r/2AViNI/1
 *
 * Here is an example of file trace produced.
 *
 * File trace here provided as an example.
 * Note that class_, function_ might not be there. Same thing for other components.
 * The trace below has been made with copy paste.
 *
 *     at firstTraceLocation (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/framework/traces.js:52:27)
 *     at new TraceErrorReporter (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/framework/traces.js:111:25)
 *     at Writer.write (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/framework/writer.js:147:13)
 *     at USEOCLGenerator.write (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/framework/generator.js:54)
 *     at USEOCLGenerator.__testGenerateModel (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/framework/generators.js:185:18)
 *     at USEOCLGenerator.generateModel (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/generator.js:119:56)
 *     at USEOCLGenerator.generate (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/generator.js:132)
 *     at USEOCLGenerator.doGenerate (/D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/framework/generators.js:138:18)
 *     at /D2/ScribesZone/StarUMLZone/scribeszone.staruml-useocl/main.js:95:27
 *     at CommandManager.execute (/opt/StarUML/resources/app.asar/src/engine/command-manager.js:104:22)
 */

function firstTraceLocation(
    javascriptFileTraced: string,
    errorObject: Error | null = null
)
{
    let stack_trace
    if (errorObject instanceof Error) {
        stack_trace = errorObject.stack
    } else {
        stack_trace = new Error().stack
    }
    // see https://regex101.com/r/2AViNI/1
    const re_prefix = ' *at '
    const re_fun = '((?<class_>\\w+)\\.)?(?<function_>\\w+)'
    const re_file = ' \\((?<filePrefix>.*)(?<fileBasename>' + javascriptFileTraced + ')'
    const re_line_number = ':(?<lineNumber>\\d+)'
    const re_column_number = '(:(?<columnNumber>\\d+))?'
    const re_full = (
        re_prefix
        + re_fun
        + re_file
        + re_line_number
        + re_column_number)
    const re = new RegExp(re_full)
    let match = re.exec(stack_trace)
    if (match) {
        const groups = match.groups
        if (groups) {
            return new TracedLocation(
                {
                    class_: groups["class_"],
                    function_: groups["function_"],
                    fileBasename: groups["fileBasename"],
                    filePath: (
                        groups["filePrefix"] + groups["fileBasename"]
                    ),
                    lineNumber: groups["lineNumber"],
                    columnNumber: groups["columnNumber"]
                })
        } else {
            return new TracedLocation(null)
        }
    } else {
         return new TracedLocation(null)
    }
}

/**
 * Exception raised by TraceErrorReporter. This exception is raised but
 * then catched by
 */
export class TracedError extends Error {
    public readonly component: string
    public readonly reporter: TracedErrorReporter
    public readonly location: TracedLocation

    constructor(
        reporter: TracedErrorReporter,
        message: string,
        component: string,
        location: TracedLocation
    ) {
        super(message)
        this.reporter = reporter
        this.component = component
        this.location = location
    }
}



/**
 * Utility to report an error where the error is located to the
 * last position in a given file.
 * No event is emitted.
 */
export class TracedErrorReporter {
    public readonly component: string
    public readonly message: string
    public readonly exception: Error | null
    public readonly location: TracedLocation
    public readonly javascriptFileToTrace: string

    /**
     * Report an error.
     * @param {string} javascriptFileToTrace the name of the javascript file
     * to trace. That is the error is reported in the corresponding location
     * in the stack trace.
     * @param {string} component The name of the component reporting the error.
     * There is no definition for the concept of "component". Just a string.
     * @param {string|Error} messageOrException Message for a new
     * error to create or an exception (javascript Error).
     *
     * NOTE: the error is not thrown by this constructor. Use throw() to
     * throw the actual error.
     */
    constructor(
            javascriptFileToTrace: string,
            component: string,
            messageOrException: string | Error) {
        this.javascriptFileToTrace = javascriptFileToTrace
        this.component = component
        if (messageOrException instanceof Error) {
            this.message = messageOrException.message
            this.exception = messageOrException
        } else {
            this.message = messageOrException
            this.exception = null
        }
        this.location = firstTraceLocation(
            javascriptFileToTrace,
            this.exception)
    }


    throw(): never {
        if (this.exception) {
            throw this.exception
        } else {
            throw new TracedError(
                this,
                this.fullMessage(),
                this.component,
                this.location)
        }
    }

    fullMessage():string {
        return (
            'Error reported by the "'+this.component+'" component:\n'
            + this.message
            + ('\n'+this.location.getPositionDescription('' +
                'Last user location:')))
    }
}