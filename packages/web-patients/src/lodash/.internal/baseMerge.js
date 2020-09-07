import Stack from './Stack.js';
import assignMergeValue from './assignMergeValue.js';
import baseFor from './baseFor.js';
import baseMergeDeep from './baseMergeDeep.js';
import isObject from '../isObject.js';
import keysIn from '../keysIn.js';

/**
 * The base implementation of `merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(
    source,
    (srcValue, key) => {
      if (isObject(srcValue)) {
        stack || (stack = new Stack());
        baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
      } else {
        let newValue = customizer
          ? customizer(object[key], srcValue, `${key}`, object, source, stack)
          : undefined;

        if (newValue === undefined) {
          newValue = srcValue;
        }
        assignMergeValue(object, key, newValue);
      }
    },
    keysIn
  );
}

export default baseMerge;
