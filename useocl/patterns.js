"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_USEOCL_PATTERNS = exports.BlankLinePattern = exports.QueryPattern = exports.DiscardCheckingStructurePattern = exports.MultiplicityViolationPattern = exports.InvariantsSummaryPattern = exports.DiscardInvariantCheckingPattern = exports.InvariantOKPattern = exports.InvariantViolationPattern = exports.SOILGlobalIssuePattern = exports.SOILLocalizedIssuePattern = exports.USEFileIssuePattern = void 0;
var patterns_1 = require("../framework/patterns");
//-------------------------------------------------------------------------
//       Issues
//-------------------------------------------------------------------------
// TODO: replaceFun
/**
 * Error message localized in a well identified '.use' file.
 * Found only in .utc files.
 *
 * Examples:
 *      main-comment-error.use:line 62:0 mismatched character '<EOF>' expecting '*'cat *.ut
 *      main.use:58:23: Undefined operation `Integer.>=(String)'.
 */
exports.USEFileIssuePattern = {
    name: 'USEFileIssuePattern',
    regex: /(?<file>.+.use):(line ?)?(?<line>\d+):(?<column>\d+)\:?(?<message>[^\n]*)\n?/m,
    action: patterns_1.TextPatternAction.replace,
    variables: ['file', 'line', 'column', 'message'],
    replaceFun: function (g) {
        return ('FILE ISSUE: '
            + [g.file, g.line, g.column].join(':')
            + ': '
            + (g.message || ''));
    }
};
/**
 * Error message found in .stc file. No file is indicated. The issue
 * is relative to the input section.
 *
 * Example:
 *
 *      <input>:1:0: Variable `Oooops' in expression `Oooops.monday' is undefined.
 *      <input>:line 1:5 missing EOF at 'is'"
 *
 * Regex:
 *
 *      -
 */
exports.SOILLocalizedIssuePattern = {
    name: 'SOILLocalizedIssue',
    regex: /^<input>:(line )?(?<line>\d+):(?<column>\d+):? ?(?<message>[^\n]*)\n?/m,
    action: patterns_1.TextPatternAction.replace,
    variables: ['line', 'column', 'message'],
    replaceFun: function (g) {
        return ('LOCALIZED ISSUE: ' + g.line + ':' + g.column + ': ' + g.message);
    }
};
// case #0: Error: Unknown command `this is not a command'. Try `help'.
// case #1: Error: Object `Wheel1' is shared by object `Car1' and object `Car2'.
// case #3: Warning: Insert has resulted in two aggregates for object
//
// MSystemState.java
//      Error: Object `example' cannot be a part of itself.`Wheel1'.
//      Object `Wheel1' is already component of another object.
/**
 * Example:
 *      Error: Object `Wheel1' is shared by object `Car1' and object `Car2'.
 */
exports.SOILGlobalIssuePattern = {
    name: 'SOILGlobalIssuePattern',
    regex: /^(?<kind>(Error|Warning)): (?<message>[^\n]*)\n?/m,
    action: patterns_1.TextPatternAction.replace,
    variables: ['kind', 'message'],
    replaceFun: function (g) {
        return 'GLOBAL ISSUE: ' + g.kind + ': ' + g.message;
    }
};
//-------------------------------------------------------------------------
//       Invariants (check section)
//-------------------------------------------------------------------------
/**
 * Example (no details):
 *
 *      checking invariant (3) `Employee::i1b': FAILED.
 *          -> false : Boolean
 *
 * Example (with details):
 *
 *      checking invariant (3) `Employee::i1b': FAILED.
 *        -> false : Boolean
 *      Results of subexpressions:
 *        Employee.allInstances : Set(Employee) = Set{sophie}
 *        self : Employee = sophie
 *        ...
 *      Instances of Employee violating the invariant:
 *        -> Set{sophie} : Set(Employee)
 *
 * Regex:
 *
 *      /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)\': FAILED\.\n  ->(?<result>[^\n]*)\n(Results of subexpressions:\n(?<details>(  [^\n]+\n)*)?Instances of (?<class>\w+) violating the invariant:\n  -> (?<collection1>\w+)\{(?<objects>[\w,]+)\} : (?<collection2>\w+)\((?<classResult>\w+)\))?/m
 */
exports.InvariantViolationPattern = {
    name: 'InvariantViolationPattern',
    regex: /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)': FAILED\.\n  ->(?<result>[^\n]*)\n((Results of subexpressions:\n(?<details>(  [^\n]+\n)*)?)?Instances of (?<class>\w+) violating the invariant:\n  -> (?<collection1>\w+){(?<objects>[\w,]+)} : (?<collection2>\w+)\((?<classResult>\w+)\))?/m,
    action: patterns_1.TextPatternAction.replace,
    variables: ['context', 'invname', 'result', 'details', 'class', 'collection1', 'objects', 'collection2', 'classResult'],
    replaceFun: function (g) {
        var text = 'INVARIANT VIOLATION: ' + g.context + '::' + g.invname + ' KO';
        if (g.details !== undefined) {
            text += "\nFaulty objects: ".concat(g.objects, ": ").concat(g.classResult, "\nSubexpressions: ").concat(g.details);
        }
        return text;
    }
};
/**
 * Example:
 *
 *      checking invariant (1) `Department::i1a': OK.
 */
