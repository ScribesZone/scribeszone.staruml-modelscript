fs = require('fs')
path = require('path')

const {ALL_USEOCL_PATTERNS} = require('../../../useocl/extract')
const {TextMatcher} = require('../../../framework/misc')

class TextBlock {

    constructor(textMatcher) {
        console.assert(textMatcher instanceof TextMatcher)
        this.textMatcher = textMatcher
    }

}

function readFile(file) {
    try {
        const data = fs.readFileSync(file, 'utf8')
        return data
    } catch (err) {
        console.error(err)
    }
}

function listFiles(directory, extension= undefined) {
    const allFiles = fs.readdirSync('.')
    if (extension) {
        const targetFiles = allFiles.filter(file => {
            return path.extname(file).toLowerCase() === extension
        })
        return targetFiles
    } else {
        return allFiles
    }
}

function splitSections(text) {
    // return text.split(/-> '@\w+' : String(\n?)/m)
    return text.split(/-> '@@@\w*' : String\n/)
}

function processSection(section, index, showMatches = true) {
    if (section === '') {
        console.log(('... SECTION '+index+ ' IS EMPTY').padEnd(72,'.'))
        return
    }
    const nb_lines = section.split('\n').length
    console.log(
        ('... SECTION '+index+' ('
            + nb_lines + ' lines)'
        ).padEnd(72,'.'))
    const content = section
    let tm = new TextMatcher(content)
    tm.extractPatterns(ALL_USEOCL_PATTERNS)
    if (showMatches) {
        const nb_matches = tm.nbOfActiveMatches
        console.log('--- '+nb_matches+' matches '.padEnd(72,'-'))
        console.log(JSON.stringify(tm.activeMatchesByPatternName, null, 2))
    }
    if (tm.residualText) {
        console.error('--- residue '.padEnd(72,'-'))
        console.error(tm.residualText)
    } else {
        console.log('no residue')
    }
}

function process(filename, showMatches=true) {
    const content = readFile(filename)
    const sections = splitSections(content)
    console.log(('### '+filename+' ').padEnd(72,'#'))
    console.log(sections.length+' sections')
    sections.forEach((section, index) => {
        processSection(section, index)
    })

}

function processAllFiles(showMatches = false) {
    const targetFiles = listFiles('.', '.stc')
    for (filename of targetFiles) {
        if (filename === 'main__demo-expr-1.stc') // DG:
        process(filename, showMatches)
    }
}

if (true) { // TEST:
    const SHOW_MATCHES = false
    processAllFiles(SHOW_MATCHES)
}