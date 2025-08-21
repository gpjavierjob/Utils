/**
 * Valida si un objeto es un Spreadsheet de Google Sheets
 * 
 * @param {*} obj Objeto a validar
 * @return {boolean}
 */
function isSpreadsheet(obj) {
  return this._validate(obj, ['getId', 'getUrl', 'getName', 'getSheets', 'copy']);
}

/**
 * Valida si un objeto es una Sheet de Google Sheets
 * 
 * @param {*} obj Objeto a validar
 * @return {boolean}
 */
function isSheet(obj) {
  return this._validate(obj, ['getName', 'getParent', 'getRange', 'getSheetId', 'getDataRange']);
}

/**
 * Valida si un objeto es un Range de Google Sheets
 * 
 * @param {*} obj Objeto a validar
 * @return {boolean}
 */
function isRange(obj) {
  return this._validate(obj, ['getA1Notation', 'getValues', 'setValues', 'getSheet', 'getRow', 'getColumn']);
}

/**
 * Valida si un objeto es un NamedRange de Google Sheets
 * 
 * @param {*} obj Objeto a validar
 * @return {boolean}
 */
function isNamedRange(obj) {
  return this._validate(obj, ['getName', 'getRange', 'setName', 'setRange', 'remove']);
}

/**
 * @typedef {'string' | 'float' | 'integer' | 'boolean' | 'date'} CellValueType
 */

const cellValueTypes = ['string', 'float', 'integer', 'boolean', 'date'];

/**
 * @typedef {Object} Normalizers
 * @property {function(any): any=} string
 * @property {function(any): any=} float
 * @property {function(any): any=} integer
 * @property {function(any): any=} boolean
 * @property {function(any): any=} date
 */

/**
 * @type {Normalizers}
 */
const normalizers = {
  string: normalizeString,
  float: normalizeFloat,
  integer: normalizeInteger,
  boolean: normalizeBoolean,
  date: normalizeDate,
};

/**
 * Devuelve el normalizador asociado al tipo indicado.
 * 
 * @param {string} type Tipo ('string','float','integer','boolean','date')
 * @returns {function} Función normalizadora
 */
function getNormalizer(type){
  if (!cellValueTypes.includes(type)) {
    throw new Error(`El parámetro 'type' debe ser uno de: ${cellValueTypes.join(', ')}`);
  }

  return normalizers[type];
}

/**
 * Devuelve el valor proporcionado normalizado como cadena. Si el valor
 * no posee el formato de cadena, se devuelve una cadena vacía.
 * 
 * @param {any} value El valor de la celda a convertir.
 * @returns {string} Valor de cadena. Es una cadena vacía si no cumple con el formato.
 */
function normalizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Devuelve el valor proporcionado normalizado como entero. Si el valor
 * no posee el formato de número, se devuelve *null*.
 * 
 * @param {any} value El valor de la celda a convertir.
 * @returns {number|null} Valor numérico o *null*, si no cumple con el formato.
 */
function normalizeInteger(value) {
  try {
    const n = parseInt(value);
    return isNaN(n) ? null : n;

  } catch (error) {
    console.warn(`Error en normalizeInteger: ${error.message}`);
    return null;
  }
}

/**
 * Devuelve el valor proporcionado normalizado como decimal. Si el valor
 * no posee el formato decimal válido, se devuelve *null*.

 * @param {any} value El valor de la celda a convertir.
 * @returns {number|null} Valor numérico o *null*, si no cumple con el formato.
 */
function normalizeFloat(value) {
  try {
    if (value === null || value === undefined) return null;

    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
      value = value.trim();

      if (value.includes(',') && value.includes('.')) {
        if (value.indexOf(',') < value.indexOf('.')) {
          // Si la coma está antes del punto, probablemente es formato inglés: "1,234.56"
          value = value.replace(/,/g, '');
        } else {
          // Si el punto está antes de la coma, probablemente es formato español: "1.234,56"
          value = value.replace(/\./g, '').replace(',', '.');
        }
      } else if (value.includes(',')) {
        // Si solo tiene coma, asumimos que es decimal en formato español
        value = value.replace(',', '.');
      } else if (value.includes('.')) {
        // Solo punto: formato inglés estándar, no se transforma
      }

      const n = parseFloat(value);
      return isNaN(n) ? null : n;
    }

    return null;

  } catch (error) {
    console.warn(`Error en normalizeFloat:${error.message}`);
    return null;
  }
}

