"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOILFileEvaluation = exports.SOILSectionEvaluation = exports.SOILSectionKind = exports.STCFile = exports.SOILFile = exports.USEFileEvaluation = exports.SourceFile = void 0;
var node_assert_1 = require("node:assert");
var path = require("path");
var files_1 = require("../framework/files");
var parser_1 = require("./parser");
var strings_1 = require("../framework/strings");
var SourceFile = /** @class */ (function () {
    function SourceFile(path) {
        this.path = path;
        this.text = (0, strings_1.ensureNoNewLineAtEnd)((0, files_1.readFile)(this.path));
    }
    Object.defineProperty(SourceFile.prototype, "extension", {
        get: function () {
            return path.extname(this.path);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SourceFile.prototype, "lines", {
        get: function () {
            return this.text.split('\n');
        },
        enumerable: false,
        configurable: true
    });
    return SourceFile;
}());
exports.SourceFile = SourceFile;
//=========================================================================
// A USEFileEvaluation is a triplet:
// - a .use file
// - a .utc file
// - an answer build by parsing the .utc file
//=========================================================================
var USEFile = /** @class */ (function (_super) {
    __extends(USEFile, _super);
    function USEFile(path) {
        var _this = _super.call(this, path) || this;
        node_assert_1.strict.equal(_this.extension, '.use');
        return _this;
    }
    return USEFile;
}(SourceFile));
var UTCFile = /** @class */ (function (_super) {
    __extends(UTCFile, _super);
    function UTCFile(path) {
        var _this = _super.call(this, path) || this;
        node_assert_1.strict.equal(_this.extension, '.utc');
        return _this;
    }
    return UTCFile;
}(SourceFile));
var USEFileEvaluation = /** @class */ (function () {
    function USEFileEvaluation(usePath) {
        this.useFile = new USEFile(usePath);
        this.utcFile = new UTCFile((0, files_1.replaceExtension)(usePath, '.utc'));
        var parser = new parser_1.USEAnswerParser(usePath, this.utcFile.text);
        parser.parse();
        this.answer = parser.answer;
    }
    USEFileEvaluation.prototype.toString = function (options) {
        var _a, _b, _c;
        if (options === void 0) { options = {}; }
        var out = '';
        out += ('>>>> SOURCE: ' + this.useFile.path + ' ').padEnd(80, '>') + '\n';
        var max_lines = (_a = options.maxLines) !== null && _a !== void 0 ? _a : 0;
        if ((_b = options.displaySource) !== null && _b !== void 0 ? _b : false) {
            out += (0, strings_1.indent)((0, strings_1.limitMultilineString)(this.useFile.text, max_lines)) + '\n';
        }
        if ((_c = options.displayTrace) !== null && _c !== void 0 ? _c : false) {
            out += ('==== TRACE: ' + this.utcFile.path + ' ').padEnd(80, '=') + '\n';
            out += (0, strings_1.indent)((0, strings_1.limitMultilineString)(this.utcFile.text, max_lines)) + '\n';
        }
        out += ('==== ANSWER '.padEnd(80, '=')) + '\n';
        out += this.answer.toString();
        out += '<'.repeat(80);
        return out;
    };
    return USEFileEvaluation;
}());
exports.USEFileEvaluation = USEFileEvaluation;
//=========================================================================
// A SOILFileEvaluation is a triplet:
// - a .soil file
// - a .stc file
// - a list of section, with an answer for each section
//=========================================================================
function extractSectionTexts(text, pattern) {
    return (text.split(pattern)
        .map(function (text) { return (0, strings_1.ensureNoNewLineAtEnd)(text); }));
}
var SOILFile = /** @class */ (function (_super) {
    __extends(SOILFile, _super);
    function SOILFile(path) {
        var _this = _super.call(this, path) || this;
        _this.SECTION_DELIMITER = / *\?'@@@\d+'\n/;
        node_assert_1.strict.equal(_this.extension, '.soil');
        _this.sections = extractSectionTexts(_this.text, _this.SECTION_DELIMITER);
        return _this;
        // const texts = this.text.split(this.SECTION_DELIMITER)
        // this.sections = texts.map( text => ensureNoNewLineAtEnd(text) )
        // this.sections.forEach(section => {
        //     section
        //     console.error('DG:107','"""'+section+'"""')
        //     console.error('DG:108',isLineEnded(section))
        //     assert(isNoLineEnded(section))
        // })
    }
    return SOILFile;
}(SourceFile));
exports.SOILFile = SOILFile;
var STCFile = /** @class */ (function (_super) {
    __extends(STCFile, _super);
    function STCFile(path) {
        var _this = _super.call(this, path) || this;
        _this.SECTION_DELIMITER = /-> '@@@\w*' : String\n/;
        (0, node_assert_1.strict)(_this.extension === '.stc');
        _this.sections = extractSectionTexts(_this.text, _this.SECTION_DELIMITER);
        return _this;
        // const texts = this.text.split(this.SECTION_DELIMITER)
        // this.sections = texts.map( text => ensureNoNewLineAtEnd(text) )
    }
    return STCFile;
}(SourceFile));
exports.STCFile = STCFile;
/**
 * The kind of SOIL section
 */
var SOILSectionKind;
(function (SOILSectionKind) {
    SOILSectionKind["statement"] = "statement";
    SOILSectionKind["query"] = "query";
    SOILSectionKind["check"] = "check";
    SOILSectionKind["comment"] = "comment";
})(SOILSectionKind = exports.SOILSectionKind || (exports.SOILSectionKind = {}));
var SOILSectionEvaluation = /** @class */ (function () {
    function SOILSectionEvaluation(soilText, stcText, index, kind, answer) {
        this.soilText = soilText;
        this.stcText = stcText;
        this.index = index;
        this.kind = kind;
        this.answer = answer;
    }
    SOILSectionEvaluation.prototype.toString = function (displaySource, displayTrace) {
        if (displaySource === void 0) { displaySource = false; }
        if (displayTrace === void 0) { displayTrace = false; }
        var out = '';
        out += ('.... @' + this.index + ': ' + this.kind + ' ').padEnd(80, '.') + '\n';
        if (displaySource) {
            // out += isNoLineEnded(this.soilText)
            // out += `"""` + this.soilText + `"""`
            out += 'SOURCE:\n';
            out += (0, strings_1.indent)(this.soilText) + '\n';
        }
        if (displayTrace) {
            out += 'TRACE:\n';
            out += (0, strings_1.indent)(this.stcText === '' ? '-' : this.stcText) + '\n';
        }
        out += this.answer.toString();
        return out;
    };
    return SOILSectionEvaluation;
}());
exports.SOILSectionEvaluation = SOILSectionEvaluation;
var SOILFileEvaluation = /** @class */ (function () {
    function SOILFileEvaluation(soilPath) {
        this.soilFile = new SOILFile(soilPath);
        this.stcFile = new STCFile((0, files_1.replaceExtension)(soilPath, '.stc'));
        this.sections = [];
        this._checkSameNumberOfSection();
        var section_nb = this.soilFile.sections.length;
        for (var index = 0; index < section_nb; index++) {
            this._process_section(index);
        }
    }
    SOILFileEvaluation.prototype._process_section = function (index) {
        var soil_text = this.soilFile.sections[index];
        var stc_text = this.stcFile.sections[index];
        var kind = (0, parser_1.kindOfSOILSection)(soil_text);
        // console.log('SECTION #' + index, ' : ', kind)
        if (kind === null) {
            // console.error('UNRECOGNIZED SECTION. kindOfSOILSection(s) === null')
            // console.error(indent(stc_text))
            throw new Error("UNRECOGNIZED SECTION #".concat(index, ". .stc is malformed"));
        }
        else {
            var parser_class = (0, parser_1.getAppropriateSOILParser)(soil_text);
            if (parser_class !== null) {
                var parser = new parser_class(stc_text);
                parser.parse();
                var evaluation = new SOILSectionEvaluation(soil_text, stc_text, index, kind, parser.answer);
                this.sections.push(evaluation);
            }
            else {
                // section is ignored
            }
        }
    };
    SOILFileEvaluation.prototype.toString = function (displaySource, displayTrace) {
        if (displaySource === void 0) { displaySource = false; }
        if (displayTrace === void 0) { displayTrace = false; }
        var out = '';
        out += ('>>>> SOURCE: ' + this.soilFile.path + ' ').padEnd(80, '>') + '\n';
        this.sections.forEach(function (section) {
            out += section.toString(displaySource, displayTrace);
        });
        out += '<'.repeat(80);
        return out;
    };
    SOILFileEvaluation.prototype._checkSameNumberOfSection = function () {
        node_assert_1.strict.equal(this.soilFile.sections.length, this.stcFile.sections.length);
    };
    return SOILFileEvaluation;
}());
exports.SOILFileEvaluation = SOILFileEvaluation;
//# sourceMappingURL=evaluations.js.map