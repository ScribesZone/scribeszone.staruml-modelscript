import * as fs from 'fs'

const DEBUG = true
const TEST_ASSERT = true


//-------------------------------------------------------------------------
//  Collections
//-------------------------------------------------------------------------

function sum(array) {
//TODO: RESTORE    console.assert(isArray(array))
    return array.reduce((total, b) => total + b, 0)
}

if (TEST_ASSERT) {
    console.assert(sum([]) === 0)
    console.assert(sum([2,5]) === 7)
}


function arrayEquals<T>(a: Array<T>, b: Array<T>, sort: boolean = false) {
    const x = a
    if (sort) {
        x.sort()
    }
    const y = b
    if (sort) {
        b.sort()
    }
    return a.every((val, index) => val === b[index])
}


if (TEST_ASSERT) {
    console.assert(arrayEquals([1, 2, 3], [1, 2, 3], true) === true)
    console.assert(arrayEquals([3, 2], [2, 3], true) === true)
    console.assert(arrayEquals([1, 2], [1, 3]) === false)
}

/**
 * Filter the entries of an object via a predicate.
 *
 * For instance :
 *
 *      noezarwin = {firstname: 'noe', lastname: 'zarwin', age: 30}
 *      keys = ['firstname', 'age']
 *
 *      returns {age: 30}
 *
 * @param object
 * @param keyValuePredicate
 * @returns {{[p: string]: unknown}}
 */

export function filterByKeyValue(object, keyValuePredicate) {
    return (
        Object.fromEntries(
            Object.entries(object)
                .filter(([key, value]) => keyValuePredicate(key, value))
        )
    )
}

if (TEST_ASSERT) {
    const _noezarwin = {firstname: 'noe', lastname: 'zarwin', age: 30}
    const _keys = ['firstname', 'age']
    const _result232 = (
         filterByKeyValue(
         _noezarwin,
         ((key,value) =>
             _keys.includes(key) && typeof value === 'number')))
//TODO RESTORE          console.assert(jsonEquals(_result232, {age: 30}))
}

/**
 * Indicates if the first array includes all elements in the second array.
 * @param big that array that could includes all elements
 * @param small the array of elements that could be included
 * @returns {*}
 */
function includesAll<T>(big: Array<T>, small: Array<T>) {
    return small.every(v => big.includes(v))
}



//-------------------------------------------------------------------------
//     Pattern matching
//-------------------------------------------------------------------------

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
     * Section to which this Pattern will be stored
     */
    section: string
    /**
     * Function producing a replacement string from a regexp match result
     * @param match
     */
    replaceFun?: (g: MatchMapping) => string  // TODO: add the type for match. Not so easy.
}


class TextMatch {
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
    readonly replacedMatchesByPatternName: Map<string, Array<TextMatch>>
    nbOfReplacedMatches: number
    nbOfIgnoredMatches: number
    sections: Set<string>
    debug: boolean

    constructor(text: string) {
        this.originalText = text
        this.residualText = text
        this.replacedMatchesByPatternName = new Map()
        this.nbOfReplacedMatches = 0
        this.nbOfIgnoredMatches = 0
        this.sections = new Set()
    }

    /**
     * Extract from the original text as many pieces of text matching
     * the given pattern and replace each match with the replacement
     * string if not ignored. No match is stored if the pattern has
     * toBeIgnored.
     */
    extractPattern(pattern: TextPattern, replacement: string = '[O]') {
        let match : RegExpExecArray | null
        const regex = pattern["regex"]
        if (this.debug) {
            console.log(`DG:148: trying pattern ${pattern.name} ${pattern.action}`)
        }
        while (match = regex.exec(this.residualText) ) {
            let match_mapping : MatchMapping
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
        if (! arrayEquals(actual_variables, expected_variables, true)) {
            console.error('Error in pattern matching')
            console.error('  expected:', expected_variables)
            console.error('  found:   ', actual_variables)
            throw new Error('Error in parsing')
        }

    }

    _addToMatches(pattern: TextPattern, mapping: MatchMapping) {
        const name = pattern.name
        this._checkVariables(pattern, mapping)
        if (pattern.action === TextPatternAction.ignore) {
            // deal with a "ignore" pattern
            this.nbOfIgnoredMatches += 1
        } else {
            // deal with a "replace" pattern
            this.nbOfReplacedMatches += 1
            if (! this.replacedMatchesByPatternName.has(name)) {
                this.replacedMatchesByPatternName.set(name, [])
            }
            const match = new TextMatch(pattern, mapping)
            this.replacedMatchesByPatternName.get(name)!.push(match)
            this.sections.add(pattern.section)
        }
    }

    getMatches(patternNames = null, summary) {
    }
}

/**
 * Make sure that the directory exists and if it does not create it with
 * all parents directories needed.
 * @param filePath
 */
export function ensureDirectory(filePath: string): string {
    // fs.mkdir(
    //     filePath,
    //     { recursive: true },
    //     (err) => {
    //         if (err) throw err
    // })
    return fs.mkdirSync(filePath, { recursive: true }) !
}
