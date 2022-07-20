import {TextPattern, TextPatternAction} from "../framework/patterns"

//-------------------------------------------------------------------------
//       Issues
//-------------------------------------------------------------------------



/**
 * Error message localized in a well identified '.use' file.
 * Found only in .utc files.
 *
 * Examples:
 *      main-comment-error.use:line 62:0 mismatched character '<EOF>' expecting '*'cat *.ut
 *      main.use:58:23: Undefined operation `Integer.>=(String)'.
 */
export const USEFileIssuePattern: TextPattern = {
    name: 'USEFileIssuePattern',
    regex: /(?<file>.+.use):(line ?)?(?<line>\d+):(?<column>\d+)\:?(?<message>[^\n]*)\n?/m,
    action: TextPatternAction.replace,
    variables: ['file', 'line', 'column', 'message'],
    replaceFun: function (g) {
        return (
            'FILE ISSUE: '
            +[g.file, g.line, g.column].join(':')
            + ': '
            + (g.message||''))
    }
}

/**
 * Error message found in .stc file. No file is indicated. The issue
 * is relative to the input section.
 *
 * Example:
 *
 *      <input>:1:0: Variable `Oooops' in expression `Oooops.monday' is undefined.
 *
 * Regex:
 *
 *      ^<input>:(?<line>\d+):(?<column>\d+): (?<Type>(Error|Warning): )?(?<message>[^\n]*)\n
 */
export const SOILLocalizedIssuePattern: TextPattern = {
    name: 'SOILLocalizedIssue',
    regex: /^<input>:(?<line>\d+):(?<column>\d+): (?<message>[^\n]*)\n/m,
    action: TextPatternAction.replace,
    variables: ['line', 'column', 'message'],
    replaceFun: function (g) {
        return (
            'LOCALIZED ISSUE: '+g.line+':'+g.column+': '+ g.message)
    }
}


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
export const SOILGlobalIssuePattern: TextPattern = {
    name: 'SOILGlobalIssuePattern',
    regex: /^(?<kind>(Error|Warning)): (?<message>[^\n]*)\n/m,
    action: TextPatternAction.replace,
    variables: ['kind', 'message'],
    replaceFun: function (g) {
        return 'GLOBAL ISSUE: '+g.kind+': '+g.message
    }
}


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
export const InvariantViolationPattern: TextPattern = {
    name: 'InvariantViolationPattern',
    regex: /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)': FAILED\.\n  ->(?<result>[^\n]*)\n((Results of subexpressions:\n(?<details>(  [^\n]+\n)*)?)?Instances of (?<class>\w+) violating the invariant:\n  -> (?<collection1>\w+){(?<objects>[\w,]+)} : (?<collection2>\w+)\((?<classResult>\w+)\))?/m,
    action: TextPatternAction.replace,
    variables: ['context', 'invname', 'result', 'details', 'class', 'collection1', 'objects', 'collection2', 'classResult'],
    replaceFun: function (g) {
        let text =  'INVARIANT VIOLATION: '+g.context+'::'+g.invname+' KO'
        if (g.details !== undefined) {
            text += `\nFaulty objects: ${g.objects}: ${g.classResult}\nSubexpressions: ${g.details}`
        }
        return text
    }
}

/**
 * Example:
 *
 *      checking invariant (1) `Department::i1a': OK.
 */
export const InvariantOKPattern: TextPattern = {
    name: 'InvariantOKPattern',
    regex: /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)': OK\.\n/m,
    action: TextPatternAction.ignore,
    variables: ['context', 'invname'],
    replaceFun: function (g) {
        return (
            '<<<INVARIANT: '+g.context+'::'+g.invname+' OK>>>')
    }
}

export const DiscardInvariantCheckingPattern: TextPattern = {
    name: 'DiscardInvariantCheckingPattern',
    regex: /checking invariants\.\.\.\n|checked \w+ invariants in [^\n]*\./m,
    action: TextPatternAction.ignore,
    variables: [],
    replaceFun: function (g) {
        return (
            '<<<DiscardInvariantChecking>>>')
    }
}

export const InvariantsSummaryPattern: TextPattern = {
    name: 'InvariantsSummaryPattern',
    regex: /^checked [^\n]+\n/,
    variables: [],
    action: TextPatternAction.ignore,
    replaceFun: function (g) {
        return (
            '<<<PatternInvariantsSummary>>>')
    }
}


//-------------------------------------------------------------------------
//       Multiplicity (check section)
//-------------------------------------------------------------------------

/**
 * Example:
 *      Multiplicity constraint violation in association `WorksIn':
 *      Object `sophie' of class `Employee' is connected to 0 objects of class `Department'
 *      at association end `departments' but the multiplicity is specified as `1..*'.
 */
export const MultiplicityViolationPattern: TextPattern = {
    name: 'MultiplicityViolationPattern',
    regex: /Multiplicity constraint violation in association `(?<association>\w+)':\n  Object `(?<object>\w+)' of class `(?<sourceClass>\w+)' is connected to (?<numberOfObjects>\d+) objects of class `(?<targetClass>\w+)'\n  at association end `(?<targetRole>\w+)' but the multiplicity is specified as `(?<cardinality>.*)'\./m,
    action: TextPatternAction.replace,
    variables: ['association', 'object', 'sourceClass', 'numberOfObjects', 'targetClass', 'targetRole', 'cardinality'],
    replaceFun: function (g) {
        return (
            'CARDINALITY VIOLATION: card('+g.object+'.'+g.targetRole+') = '
            + g.numberOfObjects
            + ' but '+g.sourceClass+'.'+g.targetRole+':'+g.targetClass+'['+g.cardinality+g.cardinality+']'
        )
    }
}

export const DiscardCheckingStructurePattern: TextPattern = {
    name: 'DiscardCheckingStructurePattern',
    regex: /checking structure\.\.\.\n|checked structure in \d+ms\.\n/m,
    action: TextPatternAction.ignore,
    variables: [],
    replaceFun: function (g) {
        return (
            '<<<PatternDiscardCheckingStructure>>>')
    }
}


//-------------------------------------------------------------------------
//       Queries
//-------------------------------------------------------------------------

/**
 *
 */
export const QueryPattern: TextPattern = {
    name: 'QueryPattern',
    regex: /Detailed results of subexpressions:\n(?<details>(  [^\n]+\n)*)-> (?<result>.*) : (?<resultType>.*)\n/m,
    action: TextPatternAction.replace,
    variables: ['details', 'result', 'resultType'],
    replaceFun: function (g) {
        return (
            'QUERY RESULT: '+g.result+': '+g.resultType+'\n'+g.details)
    }
}



//-------------------------------------------------------------------------
//       Misc
//-------------------------------------------------------------------------

export const BlankLinePattern: TextPattern = {
    name: 'BlankLinePattern',
    regex: /(^(\s*\n)+|\n$)/m,
    action: TextPatternAction.ignore,
    variables: [],
    replaceFun: function (g) {
        return (
            '<<<blank line>>>')
    }
}


export const ALL_USEOCL_PATTERNS = [
   
    // Errors
    USEFileIssuePattern,
    SOILLocalizedIssuePattern,
    SOILGlobalIssuePattern,
   
    // Invariants 
    InvariantViolationPattern,
    InvariantOKPattern,
    DiscardInvariantCheckingPattern,
    InvariantsSummaryPattern,

    // Multiplicity patterns
    MultiplicityViolationPattern,
    DiscardCheckingStructurePattern,

    // Query pattern
    QueryPattern,

    // Misc patterns
    BlankLinePattern
]