/**
 * Devuelve el valor proporcionado normalizado como date. Si el valor
 * no posee el formato de date, se devuelve null. Cuidado al 
 * establecer valores en una planilla puesto que la fecha devuelta
 * es UTF; primero debe convertirse al formato local de la planilla.
 * 
 * @param {any} value El valor de la celda a convertir.
 * @returns {Date|null} Objeto Date UTF o null si no es válido.
 */
function normalizeDate(value) {
  try {
    let date = null;

    if (isDate(value)) {
      date = new Date(value); // Crear copia para no modificar el original
    } else if (typeof value === 'string') {
      if (isISODateString(value)) {
        const newDate = new Date(value);
        if (!isNaN(newDate.getTime())) {
          date = newDate;
        }
      } else if (isDDMMYYYY(value)) {
        date = parseDDMMYYYY(value);
      }
    } else if (typeof value === 'number') {
      const days = Math.floor(value);
      const newDate = new Date(1899, 11, 30); // 1899-12-30 en zona horaria local
      newDate.setDate(newDate.getDate() + days);
      date = newDate;
    }

    if (date) date.setHours(0, 0, 0, 0);

    return date;

  } catch (error) {
    console.warn(`Error en normalizeDate: ${error.message}`);
    return null;
  }
}

/**
 * Devuelve el valor proporcionado normalizado como boolean. Si el valor
 * no posee el formato de boolean, se devuelve null.
 * 
 * @param {any} value El valor de la celda a convertir.
 * @returns {boolean|null} Objeto boolean o null si no es válido.
 */
function normalizeBoolean(value) {
  try {
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (['true', '1', 'sí', 'si', 'yes', 'y'].includes(v)) return true;
      if (['false', '0', 'no', 'n'].includes(v)) return false;
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    return null;

  } catch (error) {
    console.warn(`Error en normalizeBoolean: ${error.message}`);
    return null;
  }
}

/**
 * Compara dos valores considerando números, fechas, horas, booleanos y strings.
 *
 * @param {any} a Primer valor.
 * @param {any} b Segundo valor.
 * @param {CellValueType} [type] Tipo opcional ('string','float','integer','boolean','date'). Si no se pasa, se detecta automáticamente.
 * @returns {boolean} true si los valores son equivalentes.
 * @throws {Error} Si 'type' es inválido o 'a' y 'b' no son comparables.
 */
function areEqual(a, b, type) {
  if (type !== undefined && !cellValueTypes.includes(type)) {
    throw new Error(`El parámetro 'type' debe ser uno de: ${cellValueTypes.join(', ')}`);
  }

  const isValidValue = (v) => {
    if (v === null || v === undefined) return true;

    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return true;

    if (isDate(v)) return true;

    return false;
  };

  if (!isValidValue(a) || !isValidValue(b)) {
    throw new Error("Los valores de los parámetros 'a' y 'b' deben ser comparables: string, number, boolean, Date, null o undefined.");
  }

  try {
    const detectType = (v) => {
      if (v === null || v === undefined) return null;
      if (isDate(v)) return 'date';
      if (typeof v === 'boolean') return 'boolean';
      if (typeof v === 'number') return 'float'; // flotante por defecto
      if (typeof v === 'string') return 'string';
      return null;
    };

    const typeA = detectType(a);
    const typeB = detectType(b);

    const resolvedType = type || typeA !== 'string' ? typeA : null || typeB || 'string';
    const normalizer = normalizers[resolvedType] || (v => v);

    const normA = normalizer(a);
    const normB = normalizer(b);

    if (resolvedType === 'date') {
      if (normA === null && normB === null) return true;
      if (normA === null || normB === null) return false;
      return normA.getTime() === normB.getTime();
    }

    if (resolvedType === 'float' || resolvedType === 'integer' || resolvedType === 'boolean') {
      return normA === normB;
    }

    // Strings
    return String(normA).trim() === String(normB).trim();

  } catch (error) {
    console.warn(`Error en areEqual: ${error.message}`);
    return null;
  }
}