exports.InvariantOKPattern = {
    name: 'InvariantOKPattern',
    regex: /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)': OK\.\n?/m,
    action: patterns_1.TextPatternAction.ignore,
    variables: ['context', 'invname'],
    replaceFun: function (g) {
        return ('<<<INVARIANT: ' + g.context + '::' + g.invname + ' OK>>>');
    }
};
exports.DiscardInvariantCheckingPattern = {
    name: 'DiscardInvariantCheckingPattern',
    regex: /checking invariants\.\.\.\n|checked \w+ invariants in [^\n]*\./m,
    action: patterns_1.TextPatternAction.ignore,
    variables: [],
    replaceFun: function (g) {
        return ('<<<DiscardInvariantChecking>>>');
    }
};
exports.InvariantsSummaryPattern = {
    name: 'InvariantsSummaryPattern',
    regex: /^checked [^\n]+\n?/,
    variables: [],
    action: patterns_1.TextPatternAction.ignore,
    replaceFun: function (g) {
        return ('<<<PatternInvariantsSummary>>>');
    }
};
//-------------------------------------------------------------------------
//       Multiplicity (check section)
//-------------------------------------------------------------------------
/**
 * Example:
 *      Multiplicity constraint violation in association `WorksIn':
 *      Object `sophie' of class `Employee' is connected to 0 objects of class `Department'
 *      at association end `departments' but the multiplicity is specified as `1..*'.
 */
exports.MultiplicityViolationPattern = {
    name: 'MultiplicityViolationPattern',
    regex: /Multiplicity constraint violation in association `(?<association>\w+)':\n  Object `(?<object>\w+)' of class `(?<sourceClass>\w+)' is connected to (?<numberOfObjects>\d+) objects of class `(?<targetClass>\w+)'\n  at association end `(?<targetRole>\w+)' but the multiplicity is specified as `(?<cardinality>.*)'\./m,
    action: patterns_1.TextPatternAction.replace,
    variables: ['association', 'object', 'sourceClass', 'numberOfObjects', 'targetClass', 'targetRole', 'cardinality'],
    replaceFun: function (g) {
        return ('CARDINALITY VIOLATION: card(' + g.object + '.' + g.targetRole + ') = '
            + g.numberOfObjects
            + ' but ' + g.sourceClass + '.' + g.targetRole + ':' + g.targetClass + '[' + g.cardinality + g.cardinality + ']');
    }
};
exports.DiscardCheckingStructurePattern = {
    name: 'DiscardCheckingStructurePattern',
    regex: /checking structure\.\.\.\n|checked structure in \d+ms\.\n?/m,
    action: patterns_1.TextPatternAction.ignore,
    variables: [],
    replaceFun: function (g) {
        return ('<<<PatternDiscardCheckingStructure>>>');
    }
};
//-------------------------------------------------------------------------
//       Queries
//-------------------------------------------------------------------------
/**
 *
 */
exports.QueryPattern = {
    name: 'QueryPattern',
    regex: /Detailed results of subexpressions:\n(?<details>(  [^\n]+\n)*)-> (?<result>.*) : (?<resultType>.*)\n?/m,
    action: patterns_1.TextPatternAction.replace,
    variables: ['details', 'result', 'resultType'],
    replaceFun: function (g) {
        return ('QUERY RESULT: ' + g.result + ': ' + g.resultType + '\n' + g.details);
    }
};
//-------------------------------------------------------------------------
//       Misc
//-------------------------------------------------------------------------
exports.BlankLinePattern = {
    name: 'BlankLinePattern',
    regex: /(^(\s*\n)+|\n$)/m,
    action: patterns_1.TextPatternAction.ignore,
    variables: [],
    replaceFun: function (g) {
        return ('<<<blank line>>>');
    }
};
exports.ALL_USEOCL_PATTERNS = [
    // Errors
    exports.USEFileIssuePattern,
    exports.SOILLocalizedIssuePattern,
    exports.SOILGlobalIssuePattern,
    // Invariants 
    exports.InvariantViolationPattern,
    exports.InvariantOKPattern,
    exports.DiscardInvariantCheckingPattern,
    exports.InvariantsSummaryPattern,
    // Multiplicity patterns
    exports.MultiplicityViolationPattern,
    exports.DiscardCheckingStructurePattern,
    // Query pattern
    exports.QueryPattern,
    // Misc patterns
    exports.BlankLinePattern
];
//# sourceMappingURL=patterns.js.map