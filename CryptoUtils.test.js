function _runCryptoUtilsTests() {
  console.log(`=== UTILIDADES CRYPTO ===`);

  describe("hashFromArray", function() {
    it("Genera hash para un arreglo válido", function() {
      const arr = [1, 2, 3];
      const hash = hashFromArray(arr);
      assertTrue(typeof hash === "string" && hash.length > 0);
    });

    it("Lanza error si el parámetro no es un arreglo", function() {
      assertFunctionParams(hashFromArray, [null], true);
      assertFunctionParams(hashFromArray, ["not an array"], true);
    });

    it("Lanza error si el arreglo está vacío", function() {
      assertFunctionParams(hashFromArray, [[]], true);
    });
  });

  describe("hashFromObject", function() {
    it("Genera hash para un objeto válido", function() {
      const obj = { a: 1, b: "test" };
      const hash = hashFromObject(obj);
      assertTrue(typeof hash === "string" && hash.length > 0);
    });

    it("Lanza error si el parámetro no es un objeto", function() {
      assertFunctionParams(hashFromObject, [null], true);
      assertFunctionParams(hashFromObject, [42], true);
      assertFunctionParams(hashFromObject, ["string"], true);
    });
  });

  describe("hashFromString", function() {
    it("Genera hash para una string válida", function() {
      const str = "hola mundo";
      const hash = hashFromString(str);
      assertTrue(typeof hash === "string" && hash.length > 0);
    });

    it("Lanza error si el parámetro no es string", function() {
      assertFunctionParams(hashFromString, [null], true);
      assertFunctionParams(hashFromString, [123], true);
      assertFunctionParams(hashFromString, [[]], true);
    });

    it("Lanza error si la string está vacía o solo espacios", function() {
      assertFunctionParams(hashFromString, [""], true);
      assertFunctionParams(hashFromString, ["    "], true);
    });
  });

}
