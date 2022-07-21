
//-------------------------------------------------------------------------
// Files
//-------------------------------------------------------------------------

import * as fs from "fs";
import * as path from "path";

/**
 * Replace a file extension by another one.
 *      replaceExtension('/u/x/f.use', '.utc') = '/u/x/f.utc'
 */

export function replaceExtension(filePath: string, extension: string): string {
    let body = filePath.replace(/\.[^/.]+$/, "")
    return body + extension
}

/**
 * Make sure that the directory exists and if it does not create it with
 * all parents directories needed.
 * @param filePath
 */
export function ensureDirectory(filePath: string): string {
    // fs.mkdir(
    //     filePath,
    //     { recursive: true },
    //     (err) => {
    //         if (err) throw err
    // })
    return fs.mkdirSync(filePath, { recursive: true }) !
}

/**
 * Read a file. Can raise an error.
 */
export function readFile(filename: string): string {
    return fs.readFileSync(filename, 'utf8')
}

/**
 * List files with a given extension a file.
 */
export function listFiles(directory: string, extension?: string): Array<string> {
    const allFiles = fs.readdirSync('.')
    if (extension !== undefined) {
        const targetFiles = allFiles.filter(file => {
            return path.extname(file).toLowerCase() === extension
        })
        return (targetFiles)
    } else {
        return allFiles
    }
}