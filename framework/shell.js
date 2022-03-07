"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellCommand = exports.ShellCommandResult = void 0;
var exec = require("child_process").exec;
var ShellCommandResult = /** @class */ (function () {
    function ShellCommandResult(shellCommand, error, stdout, stderr) {
        console.assert(shellCommand instanceof ShellCommand);
        console.assert(error === null || error instanceof Error);
        console.assert(typeof stdout === 'string');
        console.assert(typeof stderr === 'string');
        this.shellCommand = shellCommand;
        this.error = error;
        this.stderr = stderr;
        this.stdout = stdout;
    }
    ShellCommandResult.prototype.hasErrors = function () {
        return ((this.error !== null)
            || (this.stderr !== ''));
    };
    ShellCommandResult.prototype.getText = function () {
        var result = '';
        if (this.error && (this.error.message !== 'Command failed: ' + this.stderr)) {
            result += 'Error code is ' + this.error.message + '\n';
        }
        if (this.stderr) {
            result += 'Error output : \n' + this.stderr + '\n\n';
        }
        result += 'Output : \n' + this.stdout + '\n\n';
        return result;
    };
    return ShellCommandResult;
}());
exports.ShellCommandResult = ShellCommandResult;
// Note sure if it would be best to replace this code with
// a promise. Await can be done only in async function
// and execute is not.
// SEE "How to use Promise with exec in Node.js"
// https://ali-dev.medium.com/how-to-use-promise-with-exec-in-node-js-a39c4d7bbf77
var ShellCommand = /** @class */ (function () {
    function ShellCommand(command, postExecutionFun, label, // mostly to simplify console messages
    debug) {
        if (postExecutionFun === void 0) { postExecutionFun = null; }
        if (label === void 0) { label = ''; }
        if (debug === void 0) { debug = false; }
        console.assert(typeof command === 'string');
        console.assert(postExecutionFun === null
            || typeof postExecutionFun === 'function');
        console.assert(typeof label === 'string');
        this.command = command;
        this.label = label;
        this.postExecutionFun = postExecutionFun;
        this.debug = debug;
        this.result = null;
        this.postExecutionResult = null;
    }
    /**
     * Executes a shell command and returns it as a promise
     * @returns {Promise<true>}
     */
    ShellCommand.prototype.execute = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.debug) {
                console.log('[SHELL]: START: "'
                    + (_this.label || _this.command)
                    + '" ...', _this);
            }
            exec(_this.command, function (error, stdout, stderr) {
                _this.result = new ShellCommandResult(_this, error, stdout, stderr);
                if (_this.debug) {
                    console.log('[SHELL]: END: '
                        + (_this.label || _this.command)
                        + '" returns '
                        + (_this.result.hasErrors() ? '' : 'no ')
                        + 'error.', _this);
                }
                if (_this.postExecutionFun) {
                    _this.postExecutionResult = (_this.postExecutionFun(_this.result));
                }
                else {
                    _this.postExecutionResult = _this.result;
                }
                var that = _this;
                resolve(that);
            });
        });
    };
    return ShellCommand;
}());
exports.ShellCommand = ShellCommand;
//# sourceMappingURL=shell.js.map