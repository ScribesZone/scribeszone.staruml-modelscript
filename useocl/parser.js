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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOILCheckAnswerParser = exports.SOILQueryAnswerParser = exports.SOILStatementAnswerParser = exports.AbstractSOILAnswerParser = exports.getAppropriateSOILParser = exports.kindOfSOILSection = exports.USEAnswerParser = void 0;
var patterns_1 = require("../framework/patterns");
var patterns_2 = require("./patterns");
var answers_1 = require("./answers");
var evaluations_1 = require("./evaluations");
var path = require("path");
var strings_1 = require("../framework/strings");
var DEBUG = true;
var AbstractAnswerParser = /** @class */ (function () {
    function AbstractAnswerParser(text, patterns) {
        this.text = text;
        // console.log('DG:14: text', this.text)
        this.textMatcher = new patterns_1.TextMatcher(text);
        this.patterns = patterns;
        this.answer = undefined;
    }
    /**
     * Parse the text with the patterns. Throw an error if there is
     * residue after matching the patterns otherwise returns an answer.
     * This method must be called but subclasses.
     */
    AbstractAnswerParser.prototype.parse = function () {
        this._extractPatterns();
        this._checkNoResidue();
        this.analyze();
    };
    AbstractAnswerParser.prototype._extractPatterns = function () {
        var _this = this;
        this.patterns.forEach(function (pattern) {
            _this.textMatcher.extractPattern(pattern);
        });
    };
    AbstractAnswerParser.prototype._checkNoResidue = function () {
        if (this.textMatcher.residualText !== '') {
            this.consoleErrorHeader();
            console.error('Remaining text after pattern matching:');
            console.error('"""');
            console.error(this.textMatcher.residualText);
            console.error("\"\"\" length(".concat(this.textMatcher.residualText.length, ")"));
            console.error(this.textMatcher);
            this.throwError();
        }
    };
    AbstractAnswerParser.prototype.consoleErrorHeader = function () {
        console.error('#'.repeat(80));
        console.error('PARSING ERROR IN CLASS ' + this.constructor.name);
        console.error('Error occurs while parsing the following text:');
        console.error('"""' + this.text + '"""');
    };
    AbstractAnswerParser.prototype.throwError = function () {
        throw new Error('===> Parsing error in class ' + this.constructor.name);
    };
    return AbstractAnswerParser;
}());
//=========================================================================
// USEAnswerParser
//=========================================================================
/**
 * Parser for a .utc file. By contrast to .stc files which are split in
 * section the content of the .utc file is parsed at once.
 */
var USEAnswerParser = /** @class */ (function (_super) {
    __extends(USEAnswerParser, _super);
    function USEAnswerParser(useFileName, utcText) {
        var _this = _super.call(this, utcText, [
            patterns_2.BlankLinePattern,
            patterns_2.USEFileIssuePattern
        ]) || this;
        _this.useFileName = useFileName;
        return _this;
    }
    USEAnswerParser.prototype.analyze = function () {
        this.answer = new answers_1.USEAnswer();
        // console.log('DG:72: ',this.textMatcher)
        this._addIssues();
        return this.answer;
    };
    USEAnswerParser.prototype._addIssues = function () {
        var _this = this;
        var matches = this.textMatcher.matches(patterns_2.USEFileIssuePattern);
        // console.log('DG:73: matches', matches)
        matches.forEach(function (match) {
            var g = match.groups;
            _this._checkFilename(g.file);
            var issue = new answers_1.USEFileIssue(parseInt(g.line), parseInt(g.column), g.message);
            _this.answer.issues.push(issue);
        });
    };
    USEAnswerParser.prototype._checkFilename = function (fileNameFromIssue) {
        if (fileNameFromIssue != path.basename(this.useFileName)) {
            this.consoleErrorHeader();
            console.error('Issue references unexpected file name');
            console.error("Current file is \"".concat(this.useFileName));
            console.error('while an issue reference ', fileNameFromIssue);
            this.throwError();
        }
    };
    return USEAnswerParser;
}(AbstractAnswerParser));
exports.USEAnswerParser = USEAnswerParser;
//=========================================================================
// SOILAnswersParser
//=========================================================================
/**
 * Determine the kind of section based on the prefix in the soil text.
 * ! means statement,
 * ? ou \ means query,
 * check means check
 * -- means comment
 * returns null in case of an unrocognized section
 */
