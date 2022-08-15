// noinspection UnnecessaryLocalVariableJS

/// <reference path="../../staruml-cli-examples/staruml/types/index.d.ts" />
/// <reference path="../../staruml-cli-examples/staruml/api.d.ts" />

/**
 * The file that is known by the generator developer.
 */
const JAVASCRIPT_FILE_TO_TRACE = 'generator.js'

declare var type : any

import * as fs from 'fs'
import * as path from 'path'

import * as staruml from './staruml'
// declare var staruml : any

import { ensureDirectory } from "./files"
import { TracedErrorReporter } from './traces'
import { asString } from "./models"
import { AbstractGenerator } from "./generators"


export type Category =
      "identifier1"
    | "identifier2"
    | "definition1"
    | "definition2"
    | "reference1"
    | "reference2"
    | "default"
    | "keyword"
    | "constant"
    | "comment"
    | "symbol"

// This should be improved with typescript enumerations or something else

export const IDENTIFIER_CATEGORIES = [
    "identifier1",
    "identifier2",
    "definition1",
    "definition2",
    "reference1",
    "reference2"
] as Array<Category> ;


/**
 * Report an error during the generation process. The error will be
 * located in the "generator.js" file so that the user can understand
 * which line of code is faulty.
 */
export class ASTTracedErrorReporter extends TracedErrorReporter {
    public readonly ast: AST

    constructor(
        ast: AST,
        component: string,
        messageOrException: string | Error)
    {
        super(
            JAVASCRIPT_FILE_TO_TRACE,
            component,
            messageOrException)
        this.ast = ast
        this.ast.emitOnError(this) // TODO: create typescript
    }
}

/**
 * Pad a (line) number.
 * Example:
 *      lineNumberPrefix(45, 348) = " 45"
 * 45 is the source line number, 348 the total number of line. The
 * total number is used to compute the amount of padding characters.
 */
export function lineNumberPrefix(
    num: number,
    maxLineNumbers: number,
    pad: string = ' '
): String {
    const max_digits = maxLineNumbers.toString().length
    const space_prefix = pad.repeat(max_digits)
    const with_spaces = space_prefix + num
    const prefix = with_spaces.substring(with_spaces.length-max_digits)
    return prefix
}

/**
 * Tokens, that is a piece of text, a category and an optional element
 * that typically have produced the token. The token could be the name
 * of a class and then the element would be the class.
 */
export class Token {
    public readonly line: Line
    public readonly text: string
    public readonly category: Category
    public readonly element: type.Model | null

    constructor(
        line : Line,
        text: string,
        category: Category = "default",
        element : type.Model | null = null) {

        this.line = line
        if (text.split('\n').length >= 2) {
            new ASTTracedErrorReporter(
                this.line.ast,
                'asts',
                "Token text must not be multiline. \n"
                + "Found: "
                + asString(text.split('\n')[0] + "\\n ...'")
            ).throw()
        }
        if (text.length === 0) {
            new ASTTracedErrorReporter(
                this.line.ast,
                'asts',
                "Token text must not be empty. \n"
                + "Found: ''"
            ).throw()
        }
        this.text = text
        this.category = category

        // check element
        if (element !== null) {
            if (! (element instanceof type.Model)) {
                new ASTTracedErrorReporter(
                    this.line.ast,
                    'asts',
    'Token element must be a type.Model element.\n'
                    + 'Type found: '+(typeof element)+'\n'
                    + 'Value found: ' + asString(element)
                ).throw()
            }
        }
        this.element = element
    }

    getPlainText(): string {
        return this.text
    }

}


/**
 * Lines, a sequence of tokens, part of an AST.
 */
export class Line {
    public readonly tokens: Array<Token>
    public readonly ast: AST
    public readonly number: number

    constructor(ast: AST, number: number) { // TODO: compute the number parameter
        this.ast = ast
        this.tokens = []
        this.number = number
    }

    addToken(token: Token): void {
        this.tokens.push(token)
    }

    getPlainText(): string {
        return this.tokens.map(t =>
            t.getPlainText())
            .join('')
    }
}

