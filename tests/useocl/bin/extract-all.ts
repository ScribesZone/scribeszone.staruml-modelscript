import * as fs from 'fs'
import * as path from 'path'
import * as assert from "assert";
import {listFiles} from "../../../framework/files"
import {
    USEFileEvaluation,
    SOILFileEvaluation
} from "../../../useocl/evaluations";
import {indent} from "../../../framework/strings";


// function processSection(filename: string, section: string, index: number, showSection: boolean = false,showMatches: boolean = false, debug: boolean = false) {
//     if (section === '') {
//     //     console.log(('... SECTION '+index+ ' IS EMPTY').padEnd(72,'.'))
//         return
//     }
//     console.log('\n\n')
//     const nb_lines = section.split('\n').length
//     console.log(
//         ('... SECTION '+index+' ('
//             + nb_lines + ' lines) ... from '+filename+' '
//         ).padEnd(72,'.'))
//     const content = section
//     let tm = new TextMatcher(content)
//     tm.extractPatterns(ALL_USEOCL_PATTERNS)
//     if (showSection) {
//         console.log(indent(section, '    '))
//     }
//     if (showMatches) {
//         const total = tm.nbOfReplacedMatches + tm.nbOfIgnoredMatches
//         console.log('--- '+ Array.from(tm.sections).join(',')+` --- ${total} matches (${tm.nbOfReplacedMatches} replaced, ${tm.nbOfIgnoredMatches} ignored)`.padEnd(72,'-'))
//         // console.log(JSON.stringify(tm.replacedMatchesByPatternName, null, 2))
//         tm.replacedMatchesByPatternName.forEach( (matches: Array<TextMatch>, key: string) => {
//             console.log('  ',key)
//             matches.forEach((match: TextMatch) => {
//                 console.log('    ',limit(onOneLine(match.replacement!), 100, '...'))
//             })
//         })
//         // console.log(tm.replacedMatchesByPatternName)
//     }
//     if (tm.residualText !== '') {
//         console.error('--- residue '.padEnd(72, '-'))
//         console.error(tm.residualText)
//
//         throw new Error(`some residue exists in ${filename} section #${index} `)
//     }
// }
//
// function process(filename: string, showSection: boolean = false, showMatches: boolean = false, debug: boolean = false) {
//     const content = readFile(filename)
//     const sections = splitSections(content)
//     console.log(('\\n\\n\\n\\n####### '+filename+' ').padEnd(72,'#'))
//     console.log(sections.length+' sections. Empty sections are omitted below')
//     sections.forEach((section, index) => {
//         processSection(filename, section, index, showSection, showMatches, debug)
//     })
//
// }
//
// function processAllFiles(showSection: boolean = false, showMatches: boolean = false, debug: boolean = false) {
//     const targetFiles = listFiles('.', '.stc')
//     targetFiles.forEach( filename => {
//        //  if (filename === 'main__demo-expr-1.stc') // DG:
//         process(filename, showMatches, debug)
//     })
// }

// if (true) { // TEST:
//     const SHOW_SECTION = true
//     const SHOW_MATCHES = true
//     const DEBUG = true
//     processAllFiles(SHOW_SECTION, SHOW_MATCHES, DEBUG)
//     console.log("c'est fini")
// }

function processUSEFile(useFilename: string) {
    console.log('='.repeat(80))
    console.log(useFilename)
    const evaluation = new USEFileEvaluation(useFilename)
    console.log(indent(evaluation.answer.toString()))
}

function processAllUSEFiles() {
    const targetFiles = listFiles('.', '.use')
    targetFiles.forEach( filename => {
        processUSEFile(filename)
    })
}



function processSOILFile(soilFilename: string) {
    console.log('='.repeat(80))
    console.log(soilFilename)
    const evaluation = new SOILFileEvaluation(soilFilename)
    // console.log(indent(evaluation.answer.toString()))
}

function processAllSOILFiles() {
    const targetFiles = listFiles('.', '.soil')
    targetFiles.forEach( filename => {
        processSOILFile(filename)
    })
}

processAllUSEFiles()
processAllSOILFiles()