function kindOfSOILSection(soilText) {
    if (/^\ *!/.exec(soilText)) {
        return evaluations_1.SOILSectionKind.statement;
    }
    else if (/^ *(\\|\?)/.exec(soilText)) {
        return evaluations_1.SOILSectionKind.query;
    }
    else if (/^ *check /.exec(soilText)) {
        return evaluations_1.SOILSectionKind.check;
    }
    else if (/^ *--/.exec(soilText)) {
        return evaluations_1.SOILSectionKind.comment;
    }
    else {
        return null;
        // console.error('ERROR: UNRECOGNIZED SECTION\n"""\n')
        // console.error(soilText)
        // console.error('"""\n')
        // throw new Error('ERROR: SOIL file does not respect the section format')
    }
}
exports.kindOfSOILSection = kindOfSOILSection;
/**
 * Return the proper parser according to the soilText
 * @param soilText
 * @param stcText
 */
// Don't know how to express this in typescript:
// type SOILAnswerParser = Function
//      SOILStatementAnswerParser | SOILQueryAnswerParser | SOILCheckAnswerParser
function getAppropriateSOILParser(soilText) {
    var kind = kindOfSOILSection(soilText);
    if (kind === evaluations_1.SOILSectionKind.statement) {
        return SOILStatementAnswerParser;
    }
    else if (kind === evaluations_1.SOILSectionKind.query) {
        return SOILQueryAnswerParser;
    }
    else if (kind === evaluations_1.SOILSectionKind.check) {
        return SOILCheckAnswerParser;
    }
    else if (kind === evaluations_1.SOILSectionKind.comment) {
        return null;
    }
    else {
        throw Error('Unexpected case');
    }
}
exports.getAppropriateSOILParser = getAppropriateSOILParser;
var AbstractSOILAnswerParser = /** @class */ (function (_super) {
    __extends(AbstractSOILAnswerParser, _super);
    function AbstractSOILAnswerParser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractSOILAnswerParser.prototype._addSOILLocalizedIssue = function () {
        var _this = this;
        var matches = this.textMatcher.matches(patterns_2.SOILLocalizedIssuePattern);
        // console.log('DG:73: matches', matches)
        matches.forEach(function (match) {
            var g = match.groups;
            var issue = new answers_1.SOILLocalizedIssue(parseInt(g.line), parseInt(g.column), g.message);
            var answer = _this.answer;
            answer.localizedIssues.push(issue);
        });
    };
    AbstractSOILAnswerParser.prototype._addSOILGlobalIssue = function () {
        var _this = this;
        var matches = this.textMatcher.matches(patterns_2.SOILGlobalIssuePattern);
        // console.log('DG:73: matches', matches)
        matches.forEach(function (match) {
            var g = match.groups;
            var issue = new answers_1.SOILGlobalIssue(g.kind, g.message);
            var answer = _this.answer;
            answer.globalIssues.push(issue);
        });
    };
    AbstractSOILAnswerParser.prototype.addIssues = function () {
        this._addSOILLocalizedIssue();
        this._addSOILGlobalIssue();
    };
    return AbstractSOILAnswerParser;
}(AbstractAnswerParser));
exports.AbstractSOILAnswerParser = AbstractSOILAnswerParser;
var SOILStatementAnswerParser = /** @class */ (function (_super) {
    __extends(SOILStatementAnswerParser, _super);
    function SOILStatementAnswerParser(stcText) {
        return _super.call(this, stcText, [
            patterns_2.SOILLocalizedIssuePattern,
            patterns_2.SOILGlobalIssuePattern,
            patterns_2.BlankLinePattern // should be at the end of the list
        ]) || this;
    }
    SOILStatementAnswerParser.prototype.analyze = function () {
        this.answer = new answers_1.SOILStatementAnswer();
        this.addIssues();
    };
    return SOILStatementAnswerParser;
}(AbstractSOILAnswerParser));
exports.SOILStatementAnswerParser = SOILStatementAnswerParser;
var SOILQueryAnswerParser = /** @class */ (function (_super) {
    __extends(SOILQueryAnswerParser, _super);
    function SOILQueryAnswerParser(soilText) {
        return _super.call(this, soilText, [
            patterns_2.SOILLocalizedIssuePattern,
            patterns_2.SOILGlobalIssuePattern,
            patterns_2.QueryPattern,
            patterns_2.BlankLinePattern // should be at the end of the list
        ]) || this;
    }
    SOILQueryAnswerParser.prototype.analyze = function () {
        this.answer = new answers_1.SOILQueryAnswer();
        this.addIssues();
        this._addQueryResult();
    };
    SOILQueryAnswerParser.prototype._addQueryResult = function () {
        var matches = this.textMatcher.matches(patterns_2.QueryPattern);
        if (matches.length === 0) {
            // USE didn't output any result.
            // Just to be safe, check that this is due to some error.
            if (this.answer.hasIssues()) {
                // There is no result, but some USE issues. This is ok.
                // No queryResult => null
                this.answer.queryResult = null;
            }
            else {
                // No USE issues. Then there is probably something strange
                // in the parser.
                this.consoleErrorHeader();
                console.error('ERROR WHEN PARSING QUERY ANSWER:');
                console.error('    (1) USE emit no issues');
                console.error('    (2) No query result can be matched');
                console.error('    This is strange.');
                this.throwError();
            }
        }
        else if (matches.length >= 2) {
            this.consoleErrorHeader();
            console.error('ERROR: More than one results for one query!');
            this.throwError();
        }
        else {
            var g = matches[0].groups;
            var lines = ((0, strings_1.ensureNoNewLineAtEnd)(g.details)
                .split('\n')
                .map(function (l) { return l.trim(); }));
            var result = new answers_1.QueryResult(g.result, g.resultType, lines);
            this.answer.queryResult = result;
        }
    };
    return SOILQueryAnswerParser;
}(AbstractSOILAnswerParser));
exports.SOILQueryAnswerParser = SOILQueryAnswerParser;
var SOILCheckAnswerParser = /** @class */ (function (_super) {
    __extends(SOILCheckAnswerParser, _super);
    function SOILCheckAnswerParser(soilText) {
        return _super.call(this, soilText, [
            patterns_2.SOILLocalizedIssuePattern,
            patterns_2.SOILGlobalIssuePattern,
            patterns_2.InvariantViolationPattern,
            patterns_2.InvariantOKPattern,
            patterns_2.DiscardInvariantCheckingPattern,
            patterns_2.InvariantsSummaryPattern,
            patterns_2.MultiplicityViolationPattern,
            patterns_2.DiscardCheckingStructurePattern,
            patterns_2.BlankLinePattern
        ]) || this;
    }
    SOILCheckAnswerParser.prototype.analyze = function () {
        this.answer = new answers_1.SOILCheckAnswer();
        this.addIssues();
        this._addInvariantViolations();
        this._addMultiplicityViolations();
    };
    SOILCheckAnswerParser.prototype._addInvariantViolations = function () {
        var _this = this;
        var matches = this.textMatcher.matches(patterns_2.InvariantViolationPattern);
        matches.forEach(function (match) {
            var _a;
            var g = match.groups;
            var detail_lines = ((0, strings_1.ensureNoNewLineAtEnd)(((_a = g.details) !== null && _a !== void 0 ? _a : ''))
                .split('\n')
                .map(function (l) { return l.trim(); }));
            var iv = new answers_1.InvariantViolation(g.context, g.invname, g.objects.split(','), detail_lines);
            _this.answer.invariantViolations.push(iv);
        });
    };
    SOILCheckAnswerParser.prototype._addMultiplicityViolations = function () {
        var _this = this;
        var matches = this.textMatcher.matches(patterns_2.MultiplicityViolationPattern);
        matches.forEach(function (match) {
            var g = match.groups;
            var mv = new answers_1.MultiplicityViolation(g.sourceClass, g.targetRole, g.targetClass, g.object, parseInt(g.numberOfObjects), g.cardinality);
            _this.answer.multiplicityViolations.push(mv);
        });
    };
    return SOILCheckAnswerParser;
}(AbstractSOILAnswerParser));
exports.SOILCheckAnswerParser = SOILCheckAnswerParser;
//# sourceMappingURL=parser.js.map