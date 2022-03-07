/**
 * This module aims to create transformation developer bettor errors,
 * with a better accuracy. Since developers modify only the generators.js
 * file the idea is to search in the stack trace where was the last
 * location in this file.
 */

// TODO: make it a parameter
const fs = require("fs");
let FILE_TRACED = "generator.js"

// TODO: generalize and make stack extraction more robust

function numberOrNull(value) {
    const x = parseInt(value)
    return (x === NaN ? null : x)
}


export class TracedLocation {
    private options: any;
    private class_: any;
    private function_: any;
    private filePath: any;
    private fileBasename: any;
    private lineNumber: number;
    private columnNumber: number;
    private codeLine: string;

    constructor(options) {
        this.options = options
        if (options) {
            this.class_ = options['class_']
            this.function_ = options['function_']
            this.filePath = options['filePath']
            this.fileBasename = options['fileBasename']
            this.lineNumber = numberOrNull(options['lineNumber'])
            this.columnNumber = numberOrNull(options['columnNumber'])
            this.codeLine = this._getCodeLine()
        }
    }

    isDefined() {
        return (this.options)
    }

    _getCodeLine() {
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

    getLineSpec() {
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

    getPositionDescription(header) {
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
 */
function firstTraceLocation(errorObject = undefined) {
    console.log('DG:91', FILE_TRACED)
    if (FILE_TRACED) {
        let stack_trace
        if (errorObject) {
            stack_trace = errorObject.stack
        } else {
            stack_trace = new Error().stack
        }
        // TODO: generalize stack extraction. here FILE_TRACED inside
        // see https://regex101.com/r/2AViNI/1
        const re_prefix = ' *at '
        const re_fun = '((?<class_>\\w+)\\.)?(?<function_>\\w+)'
        const re_file = ' \\((?<filePrefix>.*)(?<fileBasename>' + FILE_TRACED + ')'
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
            return new TracedLocation(
                {
                    class_ : groups["class_"],
                    function_ : groups["function_"],
                    fileBasename : groups["fileBasename"],
                    filePath : (
                        groups["filePrefix"]+groups["fileBasename"]
                    ),
                    lineNumber : groups["lineNumber"],
                    columnNumber : groups["columnNumber"]
                })
        } else {
             return new TracedLocation(undefined)
        }
    } else {
        return new TracedLocation(undefined)
    }
}

export class TracedError extends Error {
    component: any;
    private location: any;

    constructor(message, component, location) {
        super(message)
        this.component = component
        this.location = location
    }

}


export class TraceErrorReporter {
    private component: any;
    private message: string;
    private exception: Error;
    private location: TracedLocation;
    private eventFns: any;

    /**
     * Report an error
     * @param {string} component The name of the component reporting the error.
     * @param {string|Error} messageOrException Message for a new
     * error to create or an exception (javascript Error).
     * @param {map(...onError)}  eventFns Handlers. Event onError is emitted.
     */
    constructor(
            component: string,
            messageOrException: string | Error,
            eventFns = undefined) {
        console.assert(typeof component === 'string')
        console.assert(
            typeof messageOrException === 'string'
            || messageOrException instanceof Error
        )
        this.component = component
        if (messageOrException instanceof Error) {
            this.message = messageOrException.message
            this.exception = messageOrException
        } else {
            this.message = messageOrException
            this.exception = null
        }
        this.eventFns = eventFns
        this.location = firstTraceLocation(this.exception)
        console.assert(this.location instanceof TracedLocation)
        if (eventFns && eventFns["onError"]) {
            eventFns["onError"](this)
        }
    }

    throw() {
        if (this.exception) {
            throw this.exception
        } else {
            throw new TracedError(
                this.fullMessage(),
                this.component,
                this.location)
        }
    }


    fullMessage() {
        return (
            'Error reported by the "'+this.component+'" component:\n'
            + this.message
            + ('\n'+this.location.getPositionDescription('' +
                'Last user location:')))
    }
}


// exports.TraceErrorReporter = TraceErrorReporter
// exports.TracedError = TracedError
// exports.TracedLocation = TracedLocation