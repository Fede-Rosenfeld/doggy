/**
 * Validaciones locales de formularios.
 *
 * Mientras no haya backend, los formularios solo chequean formato. Cada
 * función devuelve el mensaje de error a mostrar o undefined si el valor es válido.
 */

/** Formato básico de email: algo@algo.dominio, sin espacios. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Valida un email.
 * @param email texto ingresado
 * @returns mensaje de error o undefined
 */
export function validarEmail(email: string): string | undefined {
  const valor = email.trim();
  if (!valor) return 'Ingresá tu email.';
  if (!EMAIL_REGEX.test(valor)) return 'El email no tiene un formato válido.';
  return undefined;
}

/**
 * Valida que la contraseña no esté vacía.
 * @param password texto ingresado
 * @returns mensaje de error o undefined
 */
export function validarPasswordRequerida(password: string): string | undefined {
  if (!password) return 'Ingresá tu contraseña.';
  return undefined;
}
