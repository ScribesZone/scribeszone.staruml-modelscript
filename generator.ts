import * as staruml from "./framework/staruml"
declare var app: staruml.IAppContext
declare var type: any

import { Token, Line, AST, ASTTracedErrorReporter } from "./framework/asts"
import {
    AbstractGenerator,
    GeneratorFuns,
    getProjectBasedFilename }
from "./framework/generators"

import {
    selectOwnedElements,
    selectAllElements,
    allRegularAssociation,
    allRegularClasses,
    isClassAssociationClassSide,
    isRegularObject,
    allInteractions
}  from "./framework/models"

const CL1_EXTENSION = '.cl1'
const MODELSCRIPT_CL1_DIRECTORY = 'concepts/classes'
const CL1_FILENAME = 'classes'

const OB1_EXTENSION = '.ob1'
const MODELSCRIPT_OB1_PARENT_DIRECTORY = 'concepts/objets'

const FORCE_READABLE_SOILS = true  // TODO: decide if human readable will be useful

const USS_EXTENSION = '.uss'
const MODELSCRIPT_USS_DIRECTORY = 'cu/cu'
const USS_FILENAME = 'cu'
const path = require('path')

const ATTRIBUTE_TYPE_CONVERSIONS = {
    "DateTime" : "String",
    "Date" : "String",
    "Time" : "String"
}

/**
 * Layout choice defined in preferences/preference.json
 */
enum USEOCLLayoutKind {
    build = 0,        // see constants in preference.json
    inplace = 1,
    modelscript = 2
}

class USEOCLGeneratorLayout {

    private readonly layoutKind : USEOCLLayoutKind
    private readonly buildDir = "build"

    constructor(layoutKind: USEOCLLayoutKind = USEOCLLayoutKind.build) {
        this.layoutKind = layoutKind ?? app.preferences.get('useocl.generation.layout')
    }

    getUseFileName(): string {
        switch (this.layoutKind) {
            case USEOCLLayoutKind.build:
                return getProjectBasedFilename(
                    CL1_EXTENSION,
                    this.buildDir,
                    CL1_FILENAME)
            case USEOCLLayoutKind.modelscript:
                return getProjectBasedFilename(
                    CL1_EXTENSION,
                    MODELSCRIPT_CL1_DIRECTORY,
                    CL1_FILENAME)
            case USEOCLLayoutKind.inplace:
                return getProjectBasedFilename(
                    CL1_EXTENSION,
                    '.',
                    CL1_FILENAME)
        }
    }

    getSoilFilename(stateModel) {
        switch (this.layoutKind) {
            case USEOCLLayoutKind.build:
                return getProjectBasedFilename(
                    OB1_EXTENSION,
                    this.buildDir,
                    stateModel.name) // TODO: check model name
            case USEOCLLayoutKind.modelscript:
                return getProjectBasedFilename(
                    OB1_EXTENSION,
                    path.join(MODELSCRIPT_OB1_PARENT_DIRECTORY, stateModel.name),
                    stateModel.name) // TODO: check model name
            case USEOCLLayoutKind.inplace:
                return getProjectBasedFilename(
                    OB1_EXTENSION,
                    '.',
                    stateModel.name) // TODO: check model name
        }
    }

    getUseCaseFilename(): string {
        switch (this.layoutKind) {
            case USEOCLLayoutKind.build:
                return getProjectBasedFilename(
                    USS_EXTENSION,
                    this.buildDir,
                    USS_FILENAME)
            case USEOCLLayoutKind.modelscript:
                return getProjectBasedFilename(
                    OB1_EXTENSION,
                    MODELSCRIPT_USS_DIRECTORY,
                    USS_FILENAME)
            case USEOCLLayoutKind.inplace:
                return getProjectBasedFilename(
                    USS_EXTENSION,
                    '.',
                    USS_FILENAME)
        }
    }

}


