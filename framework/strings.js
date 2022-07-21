"use strict";
//-------------------------------------------------------------------------
//     Strings
//-------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.limit = exports.onOneLine = exports.indent = void 0;
/**
 * Add a margin before all lines
 */
function indent(text, margin, nb) {
    if (margin === void 0) { margin = '    '; }
    if (nb === void 0) { nb = 1; }
    var left = margin.repeat(nb);
    return text.split('\n').map(function (l) { return margin + l; }).join('\n');
}
exports.indent = indent;
/**
 * Join a multiline string and put it on one line
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
//# sourceMappingURL=strings.js.map