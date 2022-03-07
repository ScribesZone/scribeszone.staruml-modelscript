"use strict";
/**
 * This module aims to create transformation developer bettor errors,
 * with a better accuracy. Since developers modify only the generators.js
 * file the idea is to search in the stack trace where was the last
 * location in this file.
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
exports.TraceErrorReporter = exports.TracedError = exports.TracedLocation = void 0;
// TODO: make it a parameter
var fs = require("fs");
var FILE_TRACED = "generator.js";
// TODO: generalize and make stack extraction more robust
function numberOrNull(value) {
    var x = parseInt(value);
    return (x === NaN ? null : x);
}
var TracedLocation = /** @class */ (function () {
    function TracedLocation(options) {
        this.options = options;
        if (options) {
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
 */
function firstTraceLocation(errorObject) {
    if (errorObject === void 0) { errorObject = undefined; }
    console.log('DG:91', FILE_TRACED);
    if (FILE_TRACED) {
        var stack_trace = void 0;
        if (errorObject) {
            stack_trace = errorObject.stack;
        }
        else {
            stack_trace = new Error().stack;
        }
        // TODO: generalize stack extraction. here FILE_TRACED inside
        // see https://regex101.com/r/2AViNI/1
        var re_prefix = ' *at ';
        var re_fun = '((?<class_>\\w+)\\.)?(?<function_>\\w+)';
        var re_file = ' \\((?<filePrefix>.*)(?<fileBasename>' + FILE_TRACED + ')';
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
            return new TracedLocation(undefined);
        }
    }
    else {
        return new TracedLocation(undefined);
    }
}
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
exports.TracedError = TracedError;
var TraceErrorReporter = /** @class */ (function () {
    /**
     * Report an error
     * @param {string} component The name of the component reporting the error.
     * @param {string|Error} messageOrException Message for a new
     * error to create or an exception (javascript Error).
     * @param {map(...onError)}  eventFns Handlers. Event onError is emitted.
     */
    function TraceErrorReporter(component, messageOrException, eventFns) {
        if (eventFns === void 0) { eventFns = undefined; }
        console.assert(typeof component === 'string');
        console.assert(typeof messageOrException === 'string'
            || messageOrException instanceof Error);
        this.component = component;
        if (messageOrException instanceof Error) {
            this.message = messageOrException.message;
            this.exception = messageOrException;
        }
        else {
            this.message = messageOrException;
            this.exception = null;
        }
        this.eventFns = eventFns;
        this.location = firstTraceLocation(this.exception);
        console.assert(this.location instanceof TracedLocation);
        if (eventFns && eventFns["onError"]) {
            eventFns["onError"](this);
        }
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
// exports.TraceErrorReporter = TraceErrorReporter
// exports.TracedError = TracedError
// exports.TracedLocation = TracedLocation
//# sourceMappingURL=traces.js.map