const {allRegularAssociation} = require("./framework/models");
DEBUG = true

const {
    allAssoallRegular
} = (
    require('./framework/models'))


/*---------------------------------------------------------------------
 * Association verbal form
 * --------------------------------------------------------------------
 */


/**
 * Check if the given word is possibly a French verb at the third person 'il'.
 * This function returns false if it is certain that this is not a verb.
 * Otherwise, we don't know
 */
function looksLikeFrenchVerb3rd(word) {
    const len = word.length
    if (len===0) {
        return false
    } else if (len===1) {
        return (word==='a')
    } else {
        // According to the French conjugation all third forms
        // of verb terminates by a or e or t or d.
        return Boolean(word.match(/^[a-z]+(a|e|t|d)$/))
    }
}

console.assert(looksLikeFrenchVerb3rd('') === false)
console.assert(looksLikeFrenchVerb3rd('a') === true)
console.assert(looksLikeFrenchVerb3rd('b') === false)
console.assert(looksLikeFrenchVerb3rd('file') === true)
console.assert(looksLikeFrenchVerb3rd('est') === true)
console.assert(looksLikeFrenchVerb3rd('répond') === true)
console.assert(looksLikeFrenchVerb3rd('camembert') === true)
console.assert(looksLikeFrenchVerb3rd('miroir') === false)
console.assert(looksLikeFrenchVerb3rd('mir!!oir#') === false)

function looksLikeFrenchVerbalTerm(id) {
    const m = id.match(/[A-Z][a-z]*/)
    if (m) {
        return looksLikeFrenchVerb3rd(m[0].toLowerCase())
    } else {
        return false
    }
}

console.assert(looksLikeFrenchVerbalTerm('') === false)
console.assert(looksLikeFrenchVerbalTerm('Est') === true)
console.assert(looksLikeFrenchVerbalTerm('A') === true)
console.assert(looksLikeFrenchVerbalTerm('ACommeElement') === true)
console.assert(looksLikeFrenchVerbalTerm('A_Comme_Element') === true)
console.assert(looksLikeFrenchVerbalTerm('Camembert') === true)
console.assert(looksLikeFrenchVerbalTerm('EstComposeDe') === true)
console.assert(looksLikeFrenchVerbalTerm('_EstComposeDe') === true)
console.assert(looksLikeFrenchVerbalTerm('Salaire') === true)
console.assert(looksLikeFrenchVerbalTerm('Nom') === false)
console.assert(looksLikeFrenchVerbalTerm('Employeur') === false)


/*---------------------------------------------------------------------
 * CamelCase Class/Attribute Enumeration/Literals Association/End
 * --------------------------------------------------------------------
 */

RE_Blank = /^\s*$/
RE_CamelCase = /^_*[A-Z]\w*$/
RE_camelCase = /^_*[a-z]\w*$/


RE_cardinality = /^(\*|\d+|\d+\.\.(\d+|\*))$/


function oneCardinality(cardinality) {
    return ['0..1','1','1..1'].includes(cardinality)
}

function isFrenchPlural(word) {
    return ['s','S','x','X'].includes(word[word.length-1])
}


/*---------------------------------------------------------------------
 * Checkers
 * --------------------------------------------------------------------
 */

class Checker {

    constructor(registry) {
        this.registry = registry
        this.elementsBeingChecked = []
    }

    elementLabel(element) {
        throw new Error(
            'Checker::elementLabel must be implemented in subclasses')
    }

    startCheckingElement(element) {
        this.elementsBeingChecked.push(element)
        //this.log(`Checking ${type} ` + this.elementLabel(element))
    }

    stopCheckingElement() {
        this.elementsBeingChecked.pop()
    }

    error(tokenMessage) {
        this.registry.error(tokenMessage)
    }

    log(tokenMessage) {
        if (this.registry.debug) {
            console.log(tokenMessage)
        }
    }

}

/*---------------------------------------------------------------------
 * Classes and attributes
 * --------------------------------------------------------------------
 */

class ClassChecker extends Checker {

    constructor(registry) {
        super(registry)
    }

    elementLabel(class_) {
        return {
            text: class_.name,
            element: class_
        }
    }

    checkName(class_) {
        if (class_.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing class name for ',
                    this.elementLabel(class_)])
        } else if (! class_.name.match(RE_CamelCase)) {
            this.error(
                [
                    'Class name "',
                    this.elementLabel(class_),
                    '" must be in CamlCase'])
        }
    }

    checkAttributes(class_) {
        class_.attributes.forEach( attribute => {
            this.registry.checkers['attribute'].check(attribute)
        })
    }

    check(class_) {
        this.startCheckingElement(class_)
        this.checkName(class_)
        this.checkAttributes(class_)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLClass').forEach( class_ => {
            this.check(class_)
        })
    }
}



