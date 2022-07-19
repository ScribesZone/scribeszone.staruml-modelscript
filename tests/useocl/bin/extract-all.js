"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var extract_1 = require("../../../useocl/extract");
var misc_1 = require("../../../framework/misc");
var TextBlock = /** @class */ (function () {
    function TextBlock(textMatcher) {
        this.textMatcher = textMatcher;
    }
    return TextBlock;
}());
function readFile(filename) {
    try {
        return fs.readFileSync(filename, 'utf8');
    }
    catch (err) {
        console.error(err);
        return '**** ERROR FOUND ****';
    }
}
function listFiles(directory, extension) {
    var allFiles = fs.readdirSync('.');
    if (extension !== undefined) {
        var targetFiles = allFiles.filter(function (file) {
            return path.extname(file).toLowerCase() === extension;
        });
        return targetFiles;
    }
    else {
        return allFiles;
    }
}
function splitSections(text) {
    // return text.split(/-> '@\w+' : String(\n?)/m)
    return text.split(/-> '@@@\w*' : String\n/);
}
function indent(text, margin) {
    return text.split('\n').map(function (l) { return margin + l; }).join('\n');
}
function onOneLine(text) {
    return text.split('\n').join(' \\n ');
}
function limit(text, size, rest) {
    if (text.length <= size) {
        return text;
    }
    else {
        return text.slice(0, size) + rest;
    }
}
function processSection(filename, section, index, showSection, showMatches, debug) {
    if (showSection === void 0) { showSection = false; }
    if (showMatches === void 0) { showMatches = false; }
    if (debug === void 0) { debug = false; }
    if (section === '') {
        //     console.log(('... SECTION '+index+ ' IS EMPTY').padEnd(72,'.'))
        return;
    }
    console.log('\n\n');
    var nb_lines = section.split('\n').length;
    console.log(('... SECTION ' + index + ' ('
        + nb_lines + ' lines) ... from ' + filename + ' ').padEnd(72, '.'));
    var content = section;
    var tm = new misc_1.TextMatcher(content);
    tm.extractPatterns(extract_1.ALL_USEOCL_PATTERNS);
    if (showSection) {
        console.log(indent(section, '    '));
    }
    if (showMatches) {
        console.log(('--- section(s): ' + Array.from(tm.sections).join(', ')).padEnd(72, '-'));
        var total = tm.nbOfReplacedMatches + tm.nbOfIgnoredMatches;
        console.log("--- ".concat(total, " matches (").concat(tm.nbOfReplacedMatches, " replaced, ").concat(tm.nbOfIgnoredMatches, " ignored)").padEnd(72, '-'));
        // console.log(JSON.stringify(tm.replacedMatchesByPatternName, null, 2))
        tm.replacedMatchesByPatternName.forEach(function (matches, key) {
            console.log('  ', key);
            matches.forEach(function (match) {
                console.log('    ', limit(onOneLine(match.replacement), 100, '...'));
            });
        });
        // console.log(tm.replacedMatchesByPatternName)
    }
    if (tm.residualText !== '') {
        console.error('--- residue '.padEnd(72, '-'));
        console.error(tm.residualText);
        throw new Error("some residue exists in ".concat(filename, " section #").concat(index, " "));
    }
}
function process(filename, showSection, showMatches, debug) {
    if (showSection === void 0) { showSection = false; }
    if (showMatches === void 0) { showMatches = false; }
    if (debug === void 0) { debug = false; }
    var content = readFile(filename);
    var sections = splitSections(content);
    console.log(('\\n\\n\\n\\n####### ' + filename + ' ').padEnd(72, '#'));
    console.log(sections.length + ' sections. Empty sections are omitted below');
    sections.forEach(function (section, index) {
        processSection(filename, section, index, showSection, showMatches, debug);
    });
}
function processAllFiles(showSection, showMatches, debug) {
    if (showSection === void 0) { showSection = false; }
    if (showMatches === void 0) { showMatches = false; }
    if (debug === void 0) { debug = false; }
    var targetFiles = listFiles('.', '.stc');
    targetFiles.forEach(function (filename) {
        //  if (filename === 'main__demo-expr-1.stc') // DG:
        process(filename, showMatches, debug);
    });
}
if (true) { // TEST:
    var SHOW_SECTION = true;
    var SHOW_MATCHES = true;
    var DEBUG = true;
    processAllFiles(SHOW_SECTION, SHOW_MATCHES, DEBUG);
    console.log("c'est fini");
}
//# sourceMappingURL=extract-all.js.map