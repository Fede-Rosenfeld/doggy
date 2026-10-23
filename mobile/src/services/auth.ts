/**
 * Service de sesión. El login llega en la Etapa 4: hasta entonces el
 * servidor atiende todos los pedidos como la usuaria de la demo, así que se
 * acepta cualquier email con formato válido (la validación la hace la pantalla).
 */
import type { Usuario } from '@/types/models';
import { obtenerUsuario } from './usuario';

/**
 * Inicia sesión.
 * Endpoint futuro (Etapa 4): POST /api/auth/login  { email, password } -> Usuario
 * @param _email email ingresado
 * @param _password contraseña (el backend la va a verificar)
 * @returns el usuario de la sesión
 */
export async function iniciarSesion(_email: string, _password: string): Promise<Usuario> {
  // Sin login en el servidor, siempre entra la misma cuenta, sin importar el email.
  return obtenerUsuario();
}

/**
 * Cierra la sesión actual. Todavía no hay sesión en el servidor que cerrar.
 * Endpoint futuro (Etapa 4): POST /api/auth/logout -> 204
 */
export async function cerrarSesion(): Promise<void> {
  // Se conecta con pedirSinRespuesta cuando exista el endpoint.
}
