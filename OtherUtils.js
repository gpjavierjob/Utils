/**
 * Valida si obj es de tipo object y si implementa todas las funciones
 * cuyos nombres están en methods.
 *  
 * @param {*} obj Objeto a validar
 * @param {string[]} methods Lista de nombres de funciones a validar
 * @return {boolean}
 */
function _validate(obj, methods) {
  try {
    if (!obj || typeof obj !== 'object') return false;
    return methods.every(method => typeof obj[method] === 'function');
  } catch (e) {
    return false;
  }
}

/**
 * Valida si un objeto es un Map
 * 
 * @param {*} map Objeto a validar
 * @return {boolean}
 */
function isMap(map) {
  return this._validate(map, ['entries', 'get', 'set', 'has', 'delete'])
}
