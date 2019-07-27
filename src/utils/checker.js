export function isLowerCaseChar(char) {
  if (char === char.toLowerCase()) return '0';
  return '1';
}

export function isNumber(value) {
  return (
    !isNaN(value) ||
    typeof value === 'number' ||
    (isObjectLike(value) && getTag(value) === '[object Number]')
  );
}

export function isObject(value) {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
}

export function isFunction(value) {
  if (!isObject(value)) {
    return false
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  const tag = getTag(value);
  return (
    tag === '[object Function]' ||
    tag === '[object AsyncFunction]' ||
    tag === '[object GeneratorFunction]' ||
    tag === '[object Proxy]'
  );
}

/* ====================================================================
                          INTERNAL METHODS
   ==================================================================*/
function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}