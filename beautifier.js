function setAllProperties(type_, properties) {
    const elements = app.repository.select('@'+type_)
    elements.forEach(e =>
        app.engine.setProperties(e, properties)
    )
}

function beautifyUMLClassView(nice) {
    setAllProperties('UMLClassView', {
        showVisibility: ! nice,
        // showProperty:   ! state,
        showType:       nice,
        suppressOperations: nice,
        suppressReceptions: nice,
        fillColor: nice ? '#f6ec9f' : '#3e6ea9',
        fontColor: nice ? '#000000' : '#ffffff',
        lineColor: nice ? '#450f0f' : '#000070'
    })
}

function beautifyUMLEnumerationView(nice) {
    setAllProperties('UMLEnumerationView', {
        fillColor: nice ? '#f2f2d6' : '#adc8ff',
        fontColor: nice ? '#000000' : '#ffffff',
        lineColor: nice ? '#450f0f' : '#000070'
    })
}

function beautifyUMLAssociationView(nice) {
    // add coloring for roles and association name
    // these fields must be used
    //      headMultiplicityLabal
    //      headPropertyLabel
    //      headRoleNameLabel
    //      nameLabel
    //      tailMultiplicityLabal
    //      tailPropertyLabel ?
    //      taildRoleNameLabel
    setAllProperties('UMLAssociationView', {
        showVisibility: ! nice,
        fontColor: nice ? '#000000' : '#ff0000',
        lineColor: nice ? '#450f0f' : '#000070'
    })

}

function beautifyUMLObjectView(nice) {
    setAllProperties('UMLObjectView', {
        showVisibility: ! nice,
        // shwoProperty:   ! state,
        // showType:       nice,
        fillColor: nice ? '#f3dac7' : '#9d00ff',
        fontColor: nice ? '#000000' : '#ffffff',
        lineColor: nice ? '#450f0f' : '#000070'
    })
}

function beautifyUMLLinkView(nice) {
    // add coloring for roles and association name
    // these fields must be used
    //      headMultiplicityLabal
    //      headPropertyLabel
    //      headRoleNameLabel
    //      nameLabel
    //      tailMultiplicityLabal
    //      tailPropertyLabel ?
    //      taildRoleNameLabel
    setAllProperties('UMLLinkView', {
        showVisibility: ! nice,
        fontColor: nice ? '#000000' : '#ff0000',
        lineColor: nice ? '#450f0f' : '#000070'
    })
}

class Beautifier {

    constructor() {
    }

    doBeautify() {
        const nice = true
        beautifyUMLClassView(nice)
        beautifyUMLEnumerationView(nice)
        beautifyUMLAssociationView(nice)
        beautifyUMLObjectView(nice)
        beautifyUMLLinkView(nice)
    }

}

exports.Beautifier = Beautifier