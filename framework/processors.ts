import { ShellCommand } from "./shell";


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

    abstract isProcessorEnabled()

    setCompilationPanel(compilationPanel): void {
        this.compilationPanel = compilationPanel
    }

    abstract doProcess()
}

export class ProcessorResult {

}

export class ShellProcessorResult extends ProcessorResult {
    shellCommand: ShellCommand
    constructor(shellCommand: ShellCommand) {
        super()
        this.shellCommand = shellCommand
    }
}

