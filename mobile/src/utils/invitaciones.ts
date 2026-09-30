/**
 * Helpers de los links de asignación de mascotas: armar el link a partir del
 * código y sacar el código de lo que pegue el usuario.
 */
import * as Linking from 'expo-linking';

/** Código de un link: letras y números, sin espacios. */
const TOKEN_REGEX = /^[A-Z0-9]{6,16}$/;

/**
 * Arma el link que abre la pantalla de asignación con el código.
 * En una build es `doggy://asignar?token=XXXX`; en Expo Go usa la URL de
 * desarrollo (`exp://.../--/asignar?token=XXXX`), así también se puede probar.
 * @param token código de la invitación
 * @returns el link para compartir
 */
export function linkDeInvitacion(token: string): string {
  return Linking.createURL('/asignar', { queryParams: { token } });
}

/**
 * Saca el código de lo que pegó el usuario: el link completo o solo el código.
 * @param texto link o código
 * @returns el código en mayúsculas, o null si no se reconoce
 */
export function tokenDeTexto(texto: string): string | null {
  const limpio = texto.trim();
  const enLink = /[?&]token=([A-Za-z0-9]+)/.exec(limpio);
  const token = (enLink ? enLink[1] : limpio).toUpperCase();
  return TOKEN_REGEX.test(token) ? token : null;
}
