"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunction = exports.isObject = exports.isArray = exports.isString = exports.isJSONEquals = exports.isDefined = exports.affirm = exports.Q = exports.L = exports.W = exports.E = exports.F = void 0;
var asString = require("./models").asString;
var TEST_ASSERT = true;
exports.F = 'fail';
exports.E = 'error';
exports.W = 'warning';
exports.L = 'log';
exports.Q = 'question';
function affirm(mode, condition, value, label) {
    if (label === void 0) { label = 'affirm'; }
    console.log('A', mode, condition, value, label);
    if (condition) {
        return true;
    }
    else {
        if (mode === exports.Q) {
            return false;
        }
        var message = label + '(' + asString(value) + ')';
        if (mode === exports.L) {
            console.log('Affirmation failed: ' + message, value);
            return false;
        }
        else if (mode === exports.W) {
            console.warn('Affirmation failed: ' + message, value);
            return false;
        }
        else if (mode === exports.E) {
            console.error('Affirmation failed: ' + message, value);
            return false;
        }
        else if (mode === exports.F) {
            console.error('Affirmation failed: ' + message, value);
            throw new Error('Affirmation failed: ' + message + asString(value));
        }
        else {
            throw new Error('Affirm(): mode "' + mode + '" is unvailable');
        }
    }
}
exports.affirm = affirm;
// affirm({a:3,b:[]})
function isDefined(value, mode) {
    if (mode === void 0) { mode = exports.F; }
    console.log('B', value, mode);
    return affirm(mode, (value !== null && value !== undefined), value, 'isDefined');
}
exports.isDefined = isDefined;
if (TEST_ASSERT) {
    isDefined('34');
    !isDefined(null, exports.Q);
    !isDefined(undefined, exports.Q);
}
function isJSONEquals(value1, value2, mode) {
    if (mode === void 0) { mode = exports.F; }
    return affirm(mode, JSON.stringify(value1) === JSON.stringify(value2), [value1, value2], 'isJSONEquals');
}
exports.isJSONEquals = isJSONEquals;
function isString(value, option, mode) {
    if (option === void 0) { option = null; }
    if (mode === void 0) { mode = exports.F; }
    if (value === undefined || value === null) {
        return affirm(mode, option === '?', value, 'isDefinedString');
    }
    else
        return affirm(mode, (typeof value === 'string'), value, 'isString');
}
exports.isString = isString;
if (TEST_ASSERT) { // TEST:
    isString('hello');
    isString('');
    !isString(5, '!', exports.Q);
    !isString([], '!', exports.Q);
    !isString(undefined, '!', exports.Q);
    isString(null, '?', exports.Q);
    isString(undefined, '?', exports.Q);
}
function isArray(value, option, mode) {
    if (option === void 0) { option = null; }
    if (mode === void 0) { mode = exports.F; }
    if (value === undefined || value === null) {
        return affirm(mode, option === '?', value, 'isDefinedArray');
    }
    else {
        return affirm(mode, (((!isDefined(value)) && (option === '?'))
            || Array.isArray(value)), value, 'isArray');
    }
}
exports.isArray = isArray;
if (TEST_ASSERT) {
    isArray([]);
    isArray([4, 3]);
    isArray([{ a: 3, b: 5 }]);
    isArray(null, '?');
    isArray(undefined, '?');
    !isArray(undefined, '!', exports.Q);
    !isArray('hello', '!', exports.Q);
    !isArray('', '!', exports.Q);
    !isArray(5, '!', exports.Q);
}
function isObject(value, option, mode) {
    if (option === void 0) { option = null; }
    if (mode === void 0) { mode = exports.F; }
    if (value === undefined || value === null) {
        return affirm(mode, option === '?', value, 'isDefinedObject');
    }
    else {
        return affirm(mode, (((!isDefined(value)) && (option === '?'))
            || (typeof value === 'object'
                && !Array.isArray(value))), value, 'isObject');
    }
}
exports.isObject = isObject;
if (TEST_ASSERT) {
    isObject({ a: 3, b: 5 });
    isObject({});
    isObject(null, '?');
    isObject(undefined, '?');
    !isObject('hello', '!', exports.Q);
    !isObject('', '!', exports.Q);
    !isObject(5, '!', exports.Q);
    !isObject([], '!', exports.Q);
    !isObject([4, 3], '!', exports.Q);
    !isObject(undefined, '!', exports.Q);
}
function isFunction(value, mode) {
    if (mode === void 0) { mode = 'F'; }
    return affirm(mode, (typeof value === 'function'), value, 'isFunction');
}
exports.isFunction = isFunction;
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
//# sourceMappingURL=affirm.js.map