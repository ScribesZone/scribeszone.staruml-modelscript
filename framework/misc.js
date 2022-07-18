"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirectory = exports.TextMatcher = exports.TextPatternAction = exports.filterByKeyValue = void 0;
var fs = require("fs");
var DEBUG = true;
var TEST_ASSERT = true;
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
function arrayEquals(a, b, sort) {
    if (sort === void 0) { sort = false; }
    var x = a;
    if (sort) {
        x.sort();
    }
    var y = b;
    if (sort) {
        b.sort();
    }
    return a.every(function (val, index) { return val === b[index]; });
}
if (TEST_ASSERT) {
    console.assert(arrayEquals([1, 2, 3], [1, 2, 3], true) === true);
    console.assert(arrayEquals([3, 2], [2, 3], true) === true);
    console.assert(arrayEquals([1, 2], [1, 3]) === false);
}
/**
 * Filter the entries of an object via a predicate.
 *
 * For instance :
 *
 *      noezarwin = {firstname: 'noe', lastname: 'zarwin', age: 30}
 *      keys = ['firstname', 'age']
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
//-------------------------------------------------------------------------
//     Pattern matching
//-------------------------------------------------------------------------
var TextPatternAction;
(function (TextPatternAction) {
    TextPatternAction["replace"] = "replace";
    TextPatternAction["ignore"] = "ignore";
})(TextPatternAction = exports.TextPatternAction || (exports.TextPatternAction = {}));
var TextMatch = /** @class */ (function () {
    function TextMatch(pattern, groups) {
        this.pattern = pattern;
        this.groups = groups;
        var replaceFun = pattern.replaceFun;
        if (replaceFun !== undefined) {
            this.replacement = replaceFun(this.groups);
        }
        else {
            this.replacement = null;
        }
    }
    return TextMatch;
}());
/**
 * A text from which patterns are matched and replaced by other strings.
 * Returns the text remaining after all pattern replacements as well
 * as an unordered series of matches grouped by pattern name.
 * NOTE: the matches are not ordered by original position of the matched
 * text since patterns are extracted in sequence.
 */
var TextMatcher = /** @class */ (function () {
    function TextMatcher(text) {
        this.originalText = text;
        this.residualText = text;
        this.replacedMatchesByPatternName = new Map();
        this.nbOfReplacedMatches = 0;
        this.nbOfIgnoredMatches = 0;
        this.sections = new Set();
    }
    /**
     * Extract from the original text as many pieces of text matching
     * the given pattern and replace each match with the replacement
     * string if not ignored. No match is stored if the pattern has
     * toBeIgnored.
     */
    TextMatcher.prototype.extractPattern = function (pattern, replacement) {
        if (replacement === void 0) { replacement = '[O]'; }
        var match;
        var regex = pattern["regex"];
        if (this.debug) {
            console.log("DG:148: trying pattern ".concat(pattern.name, " ").concat(pattern.action));
        }
        while (match = regex.exec(this.residualText)) {
            var match_mapping = void 0;
            if (match.groups === undefined) {
                match_mapping = {};
            }
            else {
                match_mapping = match.groups;
            }
            // // check if the pattern matches some text
            // const groups = match.groups
            // // there is a match
            // if (groups === undefined) {
            //     if (DEBUG) {
            //         console.log(`   DG:159: '${pattern.name}' match ${pattern.action}. No group.`)
            //     }
            // } else {
            //     if (DEBUG) {
            //         console.log(`   DG:160: '${pattern.name}' match ${pattern.action}`, groups)
            //     }
            this._addToMatches(pattern, match_mapping);
            // }
            this.residualText = this.residualText.replace(regex, replacement);
        }
    };
    /**
     * Extract the given list of patterns in given order. See
     * extractPattern for details.
     */
    TextMatcher.prototype.extractPatterns = function (patterns, replacement) {
        if (replacement === void 0) { replacement = ''; }
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            this.extractPattern(pattern, replacement);
        }
    };
    TextMatcher.prototype._checkVariables = function (pattern, mapping) {
        var actual_variables = Object.keys(mapping);
        var expected_variables = pattern.variables;
        if (!arrayEquals(actual_variables, expected_variables, true)) {
            console.error('Error in pattern matching');
            console.error('  expected:', expected_variables);
            console.error('  found:   ', actual_variables);
            throw new Error('Error in parsing');
        }
    };
    TextMatcher.prototype._addToMatches = function (pattern, mapping) {
        var name = pattern.name;
        this._checkVariables(pattern, mapping);
        if (pattern.action === TextPatternAction.ignore) {
            // deal with a "ignore" pattern
            this.nbOfIgnoredMatches += 1;
        }
        else {
            // deal with a "replace" pattern
            this.nbOfReplacedMatches += 1;
            if (!this.replacedMatchesByPatternName.has(name)) {
                this.replacedMatchesByPatternName.set(name, []);
            }
            var match = new TextMatch(pattern, mapping);
            this.replacedMatchesByPatternName.get(name).push(match);
            this.sections.add(pattern.section);
        }
    };
    TextMatcher.prototype.getMatches = function (patternNames, summary) {
        if (patternNames === void 0) { patternNames = null; }
    };
    return TextMatcher;
}());
exports.TextMatcher = TextMatcher;
/**
 * Make sure that the directory exists and if it does not create it with
 * all parents directories needed.
 * @param filePath
 */
function ensureDirectory(filePath) {
    // fs.mkdir(
    //     filePath,
    //     { recursive: true },
    //     (err) => {
    //         if (err) throw err
    // })
    return fs.mkdirSync(filePath, { recursive: true });
}
exports.ensureDirectory = ensureDirectory;
//# sourceMappingURL=misc.js.map