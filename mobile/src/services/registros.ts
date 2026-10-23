/**
 * Service del carnet sanitario (vacunas, desparasitaciones y otros registros).
 */
import type { NuevoRegistro, RegistroSanitario } from '@/types/models';
import { conCuerpo, pedirJson, pedirSinRespuesta } from './http';

/**
 * Lista los registros sanitarios de todas las mascotas del usuario.
 * Las fechas llegan como AAAA-MM-DD y se leen con `parsearFecha` (día local).
 * Endpoint: GET /api/registros -> 200 RegistroSanitario[]
 * @returns los registros
 */
export async function obtenerRegistros(): Promise<RegistroSanitario[]> {
  return pedirJson<RegistroSanitario[]>('/api/registros');
}

/**
 * Agrega un registro al carnet de una mascota.
 * Endpoint: POST /api/mascotas/:id/registros
 *   { tipo, nombre, fecha, profesional, proximaDosis?, fotoEtiqueta? } -> 201 RegistroSanitario
 * @param datos datos del registro, incluido el mascotaId
 * @returns el registro creado
 */
export async function crearRegistro(datos: NuevoRegistro): Promise<RegistroSanitario> {
  return pedirJson<RegistroSanitario>(
    `/api/mascotas/${datos.mascotaId}/registros`,
    conCuerpo('POST', datos),
  );
}

/**
 * Corrige un registro mal cargado con todos los datos del formulario. Los
 * opcionales que no vienen se mandan como `null` para que el servidor los
 * borre: si se sacó el refuerzo o la foto de la etiqueta, el registro queda sin ellos.
 * Endpoint: PATCH /api/registros/:id
 *   { tipo, nombre, fecha, profesional, proximaDosis | null, fotoEtiqueta | null } -> 200 RegistroSanitario
 * @param id id del registro
 * @param datos datos completos del registro
 * @returns el registro actualizado
 */
export async function actualizarRegistro(
  id: number,
  datos: NuevoRegistro,
): Promise<RegistroSanitario> {
  // El servidor ignora el mascotaId: un registro no cambia de mascota.
  const cuerpo = {
    ...datos,
    proximaDosis: datos.proximaDosis ?? null,
    fotoEtiqueta: datos.fotoEtiqueta ?? null,
  };
  return pedirJson<RegistroSanitario>(`/api/registros/${id}`, conCuerpo('PATCH', cuerpo));
}

/**
 * Borra un registro del carnet.
 * Endpoint: DELETE /api/registros/:id -> 204
 * @param id id del registro
 */
export async function borrarRegistro(id: number): Promise<void> {
  await pedirSinRespuesta(`/api/registros/${id}`, { method: 'DELETE' });
}
