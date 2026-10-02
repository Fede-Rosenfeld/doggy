/**
 * Service de reportes de mascotas perdidas y encontradas (mapa comunitario).
 */
import { reportes as reportesMock, USUARIO_ID } from '@/data/mock';
import type { NuevoReporte, ReportePerdida } from '@/types/models';
import { siguienteId, simularRespuesta } from './http';

let reportes: ReportePerdida[] = reportesMock;

/**
 * Lista los reportes activos de la zona.
 * Endpoint futuro: GET /api/reportes -> 200 ReportePerdida[]
 * @returns los reportes
 */
export async function obtenerReportes(): Promise<ReportePerdida[]> {
  return simularRespuesta(reportes);
}

/**
 * Publica un reporte nuevo.
 * Endpoint futuro: POST /api/reportes  { ...datos } -> 201 ReportePerdida
 * @param datos datos del reporte
 * @returns el reporte creado
 */
export async function crearReporte(datos: NuevoReporte): Promise<ReportePerdida> {
  const nuevo: ReportePerdida = { ...datos, id: siguienteId(reportes), autorId: USUARIO_ID };
  reportes = [...reportes, nuevo];
  return simularRespuesta(nuevo);
}

/**
 * Modifica un reporte ya publicado (por ejemplo, el punto o el radio de búsqueda).
 * Endpoint futuro: PATCH /api/reportes/:id  { ...cambios } -> 200 ReportePerdida
 * @param id id del reporte
 * @param cambios campos a modificar
 * @returns el reporte actualizado
 */
export async function actualizarReporte(
  id: number,
  cambios: Partial<NuevoReporte>,
): Promise<ReportePerdida> {
  const actual = reportes.find((r) => r.id === id);
  if (!actual) throw new Error('El reporte no existe.');
  const actualizado: ReportePerdida = { ...actual, ...cambios };
  reportes = reportes.map((r) => (r.id === id ? actualizado : r));
  return simularRespuesta(actualizado);
}

/**
 * Cierra un reporte porque la mascota ya apareció: deja de estar activo y sale del mapa.
 * Endpoint futuro: DELETE /api/reportes/:id -> 204
 * @param id id del reporte
 */
export async function cerrarReporte(id: number): Promise<void> {
  if (!reportes.some((r) => r.id === id)) throw new Error('El reporte no existe.');
  reportes = reportes.filter((r) => r.id !== id);
  return simularRespuesta(undefined);
}
