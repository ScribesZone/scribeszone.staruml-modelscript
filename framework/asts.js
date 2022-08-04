"use strict";
// noinspection UnnecessaryLocalVariableJS
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
exports.ASTCollection = exports.AST = exports.Line = exports.Token = exports.lineNumberPrefix = exports.ASTTracedErrorReporter = exports.IDENTIFIER_CATEGORIES = void 0;
/**
 * The file that is known by the generator developer.
 */
var JAVASCRIPT_FILE_TO_TRACE = 'generator.js';
var fs = require("fs");
var path = require("path");
// declare var staruml : any
var files_1 = require("./files");
var traces_1 = require("./traces");
var models_1 = require("./models");
// This should be improved with typescript enumerations or something else
exports.IDENTIFIER_CATEGORIES = [
    "identifier1",
    "identifier2",
    "definition1",
    "definition2",
    "reference1",
    "reference2"
];
/**
 * Report an error during the generation process. The error will be
 * located in the "generator.js" file so that the user can understand
 * which line of code is faulty.
 */
var ASTTracedErrorReporter = /** @class */ (function (_super) {
    __extends(ASTTracedErrorReporter, _super);
    function ASTTracedErrorReporter(ast, component, messageOrException) {
        var _this = _super.call(this, JAVASCRIPT_FILE_TO_TRACE, component, messageOrException) || this;
        _this.ast = ast;
        _this.ast.emitOnError(_this); // TODO: create typescript
        return _this;
    }
    return ASTTracedErrorReporter;
}(traces_1.TracedErrorReporter));
exports.ASTTracedErrorReporter = ASTTracedErrorReporter;
/**
 * Pad a (line) number.
 * Example:
 *      lineNumberPrefix(45, 348) = " 45"
 * 45 is the source line number, 348 the total number of line. The
 * total number is used to compute the amount of padding characters.
 */
function lineNumberPrefix(num, maxLineNumbers, pad) {
    if (pad === void 0) { pad = ' '; }
    var max_digits = maxLineNumbers.toString().length;
    var space_prefix = pad.repeat(max_digits);
    var with_spaces = space_prefix + num;
    var prefix = with_spaces.substring(with_spaces.length - max_digits);
    return prefix;
}
exports.lineNumberPrefix = lineNumberPrefix;
/**
 * Tokens, that is a piece of text, a category and an optional element
 * that typically have produced the token. The token could be the name
 * of a class and then the element would be the class.
 */
var Token = /** @class */ (function () {
    function Token(line, text, category, element) {
        if (category === void 0) { category = "default"; }
        if (element === void 0) { element = null; }
        this.line = line;
        if (text.split('\n').length >= 2) {
            new ASTTracedErrorReporter(this.line.ast, 'asts', "Token text must not be multiline. \n"
                + "Found: "
                + (0, models_1.asString)(text.split('\n')[0] + "\\n ...'")).throw();
        }
        if (text.length === 0) {
            new ASTTracedErrorReporter(this.line.ast, 'asts', "Token text must not be empty. \n"
                + "Found: ''").throw();
        }
        this.text = text;
        this.category = category;
        // check element
        if (element !== null) {
            if (!(element instanceof type.Model)) {
                new ASTTracedErrorReporter(this.line.ast, 'asts', 'Token element must be a type.Model element.\n'
                    + 'Type found: ' + (typeof element) + '\n'
                    + 'Value found: ' + (0, models_1.asString)(element)).throw();
            }
        }
        this.element = element;
    }
    Token.prototype.getPlainText = function () {
        return this.text;
    };
    return Token;
}());
exports.Token = Token;
/**
 * Lines, a sequence of tokens, part of an AST.
 */
