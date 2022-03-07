"use strict";
// noinspection UnnecessaryLocalVariableJS
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTCollection = exports.AST = exports.Line = exports.Token = exports.lineNumberPrefix = exports.CATEGORIES = exports.IDENTIFIER_CATEGORIES = void 0;
var misc_1 = require("./misc");
var fs = require('fs');
var path = require('path');
var TraceErrorReporter = require('./traces').TraceErrorReporter;
var asString = require("./models").asString;
exports.IDENTIFIER_CATEGORIES = [
    "identifier1",
    "identifier2",
    "definition1",
    "definition2",
    "reference1",
    "reference2"
];
exports.CATEGORIES = [
    "default",
    "keyword",
    "constant",
    "comment",
    "symbol"
].concat(exports.IDENTIFIER_CATEGORIES);
function isString(value) {
    return (typeof value === 'string' || value instanceof String);
}
function lineNumberPrefix(num, maxLineNumbers) {
    if (num === undefined) {
        new TraceErrorReporter('asts', "'num' of lineNumberPrefix() is undefined.", undefined).throw();
    }
    if (maxLineNumbers === undefined) {
        new TraceErrorReporter('asts', "ERROR : 'maxLineNumbers' of lineNumberPrefix() is undefined.", undefined).throw();
    }
    var max_digits = maxLineNumbers.toString().length;
    var space_prefix = " ".repeat(max_digits);
    var with_spaces = space_prefix + num;
    var prefix = with_spaces.substr(with_spaces.length - max_digits);
    return prefix;
}
exports.lineNumberPrefix = lineNumberPrefix;
var Token = /** @class */ (function () {
    function Token(line, text, category, element, eventFns) {
        if (eventFns === void 0) { eventFns = undefined; }
        if (!(line instanceof Line)) {
            new TraceErrorReporter('asts', "First argument of Token must be a line \n"
                + "Found: " + asString(line), eventFns).throw();
        }
        this.line = line;
        // check text
        if (!isString(text)) {
            new TraceErrorReporter('asts', "Token text must be a string. \n"
                + "Found: " + asString(text), eventFns).throw();
        }
        if (text.split('\n').length >= 2) {
            new TraceErrorReporter('asts', "Token text must not be multiline. \n"
                + "Found: "
                + asString(text.split('\n')[0] + "\\n ...'"), eventFns).throw();
        }
        if (text.length === 0) {
            new TraceErrorReporter('asts', "Token text must not be empty. \n"
                + "Found: ''", eventFns).throw();
        }
        this.text = text;
        // check category
        var cat = (category === undefined ? "default" : category);
        if (!exports.CATEGORIES.includes(cat)) {
            var category_list = '[' + exports.CATEGORIES.join(', ') + ']';
            new TraceErrorReporter('asts', 'Invalid token category.\n'
                + 'Found :"' + asString(cat) + '"\n'
                + 'Available categories are ' + category_list + '.\n'
                + 'Token text was: ' + text, eventFns).throw();
        }
        this.category = cat;
        // check element
        if (element !== undefined) {
            if (!(element instanceof type.Model)) {
                new TraceErrorReporter('asts', 'Token element must be a type.Model element.\n'
                    + 'Type found: ' + (typeof element) + '\n'
                    + 'Value found: ' + asString(element), eventFns).throw();
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
var AST = /** @class */ (function () {
    function AST(astCollection, filename, role, elements, debug, eventFns) {
        if (role === void 0) { role = "main"; }
        if (elements === void 0) { elements = []; }
        if (debug === void 0) { debug = false; }
        if (eventFns === void 0) { eventFns = null; }
        console.assert(astCollection instanceof ASTCollection, astCollection);
        console.assert(typeof filename === 'string' && filename, filename);
        console.assert(typeof role === 'string', role);
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
         * This field is not used otherwise unless mentionned.
         * @type {null|ProcessorResult}
         */
        this.processorResult = null;
    }
    AST.prototype.currentLine = function () {
        return this.lines[this.lines.length - 1];
    };
    AST.prototype.write = function (text, category, element) {
        if (!isString(text)) {
            var message = ("First argument of write() must be a string. \n"
                + "Found: " + asString(text));
            new TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        if (text.split('\n').length >= 2) {
            var message = ("First argument of write() is invalid. \n"
                + "Generators are token/line based."
                + " Text must not contain \\n characters. \n"
                + "Use writeln() instead.\n"
                + "Found: " + asString(text.split('\n')[0] + '\\n' + '...'));
            new TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        if (!this.isOpen) {
            var message = ("AST has been closed by save(). No more token can be added");
            new TraceErrorReporter('asts', message, this.eventFns).throw();
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
            new TraceErrorReporter('asts', message, this.eventFns).throw();
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
            new TraceErrorReporter('asts', message, this.eventFns).throw();
        }
        try {
            fs.writeFileSync(this.filename, this.getPlainText());
        }
        catch (error) {
            var message = ("Fail to save AST file: " + this.filename);
            new TraceErrorReporter('asts', message, this.eventFns).throw();
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
        this.astsByRole = {}; /* {role->[AST] */
        this.astSequence = []; /* [AST] */
        this.debug = debug;
        this.eventFns = eventFns;
        this.currentAST = null;
    }
    ASTCollection.prototype.openAST = function (filename, role, elements) {
        if (role === void 0) { role = 'main'; }
        if (elements === void 0) { elements = []; }
        console.assert(typeof filename === 'string', filename);
        console.assert(typeof role === 'string', role);
        console.assert(elements.every(function (element) { return element instanceof type.Model; }), elements);
        var ast = new AST(this, filename, role, elements, this.debug, this.eventFns);
        if (this.astsByRole[role] === undefined) {
            this.astsByRole[role] = [];
        }
        this.astsByRole[role].push(ast);
        this.astSequence.push(ast);
        this.currentAST = ast;
        return ast;
    };
    ASTCollection.prototype.reopenAST = function (ast) {
        console.assert(ast instanceof AST, ast);
        this.currentAST = ast;
    };
    ASTCollection.prototype.save = function () {
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
// exports.CATEGORIES = CATEGORIES
// exports.IDENTIFIER_CATEGORIES = IDENTIFIER_CATEGORIES
// exports.AST = AST
// exports.ASTCollection = ASTCollection
// exports.lineNumberPrefix = lineNumberPrefix
//# sourceMappingURL=asts.js.map