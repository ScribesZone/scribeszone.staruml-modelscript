import { strict as assert } from 'node:assert'
import *  as path from "path"
import { readFile, replaceExtension } from "../framework/files"
import {
    USEAnswerParser,
    AbstractSOILAnswerParser,
    SOILStatementAnswerParser,
    SOILQueryAnswerParser,
    SOILCheckAnswerParser,
    kindOfSOILSection,
    getAppropriateSOILParser
} from "./parser"
import {
    USEAnswer,
    SOILAnswer, SOILStatementAnswer, SOILQueryAnswer, SOILCheckAnswer
} from "./answers";
import {
    ensureNewLineAtEnd,
    ensureNoNewLineAtEnd,
    indent,
    isLineEnded,
    isNoLineEnded,
    limitMultilineString,
    NoLineEndedString,
    NoLineString
} from "../framework/strings";


export class SourceFile {
    readonly path: string
    readonly text: NoLineEndedString
    get extension(): string {
        return path.extname(this.path)
    }
    get lines(): Array<NoLineString> {
        return this.text.split('\n')
    }

    constructor(path: string) {
        this.path = path
        this.text = ensureNoNewLineAtEnd(readFile(this.path))
    }
}

export interface DisplayOptions  {
    displaySource?: boolean
    displayTrace?: boolean
    maxLines?: number
}
//=========================================================================
// A USEFileEvaluation is a triplet:
// - a .use file
// - a .utc file
// - an answer build by parsing the .utc file
//=========================================================================


class USEFile extends SourceFile {
    constructor(path: string) {
        super(path)
        assert.equal(this.extension, '.use')
    }
}

class UTCFile extends SourceFile {
    constructor(path: string) {
        super(path)
        assert.equal(this.extension, '.utc')
    }
}

export class USEFileEvaluation {
    readonly useFile: USEFile
    readonly utcFile: UTCFile
    readonly answer: USEAnswer

    constructor(usePath: string) {
        this.useFile = new USEFile(usePath)
        this.utcFile = new UTCFile(replaceExtension(usePath, '.utc'))
        const parser = new USEAnswerParser(usePath, this.utcFile.text)
        parser.parse()
        this.answer = parser.answer
    }

    toString(options: DisplayOptions = {}): string {
        let out = ''
        out += ('>>>> SOURCE: ' + this.useFile.path + ' ').padEnd(80, '>') + '\n'
        const max_lines = options.maxLines ?? 0
        if (options.displaySource ?? false) {
            out += indent(limitMultilineString(this.useFile.text, max_lines)) + '\n'
        }
        if (options.displayTrace ?? false) {
            out += ('==== TRACE: ' + this.utcFile.path  + ' ').padEnd(80, '=') + '\n'
            out += indent(limitMultilineString(this.utcFile.text, max_lines)) + '\n'
        }
        out += ('==== ANSWER '.padEnd(80, '=')) + '\n'
        out += this.answer.toString()
        out += '<'.repeat(80)
        return out
    }
}

//=========================================================================
// A SOILFileEvaluation is a triplet:
// - a .soil file
// - a .stc file
// - a list of section, with an answer for each section
//=========================================================================

function extractSectionTexts(text: string, pattern: RegExp): Array<NoLineEndedString> {
    return (
        text.split(pattern)
            .map(text => ensureNoNewLineAtEnd(text)))
}

export class SOILFile extends SourceFile {
    private SECTION_DELIMITER = / *\?'@@@\d+'\n/
    readonly sections: Array<NoLineEndedString>

    constructor (path: string) {
        super(path)
        assert.equal(this.extension,'.soil')
        this.sections = extractSectionTexts(this.text, this.SECTION_DELIMITER)
        // const texts = this.text.split(this.SECTION_DELIMITER)
        // this.sections = texts.map( text => ensureNoNewLineAtEnd(text) )
        // this.sections.forEach(section => {
        //     section
        //     console.error('DG:107','"""'+section+'"""')
        //     console.error('DG:108',isLineEnded(section))
        //     assert(isNoLineEnded(section))
        // })
    }
}


export class STCFile extends SourceFile {
    private SECTION_DELIMITER = /-> '@@@\w*' : String\n/
    readonly sections: Array<string>
    constructor (path: string) {
        super(path)
        assert(this.extension === '.stc')
        this.sections = extractSectionTexts(this.text, this.SECTION_DELIMITER)
        // const texts = this.text.split(this.SECTION_DELIMITER)
        // this.sections = texts.map( text => ensureNoNewLineAtEnd(text) )
    }
}


/**
 * The kind of SOIL section
 */
export enum SOILSectionKind {
    statement = 'statement',
    query = 'query',
    check = 'check',
    comment = 'comment'
}


export class SOILSectionEvaluation {
    constructor (
        public readonly soilText: string,
        public readonly stcText: string,
        public readonly index: number,
        public readonly kind: SOILSectionKind,
        public readonly answer?: SOILAnswer
    ) {}

    toString(displaySource: boolean = false, displayTrace: boolean = false): string {
        let out = ''
        out += ('.... @' + this.index + ': ' + this.kind + ' ').padEnd(80, '.') + '\n'
        if (displaySource) {
            // out += isNoLineEnded(this.soilText)
            // out += `"""` + this.soilText + `"""`
            out += 'SOURCE:\n'
            out += indent(this.soilText)+'\n'
        }
        if (displayTrace) {
            out += 'TRACE:\n'
            out += indent(this.stcText === '' ? '-' :  this.stcText ) + '\n'
        }
        out += this.answer!.toString()
        return out
    }
}




export class SOILFileEvaluation {
    readonly soilFile: SOILFile
    readonly stcFile: STCFile
    readonly sections: Array<SOILSectionEvaluation>

    constructor (soilPath: string) {
        this.soilFile = new SOILFile(soilPath)
        this.stcFile = new STCFile(replaceExtension(soilPath, '.stc'))
        this.sections = []
        this._checkSameNumberOfSection()
        const section_nb = this.soilFile.sections.length
        for (let index = 0; index < section_nb; index++) {
            this._process_section(index)
        }
    }

    private _process_section(index: number) {
        const soil_text = this.soilFile.sections[index]
        const stc_text = this.stcFile.sections[index]
        const kind = kindOfSOILSection(soil_text)
        // console.log('SECTION #' + index, ' : ', kind)
        if (kind === null) {
            // console.error('UNRECOGNIZED SECTION. kindOfSOILSection(s) === null')
            // console.error(indent(stc_text))
            throw new Error(`UNRECOGNIZED SECTION #${index}. .stc is malformed`)
        } else {
            const parser_class = getAppropriateSOILParser(soil_text)
            if (parser_class !== null) {
                const parser = new parser_class(stc_text)
                parser.parse()
                const evaluation = new SOILSectionEvaluation(
                    soil_text,
                    stc_text,
                    index,
                    kind!,
                    parser.answer)
                this.sections.push(evaluation)
            } else {
                // section is ignored
            }
        }
    }

    toString(displaySource: boolean = false, displayTrace: boolean = false): string {
        let out = ''
        out += ('>>>> SOURCE: ' + this.soilFile.path + ' ').padEnd(80, '>') + '\n'

        this.sections.forEach(section => {
            out += section.toString(displaySource, displayTrace)
        })
        out += '<'.repeat(80)
        return out
    }

    private _checkSameNumberOfSection(): void {
        assert.equal(this.soilFile.sections.length, this.stcFile.sections.length)
    }
}