// noinspection JSUnusedLocalSymbols
export class USEOCLGenerator extends AbstractGenerator {
    private readonly layout: USEOCLGeneratorLayout
    public classModelAST: AST | null
    public readonly stateModelASTs: Array<AST>
    public usecaseModelAST: AST | null
    private soilStatementIndex: number

    constructor(
        layoutKind: USEOCLLayoutKind = USEOCLLayoutKind.build,
        debug = true,
        eventFns: GeneratorFuns
    ) {
        super(debug, eventFns)
        this.layout = new USEOCLGeneratorLayout(layoutKind)
        this.classModelAST = null
        this.stateModelASTs = []
        this.usecaseModelAST = null
        this.soilStatementIndex = 0 // use to in getSoilStatementIndex
    }

    generate(): void {
        this.generateClassModel()
        this.generateStateModels()
        this.generateUseCaseModel()
    }

    //====================================================================
    //  Class model
    //====================================================================

    generateClassModel(): void {
        // this.ruleCheck(arguments, "none")
        const use_filename = this.layout.getUseFileName()
        if (this.eventFns && this.eventFns['onFileGeneration']) {
            this.eventFns['onFileGeneration'](
                'class model',
                use_filename)
        }
        this.classModelAST = this.openAST(
            use_filename,
            'class model',
            'class')
        this.writeln("-- THIS FILE IS GENERATED. DON'T TOUCH IT!!!")
        this.writeln()
        this.write('model ', 'keyword')
        this.write('M')
        this.writeln()
        this.writeln()

        // const x = app.repository.select('@UMLEnumeration')
        // console.log(typeof x)

        this.generateEnumerations(
           app.repository.select('@UMLEnumeration'))

        this.generateClasses(allRegularClasses())

        this.generateRegularAssociations(allRegularAssociation())

        this.save()
        this.ruleEnd()
    }

    //--------------------------------------------------------------------
    //  Enumerations
    //--------------------------------------------------------------------

    generateEnumerations(enumerations): void {
        // this.ruleCheck(arguments, [type.UMLEnumeration])
        enumerations.forEach( enumeration => {
            this.generateEnumeration(enumeration)
        })
        this.ruleEnd()
    }

    generateEnumeration(enumeration): void {
        // this.ruleCheck(arguments, type.UMLEnumeration)
        this.write('enum ', 'keyword')
        this.writeIdentifier(enumeration.name, enumeration)
        this.writeln(' {')
        this.generateLiterals(enumeration.literals)
        this.writeln('}')
        this.writeln()
        this.ruleEnd()
    }

    generateLiterals(literals): void {
        // this.ruleCheck(arguments, [type.UMLEnumerationLiteral])
        literals.forEach((literal, index) => {
            const isLastLiteral = (index === literals.length-1)
            const separator = (isLastLiteral ? '' : ',')
            this.generateLiteral(literal)
            this.writeln(separator)
        })
        this.ruleEnd()
    }

    generateLiteral(literal): void {
        // this.ruleCheck(arguments, type.UMLEnumerationLiteral)
        this.write('    ')
        this.writeIdentifier(literal.name, literal)
        this.ruleEnd()
    }

    //--------------------------------------------------------------------
    //  Classes
    //--------------------------------------------------------------------

    generateClasses(classes): void {
        // this.ruleCheck(arguments, [type.UMLClass])
        classes.forEach( class_ => {
            this.generateClass(class_)
        })
        this.ruleEnd()
    }

    generateClass(class_): void {
        // this.ruleCheck(arguments, type.UMLClass)
        if (class_.isAbstractTIT) {
            this.write('abstract ', 'keyword')
        }
        const association_side = isClassAssociationClassSide(class_)
        const is_association_class = (association_side !== false)
        if (is_association_class) {
            this.write('associationclass', 'keyword')
        } else {
            this.write('class', 'keyword')
        }
        this.write(' ')
        this.writeIdentifier(class_.name, class_)
        this.generateSuperClasses(class_.getGeneralElements())
        this.writeln()
        if (is_association_class) {
            this.generateAssociationEnds(association_side)
        }
        const attributes = class_.attributes
        this.generateAttributes(attributes)
        this.writeln('end', "keyword")
        this.writeln('')
        // const constraints = class_.getConstraints()
        this.ruleEnd()
    }

