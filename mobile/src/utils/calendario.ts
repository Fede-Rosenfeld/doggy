/**
 * Lógica del calendario mensual de la Agenda (sin librerías, solo Date).
 *
 * Cómo se arma la grilla:
 * 1. Se toma el día 1 del mes y se calcula en qué columna cae. `getDay()`
 *    devuelve 0 para domingo y 6 para sábado, pero la semana de la app
 *    empieza el lunes, así que se corre con `(getDay() + 6) % 7`:
 *    lunes = 0, martes = 1, ..., domingo = 6. Ese número es cuántos días
 *    del mes anterior hay que mostrar antes del 1.
 * 2. La cantidad de días del mes sale de pedir el "día 0" del mes siguiente:
 *    `new Date(anio, mes + 1, 0)` es el último día del mes actual.
 * 3. Se completan semanas enteras (múltiplos de 7) con los primeros días del
 *    mes siguiente, así la grilla siempre queda rectangular (5 o 6 filas).
 * Date resuelve solo los desbordes: `new Date(2026, 9, -2)` es el 28 de
 * septiembre y `new Date(2026, 9, 33)` es el 2 de noviembre.
 */
import { parsearFecha } from './fechas';

/** Celda de la grilla del calendario. */
export type DiaCalendario = {
  fecha: Date;
  /** false para los días de relleno del mes anterior o siguiente. */
  delMes: boolean;
  /** Clave AAAA-MM-DD para buscar los turnos de ese día. */
  clave: string;
};

/** Encabezados de columna, empezando el lunes. */
export const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Clave de un día en hora local (AAAA-MM-DD). No se usa toISOString porque
 * convierte a UTC y de noche en Argentina ya daría el día siguiente.
 * @param fecha día a convertir
 * @returns la clave del día
 */
export function claveDia(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/**
 * Clave del día de una fecha ISO (con o sin hora).
 * @param iso fecha ISO
 * @returns la clave AAAA-MM-DD en hora local
 */
export function claveDeIso(iso: string): string {
  return claveDia(parsearFecha(iso));
}

/**
 * Genera las celdas de un mes con la semana empezando el lunes.
 * @param anio año completo (2026)
 * @param mes mes de 0 (enero) a 11 (diciembre), como en Date
 * @returns las celdas en orden, en múltiplos de 7
 */
export function generarMes(anio: number, mes: number): DiaCalendario[] {
  const primerDia = new Date(anio, mes, 1);
  // Paso 1: columna del día 1 con la semana empezando el lunes.
  const desplazamiento = (primerDia.getDay() + 6) % 7;
  // Paso 2: el "día 0" del mes siguiente es el último de este mes.
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  // Paso 3: semanas completas.
  const totalCeldas = Math.ceil((desplazamiento + diasDelMes) / 7) * 7;

  return Array.from({ length: totalCeldas }, (_, indice) => {
    // El índice 0 es el día (1 - desplazamiento): Date corrige los negativos y los excesos.
    const fecha = new Date(anio, mes, indice - desplazamiento + 1);
    return { fecha, delMes: fecha.getMonth() === mes, clave: claveDia(fecha) };
  });
}

/**
 * Indica si dos fechas caen el mismo día (ignorando la hora).
 * @param a primera fecha
 * @param b segunda fecha
 * @returns true si es el mismo día
 */
export function mismoDia(a: Date, b: Date): boolean {
  return claveDia(a) === claveDia(b);
}

/**
 * Título del mes: "Octubre 2026".
 * @param anio año
 * @param mes mes de 0 a 11
 * @returns el título
 */
export function tituloMes(anio: number, mes: number): string {
  return `${MESES[mes]} ${anio}`;
}

/**
 * Día completo en texto: "Viernes 23 de Octubre".
 * @param fecha día
 * @returns el texto
 */
export function textoDiaCompleto(fecha: Date): string {
  return `${DIAS_LARGOS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

/**
 * Mueve un mes hacia adelante o hacia atrás, pasando de año si hace falta.
 * @param anio año actual
 * @param mes mes actual (0 a 11)
 * @param delta +1 o -1
 * @returns el nuevo año y mes
 */
export function sumarMes(anio: number, mes: number, delta: number): { anio: number; mes: number } {
  const fecha = new Date(anio, mes + delta, 1);
  return { anio: fecha.getFullYear(), mes: fecha.getMonth() };
}
