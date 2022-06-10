// noinspection UnnecessaryLocalVariableJS

declare var type : any

import * as fs from 'fs'
import * as path from 'path'

import * as staruml from './staruml'

import { ensureDirectory } from "./misc"
import { TraceErrorReporter } from './traces'
import { asString } from "./models"
import { ProcessorResult } from "./processors"
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




// @tscheck
// function isString(value): boolean {
//     return (typeof value === 'string' || value instanceof String)
// }

/**
 * Pad a (line) number.
 * Example:
 *      lineNumberPrefix(45, 348) = " 45"
 * 45 is the source line number, 348 the total number of line.
 * @param num
 * @param maxLineNumbers
 * @param pad
 */
export function lineNumberPrefix(
    num: number,
    maxLineNumbers: number,
    pad: string = ' '
): String {
    if (num === undefined) {
        new TraceErrorReporter(
            'asts',
            "'num' of lineNumberPrefix() is undefined.",
            undefined).throw()
    }
    if (maxLineNumbers === undefined) {
        new TraceErrorReporter(
            'asts',
            "ERROR : 'maxLineNumbers' of lineNumberPrefix() is undefined.",
            undefined).throw()
    }
    const max_digits = maxLineNumbers.toString().length
    const space_prefix = " ".repeat(max_digits)
    const with_spaces = space_prefix + num
    const prefix = with_spaces.substring(with_spaces.length-max_digits)
    return prefix
}

/**
 * Token.
 * @line
 * @text THe content of the token. It must be not empty.
 * It must not contain \n.
 * @category
 * @element
 * Note:
 */
export class Token {
    public readonly line: Line
    public readonly text: string
    public readonly category: Category
    public readonly element: staruml.Model | null

