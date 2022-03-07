"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractProcessor = void 0;
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
// exports.AbstractProcessor = AbstractProcessor
//# sourceMappingURL=processors.js.map