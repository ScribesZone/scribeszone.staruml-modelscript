import {ShellCommand} from "./shell";


export class AbstractProcessor {
    private debug: boolean;
    private compilationPanel: null;
    private result: null;
    private postProcessResult: null;

    constructor(debug = true) {
        this.debug = debug
        this.compilationPanel = null
        this.result = null
        this.postProcessResult = null
    }

    isProcessorEnabled() {
        throw new Error(
            'isProcessorEnabled() is not implemented by processor')
    }

    setCompilationPanel(compilationPanel) {
        this.compilationPanel = compilationPanel
    }

    doProcess() {
        throw new Error('doProcess() must be implemented')
    }
}

export class ProcessorResult {

}

export class ShellProcessorResult extends ProcessorResult{
    shellCommand: ShellCommand
    constructor(shellCommand: ShellCommand) {
        super()
        this.shellCommand = shellCommand
    }
}

