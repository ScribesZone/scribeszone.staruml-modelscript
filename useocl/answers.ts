//=========================================================================
//  USE answer
//=========================================================================-

import {TextMatcher, TextPattern} from "../framework/patterns"
import {BlankLinePattern, USEFileIssuePattern} from "./patterns"
import {
    indent,
    NoLineString,
    MultilineString,
    isNoLineString,
    isMultilineString, ensureNoNewLineAtEnd, LineEndedString, isLineEnded
} from "../framework/strings"

import assert = require("node:assert")


function subExpressionsToString(label:string, subExpressions: Array<String>): NoLineString {
    let r = `[${subExpressions.length} ${label}]`
    assert(isNoLineString(r))
    return r
}


export abstract class AbstractAnswer {
}

export class USEFileIssue {
    constructor(
        public readonly line: number,
        public readonly column: number,
        public readonly message: string
    ) {}

    toString(): NoLineString {
        let r = `ISSUE: ${this.line}:${this.column}:${this.message}`
        assert(isNoLineString(r))
        return r
    }
}





//=========================================================================
//  USE answers
//=========================================================================

export class USEAnswer {
    constructor(
        public readonly issues: Array<USEFileIssue> = []
    ) {}

    hasIssues() {
        return this.issues.length >= 1
    }

    toString(): LineEndedString {
        let r
        if (this.issues.length === 0) {
            r = 'ANSWER: -\n'
        } else {
            r = (
                'ANSWER:\n'
                + indent(this.issues.map(i => i.toString()).join('\n')) + ' \n')
        }
        assert(isLineEnded(r))
        return r
    }
}

//=========================================================================
//  SOIL answers
//=========================================================================

export abstract class SOILAnswer {

    protected constructor (
        public readonly localizedIssues: Array<SOILLocalizedIssue> = [],
        public readonly globalIssues: Array<SOILGlobalIssue> = []
    ) {}

    hasIssues() {
        return (this.localizedIssues.length > 0) || (this.globalIssues.length > 0)
    }

    toString(): LineEndedString {
        let r = 'ANSWER:\n'
        if (this.localizedIssues.length >= 1) {
            r += indent(this.localizedIssues.map(i=>i.toString()).join('\n')) +'\n'
        }
        if (this.globalIssues.length >= 1) {
            r += indent(this.globalIssues.map(i=>i.toString()).join('\n')) +'\n'
        }
        console.error('"""'+r+'"""')
        assert(isLineEnded(r))
        return r
    }
}

//-------------------------------------------------------------------------
//  Soil issues
//-------------------------------------------------------------------------

export class SOILLocalizedIssue {
    constructor (
        public readonly line: number,
        public readonly column: number,
        public readonly message: string
    ) {}

    toString(): NoLineString {
        let r = `ISSUE: ${this.line}:${this.column}:${this.message}`
        assert(isNoLineString(r))
        return r
    }
}

export type SOILIssueKind = 'Error' | 'Warning'


export class SOILGlobalIssue {

    constructor(
        public readonly kind: SOILIssueKind,
        public readonly message: string
    ) {}

    toString(): NoLineString {
        let r = `ISSUE: '-':'-':${this.kind}:${this.message}`
        assert(isNoLineString(r))
        return r
    }

}

//-------------------------------------------------------------------------
//  Statements answer
//-------------------------------------------------------------------------


export class SOILStatementAnswer extends SOILAnswer {
    constructor(
        public readonly localizedIssues: Array<SOILLocalizedIssue> = [],
        public readonly globalIssues: Array<SOILGlobalIssue> = []) {
        super(localizedIssues, globalIssues)
    }

    toString(): LineEndedString {
        let r = super.toString()
        assert(isLineEnded(r))
        return r
    }
}

//-------------------------------------------------------------------------
// Query result
//-------------------------------------------------------------------------

/**
 * Result of a query. If errors are generated during the evaluation
 * then instead of having a QueryResult, a  null value means no query result.
 * The class below represents the case where there is a result.
 */
export class QueryResult {

    constructor(
        public readonly result: string,
        public readonly resultType: string,
        public readonly subExpressions: Array<string>
    ) {}

    toString(): LineEndedString {
        let r = `RESULT: ${this.result}: ${this.resultType}` + '\n'
        r += indent(this.subExpressions.join('\n')) + '\n'
        // r += ensureNoNewLineAtEnd(this.subExpressions ?? '').split('\n').map(line => line.trim()) +'\n'
        // r += subExpressionsToString('subExprs', this.subExpressions)
        assert(isLineEnded(r))
        return r
    }
}

/**
 * Answer to a query statements ( ? ?? \ )
 */
export class SOILQueryAnswer extends SOILAnswer {

    constructor(
        public readonly localizedIssues: Array<SOILLocalizedIssue> = [],
        public readonly globalIssues: Array<SOILGlobalIssue> = [],
        /**
         * Result of the query. null means that an error occured in the use evaluation.
         * For instance if the query is malformed.
         */
        public queryResult: QueryResult | null = null) {
        super(localizedIssues, globalIssues)
    }

    toString(): string {
        let r = super.toString()
        const query_result_text = (
            (this.queryResult === null)
                ? 'RESULT: none\n'
                : this.queryResult.toString()  )
        r += indent(query_result_text))
        assert(isLineEnded(r))
        return r
    }
}

//-------------------------------------------------------------------------
//  Check answer
//-------------------------------------------------------------------------

export class InvariantViolation {
    constructor(
        public readonly className: string,
        public readonly invariantName: string,
        public readonly faultyObjects: Array<string>,
        public readonly subExpressions: Array<string>
    ) {}

    toString(): LineEndedString {
        let r = (
            'INVARIANT VIOLATION: '
            + this.className + '.' + this.invariantName
            + ' (' + this.faultyObjects.join(',') + ') ')
        r += indent(this.subExpressions.join('\n')) + '\n'
        assert(isLineEnded(r))
        return r
    }
}


export class MultiplicityViolation {
    constructor(
        public readonly sourceClass: string,
        public readonly targetRole: string,
        public readonly targetClass: string,
        public readonly object: string,
        public readonly numberOfObjects: number,
        public readonly cardinality: string
    ) {}

    toString(): LineEndedString {
        const r = (
            'MULTIPLICITY VIOLATION: '
            + `card(${this.object}.${this.targetRole})=${this.numberOfObjects}`
            + ` but card(${this.sourceClass}).${this.targetRole}=${this.cardinality}\n`
        )
        assert(isLineEnded(r))
        return r
    }
}

/**
 * Answer to a query statements ( ? ?? \ )
 */
export class SOILCheckAnswer extends SOILAnswer {

    constructor (
        public readonly localizedIssues: Array<SOILLocalizedIssue> = [],
        public readonly globalIssues: Array<SOILGlobalIssue> = [],
        public readonly invariantViolations: Array<InvariantViolation> = [],
        public readonly multiplicityViolations: Array<MultiplicityViolation> = []) {
        super(localizedIssues, globalIssues)
    }

    toString(): LineEndedString {
        let r = super.toString()
        if (this.multiplicityViolations.length >= 1) {
            r += indent(this.multiplicityViolations.map(v => v.toString()).join('\n'))
        }
        if (this.invariantViolations.length >= 1) {
            r += indent(this.invariantViolations.map(v => v.toString()).join('\n'))
        }
        console.error('"""'+r+'"""')
        assert(isLineEnded(r))
        return r
    }
}

