/**
 * Service del usuario logueado (perfil y contacto de emergencia).
 */
import { usuario as usuarioMock } from '@/data/mock';
import type { DatosUsuario, Usuario } from '@/types/models';
import { simularRespuesta } from './http';

// "Base de datos" en memoria mientras no haya backend.
let usuarioActual: Usuario = usuarioMock;

/**
 * Trae el perfil del usuario.
 * Endpoint futuro: GET /api/usuarios/me -> 200 Usuario
 * @returns el usuario
 */
export async function obtenerUsuario(): Promise<Usuario> {
  return simularRespuesta(usuarioActual);
}

/**
 * Actualiza datos del perfil.
 * Endpoint futuro: PATCH /api/usuarios/me  { ...datos } -> 200 Usuario
 * @param datos campos a modificar
 * @returns el usuario actualizado
 */
export async function actualizarUsuario(datos: DatosUsuario): Promise<Usuario> {
  usuarioActual = { ...usuarioActual, ...datos };
  return simularRespuesta(usuarioActual);
}
