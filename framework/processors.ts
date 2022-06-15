import { ShellCommand, ShellCommandResult } from "./shell";


export abstract class AbstractProcessor {
    private debug: boolean;
    private compilationPanel: any;
    private result: null;
    public postProcessResult: null;

    protected constructor(debug = true) {
        this.debug = debug
        this.compilationPanel = null
        this.result = null
        this.postProcessResult = null
    }

    abstract isProcessorEnabled(): boolean

    setCompilationPanel(compilationPanel): void {
        this.compilationPanel = compilationPanel
    }

    abstract doProcess():
}


export class AbstractProcessorResult {

}


export class ShellProcessorResult extends AbstractProcessorResult {
    public readonly shellCommand: ShellCommand

    constructor(shellCommand: ShellCommand) {
        super()
        this.shellCommand = shellCommand
    }
}

