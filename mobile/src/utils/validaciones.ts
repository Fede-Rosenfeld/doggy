/**
 * Validaciones locales de formularios.
 *
 * Mientras no haya backend, los formularios solo chequean formato. Cada
 * función devuelve el mensaje de error a mostrar o undefined si el valor es válido.
 */

import { fechaIngresadaAIso, hoy, parsearFecha, parsearHora } from './fechas';

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

/** Edad máxima razonable de una mascota, en años. */
export const EDAD_MAXIMA = 30;

/**
 * Valida la edad en años: obligatoria, entera y dentro de un rango razonable.
 * @param texto lo que escribió el usuario
 * @returns mensaje de error o undefined
 */
export function validarEdad(texto: string): string | undefined {
  const valor = texto.trim();
  if (!valor) return 'Ingresá la edad.';
  if (!/^\d+$/.test(valor)) return 'Solo números.';
  if (Number(valor) > EDAD_MAXIMA) return `Máximo ${EDAD_MAXIMA}.`;
  return undefined;
}

/**
 * Valida una fecha escrita como dd/mm/aaaa.
 * @param texto lo que escribió el usuario
 * @returns mensaje de error o undefined
 */
export function validarFechaIngresada(texto: string): string | undefined {
  if (!texto.trim()) return 'Ingresá la fecha.';
  if (!fechaIngresadaAIso(texto)) return 'Usá el formato dd/mm/aaaa con una fecha real.';
  return undefined;
}

/**
 * Valida la fecha de aplicación de un registro sanitario: formato válido y
 * no futura (en el carnet solo se cargan aplicaciones ya hechas).
 * @param texto fecha dd/mm/aaaa
 * @returns mensaje de error o undefined
 */
export function validarFechaAplicacion(texto: string): string | undefined {
  const error = validarFechaIngresada(texto);
  if (error) return error;
  const iso = fechaIngresadaAIso(texto);
  if (iso && parsearFecha(iso) > hoy()) return 'Una aplicación no puede tener fecha futura.';
  return undefined;
}

/**
 * Valida la fecha opcional del próximo refuerzo: si viene, tiene que tener
 * formato válido y ser posterior a la aplicación.
 * @param texto fecha dd/mm/aaaa del refuerzo (puede estar vacía)
 * @param aplicacion fecha dd/mm/aaaa de la aplicación
 * @returns mensaje de error o undefined
 */
export function validarProximaDosis(texto: string, aplicacion: string): string | undefined {
  if (!texto.trim()) return undefined;
  const iso = fechaIngresadaAIso(texto);
  if (!iso) return 'Usá el formato dd/mm/aaaa con una fecha real.';
  const isoAplicacion = fechaIngresadaAIso(aplicacion);
  if (isoAplicacion && parsearFecha(iso) <= parsearFecha(isoAplicacion)) {
    return 'El refuerzo tiene que ser posterior a la aplicación.';
  }
  return undefined;
}

/**
 * Valida una hora escrita como HH:MM.
 * @param texto lo que escribió el usuario
 * @returns mensaje de error o undefined
 */
export function validarHora(texto: string): string | undefined {
  if (!texto.trim()) return 'Ingresá la hora.';
  if (!parsearHora(texto)) return 'Usá el formato HH:MM (por ejemplo, 10:30).';
  return undefined;
}

/**
 * Valida un teléfono: entre 8 y 15 dígitos, admitiendo espacios, guiones y "+".
 * @param telefono texto ingresado
 * @returns mensaje de error o undefined
 */
export function validarTelefono(telefono: string): string | undefined {
  const valor = telefono.trim();
  if (!valor) return 'Ingresá un teléfono de contacto.';
  if (!/^\+?[\d\s-]+$/.test(valor)) return 'Usá solo números, espacios, guiones y "+".';
  const digitos = valor.replace(/\D/g, '').length;
  if (digitos < 8 || digitos > 15) return 'El teléfono tiene que tener entre 8 y 15 números.';
  return undefined;
}
