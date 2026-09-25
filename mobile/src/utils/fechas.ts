/**
 * Utilidades de fechas.
 *
 * Los modelos guardan fechas ISO. Una fecha sola ("2026-05-10") la
 * interpreta `new Date` como medianoche UTC, que en Buenos Aires (UTC-3) cae
 * el día anterior. Por eso las fechas sin hora se arman a mano en hora local.
 */

/** Detecta fechas sin hora, del tipo AAAA-MM-DD. */
const SOLO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Convierte un string ISO a Date respetando la hora local para fechas sin hora.
 * @param iso fecha ISO, con o sin hora
 * @returns el objeto Date
 */
export function parsearFecha(iso: string): Date {
  const partes = SOLO_FECHA.exec(iso);
  if (partes) {
    const [, anio, mes, dia] = partes;
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  }
  return new Date(iso);
}

/**
 * Formatea una fecha como dd/mm/aaaa.
 * @param iso fecha ISO
 * @returns la fecha en formato argentino
 */
export function formatearFecha(iso: string): string {
  const fecha = parsearFecha(iso);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

/**
 * Formatea la hora de una fecha como "10:30 hs".
 * @param iso fecha ISO con hora
 * @returns la hora en formato de 24 hs
 */
export function formatearHora(iso: string): string {
  const fecha = parsearFecha(iso);
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos} hs`;
}

/** Fecha escrita por el usuario: dd/mm/aaaa. */
const FECHA_INGRESADA = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * Va agregando las barras mientras el usuario escribe una fecha ("10052026" → "10/05/2026").
 * @param texto lo que hay en el campo
 * @returns el texto con formato dd/mm/aaaa (parcial si todavía no terminó)
 */
export function enmascararFecha(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  const partes = [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4, 8)].filter(Boolean);
  return partes.join('/');
}

/**
 * Convierte una fecha dd/mm/aaaa a ISO (aaaa-mm-dd), verificando que exista.
 * @param texto fecha escrita por el usuario
 * @returns la fecha ISO, o null si el formato o el día no son válidos (ej. 31/02)
 */
export function fechaIngresadaAIso(texto: string): string | null {
  const partes = FECHA_INGRESADA.exec(texto.trim());
  if (!partes) return null;
  const [, dia, mes, anio] = partes;
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
  // Si el día no existe, Date lo corre al mes siguiente: así se detecta.
  const existe =
    fecha.getFullYear() === Number(anio) &&
    fecha.getMonth() === Number(mes) - 1 &&
    fecha.getDate() === Number(dia);
  return existe ? `${anio}-${mes}-${dia}` : null;
}

/**
 * Fecha de hoy a medianoche local, para comparar solo días.
 * @returns el Date de hoy sin hora
 */
export function hoy(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}
