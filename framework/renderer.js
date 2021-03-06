"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeInterface = exports.CodeZone = exports.HTMLRenderer = void 0;
var asts_1 = require("./asts");
// Render a writer as an HTML structure. This class is
// independent of any kind of interface. The HTML code can be
// put in a regular web page. However, no direct support is provided
// for clicks on element. Use CodeZone to add behavior.
var HTMLRenderer = /** @class */ (function () {
    function HTMLRenderer(ast) {
        // @tscheck
        // if (ast === undefined) {
        //     throw "ERROR : 'ast' of HTMLRenderer is undefined."
        // }
        this.ast = ast;
    }
    HTMLRenderer.prototype.getHTMLForToken = function (token) {
        // @tscheck
        // if (token === undefined) {
        //     throw "ERROR : 'token' of getHTMLForToken is undefined."
        // }
        if (token.element) {
            return ('<a href="#" class="{{category-token}}" element="{{id}}">{{text}}</a>'
                // @ts-ignore   TODO .replaceAll
                .replaceAll("{{id}}", token.element._id)
                .replaceAll("{{category-token}}", this._getCategoryClass(token.category))
                .replaceAll("{{text}}", token.text));
        }
        else {
            return ('<span class="token-{{category}}">{{text}}</span>'
                // @ts-ignore   TODO .replaceAll
                .replaceAll("{{category}}", token.category)
                .replaceAll("{{text}}", token.text));
        }
    };
    HTMLRenderer.prototype.getHTMLForLineNumber = function (num) {
        // @tscheck
        // if (num === undefined) {
        //     throw "ERROR : parameter 'num' of getHTMLForLineNumber is undefined."
        // }
        var max_lines = this.ast.lines.length;
        var line_number_pad = (0, asts_1.lineNumberPrefix)(num, max_lines);
        return ('<span class="line-number">{{pad}} </span>'
            // @ts-ignore   TODO .replaceAll
            .replaceAll("{{pad}}", line_number_pad));
    };
    HTMLRenderer.prototype.getHTMLForLine = function (line) {
        var _this = this;
        // @tscheck
        // if (line === undefined) {
        //     throw "ERROR : 'line' of getHTMLForLine is undefined."
        // }
        var prefix = ('<span id="line-{{num}}" class="line" line="{{num}}">'
            + '{{pad_number}}'
            + '{{body}}'
            + '</span>');
        var pad_number = this.getHTMLForLineNumber(line.number);
        var body = (line.tokens.map(function (token) {
            return _this.getHTMLForToken(token);
        }).join(''));
        return (prefix
            // @ts-ignore   TODO .replaceAll
            .replaceAll('{{num}}', line.number)
            .replaceAll('{{pad_number}}', pad_number)
            .replaceAll('{{body}}', body));
    };
    HTMLRenderer.prototype.getHTMLForLines = function (lines) {
        var _this = this;
        if (lines === undefined) {
            throw "ERROR : 'lines' of getHTMLForLines is undefined.";
        }
        return lines.map(function (line) { return _this.getHTMLForLine(line); }).join('\n');
    };
    HTMLRenderer.prototype.getHTML = function () {
        var html = '<div id="code-zone">{{body}}</div>';
        var body = this.getHTMLForLines(this.ast.lines);
        return (
        // @ts-ignore   TODO .replaceAll
        html.replaceAll('{{body}}', body));
    };
    HTMLRenderer.prototype._getCategoryClass = function (category) {
        return 'token-' + category;
    };
    // Return something like 'token-identifier1, token-identifier2, ...'
    HTMLRenderer.prototype.getIdentifiersSelector = function () {
        var _this = this;
        return (asts_1.IDENTIFIER_CATEGORIES.map(function (category) {
            return '.' + _this._getCategoryClass(category);
        })
            .join(', '));
    };
    return HTMLRenderer;
}());
exports.HTMLRenderer = HTMLRenderer;
/**
 * A DOM element containing the code generated by a HTMLRenderer.
 * This class does not depend on its DOM container. This means that
 * the code zone can be inserted everywhere, not necessarily in a
 * CustomPanel. Click behavior is added to the HTML generated via
 * HTMLRenderer.
 */
var CodeZone = /** @class */ (function () {
    function CodeZone($container) {
        if ($container === undefined) {
            throw "ERROR: 'CodeZone.constructor()': $container is undefined.";
        }
        $container.innerHTML = 'Code coming soon ...';
        this.$container = $container;
        this.ast = undefined;
        this.renderer = undefined;
    }
    CodeZone.prototype.build = function (ast) {
        if (ast === undefined) {
            throw "ERROR: 'CodeZone.build()': CodeZone is undefined.";
        }
        this.ast = ast;
        this.renderer = new HTMLRenderer(this.ast);
        this.$container.innerHTML = this.renderer.getHTML();
        this._addOnClickBehavior();
        if (false) { // TEST:
            this.__testHighligthtLine();
        }
    };
    CodeZone.prototype._addOnClickBehavior = function () {
        var selector = this.renderer.getIdentifiersSelector();
        $(selector).click(function (event) {
            var element_id = (event.currentTarget.attributes['element'].value);
            var element = app.repository.get(element_id);
            if (element) {
                app.modelExplorer.select(element, true);
            }
            else {
                console.error('[DEBUG]: element "' + element_id + '" not found');
            }
        });
        return false;
    };
    // DEMO: TEST:
    CodeZone.prototype.__testHighligthtLine = function () {
        this.highligthtLine(10, true);
        this.highligthtLine(5, true);
    };
    CodeZone.prototype.highligthtLine = function (num, highlight, highlight_number) {
        if (highlight === void 0) { highlight = true; }
        if (highlight_number === void 0) { highlight_number = false; }
        if (num < 1 || num > this.ast.lines.length) {
            throw ("highligthtLine: Line number" + num + "is invalid.");
        }
        else {
            var query = ('#code-zone span.line[line=' + num + ']');
            if (highlight_number) {
                query += ' span.line-number';
            }
            $(query).addClass("selected");
        }
    };
    return CodeZone;
}());
exports.CodeZone = CodeZone;
// This class put together a (custom) console  panel
// and put inside of it a CodeZone
var CodeInterface = /** @class */ (function () {
    function CodeInterface(consolePanel) {
        this.consolePanel = consolePanel;
        this.ast = undefined;
        this.codeZone = undefined;
    }
    CodeInterface.prototype.build = function (ast) {
        if (ast === undefined) {
            throw "ERROR: 'ast' of CodeInterface is undefined.";
        }
        this.ast = ast;
        this.codeZone = new CodeZone(this.consolePanel.getContentContainer());
        this.codeZone.build(this.ast);
    };
    return CodeInterface;
}());
exports.CodeInterface = CodeInterface;
//     app.repository.get(element_id)
// return this.getHTMLForElementToken(token)
// CONSOLE_PANEL.setText(html)
//$link = CONSOLE_PANEL.$panel.find('.link')
// $link.click(function () {
//     console.log('debug: CLICK!')
//     CONSOLE_PANEL.hide()
// })
// generator.doCompile()
// $("li").each(function(i, element) {
//   var li = $(element);
//
//   if (li.text() == "Orange") {
//     li.addClass("selected");
//
//     // Get position of selected element relative to top of document
//     var position = li.offset().top;
//
//     // Get the height of the window
//     var windowHeight = $(window).height();
//
//     // Scroll to and center the selected element in the viewport
//     $("body").scrollTop(position - (windowHeight/2));
//   }
// });
//# sourceMappingURL=renderer.js.map