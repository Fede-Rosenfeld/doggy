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

/** Largo mínimo de una contraseña nueva. */
export const PASSWORD_MIN = 6;

/**
 * Valida que un campo de texto no esté vacío.
 * @param valor texto ingresado
 * @param mensaje error a mostrar si está vacío
 * @returns mensaje de error o undefined
 */
export function validarRequerido(valor: string, mensaje: string): string | undefined {
  if (!valor.trim()) return mensaje;
  return undefined;
}

/**
 * Valida una contraseña nueva: obligatoria y con un largo mínimo.
 * @param password texto ingresado
 * @returns mensaje de error o undefined
 */
export function validarPasswordNueva(password: string): string | undefined {
  if (!password) return 'Ingresá una contraseña.';
  if (password.length < PASSWORD_MIN) {
    return `La contraseña tiene que tener al menos ${PASSWORD_MIN} caracteres.`;
  }
  return undefined;
}

/**
 * Valida que la confirmación coincida con la contraseña.
 * @param password contraseña elegida
 * @param confirmacion texto repetido por el usuario
 * @returns mensaje de error o undefined
 */
export function validarConfirmacion(password: string, confirmacion: string): string | undefined {
  if (!confirmacion) return 'Repetí la contraseña.';
  if (password !== confirmacion) return 'Las contraseñas no coinciden.';
  return undefined;
}
