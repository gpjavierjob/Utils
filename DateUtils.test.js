const _runDateUtilsTests = () => {
  console.log(`=== UTILIDADES DATE ===`);

  describe("isDate", () => {
    it("debe reconocer fechas válidas", () => {
      assertTrue(isDate(new Date()), "Una fecha real debe ser reconocida");
    });

    it("no debe reconocer valores no fecha", () => {
      assertTrue(!isDate("2023-01-01"), "String no debe ser fecha");
      assertTrue(!isDate(null), "null no debe ser fecha");
      assertTrue(!isDate(undefined), "undefined no debe ser fecha");
      assertTrue(!isDate({}), "Objeto no debe ser fecha");
      assertTrue(!isDate(new Date("invalid")), "Invalid Date no debe ser reconocido");
    });
  });

  describe("isISODateString", () => {
    it("debe reconocer strings en formato ISO", () => {
      assertTrue(isISODateString("2023-08-14"), "No reconoce string en formato yyyy-MM-dd");
      assertTrue(isISODateString("2023-08-14T12:34:56"), "No reconoce string en formato yyyy-MM-ddThh:mm:ss");
      assertTrue(isISODateString("2023-08-14T12:34:56Z"), "No reconoce string en formato yyyy-MM-ddThh:mm:ssZ");
      assertTrue(isISODateString("2023-08-14T12:34:56+03:00"), "No reconoce string en formato yyyy-MM-ddThh:mm:ss+00:00");
    });

    it("no debe reconocer strings inválidos", () => {
      assertTrue(!isISODateString("14/08/2023"));
      assertTrue(!isISODateString("2023/08/14"));
      assertTrue(!isISODateString("2023-8-4"));
      assertTrue(!isISODateString(""));
      assertTrue(!isISODateString(null));
      assertTrue(!isISODateString(undefined));
      assertTrue(!isISODateString(20230814));
    });
  });

  describe("isDDMMYYYY", () => {
    it("debe reconocer fechas válidas dd/MM/yyyy", () => {
      assertTrue(isDDMMYYYY("14/08/2023"));
      assertTrue(isDDMMYYYY("01/01/2000"));
    });

    it("no debe reconocer fechas inválidas", () => {
      assertTrue(!isDDMMYYYY("32/01/2023"), "día > 31 inválido");
      assertTrue(!isDDMMYYYY("00/01/2023"), "día 0 inválido");
      assertTrue(!isDDMMYYYY("14/13/2023"), "mes > 12 inválido");
      assertTrue(!isDDMMYYYY("14/00/2023"), "mes 0 inválido");
      assertTrue(!isDDMMYYYY("14-08-2023"), "formato incorrecto");
      assertTrue(!isDDMMYYYY("2023/08/14"), "formato incorrecto");
      assertTrue(!isDDMMYYYY(""), "string vacío inválido");
      assertTrue(!isDDMMYYYY(null), "null inválido");
      assertTrue(!isDDMMYYYY(undefined), "undefined inválido");
    });
  });

  describe("parseDDMMYYYY", () => {
    it("debe convertir strings válidos a Date", () => {
      const d = parseDDMMYYYY("14/08/2023");
      assertTrue(isDate(d), "Debe retornar un objeto Date");
      assertEquals(d.getFullYear(), 2023);
      assertEquals(d.getMonth(), 7); // 0-based
      assertEquals(d.getDate(), 14);
    });

    it("debe retornar null para strings inválidos", () => {
      assertEquals(parseDDMMYYYY("32/01/2023"), null);
      assertEquals(parseDDMMYYYY("14-08-2023"), null);
      assertEquals(parseDDMMYYYY(""), null);
      assertEquals(parseDDMMYYYY(null), null);
      assertEquals(parseDDMMYYYY(undefined), null);
    });
  });

  describe("getTimestamp", () => {
    it("debe devolver un string con el formato por defecto si no se pasa formato", () => {
      const ts = getTimestamp();
      assertTrue(typeof ts === "string", "Debe retornar string");
      assertTrue(/\d{8} \d{6}/.test(ts), "Debe coincidir con el formato YYYYMMDD HHmmss");
    });

    it("debe devolver un string con formato personalizado", () => {
      const ts = getTimestamp("YYYY-MM-DD HH:mm:ss");
      assertTrue(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(ts));
    });

    it("debe lanzar error si 'format' es inválido", () => {
      assertFunctionParams(getTimestamp, [""], true, "El parámetro 'format' es inválido.");
      assertFunctionParams(getTimestamp, [null], true, "El parámetro 'format' es inválido.");
      assertFunctionParams(getTimestamp, [123], true, "El parámetro 'format' es inválido.");
    });

    it("debe lanzar error si 'lng' es inválido", () => {
      assertFunctionParams(getTimestamp, [undefined, ""], true, "El parámetro 'lng' es inválido.");
      assertFunctionParams(getTimestamp, [undefined, null], true, "El parámetro 'lng' es inválido.");
      assertFunctionParams(getTimestamp, [undefined, 123], true, "El parámetro 'lng' es inválido.");
    });

    it("debe reemplazar placeholders correctamente", () => {
      const ts = getTimestamp("YYYY/MM/DD HH:mm:ss AMPM", "es");
      const pattern = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} (AM|PM)$/;
      assertTrue(pattern.test(ts));
    });
  });
}