class AttributeChecker extends Checker {

    constructor(registry) {
        super(registry)
    }

    elementLabel(attribute) {
        const class_ = attribute._parent

        const type_ = (
            (attribute.type instanceof type.Element)
                ? attribute.type.name
                : attribute.type)
        const multiplicity = (
            (attribute.multiplicity)
                ? '[' + attribute.multiplicity + ']'
                : '')
        return (
                {
                    text:  (
                        class_.name + '.' + attribute.name
                        + ' : ' + type_
                        + (multiplicity ? multiplicity : '')),
                    element: attribute
                })
    }

    checkName(attribute) {
        if (attribute.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing attribute name for ',
                    this.elementLabel(attribute)])
        } else if (! attribute.name.match(RE_camelCase)) {
            this.error(
                [
                    'Attribute name "',
                    attribute.name,
                    '" must be in camlCase in attribute ',
                    this.elementLabel(attribute)])
        }
    }

    checkType(attribute) {
        const type_ = attribute.type
        if (type_=== '' || type_ === undefined || type === null) {
            this.error(
                [
                    'Missing type for attribute ',
                    this.elementLabel(attribute),
                    '?'])
        } else if (typeof type_ === 'string') {
            // TODO Check for basic type (Integer, etc) or String to enum, to fix ?
            if (! attribute.type.match(RE_CamelCase)) {
                this.error(
                    [
                        'The type of attribute ',
                        this.elementLabel(attribute),
                        ' must be in CamlCase'])
            }
        } else if (type_ instanceof type.UMLEnumeration ) {
            return
        } else {
            this.error(
                [ 'Invalid attribute type : ',
                  this.elementLabel(attribute)])
        }
    }


    checkCardinality(attribute) {
        if (attribute.multiplicity === '') {
            return
        } else if (! attribute.name.match(RE_cardinality)) {
            this.error(
                [
                    'Invalid cardinality for attribute ',
                    this.elementLabel(attribute)])
        }
    }

    check(attribute) {
        this.startCheckingElement(attribute)
        this.checkName(attribute)
        this.checkType(attribute)
        this.checkCardinality(attribute)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLAttribute').forEach( attribute => {
            this.check(attribute)
        })
    }

}




/*---------------------------------------------------------------------
 * Enumerations and enumeration literals
 * --------------------------------------------------------------------
 */

class EnumerationChecker extends Checker {

    elementLabel(enumeration) {
        return {
            text: enumeration.name,
            element: enumeration
        }
    }

    checkName(enumeration) {
        if (enumeration.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing enumeration for  ',
                    this.elementLabel(enumeration)])
        } else if (! enumeration.name.match(RE_CamelCase)) {
            this.error(
                [
                    'Enumeration name "',
                    this.elementLabel(enumeration),
                    '" must be in CamlCase'])
        }
    }

    checkLiterals(enumeration) {
        enumeration.literals.forEach( literal => {
            this.registry.checkers['literal'].check(literal)
        })
    }

    check(enumeration) {
        this.startCheckingElement(enumeration)
        this.checkName(enumeration)
        this.checkLiterals(enumeration)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLEnumeration').forEach( enumeration => {
            this.log('Checking enumeration '+this.elementLabel(enumeration))
            this.check(enumeration)
        })
    }
}


class LiteralChecker extends Checker {


    elementLabel(literal) {
        const enumeration = literal._parent
        return {
            text: enumeration.name + '.' + literal.name,
            element: literal
        }
    }

    checkName(literal) {
        if (literal.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing literal name for ',
                    this.elementLabel(literal)])
        } else if (! literal.name.match(RE_camelCase)) {
            this.error(
                [
                    'Enumeration literal name "',
                    literal.name,
                    '" must be in camlCase in ',
                    this.elementLabel(literal)])
        }
    }

    check(literal) {
        this.startCheckingElement(literal)
        this.checkName(literal)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLEnumerationLiteral').forEach(
            literal => {
                this.check(literal)
            })
    }

}


/*---------------------------------------------------------------------
 * Associations and roles
 * --------------------------------------------------------------------
 */

class RegularAssociationChecker extends Checker {

    elementLabel(association) {
        return {
            text: (association.name ? association.name : '""'),
            element: association
        }
    }

    checkName(association) {
        if (association.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing association name for ',
                    this.elementLabel(association)])
        } else {
            if (!association.name.match(RE_CamelCase)) {
                this.error(
                    [
                        'Association name "',
                        this.elementLabel(association),
                        '" must be in CamlCase'])
            }
            if (!looksLikeFrenchVerbalTerm(association.name)) {
                this.error(
                    [
                        'Association name "',
                        this.elementLabel(association),
                        '" does not look like a verbal form'])
            }
        }
    }

    checkRoles(association) {
        this.registry.checkers['role'].check(association.end1)
        this.registry.checkers['role'].check(association.end2)
    }

    check(association) {
        this.startCheckingElement(association)
        this.checkName(association)
        this.checkRoles(association)
        this.stopCheckingElement()
    }

    checkAll() {
        allRegularAssociation().forEach( association => {
            this.check(association)
        })
    }
}


