"use strict";
//-------------------------------------------------------------------------
// Files
//-------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFiles = exports.readFile = exports.ensureDirectory = exports.replaceExtension = void 0;
var fs = require("fs");
var path = require("path");
/**
 * Replace a file extension by another one.
 *      replaceExtension('/u/x/f.use', '.utc') = '/u/x/f.utc'
 */
function replaceExtension(filePath, extension) {
    var body = filePath.replace(/\.[^/.]+$/, "");
    return body + extension;
}
exports.replaceExtension = replaceExtension;
/**
 * Make sure that the directory exists and if it does not create it with
 * all parents directories needed.
 * @param filePath
 */
function ensureDirectory(filePath) {
    // fs.mkdir(
    //     filePath,
    //     { recursive: true },
    //     (err) => {
    //         if (err) throw err
    // })
    return fs.mkdirSync(filePath, { recursive: true });
}
exports.ensureDirectory = ensureDirectory;
/**
 * Read a file. Can raise an error.
 */
function readFile(filename) {
    return fs.readFileSync(filename, 'utf8');
}
exports.readFile = readFile;
/**
 * List files with a given extension a file.
 */
function listFiles(directory, extension) {
    var allFiles = fs.readdirSync('.');
    if (extension !== undefined) {
        var targetFiles = allFiles.filter(function (file) {
            return path.extname(file).toLowerCase() === extension;
        });
        return (targetFiles);
    }
    else {
        return allFiles;
    }
}
exports.listFiles = listFiles;
//# sourceMappingURL=files.js.map