export interface ASTFuns {
    onError?: (reporter: any) => void,
    onOpen?: (ast) => void,
    afterToken?: (token: Token) => void,
    afterLine?: (line: Line) => void,
    onSaveFile?: (nbOfLines: number) => void
}

//
//
//     emitAfterToken(token: Token) {
//         if (this.eventFns && this.eventFns["afterToken"]) {
//             this.eventFns["afterToken"](token)
//         }
//     }
//
//     emitAfterLine(line: Line) {
//         if (this.eventFns && this.eventFns["afterLine"]) {
//             this.eventFns["afterLine"](line)
//         }
//     }
//
//     emitOnSaveFile(lineSaved: number) {
//         if (this.eventFns && this.eventFns['onSaveFile']) {
//             this.eventFns['onSaveFile'](lineSaved)
//         }
//     }
//
//     emitOnError(error: ASTTracedErrorReporter) {
//         if (this.eventFns && this.eventFns['onError']) {
//             this.eventFns['onError'](error)
//         }
//     }


/**
 * AST, Abstract Syntax Tree, represented as a sequence of lines.
 * An AST is part of an AST collection.
 */

export class AST {  // TODO: add EventEmitter
    public readonly astCollection: ASTCollection
    public readonly filename: string
    public readonly label: string  // something like class model or lea state model
    public readonly role: string
    public readonly elements: Array<type.Model>
    public readonly lines: Array<Line>
    public isOpen: boolean

    private readonly debug: boolean
    private readonly eventFns: ASTFuns

    constructor( astCollection: ASTCollection,
                 filename: string,
                 label: string = "",
                 role: string = "main",
                 elements: Array<type.Model> = [],
                 debug: boolean= false,
                 eventFns = {}) {  // TODO: replace eventFns by
        console.assert(
            elements.every( element => element instanceof type.Model),
            elements)
        this.astCollection = astCollection
        this.filename = filename
        this.label = label
        this.role = role
        this.elements = elements
        this.lines = [new Line(this,1)]
        this.debug = debug
        this.eventFns = eventFns  // TODO: replace eventFns by
        this.isOpen = false
    }

    /**
     * Open the AST so that it can be used with write statements.
     * Having this step is necessary to have time to register events
     */
    open() {
        if (this.isOpen) {
            new ASTTracedErrorReporter(
                this,
                'asts',
                "AST is opened"
            ).throw()
        } else {}
        this.isOpen = true
        this.emitOnOpen()
    }

    private _checkIsOpen() {
        if (! this.isOpen) {
            new ASTTracedErrorReporter(
                this,
                'asts',
                "AST is closed"
            ).throw()
        }
    }

    currentLine() {
        return this.lines[this.lines.length-1]
    }

    write(
        text: string,
        category: Category = "default",
        element: type.Model | null = null
    ) {
        this._checkIsOpen()
        if (text.split('\n').length >= 2) {
            const message = (
                "First argument of write() is invalid. \n"
                + "Generators are token/line based."
                + " Text must not contain \\n characters. \n"
                + "Use writeln() instead.\n"
                + "Found: " + asString(
                    text.split('\n')[0] + '\\n'+'...'))
            new ASTTracedErrorReporter(
                this,
                'asts',
                message
            ).throw()
        }
        if (! this.isOpen) {
            const message = (
                "AST has been closed by save(). No more token can be added")
            new ASTTracedErrorReporter(
                this,
                'asts',
                message,
            ).throw()
        }
        if (text !== '') {
            const token = new Token(
                this.currentLine(),
                text,
                category,
                element,
            )
            this.currentLine().addToken(token)
            this.emitAfterToken(token)

            if (this.debug) {
                console.log('[ASTS]:     ',text)
            }
        }
    }

    writeln(
        text?: string,
        category: Category = "default",
        element: type.Model | null = null
    ) {
        if (text !== undefined) {
            this.write(text, category, element)
        } else {
            this._checkIsOpen()
        }
        const new_line = new Line(this,this.lines.length+1)
        this.lines.push(new_line)
        this.emitAfterLine(new_line)
    }

