const { asString } = require("./models")



const TEST_ASSERT = true

export const F = 'fail'
export const E = 'error'
export const W = 'warning'
export const L = 'log'
export const Q = 'question'

export function affirm(mode, condition, value, label = 'affirm') {
    console.log('A', mode, condition, value, label)
    if (condition) {
        return true
    } else {
        if (mode === Q) {
            return false
        }
        const message = label +'(' +asString(value)+')'
        if (mode === L) {
            console.log('Affirmation failed: '+message, value)
            return false
        } else if (mode === W) {
            console.warn('Affirmation failed: '+message, value)
            return false
        } else if (mode === E) {
            console.error('Affirmation failed: ' + message, value)
            return false
        } else if (mode === F) {
            console.error('Affirmation failed: ' + message, value)
            throw new Error(
                'Affirmation failed: ' + message + asString(value))
        } else {
            throw new Error ('Affirm(): mode "'+mode+'" is unvailable')
        }
    }
}

// affirm({a:3,b:[]})

export function isDefined(value, mode= F) {
    console.log('B', value, mode)
    return affirm (
        mode,
        (value !== null && value !== undefined),
        value,
        'isDefined')
}

if (TEST_ASSERT) {
    isDefined('34')
    ! isDefined(null, Q)
    ! isDefined(undefined, Q)
}

export function isJSONEquals(value1, value2, mode=F) {
    return affirm (
        mode,
        JSON.stringify(value1) === JSON.stringify(value2),
        [value1, value2],
        'isJSONEquals')
}

export function isString(value, option = null, mode= F) {
    if (value === undefined || value === null) {
        return affirm(
            mode,option === '?', value, 'isDefinedString')
    } else
        return affirm (
            mode, (typeof value === 'string'), value, 'isString')
}


if (TEST_ASSERT) { // TEST:
    isString('hello')
    isString('')
    ! isString(5, '!', Q)
    ! isString([], '!', Q)
    ! isString(undefined, '!', Q)
    isString(null, '?', Q)
    isString(undefined, '?', Q)
}

export function isArray(value, option = null, mode=F) {
    if (value === undefined || value === null) {
        return affirm(
            mode, option === '?', value, 'isDefinedArray')
    } else {
        return affirm(
            mode,
            (((! isDefined(value)) && (option === '?'))
                || Array.isArray(value)),
            value,
            'isArray')
    }
}

if (TEST_ASSERT) {
    isArray([])
    isArray([4, 3])
    isArray([{a: 3, b: 5}])
    isArray(null, '?')
    isArray(undefined, '?')
    !isArray(undefined, '!',  Q)
    !isArray('hello', '!', Q)
    !isArray('', '!', Q)
    !isArray(5, '!', Q)
}

export function isObject(value, option = null, mode=F) {
    if (value === undefined || value === null) {
        return affirm(
            mode, option === '?', value, 'isDefinedObject')
    } else {
        return affirm(
            mode,
            (((!isDefined(value)) && (option === '?'))
                || (typeof value === 'object'
                    && !Array.isArray(value))),
            value,
            'isObject')
    }
}

if (TEST_ASSERT) {
    isObject({a: 3, b: 5})
    isObject({})
    isObject(null, '?')
    isObject(undefined, '?')
    !isObject('hello', '!', Q)
    !isObject('','!', Q)
    !isObject(5, '!', Q)
    !isObject([], '!', Q)
    !isObject([4, 3], '!', Q)
    !isObject(undefined, '!', Q)
}

export function isFunction(value, mode='F') {
        return affirm(
            mode,
            (typeof value === 'function'),
            value,
            'isFunction')
}

// exports.F = F
// exports.E = E
// exports.W = W
// exports.L = L
// exports.Q = Q
// exports.affirm = affirm
// exports.isDefined = isDefined
// exports.isArray = isArray
// exports.isObject = isObject
// exports.isFunction = isFunction
