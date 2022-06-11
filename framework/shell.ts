import { exec } from "child_process"

/**
 * ShellCommandResult. The result of a ShellCommand with the optional
 * error, stderr, and stdout.
 */
export class ShellCommandResult {
    private readonly shellCommand: ShellCommand
    public readonly error: Error | null
    public readonly stderr: string
    public readonly stdout: string

    constructor(shellCommand: ShellCommand,
                error: Error | null,
                stdout: string,
                stderr: string ) {
        // @ts-check
        // console.assert(shellCommand instanceof ShellCommand)
        // console.assert( error === null || error instanceof Error)
        // console.assert(typeof stdout === 'string')
        // console.assert(typeof stderr === 'string')
        this.shellCommand = shellCommand
        this.error = error
        this.stderr = stderr
        this.stdout = stdout
    }

    /**
     * Indicates if the command terminated with an error, either detected
     * with an Error object or via some output on stderr.
     */
    hasErrors(): boolean {
        return (
            (this.error !== null)
            || (this.stderr !== ''))
    }

    /**
     * Convert the result to a text.
     */
    getText(): string {
        let result = ''
        if (this.error && (this.error.message !== 'Command failed: '+this.stderr)) {
           result += 'Error code is '+this.error.message+'\n'
        }
        if (this.stderr) {
           result += 'Error output : \n' + this.stderr + '\n\n'
        }
        result += 'Output : \n' + this.stdout + '\n\n'
        return result
    }
}


        // Note sure if it would be best to replace this code with
        // a promise. Await can be done only in async function
        // and execute is not.
        // SEE "How to use Promise with exec in Node.js"
        // https://ali-dev.medium.com/how-to-use-promise-with-exec-in-node-js-a39c4d7bbf77

/**
 * A ShellCommand that can be executed and that leads to a ShellCommandResult
 */

export class ShellCommand {
    public readonly command: string;
    public readonly label: string
    public result: ShellCommandResult | null
    private readonly postExecutionFun: any;
    private readonly debug: boolean;
    private postExecutionResult: any | ShellCommandResult | null;

    constructor(command: string,
                postExecutionFun: Function | null = null ,
                label: string = '',  // mostly to simplify console messages
                debug = false) {
        // @ts-check
        // console.assert(typeof command === 'string')
        // console.assert(
        //     postExecutionFun === null
        //     || typeof postExecutionFun === 'function')
        // @ts-check
        // console.assert(typeof label === 'string')
        this.command = command
        this.label = label
        this.postExecutionFun = postExecutionFun
        this.debug = debug
        this.result = null
        this.postExecutionResult = null
    }


    /**
     * Executes a shell command and returns it as a promise
     * @returns {Promise<true>}
     */
    execute(): Promise<ShellCommand> {
        return new Promise(resolve => {
            if (this.debug) {
                console.log(
                    '[SHELL]: START: "'
                    + (this.label || this.command)
                    + '" ...',
                    this)
            }
            exec(this.command, (error, stdout, stderr) => {
                this.result = new ShellCommandResult(
                    this,
                    error,
                    stdout,
                    stderr)
                if (this.debug) {
                    console.log(
                        '[SHELL]: END: '
                        + (this.label || this.command)
                        + '" returns '
                        + (this.result.hasErrors() ? '' : 'no ')
                        + 'error.',
                        this)
                }
                if (this.postExecutionFun) {
                    this.postExecutionResult = (
                        this.postExecutionFun(this.result))
                } else {
                    this.postExecutionResult = this.result
                }
                const that = this
                resolve(that)
            })
        })
    }
}