    getPlainText(withLineNumber= false) {
        const max_lines = this.lines.length
        return this.lines.map(l => {
            const prefix = (
                withLineNumber ? 
                    lineNumberPrefix(l.number, max_lines) + ' '
                    : '')
            return prefix + l.getPlainText()
            }
        ).join('\n')
    }

    save() {
        if (! this.isOpen) {
            const message = (
                "AST is not open. It cannot be saved.")
            new ASTTracedErrorReporter(
                this,
                'asts',
                message,
            ).throw()
        }
        if (this.debug) {
            console.log('[ASTS]: **** saving output to "' + this.filename)
        }
        const parent_directory = path.dirname(this.filename)
        try {
            ensureDirectory(parent_directory)
        } catch (error) {
            const message = (
                "Fail to create parent directory "
                + parent_directory
                + " for file " + this.filename)
            new ASTTracedErrorReporter(
                this,
                'asts',
                message
            ).throw()
        }
        try {
            fs.writeFileSync(this.filename, this.getPlainText())
        } catch (error) {
            const message = (
                "Fail to save AST file: " + this.filename)
            new ASTTracedErrorReporter(
                this,
                'asts',
                message
            ).throw()
        }
        this.emitOnSaveFile(this.lines.length)
        this.isOpen = false
    }

    emitOnOpen() {
        if (this.eventFns && this.eventFns["onOpen"]) {
            this.eventFns["onOpen"](this)
        }
    }

    emitAfterToken(token: Token) {
        if (this.eventFns && this.eventFns["afterToken"]) {
            this.eventFns["afterToken"](token)
        }
    }

    emitAfterLine(line: Line) {
        if (this.eventFns && this.eventFns["afterLine"]) {
            this.eventFns["afterLine"](line)
        }
    }

    emitOnSaveFile(lineSaved: number) {
        if (this.eventFns && this.eventFns['onSaveFile']) {
            this.eventFns['onSaveFile'](lineSaved)
        }
    }

    emitOnError(error: ASTTracedErrorReporter) {
        if (this.eventFns && this.eventFns['onError']) {
            this.eventFns['onError'](error)
        }
    }
}


interface ASTInfo {
    role: string,
    filename: string,
    lines: number
}

export class ASTCollection {
    public readonly asts: Array<AST> // ordered
    public readonly astsByRole: Map<string, Array<AST>>
    public currentAST: AST | null
    public readonly generator: AbstractGenerator

    private readonly debug: boolean
    private readonly eventFns: ASTFuns


    constructor( generator : AbstractGenerator,
                 debug= false,
                 eventFns: ASTFuns = {} ) {  // TODO: type eventFns
        this.generator = generator
        this.astsByRole = new Map()
        this.asts = []
        this.debug = debug
        this.eventFns = eventFns
        this.currentAST = null
    }

    openAST(
        filename: string,
        label: string = '',
        role: string = 'main',
        elements: Array<type.Model> = []
    ): AST {
        console.assert(
            elements.every( element => element instanceof type.Model),
            elements)
        const ast = new AST(
            this,
            filename,
            label,
            role,
            elements,
            this.debug,
            this.eventFns )
        ast.open()
        if (! this.astsByRole.has(role)) {
            this.astsByRole.set(role, [])
        }
        this.astsByRole.get(role)!.push(ast)
        this.asts.push(ast)
        this.currentAST = ast
        return ast
    }

    reopenAST(ast : AST): void {
        this.currentAST = ast
    }

    save(): void {
        if (this.currentAST === null) {
            const msg = 'ASTCollection.save() called but currentAST === null'
            console.error('ERROR: '+msg)
            throw new Error('Internal error: '+msg)
        }
        this.currentAST.save()
    }

    end(): void {
        console.assert(
            this.asts.every(ast => ! ast.isOpen),
            'end() can not be done. Some AST are still opened : ',
            this.asts.filter(ast => ast.isOpen))
    }

    getStats(): Array<ASTInfo> {
        return this.asts.map(ast => ({
            role: ast.role,
            filename: ast.filename,
            lines: ast.lines.length,
            // elements: ast.elements // produce circular struct with json
        }))
    }

}

