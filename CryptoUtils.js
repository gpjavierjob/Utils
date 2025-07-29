  /**
   * Genera hash SHA-256 para un arreglo no vacío.
   * 
   * @param {Array} values Arreglo con elementos
   * @return {string} Hash en base64
   */
  function hashFromArray(values) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("El parámetro 'values' no es una arreglo válido.")
    }

    return hashFromString(JSON.stringify(values));
  }

  /**
   * Genera hash SHA-256 para un objeto válido.
   * 
   * @param {Array} value Objeto
   * @return {string} Hash en base64
   */
  function hashFromObject(value) {
    if (!value || typeof value !== 'object') {
      throw new Error("El parámetro 'value' no es un objeto válido.")
    }

    return hashFromString(JSON.stringify(value));
  }

  /**
   * Genera hash SHA-256 para una cadena de caracteres no vacía.
   * 
   * @param {string} value Cadena de caracteres no vacía
   * @return {string} Hash en base64
   */
  function hashFromString(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error("El parámetro 'value' no es una string válida.")
    }

    const digest = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      value,
      Utilities.Charset.UTF_8
    );
    return Utilities.base64Encode(digest);
  }
