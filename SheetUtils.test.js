const _runSheetUtilsTests = () => {
  console.log(`=== UTILIDADES SHEET ===`);

  // --- Tests para isSpreadsheet, isSheet, isRange, isNamedRange usando _validate real ---

  describe("isSpreadsheet()", () => {
    it("debe devolver true para objeto válido con todos los métodos", () => {
      const obj = {
        getId: () => {}, getUrl: () => {}, getName: () => {},
        getSheets: () => {}, copy: () => {}
      };
      assertTrue(isSpreadsheet.call({ _validate }, obj));
    });

    it("debe devolver false si falta algún método", () => {
      const obj = {
        getId: () => {}, getUrl: () => {}, getName: () => {}
      };
      assertEquals(isSpreadsheet.call({ _validate }, obj), false);
    });
  });

  describe("isSheet()", () => {
    it("debe devolver true para objeto válido con todos los métodos", () => {
      const obj = {
        getName: () => {}, getParent: () => {}, getRange: () => {},
        getSheetId: () => {}, getDataRange: () => {}
      };
      assertTrue(isSheet.call({ _validate }, obj));
    });

    it("debe devolver false si falta algún método", () => {
      const obj = { getName: () => {}, getParent: () => {} };
      assertEquals(isSheet.call({ _validate }, obj), false);
    });
  });

  describe("isRange()", () => {
    it("debe devolver true para objeto válido con todos los métodos", () => {
      const obj = {
        getA1Notation: () => {}, getValues: () => {}, setValues: () => {},
        getSheet: () => {}, getRow: () => {}, getColumn: () => {}
      };
      assertTrue(isRange.call({ _validate }, obj));
    });

    it("debe devolver false si falta algún método", () => {
      const obj = { getA1Notation: () => {}, getValues: () => {} };
      assertEquals(isRange.call({ _validate }, obj), false);
    });
  });

  describe("isNamedRange()", () => {
    it("debe devolver true para objeto válido con todos los métodos", () => {
      const obj = {
        getName: () => {}, getRange: () => {}, setName: () => {},
        setRange: () => {}, remove: () => {}
      };
      assertTrue(isNamedRange.call({ _validate }, obj));
    });

    it("debe devolver false si falta algún método", () => {
      const obj = { getName: () => {}, getRange: () => {} };
      assertEquals(isNamedRange.call({ _validate }, obj), false);
    });
  });

  // --- Tests para normalizadores y getNormalizer ---

  describe("getNormalizer()", () => {
    it("debe devolver la función correcta para cada tipo válido", () => {
      assertEquals(getNormalizer("string"), normalizeString, "string → normalizeString");
      assertEquals(getNormalizer("float"), normalizeFloat, "float → normalizeFloat");
      assertEquals(getNormalizer("integer"), normalizeInteger, "integer → normalizeInteger");
      assertEquals(getNormalizer("boolean"), normalizeBoolean, "boolean → normalizeBoolean");
      assertEquals(getNormalizer("date"), normalizeDate, "date → normalizeDate");
    });

    it("debe lanzar error si se pasa un tipo inválido", () => {
      assertFunctionParams(getNormalizer, ["xyz"], true, "El parámetro 'type' debe ser uno de:");
    });
  });

  describe("normalizeString()", () => {
    it("debe convertir cualquier valor a string y recortar espacios", () => {
      assertEquals(normalizeString("  hola "), "hola");
      assertEquals(normalizeString(123), "123");
      assertEquals(normalizeString(true), "true");
    });

    it("debe devolver cadena vacía para null o undefined", () => {
      assertEquals(normalizeString(null), "");
      assertEquals(normalizeString(undefined), "");
    });
  });

  describe("normalizeInteger()", () => {
    it("debe convertir valores enteros válidos", () => {
      assertEquals(normalizeInteger(42), 42);
      assertEquals(normalizeInteger("42"), 42);
      assertEquals(normalizeInteger("42.9"), 42, "parseInt trunca");
    });

    it("debe devolver null para valores no enteros", () => {
      assertEquals(normalizeInteger("abc"), null);
      assertEquals(normalizeInteger({}), null);
    });
  });

  describe("normalizeFloat()", () => {
    it("debe convertir números válidos directamente", () => {
      assertEquals(normalizeFloat(3.14), 3.14);
      assertEquals(normalizeFloat(42), 42);
    });

    it("debe convertir strings con formato decimal inglés o español", () => {
      assertEquals(normalizeFloat("3.14"), 3.14);
      assertEquals(normalizeFloat("3,14"), 3.14);
      assertEquals(normalizeFloat("1,234.56"), 1234.56);
      assertEquals(normalizeFloat("1.234,56"), 1234.56);
    });

    it("debe devolver null si no es un número válido", () => {
      assertEquals(normalizeFloat("abc"), null);
      assertEquals(normalizeFloat({}), null);
      assertEquals(normalizeFloat(null), null);
      assertEquals(normalizeFloat(undefined), null);
    });
  });

  describe("normalizeDate()", () => {
    it("debe devolver copia de Date si ya es un objeto Date", () => {
      const d = new Date(2020, 0, 15);
      const res = normalizeDate(d);
      assertTrue(res instanceof Date, "Debe ser instancia Date");
      assertEquals(res.getFullYear(), 2020);
      assertEquals(res.getMonth(), 0);
      assertEquals(res.getDate(), 15);
      assertTrue(res !== d, "Debe ser copia distinta");
    });

    it("debe reconocer formato ISO válido", () => {
      const iso = "2020-05-10T00:00:00Z";
      const res = normalizeDate(iso);
      assertTrue(res instanceof Date);
      assertEquals(res.getUTCFullYear(), 2020);
      assertEquals(res.getUTCMonth(), 4); // Mayo → mes 4 en base 0
      // normalizeDate devuelve la hora en Uruguay por lo que la fecha será el día 9
      assertEquals(res.getUTCDate(), 9); 
    });

    it("debe reconocer formato DD/MM/YYYY si hay parseador disponible", () => {
      assertEquals(normalizeDate("31/12/2020").getFullYear(), 2020);
    });

    it("debe convertir números como días desde 1899-12-30", () => {
      const res = normalizeDate(1); // debería ser 1899-12-31
      assertTrue(res instanceof Date);
      assertEquals(res.getFullYear(), 1899);
      assertEquals(res.getMonth(), 11);
      assertEquals(res.getDate(), 31);
    });

    it("debe devolver null para valores inválidos", () => {
      assertEquals(normalizeDate("no-fecha"), null);
      assertEquals(normalizeDate({}), null);
      assertEquals(normalizeDate(undefined), null);
    });
  });

  describe("normalizeBoolean()", () => {
    it("debe reconocer booleanos directos", () => {
      assertEquals(normalizeBoolean(true), true);
      assertEquals(normalizeBoolean(false), false);
    });

    it("debe reconocer strings equivalentes", () => {
      assertEquals(normalizeBoolean("true"), true);
      assertEquals(normalizeBoolean("yes"), true);
      assertEquals(normalizeBoolean("1"), true);
      assertEquals(normalizeBoolean("false"), false);
      assertEquals(normalizeBoolean("no"), false);
      assertEquals(normalizeBoolean("0"), false);
    });

    it("debe reconocer números 1 y 0", () => {
      assertEquals(normalizeBoolean(1), true);
      assertEquals(normalizeBoolean(0), false);
    });

    it("debe devolver null para valores inválidos", () => {
      assertEquals(normalizeBoolean("abc"), null);
      assertEquals(normalizeBoolean(42), null);
      assertEquals(normalizeBoolean({}), null);
    });
  });

  // --- Tests para areEqual ---
  describe("areEqual()", () => {
    it("compara strings correctamente", () => {
      assertTrue(areEqual("abc", "abc"));
      assertTrue(areEqual("  abc  ", "abc")); // trim
      assertEquals(areEqual("abc", "def"), false);
    });

    it("compara números correctamente", () => {
      assertTrue(areEqual(1, 1));
      assertTrue(areEqual("1.23", 1.23, 'float'));
      assertEquals(areEqual(1, 2), false);
    });

    it("compara enteros correctamente", () => {
      assertTrue(areEqual(2, "2", 'integer'));
      assertEquals(areEqual(2, 3, 'integer'), false);
    });

    it("compara booleanos correctamente", () => {
      assertTrue(areEqual(true, 1, 'boolean'));
      assertEquals(areEqual(false, "true", 'boolean'), false);
    });

    it("compara fechas correctamente", () => {
      const d1 = new Date("2025-08-14T00:00:00");
      const d2 = new Date("2025-08-14T12:00:00"); // mismo día, diferente hora
      assertTrue(areEqual(d1, d2, 'date'));
      assertEquals(areEqual(d1, new Date("2025-08-15"), 'date'), true); // 2025-08-14T21:00:00
      assertEquals(areEqual(d1, new Date("2025-08-15T03:00:00"), 'date'), false); // 2025-08-15T00:00:00
    });

    it("maneja null y undefined", () => {
      assertTrue(areEqual(null, null));
      assertTrue(areEqual(undefined, undefined));
      assertFalse(areEqual(null, undefined));
      assertEquals(areEqual(null, 0), false);
    });

    it("lanza error para tipo inválido", () => {
      let errorThrown = false;
      try { areEqual(1, 1, 'invalid'); } catch(e){ errorThrown=true; }
      assertTrue(errorThrown);
    });
  });

  // --- Tests para getValuesFromColumn ---
  describe("getValuesFromColumn()", () => {
    const sheetMock = {
      getDataRange: () => ({
        getNumRows: () => 3,
        getNumColumns: () => 2,
        getValues: () => [
          ["A1","B1"],
          ["A2","B2"],
          ["A3","B3"]
        ]
      }),
      getName: () => "SheetMock",
      getSheetId: () => 'SheetMockId',
      getParent: () => null,
      getRange: () => {}, 
    };

    it("obtiene columna sin handlers", () => {
      const vals = getValuesFromColumn(sheetMock, 0);
      assertEquals(JSON.stringify(vals), JSON.stringify(["A1","A2","A3"]));
    });

    it("aplica filterRowsFn", () => {
      const vals = getValuesFromColumn(sheetMock, 1, { filterRowsFn: row => row[0] !== "A2" });
      assertEquals(JSON.stringify(vals), JSON.stringify(["B1","B3"]));
    });

    it("aplica formatCellValueFn", () => {
      const vals = getValuesFromColumn(sheetMock, 0, { formatCellValueFn: val => val + "!" });
      assertEquals(JSON.stringify(vals), JSON.stringify(["A1!","A2!","A3!"]));
    });

    it("aplica filterCellsFn", () => {
      const vals = getValuesFromColumn(sheetMock, 0, { filterCellsFn: val => val !== "A2" });
      assertEquals(JSON.stringify(vals), JSON.stringify(["A1","A3"]));
    });
  });

  // --- Tests para getUniqueValuesFromColumn ---
  describe("getUniqueValuesFromColumn()", () => {
    const sheetMock = {
      getDataRange: () => ({
        getNumRows: () => 3,
        getNumColumns: () => 1,
        getValues: () => [["A"],["B"],["A"]]
      }),
      getName: () => "SheetMock",
      getSheetId: () => 'SheetMockId',
      getParent: () => null,
      getRange: () => {}, 
    };

    it("devuelve conjunto sin duplicados", () => {
      const set = getUniqueValuesFromColumn(sheetMock, 0);
      assertTrue(set instanceof Set);
      assertEquals(set.size, 2);
      assertTrue(set.has("A"));
      assertTrue(set.has("B"));
    });
  });

  // --- Tests para writeTableToSheet ---
  describe("writeTableToSheet()", () => {
    let writtenRange = null;
    const sheetMock = {
      getRange: (r,c,rows,cols) => ({
        setValues: (vals) => { writtenRange = vals; }
      }),
      getName: () => "SheetMock",
      getSheetId: () => 'SheetMockId',
      getParent: () => null,
      getDataRange: () => {}, 
    };

    it("escribe tabla rectangular completa", () => {
      const table = [["a","b"],["c","d"]];
      writeTableToSheet(sheetMock, table);
      assertEquals(JSON.stringify(writtenRange), JSON.stringify([["a","b"],["c","d"]]));
    });

    it("padece filas desiguales rellenando con ''", () => {
      const table = [["a"],["b","c"]];
      writeTableToSheet(sheetMock, table);
      assertEquals(JSON.stringify(writtenRange), JSON.stringify([["a",""],["b","c"]]));
    });
  });

  // --- Tests para getOrCreateSheet ---
  describe("getOrCreateSheet()", () => {
    const sheets = [];
    const spreadsheetMock = {
      getSheetByName: (name) => sheets.find(s => s.getName() === name),
      insertSheet: (name) => {
        const newSheet = { getName: () => name };
        sheets.push(newSheet);
        return newSheet;
      },
     getId: () => 'SpreadsheetMockId',
     getUrl: () => 'SpreadsheetMock Url',
     getName: () => 'SpreadsheetMock',
     getSheets: () => [{ getName: () => name }], 
     copy: () => {},
    };

    it("crea hoja si no existe", () => {
      const sheet = getOrCreateSheet(spreadsheetMock, "Nueva");
      assertEquals(sheet.getName(), "Nueva");
    });

    it("retorna hoja existente si existe", () => {
      const sheet = getOrCreateSheet(spreadsheetMock, "Nueva");
      assertEquals(sheet.getName(), "Nueva");
    });
  });

  // --- Tests para buildRowRangeAddress y columnToLetter ---
  describe("buildRowRangeAddress()", () => {
    it("construye dirección de rango horizontal correctamente", () => {
      const addr = buildRowRangeAddress("Hoja 1", 2, 2, 3);
      assertEquals(addr, "Hoja 1!B2:D2");
    });
  });

  describe("columnToLetter()", () => {
    it("columna a letra", () => {
      assertEquals(columnToLetter(1), "A");
      assertEquals(columnToLetter(26), "Z");
      assertEquals(columnToLetter(27), "AA");
      assertEquals(columnToLetter(52), "AZ");
      assertEquals(columnToLetter(53), "BA");
    });
  });

  // --- Tests para appendRowsToSheet ---
  describe("appendRowsToSheet()", () => {
    let lastSetValues = null;
    const sheetMock = {
      getLastRow: () => sheetMock._lastRow,
      appendRow: (row) => { sheetMock._rows.push(row); sheetMock._lastRow++; },
      getRange: (row, col, numRows, numCols) => ({
        setValues: (vals) => { lastSetValues = vals; sheetMock._rows.push(...vals); sheetMock._lastRow += vals.length; }
      }),
      _rows: [],
      _lastRow: 0,
      getName: () => "SheetMock",
      getSheetId: () => 'SheetMockId',
      getParent: () => null,
      getDataRange: () => {}, 
    };

    it("lanza error si parámetros inválidos", () => {
      let err = false;
      try { appendRowsToSheet({}, [], []); } catch(e){ err=true; }
      assertTrue(err);
    });

    it("agrega títulos si hoja vacía", () => {
      sheetMock._rows = [];
      sheetMock._lastRow = 0;
      appendRowsToSheet(sheetMock, [["val1","val2"]], ["col1","col2"]);
      assertEquals(sheetMock._rows[0][0], "col1");
      assertEquals(sheetMock._rows[1][0], "val1");
    });

    it("reemplaza __ROW__ correctamente", () => {
      sheetMock._rows = [["col1","col2"]];
      sheetMock._lastRow = 1;
      appendRowsToSheet(sheetMock, [["__ROW__","data"]], ["col1","col2"]);
      assertEquals(lastSetValues[0][0], "2"); // fila real = 2
    });
  });

  // --- Tests para updateRowsInSheet ---
  describe("updateRowsInSheet()", () => {
    let setValuesCalled = [];
    const sheetMock = {
      getLastRow: () => 3,
      getRange: (row, col, numRows, numCols) => ({
        getValues: () => {
          if (row === 2) return [["A1","B1"]];
          if (row === 3) return [["A2","B2"]];
          return [];
        },
        setValues: (vals) => { setValuesCalled.push({ row, vals }); }
      }),
      getName: () => "SheetMock",
      getSheetId: () => 'SheetMockId',
      getParent: () => null,
      getDataRange: () => {}, 
    };

    it("retorna 0 si rowsMap vacío", () => {
      const updated = updateRowsInSheet(sheetMock, 0, "string", []);
      assertEquals(updated, 0);
    });

    it("actualiza fila existente correctamente", () => {
      setValuesCalled = [];
      const rowsMap = [{ key: "A1", row: ["A1_mod","B1_mod"] }];
      const updated = updateRowsInSheet(sheetMock, 0, "string", rowsMap);
      assertEquals(updated, 1);
      assertEquals(setValuesCalled.length, 1);
      assertEquals(setValuesCalled[0].vals[0][0], "A1_mod");
    });

    it("no actualiza fila si no hay cambios", () => {
      setValuesCalled = [];
      const rowsMap = [{ key: "A2", row: ["A2","B2"] }];
      const updated = updateRowsInSheet(sheetMock, 0, "string", rowsMap);
      assertEquals(updated, 0);
      assertEquals(setValuesCalled.length, 0);
    });

    it("reemplaza __ROW__ correctamente", () => {
      setValuesCalled = [];
      const rowsMap = [{ key: "A1", row: ["row__ROW__", "B1"] }];
      const updated = updateRowsInSheet(sheetMock, 0, "string", rowsMap);
      assertEquals(setValuesCalled[0].vals[0][0], "row2"); // fila real = 2
    });
  });

  // --- Tests para sortSheet ---
  describe("sortSheet()", () => {
    let sortCalled = null;
    const sheetMock = {
      getLastRow: () => 3,
      getLastColumn: () => 2,
      getRange: (row, col, numRows, numCols) => ({
        sort: (criteria) => { sortCalled = criteria; }
      }),
      getFilter: () => null,
      getName: () => "SheetMock",
      getSheetId: () => 'SheetMockId',
      getParent: () => null,
      getDataRange: () => {}, 
      getSheetId: () => '',
    };

    it("lanza error si parámetros inválidos", () => {
      let err = false;
      try { sortSheet({}, [{}]); } catch(e){ err=true; }
      assertTrue(err);
    });

    it("no ordena si sortCriteria vacío", () => {
      sortCalled = null;
      sortSheet(sheetMock, []);
      assertEquals(sortCalled, null);
    });

    it("llama a sort con criterios válidos", () => {
      sortCalled = null;
      sortSheet(sheetMock, [{ column:1, ascending:true }]);
      assertEquals(sortCalled[0].column, 1);
      assertEquals(sortCalled[0].ascending, true);
    });
  });
}