class RoleChecker extends Checker {

    elementLabel(role) {
        const association = role._parent
        const multiplicity = (
            (role.multiplicity)
                ? '[' + role.multiplicity + ']'
                : '')
        return {
            text:
                association.name
                + '.' + role.name
                + ' : ' + role.reference.name
                + multiplicity
                + '',
            element: role
        }
    }

    checkName(role) {
        if (role.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing role name for ',
                    this.elementLabel(role)])
        } else if (! role.name.match(RE_camelCase)) {
            this.error(
                [
                    'Role name "',
                    role.name,
                    '" must be in camlCase in attribute ',
                    this.elementLabel(role)])
        }
    }

    checkCardinality(role) {
        if (role.multiplicity.match(RE_Blank)) {
            this.error(
                [
                    'Cardinality is missing for role ',
                    this.elementLabel(role)])
        } else if (! role.multiplicity.match(RE_cardinality)) {
            this.error(
                [
                    'Invalid cardinality for role ',
                    this.elementLabel(role)])
        }
    }

    checkPlural(role) {
        if (! oneCardinality(role.multiplicity)) {
            if (! isFrenchPlural(role.name)) {
                this.error(
                    [
                        'Name of role ',
                        this.elementLabel(role),
                        ' must be a plural form (multiple cardinality).'])
            }
        }
    }

    // TODO: add constraints on composition/aggregation

    check(role) {
        this.startCheckingElement(role)
        this.checkName(role)
        this.checkCardinality(role)
        this.checkPlural(role)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLAssociationEnd').forEach( role => {
            this.check(role)
        })
    }
}


/*---------------------------------------------------------------------
 * Objects and links
 * --------------------------------------------------------------------
 */

class ObjectChecker extends Checker {

    elementLabel(object) {
        let className
        if (object.classifier instanceof type.Element) {
            className = object.classifier.name
        } else if (object.classifier === null ) {
            className = '?'
        } else {
            className = object.classifier
        }
        return {
            text:
                ( object.name ? object.name : '?')
                + ' : '
                + className,
            element: object
        }
    }

    checkName(object) {
        if (object.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing object name for ',
                    this.elementLabel(object)])
        } else if (! object.name.match(RE_camelCase)) {
            this.error(
                [
                    'Object name ',
                    this.elementLabel(object),
                    ' must be in camlCase'])
        }
    }

    checkClass(object) {
        if (object.classifier instanceof type.Element) {
           if (! object.classifier.name.match(RE_CamelCase)) {
                this.error(
                    [
                        'Object ',
                        this.elementLabel(object),
                        ' class name must be in camlCase'])
            }
        } else if (object.classifier === null ) {
            this.error(
                [
                    'Missing class for object ',
                    this.elementLabel(object)])
        } else {
            // TODO: fix string => Class
            if (! object.classifier.match(RE_CamelCase)) {
                this.error(
                    [
                        'Class name of object  ',
                        this.elementLabel(object),
                        ' must be in camlCase'])
            }
        }
    }

    checkSlots(object) {
        object.slots.forEach( slot => {
            this.registry.checkers['slot'].check(slot)
        })
    }

    check(object) {
        this.startCheckingElement(object)
        this.checkName(object)
        this.checkClass(object)
        this.checkSlots(object)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLObject').forEach( object => {
            this.check(object)
        })
    }
}


RE_value = /^((-?\d+)|(-?\d+\.\d+)|(true|false)|('(\\'|[^'])*')|(null|Undefined|(_*[A-Z]\w*\:\:_*[a-z]\w*)))$/


class SlotChecker extends Checker {

    elementLabel(slot) {
        const object_ = slot._parent
        return {
            text:
                ( object_.name ? object_.name : '?' )
                + '.' + ( slot.name ? slot.name : '?' )
                + ' = ' + ( slot.value ? slot.value : '?' ),
            element: slot
        }
    }

    checkName(slot) {
        if (slot.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing slot name for ',
                    this.elementLabel(slot)])
        } else if (! slot.name.match(RE_camelCase)) {
            this.error(
                [
                    'Slot name "',
                    slot.name,
                    '" must be in camlCase in slot ',
                    this.elementLabel(slot)])
        }
    }

    checkValue(slot) {
        if (! slot.value.match(RE_value)) {
            this.error(
                [
                    'Slot ',
                    this.elementLabel(slot),
                    ' has an incorrect value.'])
        }
    }

    checkVisibility(slot)  {
        // Currently, this attribute is not used
        // P3 Check or fix this value
    }

    checkDefiningFeature(slot) {
        // Currently, this attribute is not used
        // P3 Check or fix this value
    }

    checkType(slot) {
        // Currently, this attribute is not used
        // P3 Check or fix this value
    }

    check(slot) {
        this.startCheckingElement(slot)
        this.checkName(slot)
        this.checkValue(slot)
        this.checkVisibility(slot)
        this.checkDefiningFeature(slot)
        this.checkType(slot)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLSlot').forEach( slot => {
            this.check(slot)
        })
    }

}


