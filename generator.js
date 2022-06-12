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
exports.USEOCLGenerator = void 0;
var generators_1 = require("./framework/generators");
var models_1 = require("./framework/models");
var CL1_EXTENSION = '.cl1';
var MODELSCRIPT_CL1_DIRECTORY = 'concepts/classes';
var CL1_FILENAME = 'classes';
var OB1_EXTENSION = '.ob1';
var MODELSCRIPT_OB1_PARENT_DIRECTORY = 'concepts/objets';
var FORCE_READABLE_SOILS = true; // TODO: decide if human readable will be useful
var USS_EXTENSION = '.uss';
var MODELSCRIPT_USS_DIRECTORY = 'cu/cu';
var USS_FILENAME = 'cu';
var path = require('path');
var ATTRIBUTE_TYPE_CONVERSIONS = {
    "DateTime": "String",
    "Date": "String",
    "Time": "String"
};
/**
 * Layout choice defined in preferences/preference.json
 */
var USEOCLLayoutKind;
(function (USEOCLLayoutKind) {
    USEOCLLayoutKind[USEOCLLayoutKind["build"] = 0] = "build";
    USEOCLLayoutKind[USEOCLLayoutKind["inplace"] = 1] = "inplace";
    USEOCLLayoutKind[USEOCLLayoutKind["modelscript"] = 2] = "modelscript";
})(USEOCLLayoutKind || (USEOCLLayoutKind = {}));
var USEOCLGeneratorLayout = /** @class */ (function () {
    function USEOCLGeneratorLayout(layoutKind) {
        if (layoutKind === void 0) { layoutKind = USEOCLLayoutKind.build; }
        this.buildDir = "build";
        this.layoutKind = layoutKind !== null && layoutKind !== void 0 ? layoutKind : app.preferences.get('useocl.generation.layout');
    }
    USEOCLGeneratorLayout.prototype.getUseFileName = function () {
        switch (this.layoutKind) {
            case USEOCLLayoutKind.build:
                return (0, generators_1.getProjectBasedFilename)(CL1_EXTENSION, this.buildDir, CL1_FILENAME);
            case USEOCLLayoutKind.modelscript:
                return (0, generators_1.getProjectBasedFilename)(CL1_EXTENSION, MODELSCRIPT_CL1_DIRECTORY, CL1_FILENAME);
            case USEOCLLayoutKind.inplace:
                return (0, generators_1.getProjectBasedFilename)(CL1_EXTENSION, '.', CL1_FILENAME);
        }
    };
    USEOCLGeneratorLayout.prototype.getSoilFilename = function (stateModel) {
        switch (this.layoutKind) {
            case USEOCLLayoutKind.build:
                return (0, generators_1.getProjectBasedFilename)(OB1_EXTENSION, this.buildDir, stateModel.name); // TODO: check model name
            case USEOCLLayoutKind.modelscript:
                return (0, generators_1.getProjectBasedFilename)(OB1_EXTENSION, path.join(MODELSCRIPT_OB1_PARENT_DIRECTORY, stateModel.name), stateModel.name); // TODO: check model name
            case USEOCLLayoutKind.inplace:
                return (0, generators_1.getProjectBasedFilename)(OB1_EXTENSION, '.', stateModel.name); // TODO: check model name
        }
    };
    USEOCLGeneratorLayout.prototype.getUseCaseFilename = function () {
        switch (this.layoutKind) {
            case USEOCLLayoutKind.build:
                return (0, generators_1.getProjectBasedFilename)(USS_EXTENSION, this.buildDir, USS_FILENAME);
            case USEOCLLayoutKind.modelscript:
                return (0, generators_1.getProjectBasedFilename)(OB1_EXTENSION, MODELSCRIPT_USS_DIRECTORY, USS_FILENAME);
            case USEOCLLayoutKind.inplace:
                return (0, generators_1.getProjectBasedFilename)(USS_EXTENSION, '.', USS_FILENAME);
        }
    };
    return USEOCLGeneratorLayout;
}());
// noinspection JSUnusedLocalSymbols
var USEOCLGenerator = /** @class */ (function (_super) {
    __extends(USEOCLGenerator, _super);
    function USEOCLGenerator(layoutKind, debug, eventFns) {
        if (layoutKind === void 0) { layoutKind = USEOCLLayoutKind.build; }
        if (debug === void 0) { debug = true; }
        var _this = _super.call(this, debug, eventFns) || this;
        _this.layout = new USEOCLGeneratorLayout(layoutKind);
        _this.classModelAST = null;
        _this.stateModelASTs = [];
        _this.usecaseModelAST = null;
        _this.soilStatementIndex = 0; // use to in getSoilStatementIndex
        return _this;
    }
    USEOCLGenerator.prototype.generate = function () {
        this.generateClassModel();
        this.generateStateModels();
        this.generateUseCaseModel();
    };
    //====================================================================
    //  Class model
    //====================================================================
    USEOCLGenerator.prototype.generateClassModel = function () {
        // this.ruleCheck(arguments, "none")
        var use_filename = this.layout.getUseFileName();
        if (this.eventFns && this.eventFns['onFileGeneration']) {
            this.eventFns['onFileGeneration']('class model', use_filename);
        }
        this.classModelAST = this.openAST(use_filename, 'class model', 'class');
        this.writeln("-- THIS FILE IS GENERATED. DON'T TOUCH IT!!!");
        this.writeln();
        this.write('model ', 'keyword');
        this.write('M');
        this.writeln();
        this.writeln();
        // const x = app.repository.select('@UMLEnumeration')
        // console.log(typeof x)
        this.generateEnumerations(app.repository.select('@UMLEnumeration'));
        this.generateClasses((0, models_1.allRegularClasses)());
        this.generateRegularAssociations((0, models_1.allRegularAssociation)());
        this.save();
        this.ruleEnd();
    };
    //--------------------------------------------------------------------
    //  Enumerations
    //--------------------------------------------------------------------
    USEOCLGenerator.prototype.generateEnumerations = function (enumerations) {
        var _this = this;
        // this.ruleCheck(arguments, [type.UMLEnumeration])
        enumerations.forEach(function (enumeration) {
            _this.generateEnumeration(enumeration);
        });
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateEnumeration = function (enumeration) {
        // this.ruleCheck(arguments, type.UMLEnumeration)
        this.write('enum ', 'keyword');
        this.writeIdentifier(enumeration.name, enumeration);
        this.writeln(' {');
        this.generateLiterals(enumeration.literals);
        this.writeln('}');
        this.writeln();
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateLiterals = function (literals) {
        var _this = this;
        // this.ruleCheck(arguments, [type.UMLEnumerationLiteral])
        literals.forEach(function (literal, index) {
            var isLastLiteral = (index === literals.length - 1);
            var separator = (isLastLiteral ? '' : ',');
            _this.generateLiteral(literal);
            _this.writeln(separator);
        });
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateLiteral = function (literal) {
        // this.ruleCheck(arguments, type.UMLEnumerationLiteral)
        this.write('    ');
        this.writeIdentifier(literal.name, literal);
        this.ruleEnd();
    };
    //--------------------------------------------------------------------
    //  Classes
    //--------------------------------------------------------------------
    USEOCLGenerator.prototype.generateClasses = function (classes) {
        var _this = this;
        // this.ruleCheck(arguments, [type.UMLClass])
        classes.forEach(function (class_) {
            _this.generateClass(class_);
        });
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateClass = function (class_) {
        // this.ruleCheck(arguments, type.UMLClass)
        if (class_.isAbstractTIT) {
            this.write('abstract ', 'keyword');
        }
        var association_side = (0, models_1.isClassAssociationClassSide)(class_);
        var is_association_class = (association_side !== false);
        if (is_association_class) {
            this.write('associationclass', 'keyword');
        }
        else {
            this.write('class', 'keyword');
        }
        this.write(' ');
        this.writeIdentifier(class_.name, class_);
        this.generateSuperClasses(class_.getGeneralElements());
        this.writeln();
        if (is_association_class) {
            this.generateAssociationEnds(association_side);
        }
        var attributes = class_.attributes;
        this.generateAttributes(attributes);
        this.writeln('end', "keyword");
        this.writeln('');
        // const constraints = class_.getConstraints()
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateSuperClasses = function (classes) {
        var _this = this;
        // this.ruleCheck(arguments, [type.UMLClass])
        if (classes.length !== 0) {
            this.write(' < ');
            classes.forEach(function (class_, i) {
                _this.writeIdentifier(class_.name, class_);
                if (i !== classes.length - 1) {
                    _this.write(', ');
                }
            });
        }
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateAttributes = function (attributes) {
        var _this = this;
        // this.ruleCheck(arguments, [type.UMLAttribute])
        if (attributes.length >= 1) {
            this.write('    ');
            this.writeln('attributes', "keyword");
            attributes.forEach(function (attribute) {
                _this.generateAttribute(attribute);
            });
        }
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateAttribute = function (attribute) {
        // this.ruleCheck(arguments, type.UMLAttribute)
        this.write('        ');
        this.writeIdentifier(attribute.name, attribute);
        this.write(' : ');
        this.generateAttributeType(attribute.type);
        this.writeln();
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateAttributeType = function (type_) {
        // this.ruleCheck(arguments, "any")
        // this.ruleCheck(arguments, [type.UMLEnumeration, "string"])
        if (type_ instanceof type.UMLEnumeration) {
            this.writeIdentifier(type_.name, type_);
        }
        else if (type_ instanceof type.UMLClass) {
            this.writeIdentifier(type_.name, type_);
            // TODO: generate here an error
        }
        else if (typeof type_ === "string") {
            if (type_ in ATTRIBUTE_TYPE_CONVERSIONS) {
                type_ = ATTRIBUTE_TYPE_CONVERSIONS[type_];
            }
            this.write(type_);
        }
        else if (type_ === null || type_ === undefined) {
            this.write('**UNDEFINED**');
        }
        else {
            console.error("[Generator]: unexpected attribute type:", type_);
            this.write(type_);
        }
        this.ruleEnd();
    };
    //--------------------------------------------------------------------
    //  Associations
    //--------------------------------------------------------------------
    USEOCLGenerator.prototype.generateRegularAssociations = function (associations) {
        var _this = this;
        // this.ruleCheck(arguments, [type.UMLAssociation])
        associations.forEach(function (association) {
            _this.generateRegularAssociation(association);
        });
        this.ruleEnd();
    };
    USEOCLGenerator.prototype.generateRegularAssociation = function (association) {
        // this.ruleCheck(arguments, type.UMLAssociation)
        if (association.end1.aggregation === 'composite') {
            this.write('composition ', 'keyword');
        }
        else if (association.end1.aggregation === 'shared') {
            this.write('aggregation ', 'keyword');
        }
        else {
            this.write('association ', 'keyword');
        }
        this.writeIdentifier(association.name, association);
        this.writeln();
        this.generateAssociationEnds(association);
        this.write('end', 'keyword');
        this.writeln();
        this.writeln();
        this.ruleEnd();
        // TODO: emit a warning if the composition/aggregation is on the other side
    };
    USEOCLGenerator.prototype.generateAssociationEnds = function (association) {
        this.writeln('    between', 'keyword');
        this.generateAssociationEnd(association.end1);
        this.generateAssociationEnd(association.end2);
    };
    USEOCLGenerator.prototype.generateAssociationEnd = function (role) {
        // this.ruleCheck(arguments, type.UMLAssociationEnd)
        this.write('        ');
        this.writeIdentifier(role.reference.name, role.reference);
        this.write('[' + role.multiplicity + ']');
        this.write(' role ', 'keyword');
        this.writeIdentifier(role.name, role);
        this.writeln();
        this.ruleEnd();
    };
    //====================================================================
    //  State models
    //====================================================================
    USEOCLGenerator.prototype.generateStateModels = function () {
        var _this = this;
        this.getStateModels().forEach(function (stateModel) {
            _this.generateStateModel(stateModel);
        });
    };
    USEOCLGenerator.prototype.getStateModels = function () {
        return (0, models_1.selectAllElements)(type.UMLPackage, 'state');
    };
    USEOCLGenerator.prototype.generateStateModel = function (stateModel) {
        var soil_filename = this.layout.getSoilFilename(stateModel);
        if (this.eventFns && this.eventFns['onFileGeneration']) {
            this.eventFns['onFileGeneration'](stateModel.name + ' state model', soil_filename);
        }
        var ast = this.openAST(soil_filename, stateModel.name + ' state model', 'state', [stateModel]);
        this.stateModelASTs.push(ast);
        this.writeln("-- THIS FILE IS GENERATED. DON'T TOUCH IT!!!");
        this.writeln();
        this.write('-- state ', 'keyword');
        this.writeIdentifier(stateModel.name, stateModel);
        this.writeln();
        this.resetSoilStatementIndex();
        this.writeln();
        this.generateObjects(this.stateObjects(stateModel));
        this.writeln();
        this.generateLinks(this.stateLinks(stateModel));
        this.writeln();
        this.generateCheckStatement();
        this.save();
    };
    USEOCLGenerator.prototype.generateCheckStatement = function () {
        this.generateSoilStatementPrefix();
        this.write('check -v -d');
        this.writeln();
    };
    //---------------------------------------------------------------------
    //   Objects & slots generators
    //---------------------------------------------------------------------
    USEOCLGenerator.prototype.stateObjects = function (stateModel) {
        console.assert(stateModel instanceof type.UMLPackage, stateModel);
        return ((0, models_1.selectOwnedElements)(stateModel, type.UMLObject)
            .filter(function (object_) { return (0, models_1.isRegularObject)(object_); }));
        // TODO: add this to the check
    };
    USEOCLGenerator.prototype.generateObjects = function (objects) {
        var _this = this;
        objects.forEach(function (object_) {
            _this.generateObject(object_);
        });
    };
    USEOCLGenerator.prototype.generateObject = function (object_) {
        this.generateSoilStatementPrefix();
        this.write('! ');
        this.write('create ', 'keyword');
        this.writeIdentifier(object_.name, object_); // TODO: check name
        this.write(' : ');
        this.generateObjectClass(object_);
        this.writeln();
        this.generateSlots(object_.slots);
        this.writeln();
    };
    USEOCLGenerator.prototype.generateObjectClass = function (object_) {
        var classifier = object_.classifier;
        // console.log('DG:359 ',object_, object_.classifier, typeof object_.classifier)
        if (classifier instanceof type.UMLClass) {
            this.writeIdentifier(classifier.name, classifier); // TODO check name
        }
        else if (classifier instanceof type.UMLClassifier) {
            this.writeIdentifier(classifier.name, classifier); // TODO raise error
            console.warn('[GENERATOR] The classifier of an object must be a UMLCLass.'
                + ' Found: ' + classifier.name);
        }
        else if (typeof classifier === 'string') {
            console.warn('[GENERATOR] The classifier of an object must be a UMLCLass.'
                + ' Not a string. Found: "' + classifier + '"');
            this.write('***ERROR*** String("' + classifier + '")'); // TODO deal with error
        }
        else if (classifier === null) {
            console.warn('[GENERATOR] The classifier of an object must be a UMLCLass.'
                + ' No value provided. Found: ' + classifier);
            this.write('***ERROR*** null'); // TODO deal with error
        }
        else {
            console.error('INTERNAL ERROR. Classifier value not expected.', object_);
        }
    };
    USEOCLGenerator.prototype.generateSlots = function (slots) {
        var _this = this;
        slots.forEach(function (slot) {
            _this.generateSlot(slot);
        });
    };
    USEOCLGenerator.prototype.generateSlot = function (slot) {
        this.generateSoilStatementPrefix();
        var object_ = slot._parent;
        this.write('!     ');
        this.writeIdentifier(object_.name, object_); // TODO: check ?
        this.write('.');
        this.write(slot.name); // TODO: check
        this.write(' := ');
        this.generateSlotValue(slot);
        this.writeln();
    };
    USEOCLGenerator.prototype.generateSlotValue = function (slot) {
        this.write(slot.value); // TODO: check if not null/association
    };
    //---------------------------------------------------------------------
    //   Links
    //---------------------------------------------------------------------
    /**
     * Returns the links that are either nested in the objects of the
     * state package or that are at the top level of this state package.
     * By default, when a link is created it is stored in the source object
     * of the link. It is still possible to move this link to the top
     * of the state package, ot to another object ! This function returns
     * links at the top level or inside an object at the top level.
     * @param stateModel the model to explore
     * @returns {Element[]} links
     */
    USEOCLGenerator.prototype.stateLinks = function (stateModel) {
        console.assert(stateModel instanceof type.UMLPackage);
        var outsideLinks = (0, models_1.selectOwnedElements)(stateModel, type.UMLLink);
        var insideLinks = (this.stateObjects(stateModel).map(function (object_) {
            return (0, models_1.selectOwnedElements)(object_, type.UMLLink);
        }).flat());
        return outsideLinks.concat(insideLinks);
    };
    USEOCLGenerator.prototype.generateLinks = function (links) {
        var _this = this;
        links.forEach(function (link) {
            _this.generateLink(link);
        });
    };
    USEOCLGenerator.prototype.generateLink = function (link) {
        console.assert(link instanceof type.UMLLink);
        this.generateSoilStatementPrefix();
        this.write('! ');
        this.write('insert', 'keyword');
        this.write('(');
        this.generateLinkEnd(link.end1);
        this.write(',');
        this.generateLinkEnd(link.end2);
        this.write(') ');
        this.write('into', 'keyword');
        this.write(' ');
        this.generateLinkClassifier(link);
        this.writeln();
    };
    USEOCLGenerator.prototype.generateLinkEnd = function (linkEnd) {
        console.assert(linkEnd instanceof type.UMLLinkEnd);
        console.assert(linkEnd.reference instanceof type.UMLObject);
        this.write(linkEnd.reference.name); // TODO: check if it is in state
    };
    USEOCLGenerator.prototype.generateLinkClassifier = function (link) {
        this.write(link.name); // TODO: check which association it is
    };
    USEOCLGenerator.prototype.generateSoilStatementPrefix = function () {
        if (FORCE_READABLE_SOILS) {
        }
        else {
            this.write(' '.repeat(75)
                + "?'@" + this.getSoilStatementIndex()
                + "'");
            this.writeln();
        }
    };
    USEOCLGenerator.prototype.resetSoilStatementIndex = function () {
        this.soilStatementIndex = 0;
    };
    USEOCLGenerator.prototype.getSoilStatementIndex = function () {
        this.soilStatementIndex += 1;
        return this.soilStatementIndex;
    };
    //====================================================================
    //  UseCase model
    //====================================================================
    USEOCLGenerator.prototype.generateUseCaseModel = function () {
        var use_case_model_filename = this.layout.getUseCaseFilename();
        this.usecaseModelAST = this.openAST(use_case_model_filename, 'use case model', 'usecase');
        this.writeln("-- THIS FILE IS GENERATED. DON'T TOUCH IT!!!");
        this.writeln();
        this.write('model ', 'keyword');
        this.write('M');
        this.writeln();
        this.writeln();
        this.generateActors(app.repository.select('@UMLActor'));
        this.writeln();
        this.generateUseCases(app.repository.select('@UMLUseCase'));
        this.writeln();
        this.generateInteractions((0, models_1.allInteractions)());
        this.save();
        this.ruleEnd();
    };
    //--------------------------------------------------------------------
    //  Actors
    //--------------------------------------------------------------------
    USEOCLGenerator.prototype.generateActors = function (actors) {
        var _this = this;
        actors.forEach(function (actor) {
            _this.generateActor(actor);
        });
    };
    USEOCLGenerator.prototype.generateActor = function (actor) {
        this.write('actor ', 'keyword');
        this.writeIdentifier(actor.name, actor); // TODO: check name
        this.writeln();
    };
    //--------------------------------------------------------------------
    //  UseCases
    //--------------------------------------------------------------------
    USEOCLGenerator.prototype.generateUseCases = function (useCases) {
        var _this = this;
        useCases.forEach(function (useCase) {
            _this.generateUseCase(useCase);
        });
    };
    USEOCLGenerator.prototype.generateUseCase = function (useCase) {
        this.write('usecase ', 'keyword');
        this.writeIdentifier(useCase.name, useCase); // TODO: check name
        this.writeln();
    };
    //--------------------------------------------------------------------
    //  Interactions
    //--------------------------------------------------------------------
    USEOCLGenerator.prototype.generateInteractions = function (interactions) {
        var _this = this;
        this.write('interactions ', 'keyword');
        this.writeln();
        interactions.forEach(function (interaction) {
            _this.generateInteraction(interaction);
        });
    };
    USEOCLGenerator.prototype.generateInteraction = function (interaction) {
        this.write('    un ', 'keyword');
        this.writeIdentifier(interaction.actor.name, interaction.actor); // TODO: check name
        this.write(' peut ', 'keyword');
        this.writeIdentifier(interaction.useCase.name, interaction.useCase); // TODO: check name
        this.writeln();
    };
    return USEOCLGenerator;
}(generators_1.AbstractGenerator));
exports.USEOCLGenerator = USEOCLGenerator;
//# sourceMappingURL=generator.js.map