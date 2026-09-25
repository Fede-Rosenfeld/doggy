/**
 * Service de familia y cuidadores asignados a cada mascota.
 */
import { cuidadores as cuidadoresMock } from '@/data/mock';
import type { Cuidador } from '@/types/models';
import { simularRespuesta } from './http';

/**
 * Lista los cuidadores de las mascotas del usuario.
 * Endpoint futuro: GET /api/cuidadores -> 200 Cuidador[]
 * @returns los cuidadores
 */
export async function obtenerCuidadores(): Promise<Cuidador[]> {
  return simularRespuesta(cuidadoresMock);
}
