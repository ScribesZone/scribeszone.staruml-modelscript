"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var files_1 = require("../../../framework/files");
var evaluations_1 = require("../../../useocl/evaluations");
var strings_1 = require("../../../framework/strings");
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
function processUSEFile(useFilename) {
    console.log('='.repeat(80));
    console.log(useFilename);
    var evaluation = new evaluations_1.USEFileEvaluation(useFilename);
    console.log((0, strings_1.indent)(evaluation.answer.toString()));
}
function processAllUSEFiles() {
    var targetFiles = (0, files_1.listFiles)('.', '.use');
    targetFiles.forEach(function (filename) {
        processUSEFile(filename);
    });
}
function processSOILFile(soilFilename) {
    console.log('='.repeat(80));
    console.log(soilFilename);
    var evaluation = new evaluations_1.SOILFileEvaluation(soilFilename);
    // console.log(indent(evaluation.answer.toString()))
}
function processAllSOILFiles() {
    var targetFiles = (0, files_1.listFiles)('.', '.soil');
    targetFiles.forEach(function (filename) {
        processSOILFile(filename);
    });
}
processAllUSEFiles();
processAllSOILFiles();
//# sourceMappingURL=extract-all.js.map