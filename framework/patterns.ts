//-------------------------------------------------------------------------
//     Pattern matching
//-------------------------------------------------------------------------

import {arrayEquals} from './misc'

export enum TextPatternAction {
    replace = 'replace',
    ignore = 'ignore'
}

type MatchMapping = {[key: string]: string}
/**
 * A named pattern with a replacement function generating a simplified text
 * from a match. This type is used by the TextMatcher class.
 */
export interface TextPattern {
    name: string
    regex: RegExp
    /**
     * Indicate if the pattern must be matched and ignored or matched
     * and replaced.
     */
    action: TextPatternAction
    /**
     * List of variables that must be defined. No other variables are
     * allowed.
     */
    variables: Array<string>
    /**
     * Function producing a replacement string from a regexp match result
     * @param match
     */
    replaceFun?: (g: MatchMapping) => string  // TODO: add the type for match. Not so easy.
}


export class TextMatch {
    readonly pattern: TextPattern
    readonly groups: MatchMapping
    readonly replacement: string | null

    constructor(pattern: TextPattern, groups) {
        this.pattern = pattern
        this.groups = groups
        const replaceFun = pattern.replaceFun
        if (replaceFun !== undefined) {
            this.replacement = replaceFun(this.groups)
        } else {
            this.replacement = null
        }
    }

    // toString() {
    //     return this.pattern.name+' '+this.pattern.action+' '
    // }
}

/**
 * A text from which patterns are matched and replaced by other strings.
 * Returns the text remaining after all pattern replacements as well
 * as an unordered series of matches grouped by pattern name.
 * NOTE: the matches are not ordered by original position of the matched
 * text since patterns are extracted in sequence.
 */
export class TextMatcher {
    readonly originalText: string
    /** Text remaining after all matches have been removed */
    residualText: string
    readonly replacedMatchesByPattern: Map<TextPattern, Array<TextMatch>>
    nbOfReplacedMatches: number
    nbOfIgnoredMatches: number
    sections: Set<string>
    debug: boolean

    constructor(text: string) {
        this.originalText = text
        this.residualText = text
        // console.log('DG:79: residualText', this.residualText)
        // console.log('DG:80: text', text)
        this.replacedMatchesByPattern = new Map()
        this.nbOfReplacedMatches = 0
        this.nbOfIgnoredMatches = 0
        this.sections = new Set()
    }

    /**
     * Return the list of matches corresponding to a pattern.
     */

    matches(pattern: TextPattern): Array<TextMatch> {
        if (this.replacedMatchesByPattern.has(pattern)) {
            return this.replacedMatchesByPattern!.get(pattern)!
        } else {
            return []
        }
    }

    /**
     * Extract from the original text as many pieces of text matching
     * the given pattern and replace each match with the replacement
     * string if not ignored. No match is stored if the pattern has
     * toBeIgnored.
     */
    extractPattern(pattern: TextPattern, replacement: string = '') {
        let match: RegExpExecArray | null
        const regex = pattern["regex"]
        if (this.debug) {
            console.log(`DG:148: trying pattern ${pattern.name} ${pattern.action}`)
        }
        while (match = regex.exec(this.residualText)) {
            let match_mapping: MatchMapping
            if (match.groups === undefined) {
                match_mapping = {}
            } else {
                match_mapping = match.groups
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
            this._addToMatches(pattern, match_mapping)
            // }
            this.residualText = this.residualText.replace(regex, replacement)
            // console.log('DG:129: residualText=',this.residualText)
        }
    }


    /**
     * Extract the given list of patterns in given order. See
     * extractPattern for details.
     */
    extractPatterns(patterns: Array<TextPattern>, replacement: string = '') {
        for (let pattern of patterns) {
            this.extractPattern(pattern, replacement)
        }
    }

    _checkVariables(pattern: TextPattern, mapping: MatchMapping) {
        const actual_variables = Object.keys(mapping)
        const expected_variables = pattern.variables
        if (!arrayEquals(actual_variables, expected_variables, true)) {
            console.error('Error in pattern matching')
            console.error('  expected:', expected_variables)
            console.error('  found:   ', actual_variables)
            throw new Error('Error in parsing')
        }

    }

    _addToMatches(pattern: TextPattern, mapping: MatchMapping) {
        this._checkVariables(pattern, mapping)
        if (pattern.action === TextPatternAction.ignore) {
            // deal with a "ignore" pattern
            this.nbOfIgnoredMatches += 1
        } else {
            // deal with a "replace" pattern: add it to the registry
            this.nbOfReplacedMatches += 1
            if (!this.replacedMatchesByPattern.has(pattern)) {
                this.replacedMatchesByPattern.set(pattern, [])
            }
            const match = new TextMatch(pattern, mapping)
            this.replacedMatchesByPattern.get(pattern)!.push(match)
        }
    }
}