    constructor(
        line : Line,
        text: string,
        category: Category = "default",
        element : staruml.Model | null = null,
        eventFns = undefined) {

        // @tscheck: redundant check with typescript
        // if(! (line instanceof Line)) {
        //     new TraceErrorReporter(
        //         'asts',
        //         "First argument of Token must be a line \n"
        //          + "Found: " + asString(line),
        //         eventFns).throw()
        // }
        this.line = line

        // @tscheck: redundant check with typescript
        // check text
        // if (! isString(text)) {
        //     new TraceErrorReporter(
        //         'asts',
        //         "Token text must be a string. \n"
        //          + "Found: " + asString(text),
        //         eventFns).throw()
        // }
        if (text.split('\n').length >= 2) {
            new TraceErrorReporter(
                'asts',
                "Token text must not be multiline. \n"
                + "Found: "
                + asString(text.split('\n')[0] + "\\n ...'"),
                eventFns).throw()
        }
        if (text.length === 0) {
            new TraceErrorReporter(
                'asts',
                "Token text must not be empty. \n"
                + "Found: ''",
                eventFns).throw()
        }
        this.text = text

        // check category
        // const cat = (category === undefined ? "default" : category)
        // if (! CATEGORIES.includes(category)) {
        //     const category_list = '['+CATEGORIES.join(', ')+']'
        //     new TraceErrorReporter(
        //         'asts',
        //         'Invalid token category.\n'
        //         + 'Found :"' + asString(category) + '"\n'
        //         + 'Available categories are '+category_list+'.\n'
        //         + 'Token text was: ' + text,
        //         eventFns).throw()
        // }
        this.category = category

        // check element
        if (element !== null) {
            if (! (element instanceof type.Model)) {
                new TraceErrorReporter(
                    'asts',
    'Token element must be a type.Model element.\n'
                    + 'Type found: '+(typeof element)+'\n'
                    + 'Value found: ' + asString(element),
                    eventFns).throw()
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

    constructor(ast: AST, number: number) {
        this.ast = ast
        this.tokens = []
        this.number = number
    }

    addToken(token: Token): void {
        this.tokens.push(token)
    }

    getPlainText(): string {
        return this.tokens.map(t=>t.getPlainText()).join('')
    }
}


/**
 * AST, Abstract Syntax Tree, represented as a sequence of lines.
 * An AST is part of an AST collection.
 */
export class AST {
    public readonly astCollection: ASTCollection
    public readonly filename: string
    public readonly role: string
    public readonly elements: Array<staruml.Model>
    public readonly lines: Array<Line>
    public isOpen: boolean
    public processorResult: ProcessorResult | null

    private readonly debug: boolean
    private readonly eventFns: any

    constructor( astCollection: ASTCollection,
                 filename: string,
                 role: string = "main",
                 elements: Array<staruml.Model> = [],
                 debug: boolean= false,
                 eventFns = null) {
        // @tscheck:
        // console.assert(
        //     astCollection instanceof ASTCollection, astCollection)
        // console.assert(
        //     typeof filename === 'string' && filename, filename)
        // console.assert(typeof role === 'string', role)
        console.assert(
            elements.every( element => element instanceof type.Model),
            elements)
        this.astCollection = astCollection
        this.filename = filename
        this.role = role
        this.elements = elements
        this.lines = [new Line(this,1)]
        this.debug = debug
        this.eventFns = eventFns
        this.isOpen = true
        /**
         * Processor result optionally set and used by processor.
         * This field is not used otherwise unless mentioned.
         * @type {null|ProcessorResult}
         */
        this.processorResult = null
    }

    currentLine() {
        return this.lines[this.lines.length-1]
    }

    write(
        text: string,
        category: Category = "default",
        element: staruml.Model | null = null
    ) {
        // @tscheck
        // if (! isString(text)) {
        //     const message = (
        //         "First argument of write() must be a string. \n"
        //          + "Found: " + asString(text))
        //     new TraceErrorReporter(
        //         'asts',
        //         message,
        //         this.eventFns).throw()
        // }
        if (text.split('\n').length >= 2) {
            const message = (
                "First argument of write() is invalid. \n"
                + "Generators are token/line based."
                + " Text must not contain \\n characters. \n"
                + "Use writeln() instead.\n"
                + "Found: " + asString(
                    text.split('\n')[0] + '\\n'+'...'))
            new TraceErrorReporter(
                'asts',
                message,
                this.eventFns).throw()
        }
        if (! this.isOpen) {
            const message = (
                "AST has been closed by save(). No more token can be added")
            new TraceErrorReporter(
                'asts',
                message,
                this.eventFns).throw()
        }
        if (text !== '') {
            const token = new Token(
                this.currentLine(),
                text,
                category,
                element,
                this.eventFns)
            this.currentLine().addToken(token)
            if (this.eventFns && this.eventFns["afterToken"]) {
                this.eventFns["afterToken"](token)
            }
            if (this.debug) {
                console.log('[ASTS]:     ',text)
            }
        }
    }

    writeln(
        text?: string,
        category: Category = "default",
        element: staruml.Model | null = null
    ) {
        if (text !== undefined) {
            this.write(text, category, element)
        }
        const new_line = new Line(this,this.lines.length+1)
        this.lines.push(new_line)
        if (this.eventFns && this.eventFns["afterLine"]) {
            this.eventFns["afterLine"](new_line)
        }
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
            new TraceErrorReporter(
                'asts',
                message,
                this.eventFns).throw()
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
            new TraceErrorReporter(
                'asts',
                message,
                this.eventFns).throw()
        }
        try {
            fs.writeFileSync(this.filename, this.getPlainText())
        } catch (error) {
            const message = (
                "Fail to save AST file: " + this.filename)
            new TraceErrorReporter(
                'asts',
                message,
                this.eventFns).throw()
        }
        if (this.eventFns && this.eventFns['onSaveFile']) {
            this.eventFns['onSaveFile'](this.lines.length)
        }
        this.isOpen = false
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
    private readonly eventFns: any


    constructor( generator : AbstractGenerator,
                 debug= false,
                 eventFns = undefined ) {  // TODO: type eventFns
        this.generator = generator
        this.astsByRole = new Map()
        this.asts = []
        this.debug = debug
        this.eventFns = eventFns
        this.currentAST = null
    }

    openAST(
        filename: string,
        role: string = 'main',
        elements: Array<staruml.Model> = []
    ): AST {
        //@tscheck: console.assert(typeof filename === 'string', filename)
        //@tscheck: console.assert(typeof role === 'string', role)
        console.assert(
            elements.every( element => element instanceof type.Model),
            elements)
        const ast = new AST(
            this,
            filename,
            role,
            elements,
            this.debug,
            this.eventFns )
        if (! this.astsByRole.has(role)) {
            this.astsByRole.set(role, [])
        }
        this.astsByRole.get(role)!.push(ast)
        this.asts.push(ast)
        this.currentAST = ast
        return ast
    }

    reopenAST(ast : AST): void {
        console.assert(ast instanceof AST, ast)
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

