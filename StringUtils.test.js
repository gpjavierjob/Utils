// // === Mocks y helpers para los tests ===
// const slugCache = {};
// function isMap(value) {
//   return value instanceof Map;
// }

// === TESTS ===
function _runStringUtilsTests() {
  console.log(`=== UTILIDADES STRING ===`);

  describe("toSlug", function() {
    it("Convierte texto con tildes y espacios a slug", function() {
      const result = toSlug("¡Hola, señor Pérez!");
      assertEquals(result, "hola_comma_senor_perez_excl");
    });

    it("Reemplaza caracteres especiales correctamente", function() {
      const result = toSlug("A&B+C=D");
      assertEquals(result, "a_and_b_plus_c_eq_d");
    });

    it("Retorna cadena vacía si no es string", function() {
      assertEquals(toSlug(123), "");
    });
  });

  describe("toSlugMemoized", function() {
    it("Genera slug y lo guarda en cache", function() {
      const result1 = toSlugMemoized("Test!");
      const result2 = toSlugMemoized("Test!"); // debería usar cache
      assertEquals(result1, "test_excl");
      assertEquals(result2, "test_excl");
    });

    it("Retorna cadena vacía si no es string", function() {
      assertEquals(toSlugMemoized(null), "");
    });
  });

  describe("stringifyDate", function() {
    it("Convierte un Date válido a ISO string", function() {
      const date = new Date("2020-01-01T00:00:00.000Z");
      const result = stringifyDate(date);
      assertTrue(result.startsWith("2020-01-01T00:00:00"));
    });

    it("Lanza error si el parámetro no es Date", function() {
      assertFunctionParams(stringifyDate, ["noDate"], true, "no es válido");
    });
  });

  describe("parseDate", function() {
    it("Convierte un string ISO a Date válido", function() {
      const json = "2021-05-20T12:00:00.000Z";
      const result = parseDate(json);
      assertTrue(result instanceof Date);
      assertEquals(result.toISOString(), json);
    });

    it("Lanza error si el parámetro no es string válido", function() {
      assertFunctionParams(parseDate, [null], true, "no es válido");
    });
  });

  describe("stringifyMap y parseMap", function() {
    it("Serializa y deserializa un Map correctamente", function() {
      const original = new Map([["a", 1], ["b", new Date("2020-01-01T00:00:00.000Z")]]);
      const json = stringifyMap(original);
      const parsed = parseMap(json);
      assertTrue(parsed instanceof Map);
      assertEquals(parsed.get("a"), 1);
      assertTrue(parsed.get("b") instanceof Date);
    });

    it("Lanza error si stringifyMap recibe algo distinto de Map", function() {
      assertFunctionParams(stringifyMap, [{}], true, "no es válido");
    });

    it("Lanza error si parseMap recibe string vacío", function() {
      assertFunctionParams(parseMap, [""], true, "no es válido");
    });
  });

  describe("stringifyObject y parseObject", function() {
    it("Serializa y deserializa objeto con Date correctamente", function() {
      const obj = { x: 10, y: new Date("2022-02-02T00:00:00.000Z") };
      const json = stringifyObject(obj);
      const parsed = parseObject(json);
      assertEquals(parsed.x, 10);
      assertTrue(parsed.y instanceof Date);
    });

    it("Lanza error si stringifyObject recibe algo no objeto", function() {
      assertFunctionParams(stringifyObject, [null], true, "no es válido");
    });

    it("Lanza error si parseObject recibe string vacío", function() {
      assertFunctionParams(parseObject, [""], true, "no es válido");
    });
  });

}
