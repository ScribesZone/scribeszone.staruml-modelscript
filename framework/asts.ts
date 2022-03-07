// noinspection UnnecessaryLocalVariableJS

import {ensureDirectory} from "./misc";

declare var type : any

const fs = require('fs')
const path = require('path')
const { TraceErrorReporter } = require('./traces')
const { asString } = require("./models")

export const IDENTIFIER_CATEGORIES = [
    "identifier1",
    "identifier2",
    "definition1",
    "definition2",
    "reference1",
    "reference2"
]

export const CATEGORIES = [
    "default",
    "keyword",
    "constant",
    "comment",
    "symbol"
].concat(IDENTIFIER_CATEGORIES)

function isString(value) {
    return (typeof value === 'string' || value instanceof String)
}


export function lineNumberPrefix(num, maxLineNumbers) {
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
    const prefix = with_spaces.substr(with_spaces.length-max_digits)
    return prefix
}


export class Token {
    private line: Line
    private text: string
    private category: string
    private element: any

    constructor(
        line,
        text: string,
        category: string,
        element,
        eventFns = undefined) {

        if(! (line instanceof Line)) {
            new TraceErrorReporter(
                'asts',
                "First argument of Token must be a line \n"
                 + "Found: " + asString(line),
                eventFns).throw()
        }
        this.line = line

        // check text
        if (! isString(text)) {
            new TraceErrorReporter(
                'asts',
                "Token text must be a string. \n"
                 + "Found: " + asString(text),
                eventFns).throw()
        }
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
        const cat = (category === undefined ? "default" : category)
        if (! CATEGORIES.includes(cat)) {
            const category_list = '['+CATEGORIES.join(', ')+']'
            new TraceErrorReporter(
                'asts',
                'Invalid token category.\n'
                + 'Found :"' + asString(cat) + '"\n'
                + 'Available categories are '+category_list+'.\n'
                + 'Token text was: ' + text,
                eventFns).throw()
        }
        this.category = cat

        // check element
        if (element !== undefined) {
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

    getPlainText() {
        return this.text
    }
}


export class Line {
    private tokens: Token[]
    private ast: AST
    public number: bigint

    constructor(ast, number) {
        this.ast = ast
        this.tokens = []
        this.number = number
    }

    addToken(token) {
        this.tokens.push(token)
    }

    getPlainText() {
        return this.tokens.map(t=>t.getPlainText()).join('')
    }
}


export class AST {
    private astCollection: ASTCollection
    filename: string
    role: string
    elements: any[];
    lines: Line[];
    private debug: boolean;
    private eventFns: any;
    private isOpen: boolean;
    processorResult: any;

    constructor( astCollection,
                 filename,
                 role = "main",
                 elements = [],
                 debug= false,
                 eventFns = null) {
        console.assert(
            astCollection instanceof ASTCollection, astCollection)
        console.assert(
            typeof filename === 'string' && filename, filename)
        console.assert(typeof role === 'string', role)
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
         * This field is not used otherwise unless mentionned.
         * @type {null|ProcessorResult}
         */
        this.processorResult = null
    }

    currentLine() {
        return this.lines[this.lines.length-1]
    }

    write(text, category, element) {
        if (! isString(text)) {
            const message = (
                "First argument of write() must be a string. \n"
                 + "Found: " + asString(text))
            new TraceErrorReporter(
                'asts',
                message,
                this.eventFns).throw()
        }
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

    writeln(text, category, element) {
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


export class ASTCollection {
    private generator: any;
    private astsByRole: {};
    private astSequence: any[];
    private debug: boolean;
    private eventFns: any;
    private currentAST: AST;

    constructor(generator,
                 debug= false,
                 eventFns = undefined) {
        this.generator = generator
        this.astsByRole = {}  /* {role->[AST] */
        this.astSequence = [] /* [AST] */
        this.debug = debug
        this.eventFns = eventFns
        this.currentAST = null
    }

    openAST(filename, role='main', elements = []) {
        console.assert(typeof filename === 'string', filename)
        console.assert(typeof role === 'string', role)
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
        if (this.astsByRole[role] === undefined) {
            this.astsByRole[role] = []
        }
        this.astsByRole[role].push(ast)
        this.astSequence.push(ast)
        this.currentAST = ast
        return ast
    }

    reopenAST(ast) {
        console.assert(ast instanceof AST, ast)
        this.currentAST = ast
    }

    save() {
        this.currentAST.save()
    }

    end() {
        console.assert(
            this.astSequence.every(ast => ! ast.isOpen),
            'end() can not be done. Some AST are still opened : ',
            this.astSequence.filter(ast => ast.isOpen))
    }

    getStats() {
        return this.astSequence.map( ast => ({
            role: ast.role,
            filename: ast.filename,
            lines: ast.lines.length,
            // elements: ast.elements // produce circular struct with json
        }))
    }

}

// exports.CATEGORIES = CATEGORIES
// exports.IDENTIFIER_CATEGORIES = IDENTIFIER_CATEGORIES
// exports.AST = AST
// exports.ASTCollection = ASTCollection
// exports.lineNumberPrefix = lineNumberPrefix