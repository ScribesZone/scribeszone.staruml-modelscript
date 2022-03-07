declare var app : any
declare var type : any

/*=========================================================================
*             Model helpers
* =========================================================================
 */

enum DisplayTypeMode {
    none,
    asView,
    asModelIfAny,
}

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
export function asString(
        value : any,
        displayTypeMode: DisplayTypeMode = DisplayTypeMode.asModelIfAny ) {
    if (value instanceof type.Model) {
        // A model with a name  (e.g. a UMLAttribute).
        return (
            value.name
            + (displayTypeMode !== DisplayTypeMode.none
                ? ':' + value.getClassName()
                : ''))
    } else if (value instanceof type.View) {
        if (value.model) {
            // A view with a model (e.g. a UMLAttributeView).
            switch (displayTypeMode) {
                case DisplayTypeMode.none :
                    return value.model.name
                case DisplayTypeMode.asView :
                    return value.model.name + ':' + value.getClassName()
                case DisplayTypeMode.asModelIfAny :
                    return value.model.name + ':' + value.model.getClassName()
            }
        } else {
            // A view without a model (e.g. a UMLNodeView).
            // It is not possible to honor asModel, so just display the view.
            return (
                ( value.name ? value.name : '...' )
                + (displayTypeMode !== DisplayTypeMode.none
                    ? ':' + value.getClassName()
                    : ''))
        }
    } else {
        let value_text : string
        try {
            value_text = JSON.stringify(value)
        } catch (exception) {
            value_text = '...'
        }
        if (displayTypeMode !== DisplayTypeMode.none) {
            return value_text
        } else {
            if (Array.isArray(value)) {
                return value_text + ' : array'
            } else {
                return value_text + ' : '  + value
            }
        }
    }
}

/**
 * Select all elements in the whole project of a given type and
 * optionally with a stereotype.
 * @param type_ the type to be selected. For instance type.UMLClass
 * @param stereotype if specified only elements with this stereotype
 *      will be seleced
 * @returns {Array<Element>} List pf Elements
 */

export function selectAllElements(type_, stereotype=null) {
    console.assert(type_.name in type)
    console.assert(
        stereotype === null
        || typeof stereotype === 'string')
    let result = app.repository.select(
        '@'+type_.name)
    if (stereotype) {
        result = result.filter(e =>
            e.stereotype === stereotype)
    }
    return result
}

/**
 * Select all owned elements of a given element with a given type and
 * optionally with a given stereotype.
 * @param element The element where to search ownedElement
 * @param type_ The type of element to search. For instance type.UMLClass
 * @param stereotype. If provided only elements with this stereotype will
 *      be returned
 * @returns {Array<Element>} The ownedElements selected.
 */

export function selectOwnedElements(element, type_, stereotype = null) {
    console.assert(element instanceof type.Element)
    console.assert(type_.name in type, type_)
    let result = (
        element.ownedElements.filter( element =>
            element instanceof type_))
    if (stereotype) {
        result = result.filter(e =>
            e.stereotype === stereotype)
    }
    return result
}

/**
 * Tests if the given class is on the class side of an association class and
 * if this is the case returns the corresponding association.
 * Returns false otherwise.
 */

export function isClassAssociationClassSide(class_) {
    console.assert(class_ instanceof type.UMLClass)
    const association_class_link = (
        class_.ownedElements.find(
            oe => oe instanceof type.UMLAssociationClassLink ))
    if (association_class_link === undefined) {
        return false
    } else {
        return association_class_link.associationSide
    }
}

/**
 * Tests if an association is the association side of an association class
 * and if this is the case returns the corresponding class.
 * Returns false otherwise.
 */

export function isClassAssociationAssociationSide(association) {
    console.assert(association instanceof type.UMLAssociation)
    // It seems that there is no way to go from an association
    // to the class side for association class.
    const acls = app.repository.select('@UMLAssociationClassLink')
    const association_class_link = acls.find( acl =>
        acl.associationSide === association)
    if ( association_class_link === undefined) {
        return false
    } else {
        return association_class_link.classSide
    }
}

export function isActorInstance(element) {
    return (
        element instanceof type.UMLObject
        && element.classifier instanceof type.UMLActor
    )
}

export function isRegularObject(element) {
    return (
        element instanceof type.UMLObject
        && (! isActorInstance(element))
    )
}

export function isClassToClassAssociation(element) {
    return (
        element instanceof type.UMLAssociation
        && (!  (element.end1.reference instanceof type.UMLActor))
        && (!  (element.end1.reference instanceof type.UMLUseCase))
        && (!  (element.end2.reference instanceof type.UMLActor))
        && (!  (element.end2.reference instanceof type.UMLUseCase))
    )
}

export function isInteractionAssociation(element) {
    return (
        element instanceof type.UMLAssociation
        && (
                (element.end1.reference instanceof type.UMLActor
                &&  element.end2.reference instanceof type.UMLUseCase)
            ||
                (element.end2.reference instanceof type.UMLActor
                &&  element.end1.reference instanceof type.UMLUseCase))
    )
}

interface Interaction {
    association : any /*type.UMLAssociation*/,
    actor : any /*type.UMLActor*/,
    useCase : any /*type.UMLUseCase*/
}

function interactionFromAssociation(association)
        : Interaction {
    console.assert(isInteractionAssociation(association))
    if (association.end1.reference instanceof type.UMLActor) {
        return {
            association: association,
            actor: association.end1.reference,
            useCase: association.end2.reference
        }
    } else {
        return {
            association: association,
            actor: association.end2.reference,
            useCase: association.end1.reference
        }
    }
}

export function allInteractions() {
    return (
        app.repository.select('@UMLAssociation')
            .filter( assoc => isInteractionAssociation(assoc))
            .map( assoc => interactionFromAssociation(assoc) )
    )
}

// export function useCasesFromActor(actor) {
//     const use_case_list = (
//         allInteractions()
//             .map( assoc => actorUseCaseFromAssociation(assoc) )
//             .filter( info => info.actor === actor )
//             .map( info => info.useCase ))
//     return new Set(use_case_list)
// }

export function isRegularClass(element) {
    return (
        element instanceof type.UMLClass
        && isClassAssociationClassSide(element) === false)
}

export function isRegularAssociation(element) {
    return (
        isClassToClassAssociation(element)
        && isClassAssociationAssociationSide(element) === false)
}

export function allRegularClasses() {
    return app.repository.select('@UMLClass').filter( class_ =>
        isRegularClass(class_)
    )
}

export function allRegularAssociation() {
    return app.repository.select('@UMLAssociation').filter( association =>
        isRegularAssociation(association)
    )
}

export function allAssociationClasses() {
    return app.repository.select('@UMLClass').filter( class_ =>
        isClassAssociationClassSide(class_) !== false
    )}

// exports.selectAllElements = selectAllElements
// exports.selectOwnedElements = selectOwnedElements
// exports.isClassAssociationClassSide = isClassAssociationClassSide
// exports.isClassAssociationAssociationSide = isClassAssociationAssociationSide
// exports.isRegularClass = isRegularClass
// exports.isRegularClass = isRegularClass
