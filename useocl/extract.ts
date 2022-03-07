const { filterByKeyValue } = require('../framework/misc')

//-------------------------------------------------------------------------
//       Errors
//-------------------------------------------------------------------------

const PatternFileError = {
    name: 'PatternFileError',
    regex: /^(?<file>.+):(?<line>\d+):(?<column>\d+): (?<message>[^\n]*)\n/m,
    ignore: false,
    formatFun: function (match) {
        const g = match.groups
        return (
            [g.file, g.line, g.column].join(':')
            + ': '
            + (g.message||''))
    }
}

const PatternLocalizedError = {
    name: 'PatternLocalizedError',
    regex: /^<input>:(?<line>\d+):(?<column>\d+): (?<message>[^\n]*)\n/m,
    ignore: false,
    formatFun: function (match) {
        const g = match.groups
        return (
            g.line+':'+g.column+': '+ g.message)
    }
}
// ^<input>:(?<line>\d+):(?<column>\d+): (?<Type>(Error|Warning): )?(?<message>[^\n]*)\n

const PatternUnlocalizedError = {
    name: 'PatternUnlocalizedError',
    regex: /^(?<type>(Error|Warning)): (?<message>[^\n]*)\n/m,
    ignore: false,
    formatFun: function (match) {
        const g = match.groups
        return g.type+': '+g.message
    }
}


//-------------------------------------------------------------------------
//       Invariants
//-------------------------------------------------------------------------

const PatternInvariantFailed = {
    name: 'InvariantFailed1',
    // regex: /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)\': FAILED\.\n  ->(?<result>[^\n]*)\n(Results of subexpressions:\n(?<details>(  [^\n]+\n)*)?Instances of (?<class>\w+) violating the invariant:\n  -> (?<collection1>\w+)\{(?<objects>[\w,]+)\} : (?<collection2>\w+)\((?<classResult>\w+)\))?/m
    regex: /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)': FAILED\.\n  ->(?<result>[^\n]*)\n((Results of subexpressions:\n(?<details>(  [^\n]+\n)*)?)?Instances of (?<class>\w+) violating the invariant:\n  -> (?<collection1>\w+){(?<objects>[\w,]+)} : (?<collection2>\w+)\((?<classResult>\w+)\))?/m,
    ignore: false,
    formatFun: function (match) {
        const g = match.groups
        return (
            'invariant '+g.context+'::'+g.invname+' KO'+'\n'
            + '    DETAILS : TODO')
    }
}

const PatternInvariantOK = {
    name: 'InvariantOK',
    regex: /checking invariant \(\d+\) `(?<context>\w+)::(?<invname>\w+)': OK\.\n/m,
    ignore: true,
    formatFun: function (match) {
        const g = match.groups
        return (
            'invariant '+g.context+'::'+g.invname+' OK')
    }
}

const PatternDiscardInvariantChecking = {
    name: 'DiscardInvariantChecking',
    regex: /checking invariants\.\.\.\n|checked \w+ invariants in [^\n]*\./m,
    ignore: true,
    formatFun: function (match) {
        const g = match.groups
        return (
            '<<<DiscardInvariantChecking>>>')
    }
}

const PatternInvariantsSummary = {
    name: 'PatternInvariantsSummary',
    regex: /^checked [^\n]+\n/,
    ignore: true,
    formatFun: function (match) {
        const g = match.groups
        return (
            '<<<PatternInvariantsSummary>>>')
    }
}


//-------------------------------------------------------------------------
//       Multiplicities
//-------------------------------------------------------------------------

const PatternMultiplicityViolation = {
    name: 'MultiplicityViolation',
    regex: /Multiplicity constraint violation in association `(?<association>\w+)':\n  Object `(?<object>\w+)' of class `(?<sourceClass>\w+)' is connected to (?<numberOfObjects>\d+) objects of class `(?<targetClass>\w+)'\n  at association end `(?<targetRole>\w+)' but the multiplicity is specified as `(?<cardinality>.*)'\./m,
    ignore: false,
    formatFun: function (match) {
        const g = match.groups
        return (
            'card('+g.object+'.'+g.targetRole+') = '
            + g.numberOfObjects
            + ' but cardinality is ' +g.cardinality
            + ' TODO details'
        )
    }
}

const PatternDiscardCheckingStructure = {
    name: 'CheckingStructure',
    regex: /checking structure\.\.\.\n|checked structure in \d+ms\.\n/m,
    ignore: true,
    formatFun: function (match) {
        const g = match.groups
        return (
            '<<<PatternDiscardCheckingStructure>>>')
    }
}


//-------------------------------------------------------------------------
//       Queries
//-------------------------------------------------------------------------

const PatternQuery = {
    name: 'PatternQuery',
    regex: /Detailed results of subexpressions:\n(?<details>(  [^\n]+\n)*)-> (?<result>.*) : (?<resultType>.*)\n/m,
    ignore: false,
    formatFun: function (match) {
        const g = match.groups
        return (
            'PatternQuery: TODO')
    }
}



//-------------------------------------------------------------------------
//       Misc
//-------------------------------------------------------------------------

const PatternBlankLine = {
    name: 'PatternBla' +
        'nkLine',
    regex: /(^(\s*\n)+|\n$)/m,
    ignore: true,
    formatFun: function (match) {
        const g = match.groups
        return (
            'PatternQuery: TODO')
    }
}


const ALL_USEOCL_PATTERNS = [

    PatternInvariantFailed,
    PatternInvariantOK,
    PatternInvariantsSummary,
    PatternDiscardInvariantChecking,

    PatternMultiplicityViolation,
    PatternDiscardCheckingStructure,

    PatternQuery,

    PatternFileError,
    PatternLocalizedError,
    PatternUnlocalizedError,

    PatternBlankLine
]


exports.ALL_USEOCL_PATTERNS = ALL_USEOCL_PATTERNS
