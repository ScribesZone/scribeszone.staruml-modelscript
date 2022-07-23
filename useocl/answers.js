"use strict";
//=========================================================================
//  USE answer
//=========================================================================-
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
exports.SOILCheckAnswer = exports.MultiplicityViolation = exports.InvariantViolation = exports.SOILQueryAnswer = exports.QueryResult = exports.SOILStatementAnswer = exports.SOILGlobalIssue = exports.SOILLocalizedIssue = exports.SOILAnswer = exports.USEAnswer = exports.USEFileIssue = exports.AbstractAnswer = void 0;
var strings_1 = require("../framework/strings");
var assert = require("node:assert");
function subExpressionsToString(label, subExpressions) {
    var r = "[".concat(subExpressions.length, " ").concat(label, "]");
    assert((0, strings_1.isNoLineString)(r));
    return r;
}
var AbstractAnswer = /** @class */ (function () {
    function AbstractAnswer() {
    }
    return AbstractAnswer;
}());
exports.AbstractAnswer = AbstractAnswer;
var USEFileIssue = /** @class */ (function () {
    function USEFileIssue(line, column, message) {
        this.line = line;
        this.column = column;
        this.message = message;
    }
    USEFileIssue.prototype.toString = function () {
        var r = "ISSUE: ".concat(this.line, ":").concat(this.column, ":").concat(this.message);
        assert((0, strings_1.isNoLineString)(r));
        return r;
    };
    return USEFileIssue;
}());
exports.USEFileIssue = USEFileIssue;
//=========================================================================
//  USE answers
//=========================================================================
var USEAnswer = /** @class */ (function () {
    function USEAnswer(issues) {
        if (issues === void 0) { issues = []; }
        this.issues = issues;
    }
    USEAnswer.prototype.hasIssues = function () {
        return this.issues.length >= 1;
    };
    USEAnswer.prototype.toString = function () {
        var r;
        if (this.issues.length === 0) {
            r = 'ANSWER: -\n';
        }
        else {
            r = ('ANSWER:\n'
                + (0, strings_1.indent)(this.issues.map(function (i) { return i.toString(); }).join('\n')) + ' \n');
        }
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return USEAnswer;
}());
exports.USEAnswer = USEAnswer;
//=========================================================================
//  SOIL answers
//=========================================================================
var SOILAnswer = /** @class */ (function () {
    function SOILAnswer(localizedIssues, globalIssues) {
        if (localizedIssues === void 0) { localizedIssues = []; }
        if (globalIssues === void 0) { globalIssues = []; }
        this.localizedIssues = localizedIssues;
        this.globalIssues = globalIssues;
    }
    SOILAnswer.prototype.hasIssues = function () {
        return (this.localizedIssues.length > 0) || (this.globalIssues.length > 0);
    };
    SOILAnswer.prototype.toString = function () {
        var r = 'ANSWER:\n';
        if (this.localizedIssues.length >= 1) {
            r += (0, strings_1.indent)(this.localizedIssues.map(function (i) { return i.toString(); }).join('\n')) + '\n';
        }
        if (this.globalIssues.length >= 1) {
            r += (0, strings_1.indent)(this.globalIssues.map(function (i) { return i.toString(); }).join('\n')) + '\n';
        }
        console.error('"""' + r + '"""');
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return SOILAnswer;
}());
exports.SOILAnswer = SOILAnswer;
//-------------------------------------------------------------------------
//  Soil issues
//-------------------------------------------------------------------------
var SOILLocalizedIssue = /** @class */ (function () {
    function SOILLocalizedIssue(line, column, message) {
        this.line = line;
        this.column = column;
        this.message = message;
    }
    SOILLocalizedIssue.prototype.toString = function () {
        var r = "ISSUE: ".concat(this.line, ":").concat(this.column, ":").concat(this.message);
        assert((0, strings_1.isNoLineString)(r));
        return r;
    };
    return SOILLocalizedIssue;
}());
exports.SOILLocalizedIssue = SOILLocalizedIssue;
var SOILGlobalIssue = /** @class */ (function () {
    function SOILGlobalIssue(kind, message) {
        this.kind = kind;
        this.message = message;
    }
    SOILGlobalIssue.prototype.toString = function () {
        var r = "ISSUE: '-':'-':".concat(this.kind, ":").concat(this.message);
        assert((0, strings_1.isNoLineString)(r));
        return r;
    };
    return SOILGlobalIssue;
}());
exports.SOILGlobalIssue = SOILGlobalIssue;
//-------------------------------------------------------------------------
//  Statements answer
//-------------------------------------------------------------------------
var SOILStatementAnswer = /** @class */ (function (_super) {
    __extends(SOILStatementAnswer, _super);
    function SOILStatementAnswer(localizedIssues, globalIssues) {
        if (localizedIssues === void 0) { localizedIssues = []; }
        if (globalIssues === void 0) { globalIssues = []; }
        var _this = _super.call(this, localizedIssues, globalIssues) || this;
        _this.localizedIssues = localizedIssues;
        _this.globalIssues = globalIssues;
        return _this;
    }
    SOILStatementAnswer.prototype.toString = function () {
        var r = _super.prototype.toString.call(this);
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return SOILStatementAnswer;
}(SOILAnswer));
exports.SOILStatementAnswer = SOILStatementAnswer;
//-------------------------------------------------------------------------
// Query result
//-------------------------------------------------------------------------
/**
 * Result of a query. If errors are generated during the evaluation
 * then instead of having a QueryResult, a  null value means no query result.
 * The class below represents the case where there is a result.
 */
var QueryResult = /** @class */ (function () {
    function QueryResult(result, resultType, subExpressions) {
        this.result = result;
        this.resultType = resultType;
        this.subExpressions = subExpressions;
    }
    QueryResult.prototype.toString = function () {
        var r = "RESULT: ".concat(this.result, ": ").concat(this.resultType) + '\n';
        r += (0, strings_1.indent)(this.subExpressions.join('\n')) + '\n';
        // r += ensureNoNewLineAtEnd(this.subExpressions ?? '').split('\n').map(line => line.trim()) +'\n'
        // r += subExpressionsToString('subExprs', this.subExpressions)
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return QueryResult;
}());
exports.QueryResult = QueryResult;
/**
 * Answer to a query statements ( ? ?? \ )
 */
var SOILQueryAnswer = /** @class */ (function (_super) {
    __extends(SOILQueryAnswer, _super);
    function SOILQueryAnswer(localizedIssues, globalIssues, 
    /**
     * Result of the query. null means that an error occured in the use evaluation.
     * For instance if the query is malformed.
     */
    queryResult) {
        if (localizedIssues === void 0) { localizedIssues = []; }
        if (globalIssues === void 0) { globalIssues = []; }
        if (queryResult === void 0) { queryResult = null; }
        var _this = _super.call(this, localizedIssues, globalIssues) || this;
        _this.localizedIssues = localizedIssues;
        _this.globalIssues = globalIssues;
        _this.queryResult = queryResult;
        return _this;
    }
    SOILQueryAnswer.prototype.toString = function () {
        var r = _super.prototype.toString.call(this);
        var query_result_text = ((this.queryResult === null)
            ? 'RESULT: none\n'
            : this.queryResult.toString());
        r += (0, strings_1.indent)(query_result_text);
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return SOILQueryAnswer;
}(SOILAnswer));
exports.SOILQueryAnswer = SOILQueryAnswer;
//-------------------------------------------------------------------------
//  Check answer
//-------------------------------------------------------------------------
var InvariantViolation = /** @class */ (function () {
    function InvariantViolation(className, invariantName, faultyObjects, subExpressions) {
        this.className = className;
        this.invariantName = invariantName;
        this.faultyObjects = faultyObjects;
        this.subExpressions = subExpressions;
    }
    InvariantViolation.prototype.toString = function () {
        var r = ('INVARIANT VIOLATION: '
            + this.className + '.' + this.invariantName
            + ' (' + this.faultyObjects.join(',') + ') ');
        r += (0, strings_1.indent)(this.subExpressions.join('\n')) + '\n';
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return InvariantViolation;
}());
exports.InvariantViolation = InvariantViolation;
var MultiplicityViolation = /** @class */ (function () {
    function MultiplicityViolation(sourceClass, targetRole, targetClass, object, numberOfObjects, cardinality) {
        this.sourceClass = sourceClass;
        this.targetRole = targetRole;
        this.targetClass = targetClass;
        this.object = object;
        this.numberOfObjects = numberOfObjects;
        this.cardinality = cardinality;
    }
    MultiplicityViolation.prototype.toString = function () {
        var r = ('MULTIPLICITY VIOLATION: '
            + "card(".concat(this.object, ".").concat(this.targetRole, ")=").concat(this.numberOfObjects)
            + " but card(".concat(this.sourceClass, ").").concat(this.targetRole, "=").concat(this.cardinality, "\n"));
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return MultiplicityViolation;
}());
exports.MultiplicityViolation = MultiplicityViolation;
/**
 * Answer to a query statements ( ? ?? \ )
 */
var SOILCheckAnswer = /** @class */ (function (_super) {
    __extends(SOILCheckAnswer, _super);
    function SOILCheckAnswer(localizedIssues, globalIssues, invariantViolations, multiplicityViolations) {
        if (localizedIssues === void 0) { localizedIssues = []; }
        if (globalIssues === void 0) { globalIssues = []; }
        if (invariantViolations === void 0) { invariantViolations = []; }
        if (multiplicityViolations === void 0) { multiplicityViolations = []; }
        var _this = _super.call(this, localizedIssues, globalIssues) || this;
        _this.localizedIssues = localizedIssues;
        _this.globalIssues = globalIssues;
        _this.invariantViolations = invariantViolations;
        _this.multiplicityViolations = multiplicityViolations;
        return _this;
    }
    SOILCheckAnswer.prototype.toString = function () {
        var r = _super.prototype.toString.call(this);
        if (this.multiplicityViolations.length >= 1) {
            r += (0, strings_1.indent)(this.multiplicityViolations.map(function (v) { return v.toString(); }).join('\n'));
        }
        if (this.invariantViolations.length >= 1) {
            r += (0, strings_1.indent)(this.invariantViolations.map(function (v) { return v.toString(); }).join('\n'));
        }
        console.error('"""' + r + '"""');
        assert((0, strings_1.isLineEnded)(r));
        return r;
    };
    return SOILCheckAnswer;
}(SOILAnswer));
exports.SOILCheckAnswer = SOILCheckAnswer;
//# sourceMappingURL=answers.js.map