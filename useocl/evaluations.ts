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
import {indent} from "../framework/strings";


export class SourceFile {
    readonly path: string
    readonly text: string
    get extension(): string {
        return path.extname(this.path)
    }
    get lines(): Array<string> {
        return this.text.split('\n')
    }

    constructor(path: string) {
        this.path = path
        this.text = readFile(this.path)
    }
}

//=========================================================================
// A ClassModelEvaluation is a triplet:
// - a .use file
// - a .utc file
// - an answer build by parsing the .utc file
//=========================================================================


class USEFile extends SourceFile {
    constructor(path: string) {
        super(path)
        assert.strictEqual(this.extension, '.use')
    }
}

class UTCFile extends SourceFile {
    constructor(path: string) {
        super(path)
        assert.strictEqual(this.extension, '.utc')
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
}




export class SOILFile extends SourceFile {
    private SECTION_DELIMITER = / *\?'@@@\d+'\n/
    readonly sections: Array<string>
    constructor (path: string) {
        super(path)
        assert(this.extension === '.soil')
        this.sections = this.text.split(this.SECTION_DELIMITER)
    }
}


export class STCFile extends SourceFile {
    private SECTION_DELIMITER = /-> '@@@\w*' : String\n/
    readonly sections: Array<string>
    constructor (path: string) {
        super(path)
        assert(this.extension === '.stc')
        this.sections = this.text.split(this.SECTION_DELIMITER)
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
        console.log('SECTION #' + index, ' : ', kind)
        if (kind === null) {
            console.log(indent(soil_text))
        }
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

    private _checkSameNumberOfSection(): void {
        assert.equal(this.soilFile.sections.length, this.stcFile.sections.length)
    }
}