/**
 * Service del carnet sanitario (vacunas, desparasitaciones y otros registros).
 */
import { registrosSanitarios } from '@/data/mock';
import type { NuevoRegistro, RegistroSanitario } from '@/types/models';
import { siguienteId, simularRespuesta } from './http';

let registros: RegistroSanitario[] = registrosSanitarios;

/**
 * Lista los registros sanitarios de todas las mascotas del usuario.
 * Endpoint futuro: GET /api/registros -> 200 RegistroSanitario[]
 * @returns los registros
 */
export async function obtenerRegistros(): Promise<RegistroSanitario[]> {
  return simularRespuesta(registros);
}

/**
 * Agrega un registro al carnet de una mascota.
 * Endpoint futuro: POST /api/mascotas/:id/registros  { ...datos } -> 201 RegistroSanitario
 * @param datos datos del registro, incluido el mascotaId
 * @returns el registro creado
 */
export async function crearRegistro(datos: NuevoRegistro): Promise<RegistroSanitario> {
  const nuevo: RegistroSanitario = { ...datos, id: siguienteId(registros) };
  registros = [...registros, nuevo];
  return simularRespuesta(nuevo);
}
