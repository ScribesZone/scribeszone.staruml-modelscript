import * as fs from 'fs'
import * as path from "path";

const DEBUG = true
const TEST_ASSERT = true


//-------------------------------------------------------------------------
//  Collections
//-------------------------------------------------------------------------

function sum(array) {
//TODO: RESTORE    console.assert(isArray(array))
    return array.reduce((total, b) => total + b, 0)
}

if (TEST_ASSERT) {
    console.assert(sum([]) === 0)
    console.assert(sum([2,5]) === 7)
}


export function arrayEquals<T>(a: Array<T>, b: Array<T>, sort: boolean = false) {
    const x = a
    if (sort) {
        x.sort()
    }
    const y = b
    if (sort) {
        b.sort()
    }
    return a.every((val, index) => val === b[index])
}


if (TEST_ASSERT) {
    console.assert(arrayEquals([1, 2, 3], [1, 2, 3], true) === true)
    console.assert(arrayEquals([3, 2], [2, 3], true) === true)
    console.assert(arrayEquals([1, 2], [1, 3]) === false)
}

/**
 * Filter the entries of an object via a predicate.
 *
 * For instance :
 *
 *      noezarwin = {firstname: 'noe', lastname: 'zarwin', age: 30}
 *      keys = ['firstname', 'age']
 *
 *      returns {age: 30}
 *
 * @param object
 * @param keyValuePredicate
 * @returns {{[p: string]: unknown}}
 */

export function filterByKeyValue(object, keyValuePredicate) {
    return (
        Object.fromEntries(
            Object.entries(object)
                .filter(([key, value]) => keyValuePredicate(key, value))
        )
    )
}

if (TEST_ASSERT) {
    const _noezarwin = {firstname: 'noe', lastname: 'zarwin', age: 30}
    const _keys = ['firstname', 'age']
    const _result232 = (
         filterByKeyValue(
         _noezarwin,
         ((key,value) =>
             _keys.includes(key) && typeof value === 'number')))
//TODO RESTORE          console.assert(jsonEquals(_result232, {age: 30}))
}

/**
 * Indicates if the first array includes all elements in the second array.
 * @param big that array that could includes all elements
 * @param small the array of elements that could be included
 * @returns {*}
 */
function includesAll<T>(big: Array<T>, small: Array<T>) {
    return small.every(v => big.includes(v))
}

