"use strict";
// noinspection UnnecessaryLocalVariableJS
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTCollection = exports.AST = exports.Line = exports.Token = exports.lineNumberPrefix = exports.IDENTIFIER_CATEGORIES = void 0;
var fs = require("fs");
var path = require("path");
var misc_1 = require("./misc");
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
function isString(value) {
    return (typeof value === 'string' || value instanceof String);
}
/**
 * Pad a (line) number.
 * Example:
 *      lineNumberPrefix(45, 348) = " 45"
 * 45 is the source line number, 348 the total number of line.
 * @param num
 * @param maxLineNumbers
 * @param pad
 */
function lineNumberPrefix(num, maxLineNumbers, pad) {
    if (pad === void 0) { pad = ' '; }
    if (num === undefined) {
        new traces_1.TraceErrorReporter('asts', "'num' of lineNumberPrefix() is undefined.", undefined).throw();
    }
    if (maxLineNumbers === undefined) {
        new traces_1.TraceErrorReporter('asts', "ERROR : 'maxLineNumbers' of lineNumberPrefix() is undefined.", undefined).throw();
    }
    var max_digits = maxLineNumbers.toString().length;
    var space_prefix = " ".repeat(max_digits);
    var with_spaces = space_prefix + num;
    var prefix = with_spaces.substring(with_spaces.length - max_digits);
    return prefix;
}
exports.lineNumberPrefix = lineNumberPrefix;
/**
 * Token
 */