/**
 * Devuelve un arreglo con los valores de una columna. Permite
 * procesar los datos mediante handlers opcionales. El orden de ejecución 
 * de los handlers es el siguiente:
 *  1. Se ejecuta handlers.filterRowFn sobre todas las filas de la sheet.
 *     Si no se proporciona, se devuelven todas las filas
 *  2. Se extraen los valores de las celdas correspondientes a la columna 
 *     columnNumber de las filas resultantes del paso 1 y se ejecuta 
 *     handlers.formatCellValueFn sobre cada uno. Si no se proporciona,
 *     se devuelven los valores originales.
 *  3. Se ejecuta handlers.filterCellFn sobre las celdas resultantes
 *     del paso 2. Si no se proporciona, se devuelven todas las celdas.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Hoja.
 * @param {number} columnNumber Índice de la columna (base 0).
 * @param {{
 *   filterRowsFn?: (row: any[]) => boolean,
 *   formatCellValueFn?: (cell: any) => any,
 *   filterCellsFn?: (cell: any) => boolean
 * }} handlers Objeto con funciones de procesamiento opcionales.
 * @returns {any[]} Arreglo de valores de la columna después de ser formateados y filtrados.
 */
function getValuesFromColumn(sheet, columnNumber, handlers = {}) {
  if (!isSheet(sheet)) {
    console.warn('El parámetro "sheet" no es válido.');
    return null;
  }
  
  if (!Number.isInteger(columnNumber) || columnNumber < 0) {
    console.warn('El parámetro "columnNumber" no es válido.');
    return null;
  }

  try {
    const dataRange = sheet.getDataRange();
    const rowsCount = dataRange.getNumRows();
    const colsCount = dataRange.getNumColumns();
    if (rowsCount === 0 || colsCount === 0 ||
        // La hoja es nueva
        (rowsCount === 1 && colsCount === 1)) {
      return [];
    }

    const rows = dataRange.getValues();

    if (columnNumber >= rows[0].length) {
      console.warn(`La columna ${columnNumber} no existe en la hoja`);
      return null;
    }

    // Procesamiento con funciones opcionales
    const filteredRows = handlers?.filterRowsFn
      ? rows.filter((row, index, array) => handlers.filterRowsFn(row, index, array)) 
      : rows;

    const cells = filteredRows.map(row => handlers?.formatCellValueFn
      ? handlers.formatCellValueFn(row[columnNumber]) 
      : row[columnNumber]
    );

    const filteredCells = handlers?.filterCellsFn
      ? cells.filter((cell, index, array) => handlers.filterCellsFn(cell, index, array)) 
      : cells;

    return filteredCells;

  } catch (error) {
    console.warn(`Error en getValuesFromColumn: ${error.message}`);
    return null;
  }
}

/**
 * Devuelve el conjunto de valores de una columna, sin duplicados. Permite
 * procesar los datos mediante handlers opcionales. El orden de ejecución 
 * de los handlers es el siguiente:
 *  1. Se ejecuta handlers.filterRowFn sobre todas las filas de la sheet.
 *     Si no se proporciona, se devuelven todas las filas
 *  2. Se extraen los valores de las celdas correspondientes a la columna 
 *     columnNumber de las filas resultantes del paso 1 y se ejecuta 
 *     handlers.formatCellValueFn sobre cada uno. Si no se proporciona,
 *     se devuelven los valores originales.
 *  3. Se ejecuta handlers.filterCellFn sobre las celdas resultantes
 *     del paso 2. Si no se proporciona, se devuelven todas las celdas.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Hoja.
 * @param {number} columnNumber Índice de la columna. Comienza en 0.
 * @param {{
 *   filterRowsFn?: (row: any[]) => boolean,
 *   formatCellValueFn?: (cell: any) => any,
 *   filterCellsFn?: (cell: any) => boolean
 * }} handlers Objeto con funciones de manejo.
 * @returns {Set} Conjunto de valores de la columna después de ser formateados y filtrados.
 */