    generateSuperClasses(classes): void {
        // this.ruleCheck(arguments, [type.UMLClass])
        if (classes.length !== 0) {
            this.write(' < ')
            classes.forEach((class_, i) => {
                this.writeIdentifier(class_.name, class_)
                if (i !== classes.length-1) {
                    this.write(', ')
                }
            })
        }
        this.ruleEnd()
    }

    generateAttributes(attributes): void {
        // this.ruleCheck(arguments, [type.UMLAttribute])
        if (attributes.length>=1) {
            this.write('    ')
            this.writeln('attributes', "keyword")
            attributes.forEach( attribute => {
                this.generateAttribute(attribute)
            })
        }
        this.ruleEnd()
    }

    generateAttribute(attribute): void {
        // this.ruleCheck(arguments, type.UMLAttribute)
        this.write('        ')
        this.writeIdentifier(attribute.name, attribute)
        this.write(' : ')
        this.generateAttributeType(attribute.type)
        this.writeln()
        this.ruleEnd()
    }

    generateAttributeType(type_): void {
        // this.ruleCheck(arguments, "any")
        // this.ruleCheck(arguments, [type.UMLEnumeration, "string"])
        if (type_ instanceof type.UMLEnumeration) {
            this.writeIdentifier(type_.name, type_)
        } else if (type_ instanceof type.UMLClass) {
            this.writeIdentifier(type_.name, type_)
            // TODO: generate here an error
        } else if (typeof type_ === "string") {
            if (type_ in ATTRIBUTE_TYPE_CONVERSIONS) {
                type_ = ATTRIBUTE_TYPE_CONVERSIONS[type_]
            }
            this.write(type_)
        } else if (type_ === null || type_ === undefined ) {
            this.write('**UNDEFINED**')
        } else {
            console.error("[Generator]: unexpected attribute type:", type_)
            this.write(type_)
        }
        this.ruleEnd()
    }

    //--------------------------------------------------------------------
    //  Associations
    //--------------------------------------------------------------------

    generateRegularAssociations(associations): void {
        // this.ruleCheck(arguments, [type.UMLAssociation])
        associations.forEach( association => {
            this.generateRegularAssociation(association)
        })
        this.ruleEnd()
    }

    generateRegularAssociation(association): void {
        // this.ruleCheck(arguments, type.UMLAssociation)
        if (association.end1.aggregation === 'composite') {
            this.write('composition ', 'keyword')
        } else if (association.end1.aggregation === 'shared') {
            this.write('aggregation ', 'keyword')
        } else {
            this.write('association ', 'keyword')
        }
        this.writeIdentifier(association.name, association)
        this.writeln()
        this.generateAssociationEnds(association)
        this.write('end', 'keyword')
        this.writeln()
        this.writeln()
        this.ruleEnd()
        // TODO: emit a warning if the composition/aggregation is on the other side
    }

    generateAssociationEnds(association): void {
        this.writeln('    between', 'keyword')
        this.generateAssociationEnd(association.end1)
        this.generateAssociationEnd(association.end2)
    }

    generateAssociationEnd(role): void {
        // this.ruleCheck(arguments, type.UMLAssociationEnd)
        this.write('        ')
        this.writeIdentifier(role.reference.name, role.reference)
        this.write('['+role.multiplicity+']')
        this.write(' role ','keyword')
        this.writeIdentifier(role.name, role)
        this.writeln()
        this.ruleEnd()
    }


    //====================================================================
    //  State models
    //====================================================================

    generateStateModels(): void {
        this.getStateModels().forEach(stateModel => {
            this.generateStateModel(stateModel)
            }
        )
    }

