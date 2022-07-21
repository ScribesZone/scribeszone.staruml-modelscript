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
function subExpressionsToString(label, subExpressions) {
    return "[".concat(subExpressions.length, " ").concat(label, "]");
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
        return "ISSUE: ".concat(this.line, ":").concat(this.column, ":").concat(this.message);
    };
    return USEFileIssue;
}());
exports.USEFileIssue = USEFileIssue;
var USEAnswer = /** @class */ (function () {
    function USEAnswer(issues) {
        if (issues === void 0) { issues = []; }
        this.issues = issues;
    }
    USEAnswer.prototype.toString = function () {
        return 'ANSWER: \n' + (0, strings_1.indent)(this.issues.map(function (i) { return i.toString(); }).join('\n'));
    };
    return USEAnswer;
}());
exports.USEAnswer = USEAnswer;
//=========================================================================
//  SOIL answers
//=========================================================================-
var SOILAnswer = /** @class */ (function () {
    function SOILAnswer(localizedIssues, globalIssues) {
        if (localizedIssues === void 0) { localizedIssues = []; }
        if (globalIssues === void 0) { globalIssues = []; }
        this.localizedIssues = localizedIssues;
        this.globalIssues = globalIssues;
    }
    SOILAnswer.prototype.toString = function () {
        return ('ANSWER: \n'
            + (0, strings_1.indent)(this.localizedIssues.map(function (i) { return i.toString(); }).join('\n'))
            + (0, strings_1.indent)(this.globalIssues.map(function (i) { return i.toString(); }).join('\n')));
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
        return "ISSUE: ".concat(this.line, ":").concat(this.column, ":").concat(this.message);
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
        return "ISSUE: '-':'-':".concat(this.kind, ":").concat(this.message);
    };
    return SOILGlobalIssue;
}());
exports.SOILGlobalIssue = SOILGlobalIssue;
//-------------------------------------------------------------------------
//  Statements answer
//-------------------------------------------------------------------------
//
/**
 * Answer to statements.
 */
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
        return ('ANSWER:\n'
            + (0, strings_1.indent)(_super.prototype.toString.call(this)));
    };
    return SOILStatementAnswer;
}(SOILAnswer));
exports.SOILStatementAnswer = SOILStatementAnswer;
//-------------------------------------------------------------------------
// Query result
//-------------------------------------------------------------------------
var QueryResult = /** @class */ (function () {
    function QueryResult(result, resultType, subExpressions) {
        this.result = result;
        this.resultType = resultType;
        this.subExpressions = subExpressions;
    }
    QueryResult.prototype.toString = function () {
        return ("RESULT: ".concat(this.result, ": ").concat(this.resultType)
            + subExpressionsToString('subExprs', this.subExpressions));
    };
    return QueryResult;
}());
exports.QueryResult = QueryResult;
/**
 * Answer to a query statements ( ? ?? \ )
 */
var SOILQueryAnswer = /** @class */ (function (_super) {
    __extends(SOILQueryAnswer, _super);
    function SOILQueryAnswer(localizedIssues, globalIssues, queryResult) {
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
        return ('ANSWER:\n'
            + (0, strings_1.indent)(_super.prototype.toString.call(this))
            + (0, strings_1.indent)(this.queryResult.toString()));
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
        return ('INVARIANT VIOLATION:'
            + this.className + '.' + this.invariantName
            + ' (' + this.faultyObjects.join(',') + ') '
            + subExpressionsToString('subExprs', this.subExpressions));
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
        return ('MULTIPLICITY VIOLATION: '
            + "card(".concat(this.object, ".").concat(this.targetRole, ")=").concat(this.numberOfObjects)
            + " but card(".concat(this.sourceClass, ").").concat(this.targetRole, "=").concat(this.cardinality));
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
    return SOILCheckAnswer;
}(SOILAnswer));
exports.SOILCheckAnswer = SOILCheckAnswer;
//# sourceMappingURL=answers.js.map