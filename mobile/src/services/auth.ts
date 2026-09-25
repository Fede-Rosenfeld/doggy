/**
 * Service de sesión. Sin backend no hay credenciales reales: se acepta
 * cualquier email con formato válido (la validación la hace la pantalla).
 */
import type { Usuario } from '@/types/models';
import { simularRespuesta } from './http';
import { obtenerUsuario } from './usuario';

/**
 * Inicia sesión.
 * Endpoint futuro: POST /api/auth/login  { email, password } -> Usuario
 * @param _email email ingresado
 * @param _password contraseña (el backend la va a verificar)
 * @returns el usuario de la sesión
 */
export async function iniciarSesion(_email: string, _password: string): Promise<Usuario> {
  // Con datos de ejemplo siempre entra la misma cuenta, sin importar el email.
  return obtenerUsuario();
}

/**
 * Cierra la sesión actual.
 * Endpoint futuro: POST /api/auth/logout -> 204
 */
export async function cerrarSesion(): Promise<void> {
  await simularRespuesta(null);
}
