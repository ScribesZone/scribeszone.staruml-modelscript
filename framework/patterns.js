"use strict";
//-------------------------------------------------------------------------
//     Pattern matching
//-------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextMatcher = exports.TextMatch = exports.TextPatternAction = void 0;
var misc_1 = require("./misc");
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
exports.TextMatch = TextMatch;
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
        // console.log('DG:79: residualText', this.residualText)
        // console.log('DG:80: text', text)
        this.replacedMatchesByPattern = new Map();
        this.nbOfReplacedMatches = 0;
        this.nbOfIgnoredMatches = 0;
        this.sections = new Set();
    }
    /**
     * Return the list of matches corresponding to a pattern.
     */
    TextMatcher.prototype.matches = function (pattern) {
        if (this.replacedMatchesByPattern.has(pattern)) {
            return this.replacedMatchesByPattern.get(pattern);
        }
        else {
            return [];
        }
    };
    /**
     * Extract from the original text as many pieces of text matching
     * the given pattern and replace each match with the replacement
     * string if not ignored. No match is stored if the pattern has
     * toBeIgnored.
     */
    TextMatcher.prototype.extractPattern = function (pattern, replacement) {
        if (replacement === void 0) { replacement = ''; }
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
            // console.log('DG:129: residualText=',this.residualText)
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
        if (!(0, misc_1.arrayEquals)(actual_variables, expected_variables, true)) {
            console.error('Error in pattern matching');
            console.error('  expected:', expected_variables);
            console.error('  found:   ', actual_variables);
            throw new Error('Error in parsing');
        }
    };
    TextMatcher.prototype._addToMatches = function (pattern, mapping) {
        this._checkVariables(pattern, mapping);
        if (pattern.action === TextPatternAction.ignore) {
            // deal with a "ignore" pattern
            this.nbOfIgnoredMatches += 1;
        }
        else {
            // deal with a "replace" pattern: add it to the registry
            this.nbOfReplacedMatches += 1;
            if (!this.replacedMatchesByPattern.has(pattern)) {
                this.replacedMatchesByPattern.set(pattern, []);
            }
            var match = new TextMatch(pattern, mapping);
            this.replacedMatchesByPattern.get(pattern).push(match);
        }
    };
    return TextMatcher;
}());
exports.TextMatcher = TextMatcher;
//# sourceMappingURL=patterns.js.map