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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USEOCLProcessor = exports.AbstractCompilation = void 0;
var processors_1 = require("./framework/processors");
var shell_1 = require("./framework/shell");
var asts_1 = require("./framework/asts");
function summarizeErrors(shellCommandResult) {
    if (shellCommandResult.hasErrors()) {
        var nb_errors = shellCommandResult.stderr.split('/n').length;
        console.log('DG53 ', nb_errors);
        console.warn('DG22 STDERR', JSON.stringify(shellCommandResult.stderr));
        return nb_errors + ' errors found';
    }
    else {
        return 'compilation successful';
    }
}
var AbstractCompilation = /** @class */ (function () {
    function AbstractCompilation(usePath, commandLabel) {
        // @tscheck
        // console.assert(typeof usePath === 'string')
        this.usePath = usePath;
        this.shellProcessorResult = null;
        this.commandLabel = commandLabel;
    }
    AbstractCompilation.prototype.getCommand = function () {
        throw new Error('getCommand() must be implemented');
    };
    AbstractCompilation.prototype.__getErroneousCommand = function () {
        if (false) { // TEST: just output
            return 'ls -l';
        }
        if (false) { // TEST: just output
            return 'ls -WRONG ; ls -l';
        }
    };
    AbstractCompilation.prototype.bindProcessorResult = function () {
        throw new Error('bindProcessorResult() must be implemented');
    };
    /**
     *
     * // @returns {Promise<ShellProcessorResult>}
     */
    AbstractCompilation.prototype.doCompile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shell_command;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shell_command = new shell_1.ShellCommand(this.getCommand(), summarizeErrors, this.commandLabel, true);
                        return [4 /*yield*/, shell_command.execute()];
                    case 1:
                        _a.sent();
                        this.processorResult = new processors_1.ShellProcessorResult(shell_command);
                        this.bindProcessorResult();
                        return [2 /*return*/, this.processorResult];
                }
            });
        });
    };
    return AbstractCompilation;
}());
exports.AbstractCompilation = AbstractCompilation;
var ClassModelCompilation = /** @class */ (function (_super) {
    __extends(ClassModelCompilation, _super);
    function ClassModelCompilation(classModelAST, usePath) {
        var _this = _super.call(this, usePath, 'class model compilation') || this;
        console.assert(classModelAST instanceof asts_1.AST, classModelAST);
        console.assert(classModelAST.role === "class");
        _this.classModelAST = classModelAST;
        return _this;
    }
    ClassModelCompilation.prototype.getTraceFilename = function () {
        return this.classModelAST.filename + '.utc';
    };
    ClassModelCompilation.prototype.getCommand = function () {
        return (this.usePath // TODO: deal with incorrect use installation
            + ' -c '
            + this.classModelAST.filename
            + ' > '
            + this.getTraceFilename()
            + ' 2>&1');
    };
    ClassModelCompilation.prototype.bindProcessorResult = function () {
        this.classModelAST.processorResult = this.processorResult;
    };
    return ClassModelCompilation;
}(AbstractCompilation));
var StateModelCompilation = /** @class */ (function (_super) {
    __extends(StateModelCompilation, _super);
    function StateModelCompilation(classModelAST, stateModelAST, usePath) {
        var _this = this;
        var state_name = stateModelAST.elements[0].name;
        _this = _super.call(this, usePath, state_name + ' state compilation') || this;
        console.assert(classModelAST instanceof asts_1.AST, classModelAST);
        console.assert(classModelAST.role === "class");
        console.assert(stateModelAST instanceof asts_1.AST, stateModelAST);
        console.assert(stateModelAST.role === "state");
        _this.classModelAST = classModelAST;
        _this.stateModelAST = stateModelAST;
        return _this;
    }
    StateModelCompilation.prototype.getTraceFilename = function () {
        return this.stateModelAST.filename + '.stc';
    };
    StateModelCompilation.prototype.getCommand = function () {
        return (this.usePath
            + ' -qv '
            + this.classModelAST.filename // TODO: check filename
            + ' '
            + this.stateModelAST.filename // TODO: check filename
            + ' > '
            + this.getTraceFilename()
            + ' 2>&1');
    };
    StateModelCompilation.prototype.bindProcessorResult = function () {
        this.stateModelAST.processorResult = this.processorResult;
    };
    return StateModelCompilation;
}(AbstractCompilation));
var USEOCLProcessor = /** @class */ (function (_super) {
    __extends(USEOCLProcessor, _super);
    function USEOCLProcessor(generator, debug) {
        if (debug === void 0) { debug = true; }
        var _this = _super.call(this, debug) || this;
        _this.generator = generator;
        // this.processorEnabled = useocl.compilation.use.path
        _this.processorEnabled = app.preferences.get('useocl.compilation.compile');
        _this.usePath = app.preferences.get("useocl.compilation.use.path");
        return _this;
    }
    USEOCLProcessor.prototype.isProcessorEnabled = function () {
        return this.processorEnabled;
    };
    USEOCLProcessor.prototype.processClassModel = function (classModelAST) {
        return __awaiter(this, void 0, void 0, function () {
            var compilation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        compilation = (new ClassModelCompilation(classModelAST, this.usePath));
                        return [4 /*yield*/, compilation.doCompile()
                            // const processorResult = new ShellProcessorResult(compilation)
                            // // decorate the ast itself with the result
                            // ast.processorResult = processorResult
                            // return processorResult
                        ];
                    case 1: return [2 /*return*/, _a.sent()
                        // const processorResult = new ShellProcessorResult(compilation)
                        // // decorate the ast itself with the result
                        // ast.processorResult = processorResult
                        // return processorResult
                    ];
                }
            });
        });
    };
    USEOCLProcessor.prototype.processStateModel = function (classModelAST, stateModelAST) {
        return __awaiter(this, void 0, void 0, function () {
            var compilation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        compilation = (new StateModelCompilation(classModelAST, stateModelAST, this.usePath));
                        return [4 /*yield*/, compilation.doCompile()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    USEOCLProcessor.prototype.doProcess = function () {
        return __awaiter(this, void 0, void 0, function () {
            var class_model_ast, class_model_processor_result, states;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('====================== Compilation start');
                        class_model_ast = this.generator.classModelAST;
                        return [4 /*yield*/, this.processClassModel(class_model_ast)];
                    case 1:
                        class_model_processor_result = (_a.sent());
                        console.log('CLASS MODEL COMPILATION FINISHED');
                        if (class_model_processor_result.shellCommand.result.hasErrors()) {
                            console.log('class model has errors. no more processing');
                        }
                        else {
                            console.log('class model successfully compile');
                            states = this.generator.stateModelASTs;
                            states.forEach(function (state_model_ast) {
                                _this.processStateModel(class_model_ast, state_model_ast);
                            });
                            // let state_model_compilation = (
                            //     this.stateModelDoCompile()){}
                            // for (let i = 0 ; i < states.length ;  i++) {
                            //     const state_model_compilation = (
                            //         await this.stateModelDoCompile(states[i]))
                            //     if (state_model_compilation.result.hasErrors)
                            // }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return USEOCLProcessor;
}(processors_1.AbstractProcessor));
exports.USEOCLProcessor = USEOCLProcessor;
exports.USEOCLProcessor = USEOCLProcessor;
//# sourceMappingURL=processor.js.map