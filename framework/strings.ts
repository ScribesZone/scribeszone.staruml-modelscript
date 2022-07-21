//-------------------------------------------------------------------------
//     Strings
//-------------------------------------------------------------------------

/**
 * Add a margin before all lines
 */
export function indent(text: string,  margin: string='    ', nb: number=1): string {
    const left = margin.repeat(nb)
    return text.split('\n').map(l => margin + l).join('\n')
}

/**
 * Join a multiline string and put it on one line
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
