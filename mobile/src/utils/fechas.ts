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
