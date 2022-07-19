import * as fs from 'fs'
import * as path from 'path'

import {ALL_USEOCL_PATTERNS} from '../../../useocl/extract'
import {TextMatcher, TextMatch} from '../../../framework/misc'

class TextBlock {
    private textMatcher: TextMatcher;

    constructor(textMatcher: TextMatcher) {
        this.textMatcher = textMatcher
    }

}

function readFile(filename: string): string {
    try {
        return fs.readFileSync(filename, 'utf8')
    } catch (err) {
        console.error(err)
        return '**** ERROR FOUND ****'
    }
}

function listFiles(directory: string, extension?: string): Array<string> {
    const allFiles = fs.readdirSync('.')
    if (extension !== undefined) {
        const targetFiles = allFiles.filter(file => {
            return path.extname(file).toLowerCase() === extension
        })
        return targetFiles
    } else {
        return allFiles
    }
}

function splitSections(text: string): Array<string> {
    // return text.split(/-> '@\w+' : String(\n?)/m)
    return text.split(/-> '@@@\w*' : String\n/)
}

function indent(text: string,  margin: string): string {
    return text.split('\n').map(l => margin + l).join('\n')
}

function onOneLine(text: string): string {
    return text.split('\n').join(' \\n ')
}

function limit(text: string, size: number, rest?: string) {
    if (text.length <= size) {
        return text
    } else {
        return text.slice(0, size) + rest
    }
}

function processSection(filename: string, section: string, index: number, showSection: boolean = false,showMatches: boolean = false, debug: boolean = false) {
    if (section === '') {
    //     console.log(('... SECTION '+index+ ' IS EMPTY').padEnd(72,'.'))
        return
    }
    console.log('\n\n')
    const nb_lines = section.split('\n').length
    console.log(
        ('... SECTION '+index+' ('
            + nb_lines + ' lines) ... from '+filename+' '
        ).padEnd(72,'.'))
    const content = section
    let tm = new TextMatcher(content)
    tm.extractPatterns(ALL_USEOCL_PATTERNS)
    if (showSection) {
        console.log(indent(section, '    '))
    }
    if (showMatches) {
        console.log(('--- section(s): '+ Array.from(tm.sections).join(', ')).padEnd(72,'-'))
        const total = tm.nbOfReplacedMatches + tm.nbOfIgnoredMatches
        console.log(`--- ${total} matches (${tm.nbOfReplacedMatches} replaced, ${tm.nbOfIgnoredMatches} ignored)`.padEnd(72,'-'))
        // console.log(JSON.stringify(tm.replacedMatchesByPatternName, null, 2))
        tm.replacedMatchesByPatternName.forEach( (matches: Array<TextMatch>, key: string) => {
            console.log('  ',key)
            matches.forEach((match: TextMatch) => {
                console.log('    ',limit(onOneLine(match.replacement!), 100, '...'))
            })
        })
        // console.log(tm.replacedMatchesByPatternName)
    }
    if (tm.residualText !== '') {
        console.error('--- residue '.padEnd(72, '-'))
        console.error(tm.residualText)

        throw new Error(`some residue exists in ${filename} section #${index} `)
    }
}

function process(filename: string, showSection: boolean = false, showMatches: boolean = false, debug: boolean = false) {
    const content = readFile(filename)
    const sections = splitSections(content)
    console.log(('\\n\\n\\n\\n####### '+filename+' ').padEnd(72,'#'))
    console.log(sections.length+' sections. Empty sections are omitted below')
    sections.forEach((section, index) => {
        processSection(filename, section, index, showSection, showMatches, debug)
    })

}

function processAllFiles(showSection: boolean = false, showMatches: boolean = false, debug: boolean = false) {
    const targetFiles = listFiles('.', '.stc')
    targetFiles.forEach( filename => {
       //  if (filename === 'main__demo-expr-1.stc') // DG:
        process(filename, showMatches, debug)
    })
}

if (true) { // TEST:
    const SHOW_SECTION = true
    const SHOW_MATCHES = true
    const DEBUG = true
    processAllFiles(SHOW_SECTION, SHOW_MATCHES, DEBUG)
    console.log("c'est fini")
}