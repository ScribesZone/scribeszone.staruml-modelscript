// declare var app : any
// declare var type : any

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

const { AbstractGenerator } = require("./framework/generators")
const {
    selectOwnedElements,
    selectAllElements,
    allRegularAssociation,
    allAssociationClasses,
    allRegularClasses,
    isClassAssociationClassSide,
    isClassAssociationAssociationSide,
    isRegularObject,
    allInteractions
} = require("./framework/models");


class USEOCLGenerator extends AbstractGenerator {

    constructor(useModelScriptArtefactStructure, debug = true,
            eventFns= undefined) {
        super(debug, eventFns)
        this.useModelScriptArtefactStructure = useModelScriptArtefactStructure
        this.classModelAST = null
        this.stateModelASTs = []
        this.soilStatementIndex = 0 // use to in getSoilStatementIndex
    }

    generate() {
        this.generateClassModel()
        this.generateStateModels()
        this.generateUseCaseModel()
    }

    //====================================================================
    //  Class model
    //====================================================================

    generateClassModel() {
        // this.ruleCheck(arguments, "none")
        let use_filename
        if (this.useModelScriptArtefactStructure) {
            use_filename = this.getProjectBasedFilename(
                CL1_EXTENSION,
                MODELSCRIPT_CL1_DIRECTORY,
                CL1_FILENAME)
        } else {
            // create a ".use" file at the top level
            use_filename = this.getProjectBasedFilename(
                CL1_EXTENSION,
                '.',
                CL1_FILENAME)        }
        if (this.eventFns && this.eventFns['onFileGeneration']) {
            this.eventFns['onFileGeneration'](
                'class model',
                use_filename)
        }
        this.classModelAST = this.openAST(use_filename, 'class')
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

    generateEnumerations(enumerations) {
        // this.ruleCheck(arguments, [type.UMLEnumeration])
        enumerations.forEach( enumeration => {
            this.generateEnumeration(enumeration)
        })
        this.ruleEnd()
    }

    generateEnumeration(enumeration) {
        // this.ruleCheck(arguments, type.UMLEnumeration)
        this.write('enum ', 'keyword')
        this.writeIdentifier(enumeration.name, enumeration)
        this.writeln(' {')
        this.generateLiterals(enumeration.literals)
        this.writeln('}')
        this.writeln()
        this.ruleEnd()
    }

   generateLiterals(literals) {
        // this.ruleCheck(arguments, [type.UMLEnumerationLiteral])
        literals.forEach((literal, index) => {
            const isLastLiteral = (index === literals.length-1)
            const separator = (isLastLiteral ? '' : ',')
            this.generateLiteral(literal)
            this.writeln(separator)
        })
        this.ruleEnd()
    }

    generateLiteral(literal) {
        // this.ruleCheck(arguments, type.UMLEnumerationLiteral)
        this.write('    ')
        this.writeIdentifier(literal.name, literal)
        this.ruleEnd()
    }

    //--------------------------------------------------------------------
    //  Classes
    //--------------------------------------------------------------------

    generateClasses(classes) {
        // this.ruleCheck(arguments, [type.UMLClass])
        app.repository.select('@UMLClass').forEach( class_ => {
            this.generateClass(class_)
        })
        this.ruleEnd()

    }

    generateClass(class_) {
        // this.ruleCheck(arguments, type.UMLClass)
        if (class_.isAbstract) {
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

    generateSuperClasses(classes) {
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

    generateAttributes(attributes) {
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

    generateAttribute(attribute) {
        // this.ruleCheck(arguments, type.UMLAttribute)
        this.write('        ')
        this.writeIdentifier(attribute.name, attribute)
        this.write(' : ')
        this.generateAttributeType(attribute.type)
        this.writeln()
        this.ruleEnd()
    }

    generateAttributeType(type_) {
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

    generateRegularAssociations(associations) {
        // this.ruleCheck(arguments, [type.UMLAssociation])
        associations.forEach( association => {
            this.generateRegularAssociation(association)
        })
        this.ruleEnd()
    }

    generateRegularAssociation(association) {
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

    generateAssociationEnds(association) {
        this.writeln('    between', 'keyword')
        this.generateAssociationEnd(association.end1)
        this.generateAssociationEnd(association.end2)
    }

    generateAssociationEnd(role) {
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

    generateStateModels() {
        this.getStateModels().forEach(stateModel => {
            this.generateStateModel(stateModel)
            }
        )
    }

    getStateModels() {
        return selectAllElements(type.UMLPackage, 'state')
    }

    generateStateModel(stateModel) {
        let soil_filename
        if (this.useModelScriptArtefactStructure) {
            soil_filename = this.getProjectBasedFilename(
                OB1_EXTENSION,
                path.join(MODELSCRIPT_OB1_PARENT_DIRECTORY, stateModel.name),
                stateModel.name) // TODO: check model name
            console.log(soil_filename)
        } else {
            soil_filename = this.getProjectBasedFilename(
                OB1_EXTENSION,
                '.',
                stateModel.name) // TODO: check model name
        }
        if (this.eventFns && this.eventFns['onFileGeneration']) {
            this.eventFns['onFileGeneration'](
                stateModel.name + ' state model',
                soil_filename)
        }
        const ast = this.openAST(
            soil_filename,
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

    generateCheckStatement() {
        this.generateSoilStatementPrefix()
        this.write('check -v -d')
        this.writeln()
    }

    //---------------------------------------------------------------------
    //   Objects & slots
    //---------------------------------------------------------------------

    stateObjects(stateModel) {
        console.assert(
            stateModel instanceof type.UMLModel, stateModel)
        return (
            selectOwnedElements(stateModel, type.UMLObject)
                .filter(object_ => isRegularObject(object_)))
        // TODO: add this to the check
    }

    generateObjects(objects) {
        objects.forEach(object_ => {
            this.generateObject(object_)
        })
    }

    generateObject(object_) {
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

    generateObjectClass(object_) {
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

    generateSlots(slots) {
        slots.forEach(slot => {
            this.generateSlot(slot)
        })
    }

    generateSlot(slot) {
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

    generateSlotValue(slot) {
        this.write(slot.value) // TODO: check if not null/association
    }


    //---------------------------------------------------------------------
    //   Links
    //---------------------------------------------------------------------

    /**
     * Returns the links that are either nested in the objects of the
     * state model or that are at the top level of this state model.
     * By default, when a link is created it is stored in the source object
     * of the link. It is still possible to move this link to the top
     * of the state model, ot to another object ! This function returns
     * links at the top level or inside an object at the top level.
     * @param stateModel the model to explore
     * @returns {Element[]} links
     */
    stateLinks(stateModel) {
        console.assert(stateModel instanceof type.UMLModel)
        const outsideLinks = selectOwnedElements(stateModel, type.UMLLink)
        const insideLinks = (
            this.stateObjects(stateModel).map(object_ =>
                selectOwnedElements(object_, type.UMLLink)
            ).flat())
        return outsideLinks.concat(insideLinks)

    }

    generateLinks(links) {
        links.forEach(link => {
            this.generateLink(link)
        })
    }

    generateLink(link) {
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

    generateLinkEnd(linkEnd) {
        console.assert(linkEnd instanceof type.UMLLinkEnd)
        console.assert(linkEnd.reference instanceof type.UMLObject)
        this.write(linkEnd.reference.name) // TODO: check if it is in state
    }

    generateLinkClassifier(link) {
        this.write(link.name)  // TODO: check which association it is
    }

    generateSoilStatementPrefix() {
        if (FORCE_READABLE_SOILS) {

        } else {
            this.write(
                ' '.repeat(75)
                + "?'@" + this.getSoilStatementIndex()
                + "'")
            this.writeln()
        }
    }

    resetSoilStatementIndex() {
        this.soilStatementIndex = 0
    }

    getSoilStatementIndex() {
        this.soilStatementIndex += 1
        return this.soilStatementIndex
    }




    //====================================================================
    //  UseCas model
    //====================================================================

    generateUseCaseModel() {
        // this.ruleCheck(arguments, "none")
        let use_case_model_filename
        if (this.useModelScriptArtefactStructure) {
            use_case_model_filename = this.getProjectBasedFilename(
                USS_EXTENSION,
                MODELSCRIPT_USS_DIRECTORY,
                USS_FILENAME)
        } else {
            // create a ".uss" file at the top level
            use_case_model_filename = this.getProjectBasedFilename(
                USS_EXTENSION,
                '.',
                USS_FILENAME)
        }
        if (this.eventFns && this.eventFns['onFileGeneration']) {
            this.eventFns['onFileGeneration'](
                'use case model',
                USS_EXTENSION,
                '.',
                USS_FILENAME)
        }
        this.classModelAST = this.openAST(use_case_model_filename, 'usecase')
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

    generateActors(actors) {
        actors.forEach( actor => {
            this.generateActor(actor)
        })
    }

    generateActor(actor) {
        this.write('actor ', 'keyword')
        this.writeIdentifier(actor.name, actor) // TODO: check name
        this.writeln()
    }

    //--------------------------------------------------------------------
    //  UseCases
    //--------------------------------------------------------------------

    generateUseCases(useCases) {
        useCases.forEach( useCase => {
            this.generateUseCase(useCase)
        })
    }

    generateUseCase(useCase) {
        this.write('usecase ', 'keyword')
        this.writeIdentifier(useCase.name, useCase) // TODO: check name
        this.writeln()
    }

    //--------------------------------------------------------------------
    //  Interactions
    //--------------------------------------------------------------------

    generateInteractions(interactions) {
        this.write('interactions ', 'keyword')
        this.writeln()
        interactions.forEach( interaction => {
            this.generateInteraction(interaction)
        })
    }

    generateInteraction(interaction) {
        this.write('    un ', 'keyword')
        this.writeIdentifier(interaction.actor.name, interaction.actor) // TODO: check name
        this.write(' peut ', 'keyword')
        this.writeIdentifier(interaction.useCase.name, interaction.useCase) // TODO: check name
        this.writeln()
    }
}



exports.USEOCLGenerator = USEOCLGenerator