var Line = /** @class */ (function () {
    function Line(ast, number) {
        this.ast = ast;
        this.tokens = [];
        this.number = number;
    }
    Line.prototype.addToken = function (token) {
        this.tokens.push(token);
    };
    Line.prototype.getPlainText = function () {
        return this.tokens.map(function (t) {
            return t.getPlainText();
        })
            .join('');
    };
    return Line;
}());
exports.Line = Line;
//
//
//     emitAfterToken(token: Token) {
//         if (this.eventFns && this.eventFns["afterToken"]) {
//             this.eventFns["afterToken"](token)
//         }
//     }
//
//     emitAfterLine(line: Line) {
//         if (this.eventFns && this.eventFns["afterLine"]) {
//             this.eventFns["afterLine"](line)
//         }
//     }
//
//     emitOnSaveFile(lineSaved: number) {
//         if (this.eventFns && this.eventFns['onSaveFile']) {
//             this.eventFns['onSaveFile'](lineSaved)
//         }
//     }
//
//     emitOnError(error: ASTTracedErrorReporter) {
//         if (this.eventFns && this.eventFns['onError']) {
//             this.eventFns['onError'](error)
//         }
//     }
/**
 * AST, Abstract Syntax Tree, represented as a sequence of lines.
 * An AST is part of an AST collection.
 */
