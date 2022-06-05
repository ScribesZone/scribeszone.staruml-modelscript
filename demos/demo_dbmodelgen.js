"use strict";
/**
 * Create a ERD model and diagram (LesPersonnes, LesVoitures, EstProprietaireDe)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoDBModelGeneratorInterface = exports.DemoDBModelGenerator = void 0;
// Command in the "View" menu
// IMPORTANT: this constant comes from menus/menu-view.json
var TOGGLE_DBMODELGEN_COMMAND = 'demos:dbmodelgen';
var DemoDBModelGenerator = /** @class */ (function () {
    function DemoDBModelGenerator() {
        var _this = this;
        console.log('DG: Installing DemoDBModelGenerator');
        this.dbmodelgenGenCommand = TOGGLE_DBMODELGEN_COMMAND;
        // console.log('DG: MyModelGenerator', app.repository.select('@UMLClass'))
        // console.log("new MyModelGenerator()  d")
        // const x =app.repository.select('@Project')[0]
        // console.log(x,'apprep', app.repository)
        // console.log('cls',app.repository.select('@UMLClass'))
        // this.project = app.repository.select('@Project')[0]
        // console.log('OdfO',app, app.project, app.project.project)
        // console.log('OO',this.project)
        this.targetContainer = undefined;
        this.targetModel = undefined;
        this.targetDiagram = undefined;
        this._viewMap = {};
        this._elementMap = {};
        console.log('app =', app);
        console.log('DG:36 app.commands', app.commands);
        app.commands.register(this.dbmodelgenGenCommand, function () {
            _this.doGenerate();
        });
    }
    // initGenerator() {
    //     this.project = app.repository.select('@Project')[0]
    // }
    DemoDBModelGenerator.prototype.element = function (key) {
        return this._elementMap[key];
    };
    DemoDBModelGenerator.prototype.view = function (key) {
        return this._viewMap[key];
    };
    DemoDBModelGenerator.prototype.setTargetContainer = function () {
        this.targetContainer = app.project.project;
    };
    DemoDBModelGenerator.prototype.createTargetModel = function (name, modelType) {
        console.log('GM: createTargetModel(', name, modelType, ')');
        this.targetModel = app.factory.createModel({
            id: modelType,
            parent: this.targetContainer,
            modelInitializer: function (elem) {
                elem.name = name;
            }
        });
        return this.targetModel;
    };
    DemoDBModelGenerator.prototype.createTargetDiagram = function (name, diagramType) {
        console.log('GM: createTargetDiagram(', name, diagramType, ')');
        this.targetDiagram = app.factory.createDiagram({
            id: diagramType,
            parent: this.targetModel,
            diagramInitializer: function (dgm) {
                dgm.name = name;
                dgm.defaultDiagram = false;
            }
        });
        return this.targetDiagram;
    };
    DemoDBModelGenerator.prototype.addElementAndView = function (key, elementType, parent, field) {
        if (parent === void 0) { parent = undefined; }
        if (field === void 0) { field = undefined; }
        var actual_parent = (parent ? parent : this.targetModel);
        console.log('GM: addElementAndView(', key, elementType, parent, field, '|', actual_parent);
        var view = (app.factory.createModelAndView({
            id: elementType,
            parent: (parent ? parent : this.targetModel),
            field: field,
            diagram: this.targetDiagram,
        }));
        this._viewMap[key] = view;
        this._elementMap[key] = view.model;
        return view.model;
    };
    DemoDBModelGenerator.prototype.addElement = function (key, elementType, parent, field) {
        if (parent === void 0) { parent = undefined; }
        if (field === void 0) { field = undefined; }
        var actual_parent = (parent ? parent : this.targetModel);
        console.log('GM: addElement(', key, elementType, parent, field, '|', actual_parent);
        var model = (app.factory.createModel({
            id: elementType,
            parent: (parent ? parent : this.targetModel),
            field: field,
        }));
        this._elementMap[key] = model;
        return model;
    };
    DemoDBModelGenerator.prototype.addRelation = function (key, relationType, headView, tailView, parent) {
        if (parent === void 0) { parent = undefined; }
        var view = (app.factory.createModelAndView({
            id: relationType,
            parent: (parent ? parent : this.targetModel),
            diagram: this.targetDiagram,
            headView: headView,
            tailView: tailView,
            headModel: headView.model,
            tailModel: tailView.model
        }));
        this._viewMap[key] = view;
        this._elementMap[key] = view.model;
        return view.model;
    };
    DemoDBModelGenerator.prototype.set = function (object, map) {
        app.engine.setProperties(object, map);
    };
    DemoDBModelGenerator.prototype.doGenerate = function () {
        console.log('dpGenerate: ', app.repository.select('@UMLClass'));
        this.setTargetContainer();
        this.createTargetModel('**** DataModel ****', 'ERDDataModel');
        this.createTargetDiagram('**** DataModel Diagram ****', 'ERDDiagram');
        var les_personnes = this.addElementAndView('LesPersonnes', 'ERDEntity');
        this.set(les_personnes, {
            name: 'LesPersonnes'
        });
        this.set(this.view("LesPersonnes"), {
            fillColor: "#ffffaa"
        });
        var age = this.addElement('age', 'ERDColumn', les_personnes, 'columns');
        this.set(age, {
            name: 'age',
            primaryKey: false,
            foreignKey: false,
            nullable: false,
            type: 'INTEGER',
            length: undefined,
            unique: false
        });
        var nom = this.addElement('nom', 'ERDColumn', les_personnes, 'columns');
        this.set(nom, {
            name: 'nom',
            primaryKey: true,
            foreignKey: false,
            nullable: false,
            type: 'VARCHAR',
            length: 40,
            unique: true
        });
        var les_voitures = this.addElementAndView('LesVoitures', 'ERDEntity');
        this.set(les_voitures, {
            name: 'LesVoitures'
        });
        this.set(this.view("LesVoitures"), {
            fillColor: "#ffffaa"
        });
        var numImmatriculation = this.addElement('numImmatriculation', 'ERDColumn', les_voitures, 'columns');
        this.set(numImmatriculation, {
            name: 'numImmatriculation',
            primaryKey: true,
            foreignKey: false,
            nullable: false,
            type: 'VARCHAR',
            length: 20,
            unique: true
        });
        var nomDeProprietaire = this.addElement('nom_de_proprietaire', 'ERDColumn', les_voitures, 'columns');
        this.set(nomDeProprietaire, {
            name: 'nom_de_proprietaire',
            primaryKey: false,
            foreignKey: true,
            nullable: true,
            type: 'VARCHAR',
            length: 20,
            unique: false,
            referenceTo: nom
        });
        var EstProprietaireDe = this.addRelation("EstProprietaireDe", "ERDRelationship", this.view("LesVoitures"), this.view("LesPersonnes"), this.targetModel); // this is not honored
        this.set(EstProprietaireDe, {
            name: 'EstProprietaireDe',
            identifying: false
        });
        this.set(EstProprietaireDe.end1, {
            name: 'proprietaire',
            cardinality: "0..1",
        });
        this.set(EstProprietaireDe.end2, {
            name: 'voitures',
            cardinality: "0..*",
        });
        app.commands.execute('diagram-layout:auto');
    };
    return DemoDBModelGenerator;
}());
exports.DemoDBModelGenerator = DemoDBModelGenerator;
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
var DBMODELGEN_COMMAND = 'demos:dbmodelgen';
var DemoDBModelGeneratorInterface = /** @class */ (function () {
    function DemoDBModelGeneratorInterface() {
        // At this level the model is not available yet. Try :
        //    console.log('DG: DemoDBModelGeneratorInterface', app.repository.select('@UMLClass'))
        var _this = this;
        this.genModelCommand = DBMODELGEN_COMMAND;
        this.generator = new DemoDBModelGenerator();
        app.commands.register(this.genModelCommand, function () {
            _this.generator.doGenerate();
        });
    }
    return DemoDBModelGeneratorInterface;
}());
exports.DemoDBModelGeneratorInterface = DemoDBModelGeneratorInterface;
//# sourceMappingURL=demo_dbmodelgen.js.map