/*---------------------------------------------------------------------
 * Links and role
 * --------------------------------------------------------------------
 */

class LinkChecker extends Checker {

    elementLabel(link) {
        return {
            text:
                '('
                + ( link.end1.reference.name ? link.end1.reference.name : '?')
                + ' -- ' + link.name + ' -- '
                + ( link.end2.reference.name ? link.end2.reference.name : '?')
                + ')',
            element: link
        }
    }

    checkName(link) {
        if (link.name.match(RE_Blank)) {
            this.error(
                [
                    'Missing association name on link ',
                    this.elementLabel(link)])
        } else if (! link.name.match(RE_CamelCase)) {
            this.error(
                [
                    'Association name on link ',
                    this.elementLabel(link),
                    ' must be in CamlCase'])
        }
    }

    checkLinkEnds(link) {
        this.registry.checkers['linkEnd'].check(link.end1)
        this.registry.checkers['linkEnd'].check(link.end2)
    }

    check(link) {
        this.startCheckingElement(link)
        this.checkName(link)
        this.checkLinkEnds(link)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLLink').forEach( link => {
            this.check(link)
        })
    }
}


class LinkEndChecker extends Checker {

    elementLabel(linkEnd) {
        const position = (
            linkEnd._parent.end1 === linkEnd ? "source" : 'target')
        return {
            text:
                position
                + ' of '
                + this.registry.checkers["link"].elementLabel(linkEnd._parent),
            element: linkEnd
        }
    }

    checkName(linkEnd) {
        if (linkEnd.name) {
            this.error(
                [
                    'Link end name must be left empty (current limitation). Found "',
                    linkEnd.name,
                    '". ',
                    this.elementLabel(linkEnd)
                    ])
        }
    }

    check(linkEnd) {
        this.startCheckingElement(linkEnd)
        this.checkName(linkEnd)
        this.stopCheckingElement()
    }

    checkAll() {
        app.repository.select('@UMLLinkEnd').forEach( linkEnd => {
            this.check(linkEnd)
        })
    }

}


class CheckerRegistry {

    constructor(debug, eventFns) {
        this.debug = debug
        this.eventFns = eventFns
        this.errorNumber = 0
        this.checkers = {}
        this.checkers['class'] = new ClassChecker(this)
        this.checkers['attribute'] = new AttributeChecker(this)
        this.checkers['enumeration'] = new EnumerationChecker(this)
        this.checkers['literal'] = new LiteralChecker(this)
        this.checkers['regularAssociation'] = new RegularAssociationChecker(this)
        this.checkers['role'] = new RoleChecker(this)
        this.checkers['object'] = new ObjectChecker(this)
        this.checkers['slot'] = new SlotChecker(this)
        this.checkers['link'] = new LinkChecker(this)
        this.checkers['linkEnd'] = new LinkEndChecker(this)
    }

    doCheck() {
        if (this.debug) {
            console.log('>>> Checking model >>>')
        }
        this.checkers['class'].checkAll()
        this.checkers['enumeration'].checkAll()
        this.checkers['regularAssociation'].checkAll()
        this.checkers['object'].checkAll()
        this.checkers['link'].checkAll()
        if (this.debug) {
            console.log('<<< model checked <<<')
        }
    }

    error(tokenMessage) {
        this.errorNumber++
        let output = ''

        if (Array.isArray(tokenMessage)) {
            tokenMessage.forEach(token => {
                if (typeof token === 'string') {
                    output += token
                } else if (
                    (typeof token === 'object')
                    && (typeof token.text === 'string')
                    && (token.element instanceof type.Element)) {
                    output += (
                        '<a href="#" element_ref="'
                        + token.element._id
                        + '">'
                        + token.text
                        + '</a>')
                } else {
                    throw new Error('Internal error. Token of error message is incorrect')
                }
            })
        } else {
            throw new Error('Internal error. Message is incorrect')
        }
        if (this.eventFns && this.eventFns["onError"]) {
            this.eventFns["onError"](output)
        }
        // console.warn('[CHECKER]: ' + output)
    }



    isCheckSuccessful() {
        return this.errorNumber ===  0
    }

}


exports.CheckerRegistry = CheckerRegistry


