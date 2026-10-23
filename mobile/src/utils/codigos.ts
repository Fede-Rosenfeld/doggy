/**
 * ID único de cada mascota, el que se codifica en el QR de la chapita.
 * Formato: DOGGY-XXXX-NOMBRE (cuatro dígitos y el nombre en mayúsculas sin tildes).
 * Lo genera el servidor al dar de alta la mascota; la app solo lo valida al leerlo.
 */

/** Expresión que valida un código leído (por ejemplo, desde un QR). */
export const CODIGO_MASCOTA_REGEX = /^DOGGY-\d{4}-[A-Z0-9]+$/;

