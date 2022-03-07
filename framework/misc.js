"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirectory = exports.TextMatcher = exports.filterByKeyValue = void 0;
var path = require('path');
var fs = require('fs');
var TEST_ASSERT = true;
//-------------------------------------------------------------------------
//  type checking
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
//  Collections
//-------------------------------------------------------------------------
function sum(array) {
    //TODO: RESTORE    console.assert(isArray(array))
    return array.reduce(function (total, b) { return total + b; }, 0);
}
if (TEST_ASSERT) {
    console.assert(sum([]) === 0);
    console.assert(sum([2, 5]) === 7);
}
/**
 * Filter the entries of an object via a predicate.
 *
 * For instance :
 *
 *      noezarwin = {firstname: 'noe', lastname: 'zarwin', age: 30}
 *      keys = ['firstname', 'age']
 *

 *
 *      returns {age: 30}
 *
 * @param object
 * @param keyValuePredicate
 * @returns {{[p: string]: unknown}}
 */
function filterByKeyValue(object, keyValuePredicate) {
    return (Object.fromEntries(Object.entries(object)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return keyValuePredicate(key, value);
    })));
}
exports.filterByKeyValue = filterByKeyValue;
if (TEST_ASSERT) {
    var _noezarwin = { firstname: 'noe', lastname: 'zarwin', age: 30 };
    var _keys_1 = ['firstname', 'age'];
    var _result232 = (filterByKeyValue(_noezarwin, (function (key, value) {
        return _keys_1.includes(key) && typeof value === 'number';
    })));
    //TODO RESTORE          console.assert(jsonEquals(_result232, {age: 30}))
}
/**
 * Indicates if the first array includes all elements in the second array.
 * @param big that array that could includes all elements
 * @param small the array of elements that could be included
 * @returns {*}
 */
function includesAll(big, small) {
    return small.every(function (v) { return big.includes(v); });
}
// function isLikePattern(object) {
//     return includesAll(Object.keys(object),MINIMAL_PATTERN_KEYS)
// }
var TextMatch = /** @class */ (function () {
    function TextMatch(pattern, groups) {
        // console.assert(isLikePattern(pattern),'MI162')
        // console.assert(isArray(groups), 'MI163')
        this.pattern = pattern;
        this.groups = groups;
        this.formatedResult = null;
        var formatFun = pattern.formatFun;
        if (formatFun) {
            //console.assert(isFunction(formatFun), 'MI171')
            this.formatedResult = formatFun(this.groups);
            // console.assert(isString(this.formatedResult), 'MI173')
        }
    }
    return TextMatch;
}());
/**
 * A text from which patterns are matched and replaced to other strings.
 * Return the text remaining after all pattern replacements as well
 * as an unordered serie of matches grouped by pattern name.
 * NOTE: the matches are not ordered by original position of the matched
 * text since patterns are extracted in sequence.
 */
var TextMatcher = /** @class */ (function () {
    function TextMatcher(text) {
        this.originalText = text;
        this.residualText = text;
        this.activeMatchesByPatternName = {}; // TODO Map[Array[Object]]  see _addToMatches()
        this.nbOfActiveMatches = 0;
        this.nbOfIgnoredMatches = 0;
    }
    /**
     * Extract from the original text as many pieces of text matching
     * the given pattern and replace each match with the replacement
     * string. No match is stored if the pattern has ignore: true.
     * @param pattern An  object with "name", "regex", "ignore"
     * @param replacement A string for replacement or '' by default.
     */
    TextMatcher.prototype.extractPattern = function (pattern, replacement) {
        if (replacement === void 0) { replacement = ''; }
        var match;
        var regex = pattern["regex"];
        // @ts-ignore .exec TODO
        while (match = regex.exec(this.residualText)) {
            var groups = match.groups;
            if (groups !== undefined) {
                this._addToMatches(pattern, groups);
            }
            this.residualText = this.residualText.replace(regex, replacement);
        }
    };
    /**
     * Extract the given list of patterns in given order. See
     * extractPattern for details.
     */
    TextMatcher.prototype.extractPatterns = function (patterns, replacement) {
        if (replacement === void 0) { replacement = ''; }
        //console.assert(isArray(patterns), 'MI223')
        //console.assert(isString(replacement), 'MI224')
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            this.extractPattern(pattern, replacement);
        }
    };
    TextMatcher.prototype._addToMatches = function (pattern, groups) {
        // console.assert(isLikePattern(pattern), 'MI231')
        var name = pattern.name;
        if (pattern.ignore) {
            this.nbOfIgnoredMatches += 1;
        }
        else {
            this.nbOfActiveMatches = 0;
            if (this.activeMatchesByPatternName[name] === undefined) {
                this.activeMatchesByPatternName[name] = [];
            }
            var match = new TextMatch(pattern, groups);
            this.activeMatchesByPatternName[name].push(match);
        }
    };
    TextMatcher.prototype.getMatches = function (patternNames, summary) {
        if (patternNames === void 0) { patternNames = null; }
    };
    return TextMatcher;
}());
exports.TextMatcher = TextMatcher;
function ensureDirectory(filePath) {
    // fs.mkdir(
    //     filePath,
    //     { recursive: true },
    //     (err) => {
    //         if (err) throw err
    // })
    fs.mkdirSync(filePath, { recursive: true });
}
exports.ensureDirectory = ensureDirectory;
// exports.filterByKeyValue = filterByKeyValue
// exports.TextMatcher = TextMatcher
//# sourceMappingURL=misc.js.map