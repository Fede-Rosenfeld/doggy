/**
 * Token de la sesión: lo guarda en el dispositivo y lo tiene a mano en
 * memoria para que `http.ts` lo sume a cada pedido.
 *
 * Almacenamiento seguro: usa `expo-secure-store`, que guarda el token
 * cifrado en el Keychain (iOS) o con el Keystore (Android). No pide permisos.
 * La app lo necesita para que la sesión sobreviva al cerrarla: al volver a
 * abrirla, si hay un token guardado entra directo sin pedir la contraseña.
 * En la web no existe ese almacenamiento, así que se usa `localStorage`.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Clave con la que se guarda el token (SecureStore solo acepta letras, números, ".", "-" y "_"). */
const CLAVE_TOKEN = 'doggy.token';

/** Token de la sesión abierta, o null si no hay sesión. */
let tokenActual: string | null = null;

/**
 * Lee el token guardado en el dispositivo y lo deja en memoria.
 * Se llama una sola vez, al abrir la app.
 * @returns el token, o null si no hay sesión guardada
 */
export async function cargarToken(): Promise<string | null> {
  tokenActual =
    Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(CLAVE_TOKEN) ?? null
      : await SecureStore.getItemAsync(CLAVE_TOKEN);
  return tokenActual;
}

/**
 * Devuelve el token de la sesión abierta, sin leer el almacenamiento.
 * @returns el token, o null si no hay sesión
 */
export function tokenDeSesion(): string | null {
  return tokenActual;
}

/**
 * Guarda el token de una sesión nueva (después del login o el registro).
 * @param token token que devolvió el servidor
 */
export async function guardarToken(token: string): Promise<void> {
  tokenActual = token;
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(CLAVE_TOKEN, token);
  } else {
    await SecureStore.setItemAsync(CLAVE_TOKEN, token);
  }
}

/**
 * Borra el token (logout o sesión vencida). Primero lo saca de memoria, así
 * los pedidos que salgan desde ese momento ya no lo usan.
 */
export async function borrarToken(): Promise<void> {
  tokenActual = null;
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(CLAVE_TOKEN);
  } else {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  }
}
