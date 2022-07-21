import {TextMatcher, TextPattern} from "../framework/patterns";
import {
    BlankLinePattern,
    DiscardCheckingStructurePattern,
    DiscardInvariantCheckingPattern,
    InvariantOKPattern,
    InvariantsSummaryPattern,
    InvariantViolationPattern,
    MultiplicityViolationPattern,
    QueryPattern,
    SOILGlobalIssuePattern,
    SOILLocalizedIssuePattern,
    USEFileIssuePattern
} from "./patterns";
import {
    AbstractAnswer, InvariantViolation, MultiplicityViolation, QueryResult,
    SOILAnswer, SOILCheckAnswer,
    SOILGlobalIssue,
    SOILIssueKind,
    SOILLocalizedIssue,
    SOILQueryAnswer, SOILStatementAnswer,
    USEAnswer,
    USEFileIssue
} from "./answers";
import {
    SOILSectionKind
} from "./evaluations"
import * as path from "path";


abstract class AbstractAnswerParser {
    readonly text: string
    readonly textMatcher: TextMatcher
    readonly patterns: Array<TextPattern>
    answer?: AbstractAnswer

    protected constructor(text: string, patterns: Array<TextPattern>) {
        this.text = text
        // console.log('DG:14: text', this.text)
        this.textMatcher = new TextMatcher(text)
        this.patterns = patterns
        this.answer = undefined
    }

    /**
     * Parse the text with the patterns. Throw an error if there is
     * residue after matching the patterns otherwise returns an answer.
     * This method must be called but subclasses.
     */
    parse(): void {
        this._extractPatterns()
        this._checkNoResidue()
        this.analyze()
    }

    /**
     * analyse() must be defined by subclasses. This method must create
     * the answer by parsing the textMatcher matches.
     */
    protected abstract analyze() : void

    _extractPatterns(): void {
        this.patterns.forEach(pattern => {
            this.textMatcher.extractPattern(pattern)
        })
    }

    private _checkNoResidue(): void {
        if (this.textMatcher.residualText !== '') {
            this.consoleErrorHeader()
            console.error('Remaining text after pattern matching :')
            console.error('"""')
            console.error(this.textMatcher.residualText)
            console.error(`""" length(${this.textMatcher.residualText.length})`)
            console.error(this.textMatcher)
            this.throwError()
        }
    }

    protected consoleErrorHeader() {
        console.error('-'.repeat(80))
        console.error('PARSING ERROR IN CLASS ' + this.constructor.name)
    }

    protected throwError() {
        throw new Error('===> Parsing error in class '+ this.constructor.name)
    }
}




//=========================================================================
// USEAnswerParser
//=========================================================================

/**
 * Parser for a .utc file. By contrast to .stc files which are split in
 * section the content of the .utc file is parsed at once.
 */
export class USEAnswerParser extends AbstractAnswerParser {

    answer: USEAnswer
    useFileName: string    // useful to simplify/check error message

    constructor (useFileName: string, utcText: string) {
        super(utcText, [
            BlankLinePattern,
            USEFileIssuePattern])
        this.useFileName = useFileName
    }

    analyze(): USEAnswer | null {
        this.answer = new USEAnswer()
        // console.log('DG:72: ',this.textMatcher)
        this._addIssues()
        return this.answer
    }

    _addIssues() {
        const matches = this.textMatcher.matches("USEFileIssuePattern")
        // console.log('DG:73: matches', matches)
        matches.forEach(match => {
            const g = match.groups
            this._checkFilename(g.file)
            const issue = new USEFileIssue(
                parseInt(g.line),
                parseInt(g.column),
                g.message)
            this.answer.issues.push(issue)
        })
    }

    _checkFilename(fileNameFromIssue) {
        if (fileNameFromIssue != path.basename(this.useFileName)) {
            this.consoleErrorHeader()
            console.error('Issue references unexpected file name')
            console.error(`Current file is "${this.useFileName}`)
            console.error('while an issue reference ', fileNameFromIssue)
            this.throwError()
        }
    }
}







//=========================================================================
// SOILAnswersParser
//=========================================================================



/**
 * Determine the kind of section based on the prefix in the soil text.
 * ! means statement,
 * ? ou \ means query,
 * check means check
 * -- means comment
 * otherwise returns null
 */
export function kindOfSOILSection(soilText: string): SOILSectionKind | null {
    if (/^\ *!/.exec(soilText)) {
        return SOILSectionKind.statement
    } else if (/^ *(\\|\?)/.exec(soilText)) {
        return SOILSectionKind.query
    } else if (/^ *check /.exec(soilText)) {
        return SOILSectionKind.check
    } else if (/^ *-- /.exec(soilText)) {
        return SOILSectionKind.comment
    } else {
        return  null
    }
}

