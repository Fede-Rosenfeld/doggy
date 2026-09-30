/**
 * Service de mascotas del usuario.
 *
 * La "base" tiene mascotas de varios usuarios; al usuario logueado se le
 * devuelven solo aquellas a las que está asignado (como dueño o invitado).
 */
import { mascotas as mascotasMock, USUARIO_ID } from '@/data/mock';
import type { Mascota, NuevaMascota } from '@/types/models';
import { generarCodigoMascota } from '@/utils/codigos';
import { asignarCreador, idsMascotasDe } from './cuidadores';
import { siguienteId, simularRespuesta } from './http';

let mascotas: Mascota[] = mascotasMock;

/**
 * Lista las mascotas a las que está asignado el usuario.
 * Endpoint futuro: GET /api/mascotas -> 200 Mascota[]
 * @returns las mascotas
 */
export async function obtenerMascotas(): Promise<Mascota[]> {
  const asignadas = new Set(idsMascotasDe(USUARIO_ID));
  return simularRespuesta(mascotas.filter((m) => asignadas.has(m.id)));
}

/**
 * Registra una mascota nueva, le asigna su código único para el QR y deja al
 * usuario como su dueño.
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
  asignarCreador(nueva.id);
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
