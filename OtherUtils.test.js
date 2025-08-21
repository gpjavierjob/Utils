const _runOtherUtilsTests = () => {
  console.log(`=== UTILIDADES OTHERS ===`);

  // --- Tests para _validate() ---

  describe("_validate()", () => {
    it("debe devolver true si el objeto tiene todos los métodos como funciones", () => {
      const obj = {
        a: () => {}, b: () => {}, c: () => {}
      };
      const methods = ["a", "b", "c"];
      assertTrue(_validate(obj, methods));
    });

    it("debe devolver false si falta algún método", () => {
      const obj = { a: () => {}, b: () => {} };
      const methods = ["a", "b", "c"];
      assertEquals(_validate(obj, methods), false);
    });

    it("debe devolver false si algún método no es función", () => {
      const obj = { a: () => {}, b: "noFunc", c: () => {} };
      const methods = ["a", "b", "c"];
      assertEquals(_validate(obj, methods), false);
    });

    it("debe devolver false si el objeto es null o undefined", () => {
      assertEquals(_validate(null, ["a"]), false);
      assertEquals(_validate(undefined, ["a"]), false);
    });

    it("debe devolver false si el objeto no es tipo object", () => {
      assertEquals(_validate(42, ["a"]), false);
      assertEquals(_validate("string", ["a"]), false);
    });

    it("debe devolver true para objeto vacío si no se requieren métodos", () => {
      assertEquals(_validate({}, []), true);
    });
  });
}