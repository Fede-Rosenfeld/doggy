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