var Token = /** @class */ (function () {
    function Token(line, text, category, element, eventFns) {
        if (category === void 0) { category = "default"; }
        if (element === void 0) { element = null; }
        if (eventFns === void 0) { eventFns = undefined; }
        // @tscheck: redundant check with typescript
        // if(! (line instanceof Line)) {
        //     new TraceErrorReporter(
        //         'asts',
        //         "First argument of Token must be a line \n"
        //          + "Found: " + asString(line),
        //         eventFns).throw()
        // }
        this.line = line;
        // @tscheck: redundant check with typescript
        // check text
        // if (! isString(text)) {
        //     new TraceErrorReporter(
        //         'asts',
        //         "Token text must be a string. \n"
        //          + "Found: " + asString(text),
        //         eventFns).throw()
        // }
        if (text.split('\n').length >= 2) {
            new traces_1.TraceErrorReporter('asts', "Token text must not be multiline. \n"
                + "Found: "
                + (0, models_1.asString)(text.split('\n')[0] + "\\n ...'"), eventFns).throw();
        }
        if (text.length === 0) {
            new traces_1.TraceErrorReporter('asts', "Token text must not be empty. \n"
                + "Found: ''", eventFns).throw();
        }
        this.text = text;
        // check category
        // const cat = (category === undefined ? "default" : category)
        // if (! CATEGORIES.includes(category)) {
        //     const category_list = '['+CATEGORIES.join(', ')+']'
        //     new TraceErrorReporter(
        //         'asts',
        //         'Invalid token category.\n'
        //         + 'Found :"' + asString(category) + '"\n'
        //         + 'Available categories are '+category_list+'.\n'
        //         + 'Token text was: ' + text,
        //         eventFns).throw()
        // }
        this.category = category;
        // check element
        if (element !== null) {
            if (!(element instanceof type.Model)) {
                new traces_1.TraceErrorReporter('asts', 'Token element must be a type.Model element.\n'
                    + 'Type found: ' + (typeof element) + '\n'
                    + 'Value found: ' + (0, models_1.asString)(element), eventFns).throw();
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
 * Line, a sequence of token
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
        return this.tokens.map(function (t) { return t.getPlainText(); }).join('');
    };
    return Line;
}());
exports.Line = Line;
/**
 * AST, Abstract Syntax Tree, represented as a sequence of lines.
 */
var AST = /** @class */ (function () {
    function AST(astCollection, filename, role, elements, debug, eventFns) {
        if (role === void 0) { role = "main"; }
        if (elements === void 0) { elements = []; }
        if (debug === void 0) { debug = false; }
        if (eventFns === void 0) { eventFns = null; }
        // @tscheck:
        // console.assert(
        //     astCollection instanceof ASTCollection, astCollection)
        // console.assert(
        //     typeof filename === 'string' && filename, filename)
        // console.assert(typeof role === 'string', role)
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        this.astCollection = astCollection;
        this.filename = filename;
        this.role = role;
        this.elements = elements;
        this.lines = [new Line(this, 1)];
        this.debug = debug;
        this.eventFns = eventFns;
        this.isOpen = true;
        /**
         * Processor result optionally set and used by processor.
         * This field is not used otherwise unless mentioned.
         * @type {null|ProcessorResult}
         */
        this.processorResult = null;
    }
    AST.prototype.currentLine = function () {
        return this.lines[this.lines.length - 1];
    };
    AST.prototype.write = function (text, category, element) {
        if (category === void 0) { category = "default"; }
        if (element === void 0) { element = null; }
        // @tscheck
        // if (! isString(text)) {
        //     const message = (
        //         "First argument of write() must be a string. \n"
        //          + "Found: " + asString(text))
        //     new TraceErrorReporter(
        //         'asts',
        //         message,
        //         this.eventFns).throw()
        // }
        if (text.split('\n').length >= 2) {
            var message = ("First argument of write() is invalid. \n"
                + "Generators are token/line based."
                + " Text must not contain \\n characters. \n"
                + "Use writeln() instead.\n"
                + "Found: " + (0, models_1.asString)(text.split('\n')[0] + '\\n' + '...'));
            new traces_1.TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        if (!this.isOpen) {
            var message = ("AST has been closed by save(). No more token can be added");
            new traces_1.TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        if (text !== '') {
            var token = new Token(this.currentLine(), text, category, element, this.eventFns);
            this.currentLine().addToken(token);
            if (this.eventFns && this.eventFns["afterToken"]) {
                this.eventFns["afterToken"](token);
            }
            if (this.debug) {
                console.log('[ASTS]:     ', text);
            }
        }
    };
    AST.prototype.writeln = function (text, category, element) {
        if (element === void 0) { element = null; }
        if (text !== undefined) {
            this.write(text, category, element);
        }
        var new_line = new Line(this, this.lines.length + 1);
        this.lines.push(new_line);
        if (this.eventFns && this.eventFns["afterLine"]) {
            this.eventFns["afterLine"](new_line);
        }
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
            new traces_1.TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        if (this.debug) {
            console.log('[ASTS]: **** saving output to "' + this.filename);
        }
        var parent_directory = path.dirname(this.filename);
        try {
            (0, misc_1.ensureDirectory)(parent_directory);
        }
        catch (error) {
            var message = ("Fail to create parent directory "
                + parent_directory
                + " for file " + this.filename);
            new traces_1.TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        try {
            fs.writeFileSync(this.filename, this.getPlainText());
        }
        catch (error) {
            var message = ("Fail to save AST file: " + this.filename);
            new traces_1.TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        if (this.eventFns && this.eventFns['onSaveFile']) {
            this.eventFns['onSaveFile'](this.lines.length);
        }
        this.isOpen = false;
    };
    return AST;
}());
exports.AST = AST;
var ASTCollection = /** @class */ (function () {
    function ASTCollection(generator, debug, eventFns) {
        if (debug === void 0) { debug = false; }
        if (eventFns === void 0) { eventFns = undefined; }
        this.generator = generator;
        this.astsByRole = new Map();
        this.astSequence = [];
        this.debug = debug;
        this.eventFns = eventFns;
        this.currentAST = null;
    }
    ASTCollection.prototype.openAST = function (filename, role, elements) {
        if (role === void 0) { role = 'main'; }
        if (elements === void 0) { elements = []; }
        //@tscheck: console.assert(typeof filename === 'string', filename)
        //@tscheck: console.assert(typeof role === 'string', role)
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        var ast = new AST(this, filename, role, elements, this.debug, this.eventFns);
        if (!this.astsByRole.has(role)) {
            this.astsByRole.set(role, []);
        }
        this.astsByRole.get(role).push(ast);
        this.astSequence.push(ast);
        this.currentAST = ast;
        return ast;
    };
    ASTCollection.prototype.reopenAST = function (ast) {
        console.assert(ast instanceof AST, ast);
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
        console.assert(this.astSequence.every(function (ast) { return !ast.isOpen; }), 'end() can not be done. Some AST are still opened : ', this.astSequence.filter(function (ast) { return ast.isOpen; }));
    };
    ASTCollection.prototype.getStats = function () {
        return this.astSequence.map(function (ast) { return ({
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