// /**
//  * Utilidades para tipo de datos string
//  * @namespace
//  */
// const strings = (function() {
  // Memoización para toSlug
  const slugCache = {};

  /**
   * Convierte un texto en un slug válido para nombres de rango.
   * Más eficiente cuando se genera un slug a un mismo texto
   * en mútiples ocasiones pues utiliza una cache de slugs.
   *
   * @param {string} text Texto de entrada
   * @returns {string} Slug generado
   */
  function toSlugMemoized(text) {
    if (typeof text !== "string") return "";

    if (!slugCache[text]) {
      slugCache[text] = toSlug(text);
    }
    return slugCache[text];
  };

  /**
   * Convierte un texto en un slug. Útil para nombres que no
   * admitan caracteres especiales.
   *
   * @param {string} text Texto de entrada
   * @returns {string} Slug generado
   */
  function toSlug(text) {
    if (typeof text !== "string") return "";

    const replacements = {
      "<": "_lt_",      ">": "_gt_",        "+": "_plus_",        "%": "_percent_",
      "&": "_and_",     "/": "_slash_",     "\\": "_backslash_",  "=": "_eq_",
      "!": "_excl_",    "?": "_q_",         ":": "_colon_",       ";": "_semicolon_",
      "\"": "_quote_",  "'": "_apos_",      ",": "_comma_",       ".": "_dot_",
      "(": "_lpar_",    ")": "_rpar_",      "[": "_lbracket_",    "]": "_rbracket_",
      "{": "_lbrace_",  "}": "_rbrace_",    "|": "_pipe_",        "#": "_hash_",
      "@": "_at_",      "^": "_caret_",     "~": "_tilde_",       "*": "_star_",
      "$": "_dollar_",  "`": "_backtick_",  '"': "_dquote_",
    };

    return text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") // eliminar tildes
      .split("")
      .map(char => replacements[char] ?? char)
      .join("")
      .replace(/[^a-zA-Z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_+/g, "_")
      .toLowerCase();

  }

  /** 
   * Indica si value es un valor válido de fecha ISO
   * 
   * @param {string} str Valor string a comprobar
   * @returns {boolean}
   */
  function isISODateString(str) {
    return typeof str === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(str);
  }

  /**
   * Serializa un Map.
   * 
   * @param {Date} date Fecha y horas a serializar
   * @returns {string} Valor de tipo string con formato JSON
   */
  function stringifyDate(date) {
    if (!(date instanceof Date)) throw new Error("El parámetro 'date' no es válido.")

    try {  
      return date.toISOString();
    } catch (error) {
      console.error(`Error en Utils.stringifyDate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parsea una string con formato JSON que es el resultado de stringifyDate()
   * 
   * @param {string} json Objeto u objetos anidados serializados
   * @returns {Object} Objeto u objetos anidados
   */
  function parseDate(json) {
    if (typeof json !== 'string' || json.trim() === '') throw new Error("El parámetro 'json' no es válido.");

    try {
      return new Date(json);  
    } catch (error) {
      console.error(`Error en Utils.parseDate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Serializa un Map.
   * 
   * @param {Map} map Mapa a serializar
   * @returns {string} Valor de tipo string con formato JSON
   */
  function stringifyMap(map) {
    if (!isMap(map)) throw new Error("El parámetro 'map' no es válido.")

    try {  
      const obj = Object.fromEntries(map);
      return stringifyObject(obj);
    } catch (error) {
      console.error(`Error en Utils.stringifyMap: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deserializa el objeto Map a partir de una string con formato JSON 
   * resultado de su serialización con Utils.stringifyMap().
   *  
   * @param {string} json Valor de tipo string con formato JSON
   * @returns {Map} Objeto Map
   */
  function parseMap(json) {
    if (typeof json !== 'string' || json.trim() === '') throw new Error("El parámetro 'json' no es válido.");

    try {  
      const obj = parseObject(json);
      return new Map(Object.entries(obj));
    } catch (error) {
      console.error(`Error en Utils.parseMap: ${error.message}`);
      throw error;
    }
  }

  /**
   * Serializa un objeto.
   * 
   * @param {Object} obj Objeto a serializar
   * @returns {string} Valor de tipo string con formato JSON
   */
  function stringifyObject(obj) {
    if (!obj || typeof obj !== 'object') throw new Error("El parámetro 'map' no es válido.")

    function replacer(key, value) {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    }

    try {  
      return JSON.stringify(obj, replacer);
    } catch (error) {
      console.error(`Error en Utils.stringifyObject: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deserializa un objeto a partir de una string con formato JSON 
   * resultado de su serialización con Utils.stringifyMap().
   *  
   * @param {string} json Valor de tipo string con formato JSON
   * @returns {Object} Objeto
   */
  function parseObject(json) {
    if (typeof json !== 'string' || json.trim() === '') throw new Error("El parámetro 'json' no es válido.");

    function reviver(key, value) {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    }

    try {  
      return JSON.parse(json, reviver);
    } catch (error) {
      console.error(`Error en Utils.parseObject: ${error.message}`);
      throw error;
    }
  }

//   return {
//     toSlug: toSlug,
//     toSlugMemoized: toSlugMemoized,
    
//   }

// })();
