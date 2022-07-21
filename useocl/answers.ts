//=========================================================================
//  USE answer
//=========================================================================-

import {TextMatcher, TextPattern} from "../framework/patterns"
import {BlankLinePattern, USEFileIssuePattern} from "./patterns"
import {indent} from "../framework/strings";

function subExpressionsToString(label:string, subExpressions: Array<String>): string {
    return `[${subExpressions.length} ${label}]`
}



export abstract class AbstractAnswer {
}

export class USEFileIssue {
    constructor(
        public readonly line: number,
        public readonly column: number,
        public readonly message: string
    ) {}

    toString() {
        return `ISSUE: ${this.line}:${this.column}:${this.message}`
    }
}

export class USEAnswer {
    constructor(
        public readonly issues: Array<USEFileIssue> = []
    ) {}

    toString(): string {
        return 'ANSWER: \n'+indent(this.issues.map(i=>i.toString()).join('\n'))
    }
}

//=========================================================================
//  SOIL answers
//=========================================================================-

export abstract class SOILAnswer {
    constructor (
        public readonly localizedIssues: Array<SOILLocalizedIssue> = [],
        public readonly globalIssues: Array<SOILGlobalIssue> = []
    ) {}

    toString(): string {
        return (
            'ANSWER: \n'
            + indent(this.localizedIssues.map(i=>i.toString()).join('\n'))
            + indent(this.globalIssues.map(i=>i.toString()).join('\n')))
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

    toString(): string {
        return `ISSUE: ${this.line}:${this.column}:${this.message}`
    }
}

export type SOILIssueKind = 'Error' | 'Warning'


export class SOILGlobalIssue {
    constructor(
        public readonly kind: SOILIssueKind,
        public readonly message: string
    ) {}

    toString(): string {
        return `ISSUE: '-':'-':${this.kind}:${this.message}`
    }

}

//-------------------------------------------------------------------------
//  Statements answer
//-------------------------------------------------------------------------
//

/**
 * Answer to statements.
 */
export class SOILStatementAnswer extends SOILAnswer {
    constructor(
        public readonly localizedIssues: Array<SOILLocalizedIssue> = [],
        public readonly globalIssues: Array<SOILGlobalIssue> = []) {
        super(localizedIssues, globalIssues)
    }

    toString(): string {
        return (
            'ANSWER:\n'
            + indent(super.toString()))
    }
}


//-------------------------------------------------------------------------
// Query result
//-------------------------------------------------------------------------


export class QueryResult {

    constructor(
        public readonly result: string,
        public readonly resultType: string,
        public readonly subExpressions: Array<string>
    ) {}

    toString(): string {
        return (
            `RESULT: ${this.result}: ${this.resultType}`
            + subExpressionsToString('subExprs', this.subExpressions))
    }
}

/**
 * Answer to a query statements ( ? ?? \ )
 */
export class SOILQueryAnswer extends SOILAnswer {

    constructor(
        public readonly localizedIssues: Array<SOILLocalizedIssue> = [],
        public readonly globalIssues: Array<SOILGlobalIssue> = [],
        public queryResult: QueryResult | null = null) {  // null only at parse time
        super(localizedIssues, globalIssues)
    }

    toString(): string {
        return (
            'ANSWER:\n'
            + indent(super.toString())
            + indent(this.queryResult!.toString()))
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

    toString() {
        return (
            'INVARIANT VIOLATION:'
            + this.className + '.' + this.invariantName
            + ' (' + this.faultyObjects.join(',') + ') '
            + subExpressionsToString('subExprs', this.subExpressions)
        )
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

    toString() {
        return (
            'MULTIPLICITY VIOLATION: '
            + `card(${this.object}.${this.targetRole})=${this.numberOfObjects}`
            + ` but card(${this.sourceClass}).${this.targetRole}=${this.cardinality}`
        )
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

}

