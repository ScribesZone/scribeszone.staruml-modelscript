declare var app : any


class DemoDBModelGenerator {
    private targetContainer: undefined
    private targetModel: undefined
    private targetDiagram: undefined
    private _viewMap: {}
    private _elementMap: {}


    constructor() {
        // console.log('DG: MyModelGenerator', app.repository.select('@UMLClass'))
        // console.log("new MyModelGenerator()  d")
        // const x =app.repository.select('@Project')[0]
        // console.log(x,'apprep', app.repository)
        // console.log('cls',app.repository.select('@UMLClass'))
        // this.project = app.repository.select('@Project')[0]
        // console.log('OdfO',app, app.project, app.project.project)
        // console.log('OO',this.project)
        this.targetContainer = undefined
        this.targetModel = undefined
        this.targetDiagram = undefined
        this._viewMap = {}
        this._elementMap = {}
        console.log(this)
    }

    // initGenerator() {
    //     this.project = app.repository.select('@Project')[0]
    // }

    element(key) {
        return this._elementMap[key]
    }

    view(key) {
        return this._viewMap[key]
    }

    setTargetContainer() {
        this.targetContainer = app.project.project
    }

    createTargetModel(name, modelType) {
        console.log('GM: createTargetModel(',name,modelType,')')
        this.targetModel = app.factory.createModel({
            id: modelType,
            parent: this.targetContainer,
            modelInitializer: elem => {
                elem.name = name
            }})
        return this.targetModel
    }

    createTargetDiagram(name, diagramType) {
        console.log('GM: createTargetDiagram(',name,diagramType,')')
        this.targetDiagram = app.factory.createDiagram({
            id: diagramType,
            parent: this.targetModel,
            diagramInitializer: dgm => {
                dgm.name = name
                dgm.defaultDiagram = false
            }
        })
        return this.targetDiagram
    }

    addElementAndView(key, elementType, parent= undefined, field= undefined) {
        const actual_parent = (parent ? parent : this.targetModel)
        console.log('GM: addElementAndView(',key,elementType, parent, field,'|', actual_parent)
        const view = (
            app.factory.createModelAndView({
                id: elementType,
                parent: (parent ? parent : this.targetModel),
                field: field,
                diagram: this.targetDiagram,
            }))
        this._viewMap[key] = view
        this._elementMap[key] = view.model
        return view.model
    }

    addElement(key, elementType, parent= undefined, field= undefined) {
        const actual_parent = (parent ? parent : this.targetModel)
        console.log('GM: addElement(',key,elementType, parent, field,'|', actual_parent)
        const model = (
            app.factory.createModel({
                id: elementType,
                parent: (parent ? parent : this.targetModel),
                field: field,
            }))
        this._elementMap[key] = model
        return model
    }

    addRelation(key, relationType, headView, tailView,  parent= undefined, ) {
        const view = (
            app.factory.createModelAndView({
                id: relationType,
                parent: (parent ? parent : this.targetModel),
                diagram: this.targetDiagram,
                headView: headView,
                tailView: tailView,
                headModel: headView.model,
                tailModel: tailView.model
            }))
        this._viewMap[key] = view
        this._elementMap[key] = view.model
        return view.model
    }

    set(object, map) {
        app.engine.setProperties(object, map)
    }