    getStateModels() {
        return selectAllElements(type.UMLPackage, 'state')
    }

    generateStateModel(stateModel): void {
        const soil_filename = this.layout.getSoilFilename(stateModel)
        if (this.eventFns && this.eventFns['onFileGeneration']) {
            this.eventFns['onFileGeneration'](
                stateModel.name + ' state model',
                soil_filename)
        }
        const ast = this.openAST(
            soil_filename,
            stateModel.name + ' state model',
            'state',
            [stateModel])
        this.stateModelASTs.push(ast)
        this.writeln("-- THIS FILE IS GENERATED. DON'T TOUCH IT!!!")
        this.writeln()
        this.write('-- state ', 'keyword')
        this.writeIdentifier(stateModel.name, stateModel)
        this.writeln()
        this.resetSoilStatementIndex()
        this.writeln()
        this.generateObjects(this.stateObjects(stateModel))
        this.writeln()
        this.generateLinks(this.stateLinks(stateModel))
        this.writeln()
        this.generateCheckStatement()
        this.save()
    }

    generateCheckStatement(): void {
        this.generateSoilStatementPrefix()
        this.write('check -v -d')
        this.writeln()
    }

    //---------------------------------------------------------------------
    //   Objects & slots generators
    //---------------------------------------------------------------------

    stateObjects(stateModel): Array<any> {
        console.assert(
            stateModel instanceof type.UMLPackage, stateModel)
        return (
            selectOwnedElements(stateModel, type.UMLObject)
                .filter(object_ => isRegularObject(object_)))
        // TODO: add this to the check
    }

    generateObjects(objects): void {
        objects.forEach(object_ => {
            this.generateObject(object_)
        })
    }

    generateObject(object_): void {
        this.generateSoilStatementPrefix()
        this.write('! ')
        this.write('create ', 'keyword')
        this.writeIdentifier(object_.name, object_) // TODO: check name
        this.write(' : ')
        this.generateObjectClass(object_)
        this.writeln()
        this.generateSlots(object_.slots)
        this.writeln()
    }

    generateObjectClass(object_): void {
        const classifier = object_.classifier
        // console.log('DG:359 ',object_, object_.classifier, typeof object_.classifier)

        if (classifier instanceof type.UMLClass) {
            this.writeIdentifier(classifier.name, classifier) // TODO check name

        } else if (classifier instanceof type.UMLClassifier) {
            this.writeIdentifier(classifier.name, classifier) // TODO raise error
            console.warn(
                '[GENERATOR] The classifier of an object must be a UMLCLass.'
                +' Found: ' + classifier.name)
        } else if (typeof classifier === 'string') {
            console.warn(
                '[GENERATOR] The classifier of an object must be a UMLCLass.'
                +' Not a string. Found: "' + classifier + '"')
            this.write('***ERROR*** String("' + classifier + '")') // TODO deal with error
        } else if (classifier === null) {
            console.warn(
                '[GENERATOR] The classifier of an object must be a UMLCLass.'
                +' No value provided. Found: ' + classifier)
            this.write('***ERROR*** null') // TODO deal with error
        } else {
            console.error(
                'INTERNAL ERROR. Classifier value not expected.',
                object_)
        }
    }

    generateSlots(slots): void {
        slots.forEach(slot => {
            this.generateSlot(slot)
        })
    }

    generateSlot(slot): void {
        this.generateSoilStatementPrefix()
        const object_ = slot._parent
        this.write('!     ')
        this.writeIdentifier(object_.name, object_) // TODO: check ?
        this.write('.')
        this.write(slot.name) // TODO: check
        this.write(' := ')
        this.generateSlotValue(slot)
        this.writeln()
    }

