//-------------------------------------------------------------------------
//     Strings
//-------------------------------------------------------------------------



import * as assert from "assert";

/**
 * Add a margin before all lines
 */
export function indent(text: string,  margin: string='    ', nb: number=1): string {
    const left = margin.repeat(nb)
    return text.split('\n').map(l => left + l).join('\n')
}

/**
 * Join a multiline string and put it on one line with \\n character
 */
export function onOneLine(text: string, separator: string = '\\n'): string {
    return text.split('\n').join(separator)
}

/**
 * Limit a single line string
 */
export function limit(text: string, size: number, rest: string = '...') {
    if (text.length <= size) {
        return text
    } else {
        return text.slice(0, size-rest.length) + rest
    }
}

export function limitMultilineString(
    text: MultilineString,
    max: number,
    rest: string = '...'): MultilineString {
    assert.ok(max >= 0)
    const lines = text.split('\n')
    if (lines.length <= max) {
        return text
    } else {
        return (
            lines.slice(0, max).join('\n')
            + '\n'
            + rest + ' (+' + (lines.length-max) + ' lines)')
    }
}

export function ensureNewLineAtEnd(text, yes: boolean = true) {
    if (text.length === 0) {
        return '\n'
    } else if (text[text.length-1] === '\n') {
        return text
    } else {
        return text + '\n'
    }
}


/**
 * A string that contains no \n. To be checked wiyh isNoLineString()
 */
export type NoLineString = string
/**
 * A string that can contains (or not) \n. No check possible.
 * It is jut useful to makes it clear that a '\n' can be in the string.
 */
export type MultilineString = string

/**
 * A string with no '\n' at the end. Check with isNoLineEnded().
 */
export type NoLineEndedString = string

/**
 * A string with '\n' at the end. To be checked with is LineEnded().
 */

export type LineEndedString = string

function isMultilineString(text: string): boolean {
    return text.indexOf('\n') !== -1
}

export function isNoLineString(text: string): boolean {
    return ! isMultilineString(text)
}

export function isNoLineEnded(text: string): boolean {
    return (text.length === 0) || (text[text.length-1] !== '\n')
}

export function isLineEnded(text: string): boolean {
    return ! isNoLineEnded(text)
}

export function ensureNoNewLineAtEnd(text: string): string {
    if (text.length === 0) {
        return text
    } else if (text[text.length-1] !== '\n') {
        return text
    } else {
        return text.substring(0, text.length-1)
    }
}