    doGenerate() {
        console.log('dpGenerate',app.repository.select('@UMLClass'))
        this.setTargetContainer()
        this.createTargetModel(
            '**** DataModel ****',
            'ERDDataModel')
        this.createTargetDiagram(
            '**** DataModel Diagram ****',
            'ERDDiagram')

        const les_personnes = this.addElementAndView(
            'LesPersonnes',
            'ERDEntity')
        this.set(les_personnes, {
            name: 'LesPersonnes'
        })
        this.set(this.view("LesPersonnes"),{
            fillColor: "#ffffaa"
        })

        const age = this.addElement(
            'age',
            'ERDColumn',
            les_personnes,
            'columns')
        this.set(age, {
            name: 'age',
            primaryKey: false,
            foreignKey: false,
            nullable: false,
            type: 'INTEGER',
            length: undefined,
            unique: false
        })

        const nom = this.addElement(
            'nom',
            'ERDColumn',
            les_personnes,
            'columns')
        this.set(nom, {
            name: 'nom',
            primaryKey: true,
            foreignKey: false,
            nullable: false,
            type: 'VARCHAR',
            length: 40,
            unique: true
        })

        const les_voitures = this.addElementAndView(
            'LesVoitures',
            'ERDEntity')
        this.set(les_voitures, {
            name: 'LesVoitures'
        })
        this.set(this.view("LesVoitures"),{
            fillColor: "#ffffaa"
        })
        const numImmatriculation = this.addElement(
            'numImmatriculation',
            'ERDColumn',
            les_voitures,
            'columns')
        this.set(numImmatriculation, {
            name: 'numImmatriculation',
            primaryKey: true,
            foreignKey: false,
            nullable: false,
            type: 'VARCHAR',
            length: 20,
            unique: true
        })
        const nomDeProprietaire = this.addElement(
            'nom_de_proprietaire',
            'ERDColumn',
            les_voitures,
            'columns')
        this.set(nomDeProprietaire, {
            name: 'nom_de_proprietaire',
            primaryKey: false,
            foreignKey: true,
            nullable: true,
            type: 'VARCHAR',
            length: 20,
            unique: false,
            referenceTo: nom
        })

        const EstProprietaireDe = this.addRelation(
            "EstProprietaireDe",
            "ERDRelationship",
            this.view("LesVoitures"),
            this.view("LesPersonnes"),
            this.targetModel)  // this is not honored
        this.set(EstProprietaireDe, {
            name: 'EstProprietaireDe',
            identifying: false
        })
        this.set(EstProprietaireDe.end1, {
            name: 'proprietaire',
            cardinality: "0..1",
        })
        this.set(EstProprietaireDe.end2, {
            name: 'voitures',
            cardinality: "0..*",
        })


        app.commands.execute('diagram-layout:auto')

    }






}

/*

var options1 = {
  id: "UMLClass",
  parent: diagram._parent,
  diagram: diagram
}

var personneView =

personne = personneView.model


var age = app.factory.createModel({
    id: "ERDColumn",
    parent: personneView.model,
    field: "columns"
})



voiture = voitureView.model


relOpt={
    id: "ERDRelationship",
    parent: erdModel,
    diagram: erdDiagram,
    headView: voitureView,
    tailView: personneView,
    headModel: voiture,
    tailModel: personne
}
rel = app.factory.createModelAndView(relOpt)


/*
var diagram = app.factory.createDiagram(options)

// Create a UMLClass and UMLClassView
var options1 = {
  id: "UMLClass",
  parent: diagram._parent,
  diagram: diagram
}
var classView1 = app.factory.createModelAndView(options1)

// Create another UMLClass and UMLClassView
var options2 = {
  id: "UMLClass",
  parent: diagram._parent,
  diagram: diagram
}
var classView2 = app.factory.createModelAndView(options2)

// Create an association connecting the two classes
var options3 = {
  id: "UMLAssociation",
  parent: diagram._parent,
  diagram: diagram,
  tailView: classView1,
  headView: classView2,
  tailModel: classView1.model,
  headModel: classView2.model
}
var assoView = app.factory.createModelAndView(options3)




    doGenerate() {
        console.log('MyModelGenerator.doGenerate')
    }
}

*/

// Command in the tools menu
// IMPORTANT: this constant comes from menus/menu-tools.json
const DBMODELGEN_COMMAND = 'demos:dbmodelgen'

class DemoDBModelGeneratorInterface {
    generator: any
    genModelCommand: any

    constructor() {
        // At this level the model is not available yet. Try :
        //    console.log('DG: DemoDBModelGeneratorInterface', app.repository.select('@UMLClass'))

        this.genModelCommand = DBMODELGEN_COMMAND
        this.generator = new DemoDBModelGenerator()

        app.commands.register(
            this.genModelCommand,
            () => {
                this.generator.doGenerate()
            })
    }
}

exports.DemoDBModelGenerator = DemoDBModelGenerator