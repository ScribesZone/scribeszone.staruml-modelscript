import {isString} from "util"
const path = require('path')
const fs = require('fs');

const TEST_ASSERT = true


//-------------------------------------------------------------------------
//  type checking
//-------------------------------------------------------------------------


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


/**
 * Filter the entries of an object via a predicate.
 *
 * For instance :
 *
 *      noezarwin = {firstname: 'noe', lastname: 'zarwin', age: 30}
 *      keys = ['firstname', 'age']
 *

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
function includesAll(big,small) {
    return small.every(v => big.includes(v))
}



//-------------------------------------------------------------------------
//     Pattern matching
//-------------------------------------------------------------------------

// const MINIMAL_PATTERN_KEYS = ['name', 'regex']

interface TextPattern {
    name: string
    regex: string
    ignore: boolean
    formatFun?: Function
}

// function isLikePattern(object) {
//     return includesAll(Object.keys(object),MINIMAL_PATTERN_KEYS)
// }


class TextMatch {
    private readonly pattern: TextPattern;
    private readonly groups: any;
    private readonly formatedResult: string | null;

    constructor(pattern: TextPattern, groups) {
        // console.assert(isLikePattern(pattern),'MI162')
        // console.assert(isArray(groups), 'MI163')

        this.pattern = pattern
        this.groups = groups
        this.formatedResult = null

        const formatFun = pattern.formatFun
        if (formatFun) {
            //console.assert(isFunction(formatFun), 'MI171')
            this.formatedResult = formatFun(this.groups)
            // console.assert(isString(this.formatedResult), 'MI173')
        }
    }

}

/**
 * A text from which patterns are matched and replaced to other strings.
 * Return the text remaining after all pattern replacements as well
 * as an unordered serie of matches grouped by pattern name.
 * NOTE: the matches are not ordered by original position of the matched
 * text since patterns are extracted in sequence.
 */
export class TextMatcher {
    private readonly originalText: string
    private residualText: string
    private activeMatchesByPatternName: {};
    private nbOfActiveMatches: number;
    private nbOfIgnoredMatches: number;

    constructor(text: string) {
        this.originalText = text
        this.residualText = text
        this.activeMatchesByPatternName = {} // TODO Map[Array[Object]]  see _addToMatches()
        this.nbOfActiveMatches = 0
        this.nbOfIgnoredMatches = 0
    }

    /**
     * Extract from the original text as many pieces of text matching
     * the given pattern and replace each match with the replacement
     * string. No match is stored if the pattern has ignore: true.
     * @param pattern An  object with "name", "regex", "ignore"
     * @param replacement A string for replacement or '' by default.
     */
    extractPattern(pattern: TextPattern, replacement: string = '') {
        let match
        const regex = pattern["regex"]
        // @ts-ignore .exec TODO
        while (match = regex.exec(this.residualText) ) {
            let groups = match.groups
            if (groups !== undefined) {
                this._addToMatches(pattern, groups)
            }
            this.residualText = this.residualText.replace(regex, replacement)
        }
    }

    /**
     * Extract the given list of patterns in given order. See
     * extractPattern for details.
     */
    extractPatterns(patterns: TextPattern[], replacement: string = '') {
        //console.assert(isArray(patterns), 'MI223')
        //console.assert(isString(replacement), 'MI224')
        for (let pattern of patterns) {
            this.extractPattern(pattern, replacement)
        }
    }

    _addToMatches(pattern: TextPattern, groups) {
        // console.assert(isLikePattern(pattern), 'MI231')
        const name = pattern.name
        if (pattern.ignore) {
            this.nbOfIgnoredMatches += 1
        } else {
            this.nbOfActiveMatches = 0
            if (this.activeMatchesByPatternName[name] === undefined) {
                this.activeMatchesByPatternName[name] = []
            }
            const match = new TextMatch(pattern, groups)
            this.activeMatchesByPatternName[name].push(match)
        }
    }

    getMatches(patternNames = null, summary) {
    }
}

export function ensureDirectory(filePath) {
    // fs.mkdir(
    //     filePath,
    //     { recursive: true },
    //     (err) => {
    //         if (err) throw err
    // })
    fs.mkdirSync(filePath, { recursive: true })
}


// exports.filterByKeyValue = filterByKeyValue
// exports.TextMatcher = TextMatcher