"use strict";
//-------------------------------------------------------------------------
//     Strings
//-------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureNoNewLineAtEnd = exports.isLineEnded = exports.isNoLineEnded = exports.isNoLineString = exports.ensureNewLineAtEnd = exports.limitMultilineString = exports.limit = exports.onOneLine = exports.indent = void 0;
var assert = require("assert");
/**
 * Add a margin before all lines
 */
function indent(text, margin, nb) {
    if (margin === void 0) { margin = '    '; }
    if (nb === void 0) { nb = 1; }
    var left = margin.repeat(nb);
    return text.split('\n').map(function (l) { return left + l; }).join('\n');
}
exports.indent = indent;
/**
 * Join a multiline string and put it on one line with \\n character
 */
function onOneLine(text, separator) {
    if (separator === void 0) { separator = '\\n'; }
    return text.split('\n').join(separator);
}
exports.onOneLine = onOneLine;
/**
 * Limit a single line string
 */
function limit(text, size, rest) {
    if (rest === void 0) { rest = '...'; }
    if (text.length <= size) {
        return text;
    }
    else {
        return text.slice(0, size - rest.length) + rest;
    }
}
exports.limit = limit;
function limitMultilineString(text, max, rest) {
    if (rest === void 0) { rest = '...'; }
    assert.ok(max >= 0);
    var lines = text.split('\n');
    if (lines.length <= max) {
        return text;
    }
    else {
        return (lines.slice(0, max).join('\n')
            + '\n'
            + rest + ' (+' + (lines.length - max) + ' lines)');
    }
}
exports.limitMultilineString = limitMultilineString;
function ensureNewLineAtEnd(text, yes) {
    if (yes === void 0) { yes = true; }
    if (text.length === 0) {
        return '\n';
    }
    else if (text[text.length - 1] === '\n') {
        return text;
    }
    else {
        return text + '\n';
    }
}
exports.ensureNewLineAtEnd = ensureNewLineAtEnd;
function isMultilineString(text) {
    return text.indexOf('\n') !== -1;
}
function isNoLineString(text) {
    return !isMultilineString(text);
}
exports.isNoLineString = isNoLineString;
function isNoLineEnded(text) {
    return (text.length === 0) || (text[text.length - 1] !== '\n');
}
exports.isNoLineEnded = isNoLineEnded;
function isLineEnded(text) {
    return !isNoLineEnded(text);
}
exports.isLineEnded = isLineEnded;
function ensureNoNewLineAtEnd(text) {
    if (text.length === 0) {
        return text;
    }
    else if (text[text.length - 1] !== '\n') {
        return text;
    }
    else {
        return text.substring(0, text.length - 1);
    }
}
exports.ensureNoNewLineAtEnd = ensureNoNewLineAtEnd;
//# sourceMappingURL=strings.js.map