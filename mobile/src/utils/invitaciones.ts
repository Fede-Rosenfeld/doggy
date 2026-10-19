/**
 * Helpers de los códigos de asignación de mascotas: normalizar el código que
 * carga el usuario.
 */

/** Código de asignación: letras y números, sin espacios. */
const TOKEN_REGEX = /^[A-Z0-9]{6,16}$/;

/**
 * Normaliza el código que cargó el usuario (sin espacios y en mayúsculas).
 * @param texto código ingresado
 * @returns el código en mayúsculas, o null si no tiene el formato esperado
 */
export function codigoDeTexto(texto: string): string | null {
  const codigo = texto.replace(/\s/g, '').toUpperCase();
  return TOKEN_REGEX.test(codigo) ? codigo : null;
}
