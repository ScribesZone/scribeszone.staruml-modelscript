"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allAssociationClasses = exports.allRegularAssociation = exports.allRegularClasses = exports.isRegularAssociation = exports.isRegularClass = exports.allInteractions = exports.isInteractionAssociation = exports.isClassToClassAssociation = exports.isRegularObject = exports.isActorInstance = exports.isClassAssociationAssociationSide = exports.isClassAssociationClassSide = exports.selectOwnedElements = exports.selectAllElements = exports.asString = void 0;
/*=========================================================================
*             Model helpers
* =========================================================================
 */
var DisplayTypeMode;
(function (DisplayTypeMode) {
    DisplayTypeMode[DisplayTypeMode["none"] = 0] = "none";
    DisplayTypeMode[DisplayTypeMode["asView"] = 1] = "asView";
    DisplayTypeMode[DisplayTypeMode["asModelIfAny"] = 2] = "asModelIfAny";
})(DisplayTypeMode || (DisplayTypeMode = {}));
/**
 * Create a string from a arbitrary value. This takes into account
 * the possibility of having a type.Model or type.View.
 * Examples :
 *      isOpen
 *      isOpen : UMLAttribute
 *      isOpen : UMLAttributeView
 *      ... : UMLNoteView
 *      ...
 *      4 : integer
 *      [2,3,4,[2,5]] : array
 *
 * @param value the value to display.
 *
 * @param displayTypeMode indicates if the type of the value should
 * be issued.
 */
function asString(value, displayTypeMode) {
    if (displayTypeMode === void 0) { displayTypeMode = DisplayTypeMode.asModelIfAny; }
    if (value instanceof type.Model) {
        // A model with a name  (e.g. a UMLAttribute).
        return (value.name
            + (displayTypeMode !== DisplayTypeMode.none
                ? ':' + value.getClassName()
                : ''));
    }
    else if (value instanceof type.View) {
        if (value.model) {
            // A view with a model (e.g. a UMLAttributeView).
            switch (displayTypeMode) {
                case DisplayTypeMode.none:
                    return value.model.name;
                case DisplayTypeMode.asView:
                    return value.model.name + ':' + value.getClassName();
                case DisplayTypeMode.asModelIfAny:
                    return value.model.name + ':' + value.model.getClassName();
            }
        }
        else {
            // A view without a model (e.g. a UMLNodeView).
            // It is not possible to honor asModel, so just display the view.
            return ((value.name ? value.name : '...')
                + (displayTypeMode !== DisplayTypeMode.none
                    ? ':' + value.getClassName()
                    : ''));
        }
    }
    else {
        var value_text = void 0;
        try {
            value_text = JSON.stringify(value);
        }
        catch (exception) {
            value_text = '...';
        }
        if (displayTypeMode !== DisplayTypeMode.none) {
            return value_text;
        }
        else {
            if (Array.isArray(value)) {
                return value_text + ' : array';
            }
            else {
                return value_text + ' : ' + value;
            }
        }
    }
}
exports.asString = asString;
/**
 * Select all elements in the whole project of a given type and
 * optionally with a stereotype.
 * @param type_ the type to be selected. For instance type.UMLClass
 * @param stereotype if specified only elements with this stereotype
 *      will be seleced
 * @returns {Array<Element>} List pf Elements
 */
function selectAllElements(type_, stereotype) {
    if (stereotype === void 0) { stereotype = null; }
    console.assert(type_.name in type);
    console.assert(stereotype === null
        || typeof stereotype === 'string');
    var result = app.repository.select('@' + type_.name);
    if (stereotype) {
        result = result.filter(function (e) {
            return e.stereotype === stereotype;
        });
    }
    return result;
}
exports.selectAllElements = selectAllElements;
/**
 * Select all owned elements of a given element with a given type and
 * optionally with a given stereotype.
 * @param element The element where to search ownedElement
 * @param type_ The type of element to search. For instance type.UMLClass
 * @param stereotype. If provided only elements with this stereotype will
 *      be returned
 * @returns {Array<Element>} The ownedElements selected.
 */
function selectOwnedElements(element, type_, stereotype) {
    if (stereotype === void 0) { stereotype = null; }
    console.assert(element instanceof type.Element);
    console.assert(type_.name in type, type_);
    var result = (element.ownedElements.filter(function (element) {
        return element instanceof type_;
    }));
    if (stereotype) {
        result = result.filter(function (e) {
            return e.stereotype === stereotype;
        });
    }
    return result;
}
exports.selectOwnedElements = selectOwnedElements;
/**
 * Tests if the given class is on the class side of an association class and
 * if this is the case returns the corresponding association.
 * Returns false otherwise.
 */
