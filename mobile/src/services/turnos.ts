/**
 * Service de turnos de la agenda.
 */
import type { NuevoTurno, Turno } from '@/types/models';
import { conCuerpo, pedirJson, pedirSinRespuesta } from './http';

/**
 * Lista los turnos del usuario.
 * Endpoint: GET /api/turnos -> 200 Turno[]
 * @returns los turnos
 */
export async function obtenerTurnos(): Promise<Turno[]> {
  return pedirJson<Turno[]>('/api/turnos');
}

/**
 * Agenda un turno nuevo.
 * Endpoint: POST /api/turnos  { mascotaId, categoria, fecha, motivo, lugar } -> 201 Turno
 * @param datos datos del turno
 * @returns el turno creado
 */
export async function crearTurno(datos: NuevoTurno): Promise<Turno> {
  return pedirJson<Turno>('/api/turnos', conCuerpo('POST', datos));
}

/**
 * Modifica un turno con todos los datos del formulario (cambio de fecha, hora, lugar, etc.).
 * Endpoint: PATCH /api/turnos/:id  { mascotaId, categoria, fecha, motivo, lugar } -> 200 Turno
 * @param id id del turno
 * @param datos datos completos del turno
 * @returns el turno actualizado
 */
export async function actualizarTurno(id: number, datos: NuevoTurno): Promise<Turno> {
  return pedirJson<Turno>(`/api/turnos/${id}`, conCuerpo('PATCH', datos));
}

/**
 * Borra un turno de la agenda.
 * Endpoint: DELETE /api/turnos/:id -> 204
 * @param id id del turno
 */
export async function borrarTurno(id: number): Promise<void> {
  await pedirSinRespuesta(`/api/turnos/${id}`, { method: 'DELETE' });
}
