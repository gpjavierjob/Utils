/**
 * Mini framework de testing con helpers, validación de parámetros
 * y resumenes automáticos (por bloque y global).
 */

const __TEST_SUMMARY = {
  total: 0,
  passed: 0,
  failed: 0
};

let __CURRENT_DESCRIBE = null;

/**
 * Agrupa un conjunto de tests bajo un nombre común y muestra 
 * un resumen final del conjunto.
 * @param {string} label Nombre descriptivo del grupo.
 * @param {Function} fn Función que ejecuta las pruebas.
 * @param {boolean} [hideSummary] Indica si no se muestra en resumen final.
 */
function describe(title, fn, hideSummary) {
  console.log(`=== ${title} ===`);

  const prevDescribe = __CURRENT_DESCRIBE;

  __CURRENT_DESCRIBE = {
    title,
    total: 0,
    passed: 0,
    failed: 0
  };

  try {
    fn();
  } catch (e) {
    console.error(`Error en describe "${title}": ${e.message}`);
  }

  const { total, passed, failed } = __CURRENT_DESCRIBE;

  if (!(hideSummary === true)) {
    console.log(`Resumen "${title}": total=${total}, passed=${passed}, failed=${failed}`);
  }
  
  __TEST_SUMMARY.total += total;
  __TEST_SUMMARY.passed += passed;
  __TEST_SUMMARY.failed += failed;

  __CURRENT_DESCRIBE = prevDescribe;
}

/**
 * Ejecuta un test individual.
 * @param {string} label - Descripción del test.
 * @param {Function} fn - Función que ejecuta la prueba.
 */
function it(title, fn) {
  if (!__CURRENT_DESCRIBE) {
    throw new Error("Debe llamarse dentro de un describe");
  }

  __CURRENT_DESCRIBE.total += 1;

  try {
    fn();
    console.log(`✅ ${title}`);
    __CURRENT_DESCRIBE.passed += 1;
  } catch (e) {
    console.error(`❌ ${title} -> ${e.message}`);
    __CURRENT_DESCRIBE.failed += 1;
  }
}

/**
 * Muestra el resumen maestro de todos los tests ejecutados.
 */
function _showMasterSummary() {
  const { total, passed, failed } = __TEST_SUMMARY;
  console.log(`=== RESUMEN MASTER ===`);
  console.log(`Total tests: ${total}, Passed: ${passed}, Failed: ${failed}`);
}

/**
 * Compara dos valores estrictamente y lanza error si no son iguales.
 * @param {*} actual - Valor obtenido.
 * @param {*} expected - Valor esperado.
 * @param {string} [msg] - Mensaje opcional para el error.
 */
function assertEquals(actual, expected, msg) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${msg}\nEsperado: ${expectedStr}\nObtenido: ${actualStr}`);
  }
}

/**
 * Lanza error si la condición no es verdadera.
 * @param {boolean} condition - Condición a evaluar.
 * @param {string} [msg] - Mensaje opcional.
 */
function assertTrue(condition, msg) {
  if (!condition) {
    throw new Error(msg || "La condición debería ser verdadera");
  }
}

/**
 * Lanza error si la condición no es falsa.
 * @param {boolean} condition - Condición a evaluar.
 * @param {string} [msg] - Mensaje opcional.
 */
function assertFalse(condition, msg) {
  if (condition) {
    throw new Error(msg || "La condición debería ser falsa");
  }
}

/**
 * Testea que una función valide correctamente sus parámetros.
 * Si no lanza error cuando no debe, devuelve el resultado para encadenar asserts.
 * 
 * @param {Function} fn - Función a probar.
 * @param {Array} args - Argumentos con los que se llamará a la función.
 * @param {Object} options - Configuración del test.
 * @param {boolean} options.shouldThrow - true si esperamos que falle, false si esperamos que no falle.
 * @param {RegExp|string} [options.message] - Patrón para validar el mensaje de error (opcional).
 * @returns {*} El valor retornado por la función si no lanzó error y no se esperaba error.
 */
function assertFunctionParams(fn, args, shouldThrow, message) {
  let result;
  let passed = false;

  try {
    result = fn(...args);
    if (!shouldThrow) {
      passed = true; // No lanzó error como esperábamos
    }
  } catch (e) {
    if (shouldThrow) {
      if (!message || (message instanceof RegExp ? message.test(e.message) : e.message.includes(message))) {
        passed = true; // Lanzó error como esperábamos
      }
    }
  }

  if (!passed) {
    throw new Error(`${shouldThrow 
      ? 'Esperaba error y no ocurrió, o mensaje incorrecto.' 
      : 'No esperaba error y ocurrió uno.'}`);
  }

  return result;
}

/**
 * Indica el fin de los tests. Imprime el resumen global.
 */
function endTests() {
  _showMasterSummary();
}

/**
 * Ejecuta los tests para todas las utilidades 
 */
function _testAllUtils() {
  _runOtherUtilsTests();
  _runCryptoUtilsTests();
  _runStringUtilsTests();
  _runDateUtilsTests();
  _runDriveUtilsTests();
  _runSheetUtilsTests();
  endTests()
}