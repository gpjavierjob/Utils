// /**
//  * Utilidades para tipo de datos date
//  * @namespace
//  */
// const dates = (function() {
/**
 * Indica si un valor es una fecha
 * 
 * @param {object} v Valor
 * @returns {boolean} True si es un valor de fecha; de lo contrario, false
 */
function isDate(v) {
  // Detecta Date “real” y descarta 'Invalid Date'
  return Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime());
}

/**
 * Devuelve true si el año prroporcionado es bisiesto.
 * 
 * @param {number} year Año
 * @returns {boolean} True si el año es bisiesto
 */
function isLeapYear(year) {
  if (!Number.isInteger(year)) {
    throw new Error("El parámetro 'year' no es válido.")
  }

  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Indica si el valor de cadena tiene el formato ISO.
 * 
 * @param {string} value Valor *string* de fecha.
 * @returns {boolean} *true* si cumple con el formato.
 */
function isISODateString(value) {
  if (typeof value !== 'string') return false;

  // Regex estricto: fecha yyyy-MM-dd, opcional hora hh:mm:ss(.sss), opcional zona horaria
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})?(T(\d{2}):(\d{2}):(\d{2})?(\.(\d{3}))??(Z|[+-]\d{2}:\d{2})?)?$/;

  const match = value.match(isoRegex);

  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // Validación de mes y día
  if (month < 1 || month > 12) return false;
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30,
                       31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) return false;

  // Si no hay hora, ya es válida
  if (match[4] === undefined) return true;

  const hour = parseInt(match[5], 10);
  const minute = parseInt(match[6], 10);
  const second = parseInt(match[7], 10);

  if (hour < 0 || hour > 23) return false;
  if (minute < 0 || minute > 59) return false;
  if (second < 0 || second > 59) return false;

  // Zona horaria opcional
  const tz = match[9];
  if (tz && tz !== 'Z') {
    const tzMatch = /^[+-](\d{2}):(\d{2})$/.exec(tz);
    if (!tzMatch) return false;
    const tzHour = parseInt(tzMatch[1], 10);
    const tzMinute = parseInt(tzMatch[2], 10);
    if (tzHour < 0 || tzHour > 23) return false;
    if (tzMinute < 0 || tzMinute > 59) return false;
  }

  return true;
}

/**
 * Indica si el valor de cadena tiene el formato *dd/MM/yyyy*.
 * 
 * @param {string} value Cadena en formato *dd/MM/yyyy*.
 * @returns {boolean} *true* si cumple con el formato.
 */
function isDDMMYYYY(value) {
  if (typeof value !== 'string') return false;

  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = value.match(regex);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Validar rangos básicos
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  // Verificar fecha real usando el constructor de Date
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Convierte una cadena con formato *dd/MM/yyyy* en un valor de fecha. Si el
 * valor suministrado no cumple con el formato, devuelve null.
 * 
 * @param {string} value Valor de cadena en formato *dd/MM/yyyy*;
 * @returns {Date|null} Objeto *Date* o *null* si no es válido.
 */
function parseDDMMYYYY(value) {
  if (!value) return null;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const date = new Date(year, month - 1, day);
  return (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year)
    ? date
    : null;
}

  /**
   * Genera un timestamp altamente personalizable
   * 
   * @param {string} [format] Formato deseado (por defecto "YYYYMMDD HHmmss")
   * 
   *    Placeholders disponibles:
   * 
   *    Fechas:
   *    - YYYY = año completo (2023)
   *    - YY = año corto (23)
   *    - M = mes (1-12)
   *    - MM = mes (01-12)
   *    - MMM = nombre mes corto (Ene, Feb, etc.)
   *    - MMMM = nombre mes completo
   *    - D = día (1-31)
   *    - DD = día (01-31)
   * 
   *    Horas:
   *    - H = horas 24h (0-23)
   *    - HH = horas 24h (00-23)
   *    - h = horas 12h (1-12)
   *    - hh = horas 12h (01-12)
   *    - m = minutos (0-59)
   *    - mm = minutos (00-59)
   *    - s = segundos (0-59)
   *    - ss = segundos (00-59)
   *    - AMPM = AM/PM en mayúsculas
   *    - ampm = am/pm en minúsculas
   * 
   * @param {string} [lng] Código del idioma. Utilizado para mostrar los nombres de los meses. (por defecto "en-US")
   * @return {string} Timestamp formateado
   */
  function getTimestamp(format, lng) {
    if (format !== undefined && (typeof format !== "string" || format.trim() === '')) {
      throw new Error("El parámetro 'format' es inválido.")
    }
    if (lng !== undefined && (typeof lng !== "string" || lng.trim() === '')) {
      throw new Error("El parámetro 'lng' es inválido.")
    }

    const monthsMap = new Map();
    monthsMap.set("en-us", {
      names: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      shortNames: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
    }); 
    monthsMap.set("es", {
      names: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      shortNames: [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ],
    }); 
    monthsMap.set("es-uy", {
      names: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      shortNames: [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'
      ],
    }); 

    const now = new Date();

    const defaultLng = "es-uy";
    const currentLng = lng?.toLowerCase();
    const months = currentLng && monthsMap.has(currentLng) 
      ? monthsMap.get(currentLng) 
      : monthsMap.get(defaultLng);
    
    const hour24 = now.getHours();
    const hour12 = hour24 % 12 || 12;
    
    const components = {
      YYYY: String(now.getFullYear()),
      YY: String(now.getFullYear()).slice(-2),
      MMMM: months.names[now.getMonth()],
      MMM: months.shortNames[now.getMonth()],
      MM: String(now.getMonth() + 1).padStart(2, '0'),
      M: String(now.getMonth() + 1),
      DD: String(now.getDate()).padStart(2, '0'),
      D: String(now.getDate()),
      HH: String(hour24).padStart(2, '0'),
      H: String(hour24),
      hh: String(hour12).padStart(2, '0'),
      h: String(hour12),
      mm: String(now.getMinutes()).padStart(2, '0'),
      m: String(now.getMinutes()),
      ss: String(now.getSeconds()).padStart(2, '0'),
      s: String(now.getSeconds()),
      AMPM: hour24 < 12 ? 'AM' : 'PM',
      ampm: hour24 < 12 ? 'am' : 'pm'
    };
    
    // Formato por defecto si no se especifica
    const defaultFormat = 'YYYYMMDD HHmmss';
    
    // Reemplazar placeholders
    return (format || defaultFormat).replace(
      /(YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|AMPM|ampm)/g, 
      match => components[match]
    );
  }

//   return {
//     getTimestamp,
//   }

// })();
