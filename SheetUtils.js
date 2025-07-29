// /**
//  * Utilidades para sheets
//  * @namespace
//  */
// const sheets = (function() {
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
      // Preparar datos para escritura por lotes
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

    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    return sheet;
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

    const colStartA1 = columnToLetter(startCol);
    const safeSheetName = sheetName.includes(' ') ? `${sheetName}` : sheetName;

    if (length === 1) {
      return `${safeSheetName}!${colStartA1}${row}`;
    }

    const colEndA1 = columnToLetter(startCol + length - 1);
    return `${safeSheetName}!${colStartA1}${row}:${colEndA1}${row}`;
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

//   return {
//     writeTableToSheet,
//   }

// })();
