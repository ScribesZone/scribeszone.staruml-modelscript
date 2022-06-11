"use strict";
/**
 * This module aims at creating errors by searching the last function
 * in the call stack in a given module. This makes it easier to detect
 * error and improving their accuracy. CURRENTLY THE FILE IS NOT GIVEN
 * AS A PARAMETER, THIS MODULE IS CURRENTLY USED FOR
 *  transformation developers modify are changing only the
 * "generators.js" file the idea is to search in the stack trace where was
 * the last location in this file.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceErrorReporter = exports.TracedLocation = void 0;
var fs = require("fs");
function numberOrNull(value) {
    var x = parseInt(value);
    return (isNaN(x) ? null : x);
}
// noinspection UnnecessaryLocalVariableJS
/**
 * A traced location in source code with more details.
 */
var TracedLocation = /** @class */ (function () {
    function TracedLocation(options) {
        this.options = options;
        if (options !== null) {
            this.class_ = options['class_'];
            this.function_ = options['function_'];
            this.filePath = options['filePath'];
            this.fileBasename = options['fileBasename'];
            this.lineNumber = numberOrNull(options['lineNumber']);
            this.columnNumber = numberOrNull(options['columnNumber']);
            this.codeLine = this._getCodeLine();
        }
    }
    TracedLocation.prototype.isDefined = function () {
        return (this.options);
    };
    TracedLocation.prototype._getCodeLine = function () {
        if (this.filePath && this.lineNumber) {
            try {
                var file_content = fs.readFileSync(this.filePath, 'utf8');
                var line = file_content.split('\n')[this.lineNumber - 1];
                return line;
            }
            catch (error) {
                // ignore all exceptions in this block
                return null;
            }
        }
        else {
            return null;
        }
    };
    TracedLocation.prototype.getLineSpec = function () {
        if (this.isDefined()) {
            return (this.fileBasename
                + (this.lineNumber
                    ? (":" + this.lineNumber
                        + (this.columnNumber
                            ? ':' + this.columnNumber
                            : ''))
                    : '')
                + (this.function_
                    ? (" " + this.function_ + '()')
                    : ''));
        }
        else {
            return '';
        }
    };
    TracedLocation.prototype.getPositionDescription = function (header) {
        if (this.isDefined()) {
            var code_line = this.codeLine;
            return ((header ? header + '\n' : '')
                + '>>> ' + this.getLineSpec()
                + (code_line ? '\n>>> ' + code_line : ''));
        }
        else {
            return "";
        }
    };
    return TracedLocation;
}());
exports.TracedLocation = TracedLocation;
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
function firstTraceLocation(javascriptFileTraced, errorObject) {
    if (errorObject === void 0) { errorObject = null; }
    var stack_trace;
    if (errorObject instanceof Error) {
        stack_trace = errorObject.stack;
    }
    else {
        stack_trace = new Error().stack;
    }
    // see https://regex101.com/r/2AViNI/1
    var re_prefix = ' *at ';
    var re_fun = '((?<class_>\\w+)\\.)?(?<function_>\\w+)';
    var re_file = ' \\((?<filePrefix>.*)(?<fileBasename>' + javascriptFileTraced + ')';
    var re_line_number = ':(?<lineNumber>\\d+)';
    var re_column_number = '(:(?<columnNumber>\\d+))?';
    var re_full = (re_prefix
        + re_fun
        + re_file
        + re_line_number
        + re_column_number);
    var re = new RegExp(re_full);
    var match = re.exec(stack_trace);
    if (match) {
        var groups = match.groups;
        if (groups) {
            return new TracedLocation({
                class_: groups["class_"],
                function_: groups["function_"],
                fileBasename: groups["fileBasename"],
                filePath: (groups["filePrefix"] + groups["fileBasename"]),
                lineNumber: groups["lineNumber"],
                columnNumber: groups["columnNumber"]
            });
        }
        else {
            return new TracedLocation(null);
        }
    }
    else {
        return new TracedLocation(null);
    }
}
/**
 * Exception raised by TraceErrorReporter
 */
var TracedError = /** @class */ (function (_super) {
    __extends(TracedError, _super);
    function TracedError(message, component, location) {
        var _this = _super.call(this, message) || this;
        _this.component = component;
        _this.location = location;
        return _this;
    }
    return TracedError;
}(Error));
/**
 * Utility to report an error where the error is located to the
 * last position in trace.
 * No event is emitted.
 */
var TraceErrorReporter = /** @class */ (function () {
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
    function TraceErrorReporter(javascriptFileToTrace, component, messageOrException) {
        this.javascriptFileToTrace = javascriptFileToTrace;
        this.component = component;
        if (messageOrException instanceof Error) {
            this.message = messageOrException.message;
            this.exception = messageOrException;
        }
        else {
            this.message = messageOrException;
            this.exception = null;
        }
        this.location = firstTraceLocation(javascriptFileToTrace, this.exception);
    }
    TraceErrorReporter.prototype.throw = function () {
        if (this.exception) {
            throw this.exception;
        }
        else {
            throw new TracedError(this.fullMessage(), this.component, this.location);
        }
    };
    TraceErrorReporter.prototype.fullMessage = function () {
        return ('Error reported by the "' + this.component + '" component:\n'
            + this.message
            + ('\n' + this.location.getPositionDescription('' +
                'Last user location:')));
    };
    return TraceErrorReporter;
}());
exports.TraceErrorReporter = TraceErrorReporter;
//# sourceMappingURL=traces.js.map