function isClassAssociationClassSide(class_) {
    console.assert(class_ instanceof type.UMLClass);
    var association_class_link = (class_.ownedElements.find(function (oe) { return oe instanceof type.UMLAssociationClassLink; }));
    if (association_class_link === undefined) {
        return false;
    }
    else {
        return association_class_link.associationSide;
    }
}
exports.isClassAssociationClassSide = isClassAssociationClassSide;
/**
 * Tests if an association is the association side of an association class
 * and if this is the case returns the corresponding class.
 * Returns false otherwise.
 */
function isClassAssociationAssociationSide(association) {
    console.assert(association instanceof type.UMLAssociation);
    // It seems that there is no way to go from an association
    // to the class side for association class.
    var acls = app.repository.select('@UMLAssociationClassLink');
    var association_class_link = acls.find(function (acl) {
        return acl.associationSide === association;
    });
    if (association_class_link === undefined) {
        return false;
    }
    else {
        return association_class_link.classSide;
    }
}
exports.isClassAssociationAssociationSide = isClassAssociationAssociationSide;
function isActorInstance(element) {
    return (element instanceof type.UMLObject
        && element.classifier instanceof type.UMLActor);
}
exports.isActorInstance = isActorInstance;
function isRegularObject(element) {
    return (element instanceof type.UMLObject
        && (!isActorInstance(element)));
}
exports.isRegularObject = isRegularObject;
function isClassToClassAssociation(element) {
    return (element instanceof type.UMLAssociation
        && (!(element.end1.reference instanceof type.UMLActor))
        && (!(element.end1.reference instanceof type.UMLUseCase))
        && (!(element.end2.reference instanceof type.UMLActor))
        && (!(element.end2.reference instanceof type.UMLUseCase)));
}
exports.isClassToClassAssociation = isClassToClassAssociation;
function isInteractionAssociation(element) {
    return (element instanceof type.UMLAssociation
        && ((element.end1.reference instanceof type.UMLActor
            && element.end2.reference instanceof type.UMLUseCase)
            ||
                (element.end2.reference instanceof type.UMLActor
                    && element.end1.reference instanceof type.UMLUseCase)));
}
exports.isInteractionAssociation = isInteractionAssociation;
function interactionFromAssociation(association) {
    console.assert(isInteractionAssociation(association));
    if (association.end1.reference instanceof type.UMLActor) {
        return {
            association: association,
            actor: association.end1.reference,
            useCase: association.end2.reference
        };
    }
    else {
        return {
            association: association,
            actor: association.end2.reference,
            useCase: association.end1.reference
        };
    }
}
function allInteractions() {
    return (app.repository.select('@UMLAssociation')
        .filter(function (assoc) { return isInteractionAssociation(assoc); })
        .map(function (assoc) { return interactionFromAssociation(assoc); }));
}
exports.allInteractions = allInteractions;
// export function useCasesFromActor(actor) {
//     const use_case_list = (
//         allInteractions()
//             .map( assoc => actorUseCaseFromAssociation(assoc) )
//             .filter( info => info.actor === actor )
//             .map( info => info.useCase ))
//     return new Set(use_case_list)
// }
function isRegularClass(element) {
    return (element instanceof type.UMLClass
        && isClassAssociationClassSide(element) === false);
}
exports.isRegularClass = isRegularClass;
function isRegularAssociation(element) {
    return (isClassToClassAssociation(element)
        && isClassAssociationAssociationSide(element) === false);
}
exports.isRegularAssociation = isRegularAssociation;
function allRegularClasses() {
    return app.repository.select('@UMLClass').filter(function (class_) {
        return isRegularClass(class_);
    });
}
exports.allRegularClasses = allRegularClasses;
function allRegularAssociation() {
    return app.repository.select('@UMLAssociation').filter(function (association) {
        return isRegularAssociation(association);
    });
}
exports.allRegularAssociation = allRegularAssociation;
function allAssociationClasses() {
    return app.repository.select('@UMLClass').filter(function (class_) {
        return isClassAssociationClassSide(class_) !== false;
    });
}
exports.allAssociationClasses = allAssociationClasses;
// exports.selectAllElements = selectAllElements
// exports.selectOwnedElements = selectOwnedElements
// exports.isClassAssociationClassSide = isClassAssociationClassSide
// exports.isClassAssociationAssociationSide = isClassAssociationAssociationSide
// exports.isRegularClass = isRegularClass
// exports.isRegularClass = isRegularClass
//# sourceMappingURL=models.js.map