/**
 * Return the proper parser according to the soilText
 * @param soilText
 * @param stcText
 */
export function getAppropriateSOILParser(soilText: string) //: class | null
{
    const kind = kindOfSOILSection(soilText)
    if (kind === SOILSectionKind.statement) {
        return SOILStatementAnswerParser
    } else if (kind === SOILSectionKind.query){
        return SOILQueryAnswerParser
    } else if (kind === SOILSectionKind.check) {
        return SOILCheckAnswerParser
    } else if (kind === SOILSectionKind.comment) {
        return null
    } else {
        return null
    }
}


export abstract class AbstractSOILAnswerParser extends AbstractAnswerParser {

    _addSOILLocalizedIssue() {
        const matches = this.textMatcher.matches("SOILLocalizedIssue")
        // console.log('DG:73: matches', matches)
        matches.forEach(match => {
            const g = match.groups
            const issue = new SOILLocalizedIssue(
                parseInt(g.line),
                parseInt(g.column),
                g.message)
            const answer = this.answer! as SOILAnswer
            answer.localizedIssues.push(issue)
        })
    }

    _addSOILGlobalIssue() {
        const matches = this.textMatcher.matches("SOILGlobalIssuePattern")
        // console.log('DG:73: matches', matches)
        matches.forEach(match => {
            const g = match.groups
            const issue = new SOILGlobalIssue(
                g.kind as SOILIssueKind,
                g.message)
            const answer = this.answer! as SOILAnswer
            answer.globalIssues.push(issue)
        })
    }

    protected addIssues() {
        this._addSOILLocalizedIssue()
        this._addSOILGlobalIssue()
    }

}


export class SOILStatementAnswerParser extends AbstractSOILAnswerParser {
    answer: SOILStatementAnswer

    constructor(stcText: string) {
        super(stcText, [
            SOILLocalizedIssuePattern,
            SOILGlobalIssuePattern,
            BlankLinePattern
        ])
    }

    analyze() {
        this.answer = new SOILStatementAnswer()
        this.addIssues()
    }
}


export class SOILQueryAnswerParser extends AbstractSOILAnswerParser {
    answer: SOILQueryAnswer

    constructor(soilText: string) {
        super(soilText, [
            SOILLocalizedIssuePattern,
            SOILGlobalIssuePattern,
            QueryPattern,
            BlankLinePattern,
        ])
    }

    analyze() {
        this.answer = new SOILQueryAnswer()
        this.addIssues()
        this._addQueryResult()
    }

    private _addQueryResult() {
        const matches = this.textMatcher.matches("QueryPattern")
        this._checkOneResult(matches)
        const g = matches[0].groups
        const result = new QueryResult(
            g.result,
            g.resultType,
            g.details.split('\n')
        )
        this.answer.queryResult = result
    }

    private _checkOneResult(matches) {
        if (matches.length === 1) {
            return
        } else if (matches.length <= 1) {
            this.consoleErrorHeader()
            console.error('Query result expected. No match found.')
            this.throwError()
        } else {
            this.consoleErrorHeader()
            console.error('More than one results for one query!')
            this.throwError()
        }
    }
}


export class SOILCheckAnswerParser extends AbstractSOILAnswerParser {
    answer: SOILCheckAnswer

    constructor(soilText: string) {
        super(soilText, [
            SOILLocalizedIssuePattern,
            SOILGlobalIssuePattern,
            InvariantViolationPattern,
            InvariantOKPattern,
            DiscardInvariantCheckingPattern,
            InvariantsSummaryPattern,
            MultiplicityViolationPattern,
            DiscardCheckingStructurePattern,
            BlankLinePattern
        ])
    }

    analyze() {
        this.answer = new SOILCheckAnswer()
        this.addIssues()
        this._addInvariantViolations()
        this._addMultiplicityViolations()
    }

    private _addInvariantViolations() {
        const matches = this.textMatcher.matches("InvariantViolationPattern")
        matches.forEach(match => {
            const g = match.groups
            const iv = new InvariantViolation(
                g.context,
                g.invname,
                g.objects.split(','),
                g.details.split('\n').map(line => line.trim())
            )
            this.answer.invariantViolations.push(iv)
        })
    }

    private _addMultiplicityViolations() {
        const matches = this.textMatcher.matches("MultiplicityViolationPattern")
        matches.forEach(match => {
            const g = match.groups
            const mv = new MultiplicityViolation(
                g.sourceClass,
                g.targetRole,
                g.targetClass,
                g.object,
                parseInt(g.numberOfObjects),
                g.cardinality
            )
            this.answer.multiplicityViolations.push(mv)
        })
    }

}