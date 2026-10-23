/**
 * Service de mascotas del usuario.
 *
 * El servidor devuelve solo las mascotas a las que está asignado el usuario
 * (como dueño o invitado) y solo deja modificar esas.
 */
import type { Mascota, NuevaMascota } from '@/types/models';
import { conCuerpo, pedirJson } from './http';

/**
 * Lista las mascotas a las que está asignado el usuario.
 * Endpoint: GET /api/mascotas -> 200 Mascota[]
 * @returns las mascotas
 */
export async function obtenerMascotas(): Promise<Mascota[]> {
  return pedirJson<Mascota[]>('/api/mascotas');
}

/**
 * Registra una mascota nueva. El servidor le genera su código único para el
 * QR y deja al usuario como su dueño.
 * Endpoint: POST /api/mascotas  { nombre, raza, edad, senas, foto } -> 201 Mascota
 * @param datos datos del formulario
 * @returns la mascota creada, con id y código
 */
export async function crearMascota(datos: NuevaMascota): Promise<Mascota> {
  return pedirJson<Mascota>('/api/mascotas', conCuerpo('POST', datos));
}

/**
 * Modifica datos de una mascota (el código no cambia). `foto: null` la borra.
 * Endpoint: PATCH /api/mascotas/:id  { ...cambios } -> 200 Mascota
 * @param id id de la mascota
 * @param cambios campos a modificar
 * @returns la mascota actualizada
 */
export async function actualizarMascota(id: number, cambios: Partial<NuevaMascota>): Promise<Mascota> {
  return pedirJson<Mascota>(`/api/mascotas/${id}`, conCuerpo('PATCH', cambios));
}