var AST = /** @class */ (function () {
    function AST(astCollection, filename, label, role, elements, debug, eventFns) {
        if (label === void 0) { label = ""; }
        if (role === void 0) { role = "main"; }
        if (elements === void 0) { elements = []; }
        if (debug === void 0) { debug = false; }
        if (eventFns === void 0) { eventFns = {}; }
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        this.astCollection = astCollection;
        this.filename = filename;
        this.label = label;
        this.role = role;
        this.elements = elements;
        this.lines = [new Line(this, 1)];
        this.debug = debug;
        this.eventFns = eventFns; // TODO: replace eventFns by
        this.isOpen = false;
    }
    /**
     * Open the AST so that it can be used with write statements.
     * Having this step is necessary to have time to register events
     */
    AST.prototype.open = function () {
        if (this.isOpen) {
            new ASTTracedErrorReporter(this, 'asts', "AST is opened").throw();
        }
        else { }
        this.isOpen = true;
        this.emitOnOpen();
    };
    AST.prototype._checkIsOpen = function () {
        if (!this.isOpen) {
            new ASTTracedErrorReporter(this, 'asts', "AST is closed").throw();
        }
    };
    AST.prototype.currentLine = function () {
        return this.lines[this.lines.length - 1];
    };
    AST.prototype.write = function (text, category, element) {
        if (category === void 0) { category = "default"; }
        if (element === void 0) { element = null; }
        this._checkIsOpen();
        if (text.split('\n').length >= 2) {
            var message = ("First argument of write() is invalid. \n"
                + "Generators are token/line based."
                + " Text must not contain \\n characters. \n"
                + "Use writeln() instead.\n"
                + "Found: " + (0, models_1.asString)(text.split('\n')[0] + '\\n' + '...'));
            new ASTTracedErrorReporter(this, 'asts', message).throw();
        }
        if (!this.isOpen) {
            var message = ("AST has been closed by save(). No more token can be added");
            new ASTTracedErrorReporter(this, 'asts', message).throw();
        }
        if (text !== '') {
            var token = new Token(this.currentLine(), text, category, element);
            this.currentLine().addToken(token);
            this.emitAfterToken(token);
            if (this.debug) {
                console.log('[ASTS]:     ', text);
            }
        }
    };
    AST.prototype.writeln = function (text, category, element) {
        if (category === void 0) { category = "default"; }
        if (element === void 0) { element = null; }
        if (text !== undefined) {
            this.write(text, category, element);
        }
        else {
            this._checkIsOpen();
        }
        var new_line = new Line(this, this.lines.length + 1);
        this.lines.push(new_line);
        this.emitAfterLine(new_line);
    };
    AST.prototype.getPlainText = function (withLineNumber) {
        if (withLineNumber === void 0) { withLineNumber = false; }
        var max_lines = this.lines.length;
        return this.lines.map(function (l) {
            var prefix = (withLineNumber ?
                lineNumberPrefix(l.number, max_lines) + ' '
                : '');
            return prefix + l.getPlainText();
        }).join('\n');
    };
    AST.prototype.save = function () {
        if (!this.isOpen) {
            var message = ("AST is not open. It cannot be saved.");
            new ASTTracedErrorReporter(this, 'asts', message).throw();
        }
        if (this.debug) {
            console.log('[ASTS]: **** saving output to "' + this.filename);
        }
        var parent_directory = path.dirname(this.filename);
        try {
            (0, files_1.ensureDirectory)(parent_directory);
        }
        catch (error) {
            var message = ("Fail to create parent directory "
                + parent_directory
                + " for file " + this.filename);
            new ASTTracedErrorReporter(this, 'asts', message).throw();
        }
        try {
            fs.writeFileSync(this.filename, this.getPlainText());
        }
        catch (error) {
            var message = ("Fail to save AST file: " + this.filename);
            new ASTTracedErrorReporter(this, 'asts', message).throw();
        }
        this.emitOnSaveFile(this.lines.length);
        this.isOpen = false;
    };
    AST.prototype.emitOnOpen = function () {
        if (this.eventFns && this.eventFns["onOpen"]) {
            this.eventFns["onOpen"](this);
        }
    };
    AST.prototype.emitAfterToken = function (token) {
        if (this.eventFns && this.eventFns["afterToken"]) {
            this.eventFns["afterToken"](token);
        }
    };
    AST.prototype.emitAfterLine = function (line) {
        if (this.eventFns && this.eventFns["afterLine"]) {
            this.eventFns["afterLine"](line);
        }
    };
    AST.prototype.emitOnSaveFile = function (lineSaved) {
        if (this.eventFns && this.eventFns['onSaveFile']) {
            this.eventFns['onSaveFile'](lineSaved);
        }
    };
    AST.prototype.emitOnError = function (error) {
        if (this.eventFns && this.eventFns['onError']) {
            this.eventFns['onError'](error);
        }
    };
    return AST;
}());
exports.AST = AST;
var ASTCollection = /** @class */ (function () {
    function ASTCollection(generator, debug, eventFns) {
        if (debug === void 0) { debug = false; }
        if (eventFns === void 0) { eventFns = {}; }
        this.generator = generator;
        this.astsByRole = new Map();
        this.asts = [];
        this.debug = debug;
        this.eventFns = eventFns;
        this.currentAST = null;
    }
    ASTCollection.prototype.openAST = function (filename, label, role, elements) {
        if (label === void 0) { label = ''; }
        if (role === void 0) { role = 'main'; }
        if (elements === void 0) { elements = []; }
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        var ast = new AST(this, filename, label, role, elements, this.debug, this.eventFns);
        ast.open();
        if (!this.astsByRole.has(role)) {
            this.astsByRole.set(role, []);
        }
        this.astsByRole.get(role).push(ast);
        this.asts.push(ast);
        this.currentAST = ast;
        return ast;
    };
    ASTCollection.prototype.reopenAST = function (ast) {
        this.currentAST = ast;
    };
    ASTCollection.prototype.save = function () {
        if (this.currentAST === null) {
            var msg = 'ASTCollection.save() called but currentAST === null';
            console.error('ERROR: ' + msg);
            throw new Error('Internal error: ' + msg);
        }
        this.currentAST.save();
    };
    ASTCollection.prototype.end = function () {
        console.assert(this.asts.every(function (ast) { return !ast.isOpen; }), 'end() can not be done. Some AST are still opened : ', this.asts.filter(function (ast) { return ast.isOpen; }));
    };
    ASTCollection.prototype.getStats = function () {
        return this.asts.map(function (ast) { return ({
            role: ast.role,
            filename: ast.filename,
            lines: ast.lines.length,
            // elements: ast.elements // produce circular struct with json
        }); });
    };
    return ASTCollection;
}());
exports.ASTCollection = ASTCollection;
//# sourceMappingURL=asts.js.map