function getUniqueValuesFromColumn(sheet, columnNumber, handlers) {
  const result = getValuesFromColumn(sheet, columnNumber, handlers);
  return result ? new Set(result) : null;
}

/**
 * Escribe el contenido de una matriz de datos en una hoja. Las líneas de la matriz pueden tener
 * diferente cantidad de elementos.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Hoja de destino
 * @param {string[][]} table Matriz de datos.
 * @param {Object} [options] Opciones personalizadas
 * @param {number} [options.startRow=1] Fila inicial donde comenzar a escribir (base 1)
 * @param {number} [options.startCol=1] Columna inicial donde comenzar a escribir (base 1)
 * @throws {Error} Si la hoja o la tabla no son válidas
 */
function writeTableToSheet(sheet, table, options = {}) {
  if (!isSheet(sheet)) {
    throw new Error("El parámetro 'sheet' no es un objeto Sheet válido.");
  }

  if (!Array.isArray(table)) throw new Error("El parámetro 'table' no es una matriz de datos.");

  // Encontrar el máximo ancho necesario
  const maxWidth = Math.max(...table.map(row => {
    if (!Array.isArray(row)) {
      throw new Error("El parámetro 'table' no es una matriz de datos.");
    } 
    return row.length
  }));
  
  try {
    const output = table.map(row => {
      const paddedRow = new Array(maxWidth).fill('');
      row.forEach((val, i) => paddedRow[i] = val);
      return paddedRow;
    });

    const startRow = options.startRow ?? 1;
    const startCol = options.startCol ?? 1;

    // Escribir todo de una sola vez
    if (output.length > 0) {
      sheet.getRange(startRow, startCol, output.length, maxWidth).setValues(output);
    }

  } catch (error) {
    console.error(`Error en writeTableToSheet: ${error.message}`);
    throw error;
  }
}

/**
 * Obtiene una hoja por nombre desde una Spreadsheet, o la crea si no existe.
 *
 * @param {GoogleAppsScript.Spreadsheet} spreadsheet Objeto Spreadsheet
 * @param {string} sheetName Nombre de la hoja a buscar o crear
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} Hoja existente o recién creada
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  if (!isSpreadsheet(spreadsheet)) {
    throw new Error("El parámetro 'spreadsheet' no es un objeto SpreadsheetApp.Spreadsheet válido.");
  }

  if (typeof sheetName !== "string" || !sheetName.trim()) {
    throw new Error("El nombre de la hoja debe ser un string no vacío.");
  }

  try {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    return sheet;

  } catch (error) {
    console.error(`Error en getOrCreateSheet: ${error.message}`);
    throw error;
  }
}

/**
 * Construye la dirección de un rango horizontal a partir del nombre
 * de la hoja, los números de línea y columna de la celda inicial y
 * la cantidad de celdas en el rango.
 * 
 * @param {string} sheetName Nombre de la hoja
 * @param {number} row Número (base 1) de línea de la celda inicial 
 * @param {number} startCol Número (base 1) de columna de la celda inicial 
 * @param {number} length Cantidad de celdas en el rango 
 * @returns {string} Dirección del rango (A1 notation)
 */
function buildRowRangeAddress(sheetName, row, startCol, length) {
  if (typeof sheetName !== 'string' || sheetName.trim() === '') {
    throw new Error("El parámetro 'sheetName' debe ser una cadena no vacía.");
  }
  if (!Number.isInteger(row) || row <= 0) {
    throw new Error("El parámetro 'row' debe ser un número entero positivo (base 1).");
  }
  if (!Number.isInteger(startCol) || startCol <= 0) {
    throw new Error("El parámetro 'startCol' debe ser un número entero positivo (base 1).");
  }
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("El parámetro 'length' debe ser un número entero positivo.");
  }

  try {
    const colStartA1 = columnToLetter(startCol);
    const safeSheetName = sheetName.includes(' ') ? `${sheetName}` : sheetName;

    if (length === 1) {
      return `${safeSheetName}!${colStartA1}${row}`;
    }

    const colEndA1 = columnToLetter(startCol + length - 1);
    return `${safeSheetName}!${colStartA1}${row}:${colEndA1}${row}`;

  } catch (error) {
    console.error(`Error en buildRowRangeAddress: ${error.message}`);
    throw error;
  }
}


