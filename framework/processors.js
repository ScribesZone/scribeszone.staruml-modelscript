"use strict";
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
exports.ShellProcessorResult = exports.ProcessorResult = exports.AbstractProcessor = void 0;
var AbstractProcessor = /** @class */ (function () {
    function AbstractProcessor(debug) {
        if (debug === void 0) { debug = true; }
        this.debug = debug;
        this.compilationPanel = null;
        this.result = null;
        this.postProcessResult = null;
    }
    AbstractProcessor.prototype.isProcessorEnabled = function () {
        throw new Error('isProcessorEnabled() is not implemented by processor');
    };
    AbstractProcessor.prototype.setCompilationPanel = function (compilationPanel) {
        this.compilationPanel = compilationPanel;
    };
    AbstractProcessor.prototype.doProcess = function () {
        throw new Error('doProcess() must be implemented');
    };
    return AbstractProcessor;
}());
exports.AbstractProcessor = AbstractProcessor;
var ProcessorResult = /** @class */ (function () {
    function ProcessorResult() {
    }
    return ProcessorResult;
}());
exports.ProcessorResult = ProcessorResult;
var ShellProcessorResult = /** @class */ (function (_super) {
    __extends(ShellProcessorResult, _super);
    function ShellProcessorResult(shellCommand) {
        var _this = _super.call(this) || this;
        _this.shellCommand = shellCommand;
        return _this;
    }
    return ShellProcessorResult;
}(ProcessorResult));
exports.ShellProcessorResult = ShellProcessorResult;
//# sourceMappingURL=processors.js.map