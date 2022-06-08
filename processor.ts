import {
    AbstractProcessor,
    ProcessorResult,
    ShellProcessorResult
} from "./framework/processors"

import { ShellCommand } from "./framework/shell"
import { AST } from "./framework/asts"

function summarizeErrors(shellCommandResult) {
    if (shellCommandResult.hasErrors()) {
        const nb_errors = shellCommandResult.stderr.split('/n').length
                 console.log('DG53 ', nb_errors)
                 console.warn('DG22 STDERR', JSON.stringify(shellCommandResult.stderr))
        return nb_errors + ' errors found'
    } else {
        return 'compilation successful'
    }
}

export class AbstractCompilation{
    public usePath: string;
    private shellProcessorResult: null;
    private commandLabel: string;
    protected processorResult: ShellProcessorResult;

    constructor(usePath: string, commandLabel: string) {
        console.assert(typeof usePath === 'string')
        this.usePath = usePath
        this.shellProcessorResult = null
        this.commandLabel = commandLabel
    }

    getCommand() : string {
        throw new Error('getCommand() must be implemented')
    }

    __getErroneousCommand() { // could be used to test error
        if (false) {        // TEST: just output
            return 'ls -l'
        }
        if (false) {        // TEST: just output
            return 'ls -WRONG ; ls -l'
        }
    }

    bindProcessorResult() {
        throw new Error('bindProcessorResult() must be implemented')
    }

    /**
     *
     * // @returns {Promise<ShellProcessorResult>}
     */
    async doCompile() {
        const shell_command = new ShellCommand(
            this.getCommand(),
            summarizeErrors,
            this.commandLabel,
            true)
        await shell_command.execute()
        this.processorResult = new ShellProcessorResult(shell_command)
        this.bindProcessorResult()
        return this.processorResult
    }
}


class ClassModelCompilation extends AbstractCompilation {
    private classModelAST: any;

    constructor(classModelAST, usePath) {
        super(usePath, 'class model compilation')
        console.assert(classModelAST instanceof AST, classModelAST)
        console.assert(classModelAST.role === "class")
        this.classModelAST = classModelAST
    }

    getTraceFilename() {
        return this.classModelAST.filename + '.utc'
    }

    getCommand() {
        return (
            this.usePath  // TODO: deal with incorrect use installation
            + ' -c '
            + this.classModelAST.filename
            + ' > '
            + this.getTraceFilename()
            + ' 2>&1')
    }

    bindProcessorResult() {
        this.classModelAST.processorResult = this.processorResult
    }

}


class StateModelCompilation extends AbstractCompilation {
    private classModelAST: AST
    private stateModelAST: AST

    constructor(classModelAST: AST, stateModelAST: AST, usePath: string) {
        const state_name = stateModelAST.elements[0].name
        super(usePath, state_name+' state compilation')
        console.assert(classModelAST instanceof AST, classModelAST)
        console.assert(classModelAST.role === "class")
        console.assert(stateModelAST instanceof AST, stateModelAST)
        console.assert(stateModelAST.role === "state")
        this.classModelAST = classModelAST
        this.stateModelAST = stateModelAST
    }

    getTraceFilename() {

        return this.stateModelAST.filename + '.stc'
    }

    getCommand() {
        return (
            this.usePath
            + ' -qv '
            + this.classModelAST.filename   // TODO: check filename
            + ' '
            + this.stateModelAST.filename   // TODO: check filename
            + ' > '
            + this.getTraceFilename()
            + ' 2>&1')
    }

    bindProcessorResult() {
        this.stateModelAST.processorResult = this.processorResult
    }

}


export class USEOCLProcessor extends AbstractProcessor {
    private generator: any;
    private processorEnabled: any;
    private usePath: any;

    constructor(generator, debug = true) {
        super(debug)
        this.generator = generator
        // this.processorEnabled = useocl.compilation.use.path
        this.processorEnabled = app.preferences.get('useocl.compilation.compile')
        this.usePath = app.preferences.get("useocl.compilation.use.path")
    }

    isProcessorEnabled() {
        return this.processorEnabled
    }


    async processClassModel(classModelAST) {
        const compilation = (
            new ClassModelCompilation(
                classModelAST,
                this.usePath))
        return await compilation.doCompile()
        // const processorResult = new ShellProcessorResult(compilation)
        // // decorate the ast itself with the result
        // ast.processorResult = processorResult
        // return processorResult
    }

    async processStateModel(classModelAST, stateModelAST) {
       const compilation = (
            new StateModelCompilation(
                classModelAST,
                stateModelAST,
                this.usePath))
        return await compilation.doCompile()
    }

    async doProcess() {
        console.log('====================== Compilation start')

        const class_model_ast = this.generator.classModelAST
        const class_model_processor_result = (
            await this.processClassModel(
                class_model_ast))
        console.log('CLASS MODEL COMPILATION FINISHED')

        if (class_model_processor_result.shellCommand.result.hasErrors()) {
            console.log('class model has errors. no more processing')
        } else {
            console.log('class model successfully compile')
            const states = this.generator.stateModelASTs
            states.forEach( state_model_ast => {
                this.processStateModel(
                    class_model_ast,
                    state_model_ast
                )
            })


            // let state_model_compilation = (
            //     this.stateModelDoCompile()){}
            // for (let i = 0 ; i < states.length ;  i++) {
            //     const state_model_compilation = (
            //         await this.stateModelDoCompile(states[i]))
            //     if (state_model_compilation.result.hasErrors)
            // }
        }

    }


}

exports.USEOCLProcessor = USEOCLProcessor