/**
 * Convierte un número de columna a letra (A1 notation)
 *
 * @param {number} col Número de columna
 * @returns {string} Dirección de la columna (A1 notation) 
 */
function columnToLetter(col) {
  let letter = '';
  while (col > 0) {
    const mod = (col - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

/**
 * Anexa filas a una planilla. Si la planilla está vacía, adiciona títulos.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Hoja de cálculo destino.
 * @param {any[][]} rows Filas a anexar.
 * @param {string[]} columnTitles Títulos de columnas a insertar si la hoja está vacía.
 */
function appendRowsToSheet(sheet, rows, columnTitles) {
  if (!isSheet(sheet)) {
    throw new Error("El parámetro 'sheet' no es válido.");
  }

  if (!Array.isArray(rows)) {
    throw new Error("El parámetro 'rows' no es válido.");
  }

  if (!Array.isArray(columnTitles) || columnTitles.some(r => typeof r !== 'string')) {
    throw new Error("El parámetro 'sortCriteria' no es válido.");
  }

  if (rows.length === 0) return;

  try {
    let lastRow = sheet.getLastRow();

    if (lastRow === 0 && columnTitles.length > 0) {
      sheet.appendRow(columnTitles);
      lastRow = 1;
    }

    // Reemplazar "__ROW__" por el número de fila real antes de insertar
    const processedRows = rows.map((row, i) => {
      const rowIndex = lastRow + 1 + i;
      return row.map(cell => {
        return (typeof cell === 'string' && cell.includes('__ROW__'))
          ? cell.replace(/__ROW__/g, rowIndex)
          : cell;
      });
    });

    sheet.getRange(lastRow + 1, 1, processedRows.length, processedRows[0].length)
              .setValues(processedRows);

  } catch (error) {
    console.warn(`Error al anexar líneas a la hoja '${sheet.getName()}': ${error.message}`);
    throw error;
  }
}

/**
 * Actualiza filas en una planilla. Debe asegurarse que los valores de la columna
 * clave sean únicos. Se asume que la planilla al menos tiene una fila de títulos
 * y otra de datos. Los registros deben proporcionar valores o fórmulas para las
 * columnas que se desean modificar y undefined para las que no. En las fómulas
 * se sustituye automáticamente el patrón __ROW__ por el número (base 1) de la 
 * fila correspondiente.  
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Hoja de cálculo destino.
 * @param {number} keyColumn Índice (0-based) de la columna clave.
 * @param {CellValueType} keyType Tipo de datos de la columna llave.
 * @param {{ key: any, row: any[] }[]} rowsMap Arreglo de objetos que contienen como llave 
 * el número de fila a actualizar y como valor un arreglo con los nuevos datos de la fila.
 * @returns {number} Cantidad de líneas actualizadas
 */
function updateRowsInSheet(sheet, keyColumn, keyType, rowsMap) {
  if (!isSheet(sheet)) {
    throw new Error("El parámetro 'sheet' no es válido.");
  }

  if (!Number.isInteger(keyColumn) || keyColumn < 0) {
    throw new Error("El parámetro 'keyColumn' no es válido.");
  }

  if (typeof keyType !== 'string' && !cellValueTypes.includes(type)) {
    throw new Error(`El parámetro 'type' no es válido. Su valor debe ser uno de: ${cellValueTypes.join(', ')}`);
  }

  if (!Array.isArray(rowsMap)) {
    throw new Error("El parámetro 'rowsMap' no es válido.");
  }

  try {
    if (rowsMap.length === 0) return 0;

    const sheetLastRow = sheet.getLastRow();

    if (sheetLastRow < 2) return 0;

    const keyColumnIndex = keyColumn + 1;
    const numColumns = rowsMap[0].row.length;

    // Obtener todas las claves de la hoja (asumiendo títulos en la fila 1)
    const keyValues = sheet
      .getRange(2, keyColumnIndex, sheetLastRow - 1)
      .getValues()
      .flat();

    const normalizeKey = normalizers[keyType] || (v => v);

    // Mapa de clave -> número de fila (real en hoja, base 1)
    const keyToRowMap = new Map();
    keyValues.forEach((key, i) => {
      if (key !== '' && key !== null && key !== undefined) {
        keyToRowMap.set(normalizeKey(key), i + 2); // +2 porque empieza en fila 2
      }
    });

    const updateResults = rowsMap.map(({ key, row: incomingRow }) => {
      const targetRow = keyToRowMap.get(key);
      if (!targetRow) return 0;

      const range = sheet.getRange(targetRow, 1, 1, numColumns);
      const [originalRow] = range.getValues();

      // Comparar solo celdas definidas
      const hasChanges = incomingRow.some((val, i) => {
        if (val === undefined) return false;
        return !areEqual(val, originalRow[i]);
      });

      if (!hasChanges) return 0;

      // Reemplazo de "__ROW__" si aplica
      const processedRow = incomingRow.map(cell => 
        typeof cell === 'string' && cell.includes('__ROW__')
          ? cell.replace(/__ROW__/g, targetRow)
          : cell
      );

      const finalRow = originalRow.map((val, i) => 
        processedRow[i] === undefined ? val : processedRow[i]
      );

      range.setValues([finalRow]);
      
      return 1;
    });

    return updateResults.reduce((acc, v) => acc + v, 0);

  } catch (error) {
    console.warn(`Error al actualizar líneas de la hoja '${sheet.getName()}': ${error.message}`);
    throw error;
  }
}

/**
 * @typedef {Object} SortCriterion
 * @property {number} column Número de columna (comenzando en 1; A=1, B=2, etc.).
 * @property {boolean} ascending `true` para ascendente, `false` para descendente.
 */

/**
 * Ordena una hoja por múltiples columnas. Usa el filtro si está presente;
 * de lo contrario, ordena el rango manualmente (excluyendo el encabezado).
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Objeto de la hoja a ordenar.
 * @param {SortCriterion[]} sortCriteria Arreglo de criterios de ordenamiento.
 * @returns {void}
 */
function sortSheet(sheet, sortCriteria) {
  if (!isSheet(sheet)) {
    throw new Error("El parámetro 'sheet' no es válido.");
  }

  if (!Array.isArray(sortCriteria)) {
    throw new Error("El parámetro 'sortCriteria' no es válido.");
  }

  if (sortCriteria.length === 0) return;

  const columnCount = sheet.getLastColumn();

  for (let i = 0; i < sortCriteria.length; i++) {
    const criterion = sortCriteria[i];

    if (!criterion || typeof criterion !== 'object') {
      throw new Error("El parámetro 'sortCriteria' no es válido.");
    }

    if (
      !Number.isInteger(criterion.column) ||
      criterion.column < 1 ||
      criterion.column > columnCount
    ) {
      throw new Error(`Criterio de ordenamiento inválido en la posición ${i}: número de columna fuera de rango.`);
    }

    if (typeof criterion.ascending !== "boolean") {
      throw new Error(`Criterio de ordenamiento inválido en la posición ${i}: el valor 'ascending' debe ser booleano.`);
    }
  }

  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    console.warn("No hay suficientes filas para ordenar.");
    return;
  }

  const hadFilter = sheet.getFilter() !== null;

  if (hadFilter) {
    sheet.getFilter().remove();
  }

  try {
    const dataRange = sheet.getRange(2, 1, lastRow - 1, columnCount);
    dataRange.sort(sortCriteria);
  } catch (e) {
    console.warn(`Error al ordenar la hoja '${sheet.getName()}': ${e.message}`);
  } finally {
    if (hadFilter) {
      sheet.getRange(1, 1, 1, columnCount).createFilter();
    }
  }
}
