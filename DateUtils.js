// /**
//  * Utilidades para tipo de datos date
//  * @namespace
//  */
// const dates = (function() {
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
    if (format && (typeof format !== "string" || !format.trim())) {
      throw new Error("El parámetro 'format' es inválido.")
    }
    if (lng && (typeof lng !== "string" || !lng.trim())) {
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