    generateSlotValue(slot): void {
        this.write(slot.value) // TODO: check if not null/association
    }


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
    stateLinks(stateModel): Array<unknown> {
        console.assert(stateModel instanceof type.UMLPackage)
        const outsideLinks = selectOwnedElements(stateModel, type.UMLLink)
        const insideLinks = (
            this.stateObjects(stateModel).map(object_ =>
                selectOwnedElements(object_, type.UMLLink)
            ).flat())
        return outsideLinks.concat(insideLinks)

    }

    generateLinks(links): void {
        links.forEach(link => {
            this.generateLink(link)
        })
    }

    generateLink(link): void {
        console.assert(link instanceof type.UMLLink)
        this.generateSoilStatementPrefix()
        this.write('! ')
        this.write('insert', 'keyword')
        this.write('(')
        this.generateLinkEnd(link.end1)
        this.write(',')
        this.generateLinkEnd(link.end2)
        this.write(') ')
        this.write('into', 'keyword')

        this.write(' ')
        this.generateLinkClassifier(link)
        this.writeln()
    }

    generateLinkEnd(linkEnd): void {
        console.assert(linkEnd instanceof type.UMLLinkEnd)
        console.assert(linkEnd.reference instanceof type.UMLObject)
        this.write(linkEnd.reference.name) // TODO: check if it is in state
    }

    generateLinkClassifier(link): void {
        this.write(link.name)  // TODO: check which association it is
    }

    generateSoilStatementPrefix(): void {
        if (FORCE_READABLE_SOILS) {

        } else {
            this.write(
                ' '.repeat(75)
                + "?'@" + this.getSoilStatementIndex()
                + "'")
            this.writeln()
        }
    }

    resetSoilStatementIndex(): void {
        this.soilStatementIndex = 0
    }

    getSoilStatementIndex(): number {
        this.soilStatementIndex += 1
        return this.soilStatementIndex
    }




    //====================================================================
    //  UseCase model
    //====================================================================

    generateUseCaseModel(): void {


        let use_case_model_filename = this.layout.getUseCaseFilename()
        this.usecaseModelAST = this.openAST(
            use_case_model_filename,
            'use case model',
            'usecase')
        this.writeln("-- THIS FILE IS GENERATED. DON'T TOUCH IT!!!")
        this.writeln()
        this.write('model ', 'keyword')
        this.write('M')
        this.writeln()
        this.writeln()

        this.generateActors(
           app.repository.select('@UMLActor'))
        this.writeln()

        this.generateUseCases(
            app.repository.select('@UMLUseCase'))

        this.writeln()

        this.generateInteractions(
            allInteractions())

        this.save()
        this.ruleEnd()
    }

    //--------------------------------------------------------------------
    //  Actors
    //--------------------------------------------------------------------

    generateActors(actors): void {
        actors.forEach( actor => {
            this.generateActor(actor)
        })
    }

    generateActor(actor): void {
        this.write('actor ', 'keyword')
        this.writeIdentifier(actor.name, actor) // TODO: check name
        this.writeln()
    }

    //--------------------------------------------------------------------
    //  UseCases
    //--------------------------------------------------------------------

    generateUseCases(useCases): void {
        useCases.forEach( useCase => {
            this.generateUseCase(useCase)
        })
    }

    generateUseCase(useCase): void {
        this.write('usecase ', 'keyword')
        this.writeIdentifier(useCase.name, useCase) // TODO: check name
        this.writeln()
    }

    //--------------------------------------------------------------------
    //  Interactions
    //--------------------------------------------------------------------

    generateInteractions(interactions): void {
        this.write('interactions ', 'keyword')
        this.writeln()
        interactions.forEach( interaction => {
            this.generateInteraction(interaction)
        })
    }

    generateInteraction(interaction): void {
        this.write('    un ', 'keyword')
        this.writeIdentifier(interaction.actor.name, interaction.actor) // TODO: check name
        this.write(' peut ', 'keyword')
        this.writeIdentifier(interaction.useCase.name, interaction.useCase) // TODO: check name
        this.writeln()
    }
}
