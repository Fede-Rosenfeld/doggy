/**
 * Service de mascotas del usuario.
 */
import { mascotas as mascotasMock, USUARIO_ID } from '@/data/mock';
import type { Mascota, NuevaMascota } from '@/types/models';
import { generarCodigoMascota } from '@/utils/codigos';
import { siguienteId, simularRespuesta } from './http';

let mascotas: Mascota[] = mascotasMock;

/**
 * Lista las mascotas del usuario.
 * Endpoint futuro: GET /api/mascotas -> 200 Mascota[]
 * @returns las mascotas
 */
export async function obtenerMascotas(): Promise<Mascota[]> {
  return simularRespuesta(mascotas);
}

/**
 * Registra una mascota nueva y le asigna su código único para el QR.
 * Endpoint futuro: POST /api/mascotas  { ...datos } -> 201 Mascota
 * @param datos datos del formulario
 * @returns la mascota creada, con id y código
 */
export async function crearMascota(datos: NuevaMascota): Promise<Mascota> {
  const nueva: Mascota = {
    ...datos,
    id: siguienteId(mascotas),
    tutorId: USUARIO_ID,
    codigo: generarCodigoMascota(datos.nombre, mascotas.map((m) => m.codigo)),
  };
  mascotas = [...mascotas, nueva];
  return simularRespuesta(nueva);
}

/**
 * Modifica datos de una mascota.
 * Endpoint futuro: PATCH /api/mascotas/:id  { ...cambios } -> 200 Mascota
 * @param id id de la mascota
 * @param cambios campos a modificar
 * @returns la mascota actualizada
 */
export async function actualizarMascota(id: number, cambios: Partial<NuevaMascota>): Promise<Mascota> {
  const actual = mascotas.find((m) => m.id === id);
  if (!actual) throw new Error('La mascota no existe.');
  const actualizada: Mascota = { ...actual, ...cambios };
  mascotas = mascotas.map((m) => (m.id === id ? actualizada : m));
  return simularRespuesta(actualizada);
}
