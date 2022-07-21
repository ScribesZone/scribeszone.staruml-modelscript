"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterByKeyValue = exports.arrayEquals = void 0;
var DEBUG = true;
var TEST_ASSERT = true;
//-------------------------------------------------------------------------
//  Collections
//-------------------------------------------------------------------------
function sum(array) {
    //TODO: RESTORE    console.assert(isArray(array))
    return array.reduce(function (total, b) { return total + b; }, 0);
}
if (TEST_ASSERT) {
    console.assert(sum([]) === 0);
    console.assert(sum([2, 5]) === 7);
}
function arrayEquals(a, b, sort) {
    if (sort === void 0) { sort = false; }
    var x = a;
    if (sort) {
        x.sort();
    }
    var y = b;
    if (sort) {
        b.sort();
    }
    return a.every(function (val, index) { return val === b[index]; });
}
exports.arrayEquals = arrayEquals;
if (TEST_ASSERT) {
    console.assert(arrayEquals([1, 2, 3], [1, 2, 3], true) === true);
    console.assert(arrayEquals([3, 2], [2, 3], true) === true);
    console.assert(arrayEquals([1, 2], [1, 3]) === false);
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
function filterByKeyValue(object, keyValuePredicate) {
    return (Object.fromEntries(Object.entries(object)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return keyValuePredicate(key, value);
    })));
}
exports.filterByKeyValue = filterByKeyValue;
if (TEST_ASSERT) {
    var _noezarwin = { firstname: 'noe', lastname: 'zarwin', age: 30 };
    var _keys_1 = ['firstname', 'age'];
    var _result232 = (filterByKeyValue(_noezarwin, (function (key, value) {
        return _keys_1.includes(key) && typeof value === 'number';
    })));
    //TODO RESTORE          console.assert(jsonEquals(_result232, {age: 30}))
}
/**
 * Indicates if the first array includes all elements in the second array.
 * @param big that array that could includes all elements
 * @param small the array of elements that could be included
 * @returns {*}
 */
function includesAll(big, small) {
    return small.every(function (v) { return big.includes(v); });
}
//# sourceMappingURL=misc.js.map