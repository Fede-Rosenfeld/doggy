/**
 * ID único de cada mascota, el que se codifica en el QR de la chapita.
 * Formato: DOGGY-XXXX-NOMBRE (cuatro dígitos y el nombre en mayúsculas sin tildes).
 */

/** Expresión que valida un código leído (por ejemplo, desde un QR). */
export const CODIGO_MASCOTA_REGEX = /^DOGGY-\d{4}-[A-Z0-9]+$/;

/**
 * Normaliza un nombre para usarlo en el código: sin tildes, sin espacios ni símbolos.
 * @param nombre nombre de la mascota
 * @returns el nombre en mayúsculas y solo con letras y números
 */
function normalizarNombre(nombre: string): string {
  const limpio = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return limpio || 'MASCOTA';
}

/**
 * Genera un código nuevo que no choque con los existentes.
 * @param nombre nombre de la mascota
 * @param existentes códigos ya usados
 * @returns un código DOGGY-XXXX-NOMBRE
 */
export function generarCodigoMascota(nombre: string, existentes: string[] = []): string {
  const sufijo = normalizarNombre(nombre);
  let codigo: string;
  do {
    const numero = Math.floor(1000 + Math.random() * 9000);
    codigo = `DOGGY-${numero}-${sufijo}`;
  } while (existentes.includes(codigo));
  return codigo;
}
