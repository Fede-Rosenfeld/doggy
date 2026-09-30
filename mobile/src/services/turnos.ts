/**
 * Service de turnos de la agenda.
 */
import { turnos as turnosMock } from '@/data/mock';
import type { NuevoTurno, Turno } from '@/types/models';
import { siguienteId, simularRespuesta } from './http';

let turnos: Turno[] = turnosMock;

/**
 * Lista los turnos del usuario.
 * Endpoint futuro: GET /api/turnos -> 200 Turno[]
 * @returns los turnos
 */
export async function obtenerTurnos(): Promise<Turno[]> {
  return simularRespuesta(turnos);
}

/**
 * Agenda un turno nuevo.
 * Endpoint futuro: POST /api/turnos  { ...datos } -> 201 Turno
 * @param datos datos del turno
 * @returns el turno creado
 */
export async function crearTurno(datos: NuevoTurno): Promise<Turno> {
  const nuevo: Turno = { ...datos, id: siguienteId(turnos) };
  turnos = [...turnos, nuevo];
  return simularRespuesta(nuevo);
}

/**
 * Reemplaza los datos de un turno (cambio de fecha, hora, lugar, etc.).
 * Endpoint futuro: PUT /api/turnos/:id  { ...datos } -> 200 Turno
 * @param id id del turno
 * @param datos datos completos del turno
 * @returns el turno actualizado
 */
export async function actualizarTurno(id: number, datos: NuevoTurno): Promise<Turno> {
  if (!turnos.some((t) => t.id === id)) throw new Error('El turno no existe.');
  const actualizado: Turno = { ...datos, id };
  turnos = turnos.map((t) => (t.id === id ? actualizado : t));
  return simularRespuesta(actualizado);
}
