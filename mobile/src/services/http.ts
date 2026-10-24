/**
 * Utilidades compartidas por los services para hablar con la API.
 *
 * `pedirJson` es para las respuestas con body (GET, POST, PATCH) y
 * `pedirSinRespuesta` para los 204 de los DELETE, que no traen nada para leer.
 * Si el body es un FormData (subir una foto), no se pone `Content-Type`:
 * fetch lo arma solo con el boundary del multipart.
 * Los dos lanzan un `ErrorApi` (con el status) si el servidor respondió con
 * un error, o un `Error` común si no se pudo llegar al servidor.
 *
 * Sesión: si hay un token, cada pedido lo manda en `Authorization: Bearer`.
 * Si el servidor responde 401 (la sesión venció o se cerró), se borra el
 * token y se avisa al `AppContext`, que limpia el estado y vuelve al login.
 */
import { API_URL } from '@/config';
import { borrarToken, tokenDeSesion } from './sesion';

/**
 * Tiempo máximo de espera de un pedido. Si la IP de la API está mal o la PC
 * no está en la misma red, fetch puede tardar mucho en fallar: así la app
 * muestra el error en vez de quedarse cargando.
 */
const TIEMPO_MAXIMO_MS = 10000;
/** Mensaje cuando no se pudo llegar al servidor (sin red, IP equivocada o API apagada). */
const MENSAJE_SIN_CONEXION = 'No pudimos conectarnos con el servidor. Revisá tu conexión y probá de nuevo.';

/**
 * Rutas cuyo 401 no significa "se venció la sesión": el login lo usa para
 * credenciales incorrectas (la pantalla muestra el mensaje) y el logout, para
 * un token que ya estaba cerrado (igual se borra el token local).
 */
const RUTAS_CON_401_PROPIO = ['/api/auth/login', '/api/auth/logout'];

/**
 * Error que respondió el servidor: trae el status para los casos en que la
 * app tiene que distinguirlo (por ejemplo, un 404 al buscar por código). Si
 * no se pudo llegar al servidor se lanza un `Error` común, no este.
 */
export class ErrorApi extends Error {
  /**
   * @param status status HTTP de la respuesta
   * @param mensaje el `{ error }` del servidor
   */
  constructor(
    readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

/** Qué hacer cuando la sesión vence. Lo registra el `AppContext`. */
let alVencerSesion: (() => void) | null = null;

/**
 * Registra la función que se llama cuando un pedido responde 401.
 * @param fn función que limpia el estado y vuelve al login (null para sacarla)
 */
export function registrarAlVencerSesion(fn: (() => void) | null): void {
  alVencerSesion = fn;
}

/**
 * Arma los headers de un pedido: JSON (salvo que el body sea un FormData) y,
 * si hay sesión, el token.
 * @param token token de la sesión, o null
 * @param body body del pedido
 * @returns los headers
 */
function armarHeaders(token: string | null, body: RequestInit['body']): Record<string, string> {
  const headers: Record<string, string> = body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Hace un pedido a la API y revisa que haya salido bien.
 * @param ruta ruta de la API, por ejemplo "/api/mascotas"
 * @param opciones método, headers y body del fetch
 * @param tiempoMaximoMs cuánto esperar la respuesta (más para subir una foto)
 * @returns la respuesta, sin leer el body
 * @throws `ErrorApi` con el status y el `{ error }` del servidor, o un `Error`
 *   con un mensaje de conexión si no respondió dentro de `tiempoMaximoMs`
 */
async function pedir(ruta: string, opciones?: RequestInit, tiempoMaximoMs = TIEMPO_MAXIMO_MS): Promise<Response> {
  const token = tokenDeSesion();
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), tiempoMaximoMs);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${ruta}`, {
      headers: armarHeaders(token, opciones?.body),
      ...opciones,
      signal: controlador.signal,
    });
  } catch (error) {
    // Sin red, IP equivocada, API apagada o se cortó por tiempo: el detalle
    // técnico queda en la consola y el usuario ve un mensaje claro.
    console.warn(`No se pudo llamar a ${ruta}:`, error);
    throw new Error(MENSAJE_SIN_CONEXION);
  } finally {
    clearTimeout(temporizador);
  }
  if (response.status === 401 && token && !RUTAS_CON_401_PROPIO.includes(ruta)) {
    return sesionVencida(token);
  }
  if (!response.ok) {
    const cuerpo = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ErrorApi(response.status, cuerpo.error ?? `Error ${response.status} al llamar a ${ruta}`);
  }
  return response;
}

/**
 * Cierra la sesión que venció: borra el token y avisa al `AppContext` (una
 * sola vez, aunque varios pedidos en paralelo respondan 401).
 *
 * Devuelve una promesa que nunca termina: la pantalla que hizo el pedido se
 * desmonta al volver al login, y así no muestra un error encima del aviso de
 * sesión vencida.
 * @param token token con el que salió el pedido
 * @returns una promesa que no se resuelve ni se rechaza
 */
async function sesionVencida(token: string): Promise<never> {
  // Si el token ya no es el actual, otro pedido ya avisó (o se abrió otra sesión).
  if (token === tokenDeSesion()) {
    await borrarToken();
    alVencerSesion?.();
  }
  return new Promise<never>(() => {});
}

/**
 * Hace un pedido a la API y devuelve el JSON.
 * @param ruta ruta de la API, por ejemplo "/api/mascotas"
 * @param opciones método, headers y body del fetch
 * @param tiempoMaximoMs cuánto esperar la respuesta (por defecto `TIEMPO_MAXIMO_MS`)
 * @returns el cuerpo de la respuesta ya parseado
 * @throws igual que `pedir`
 */
export async function pedirJson<T>(ruta: string, opciones?: RequestInit, tiempoMaximoMs?: number): Promise<T> {
  const response = await pedir(ruta, opciones, tiempoMaximoMs);
  return (await response.json()) as T;
}

/**
 * Hace un pedido cuya respuesta no trae body (un 204 de un DELETE). Solo
 * revisa `response.ok`: no intenta leer JSON, que fallaría con el body vacío.
 * @param ruta ruta de la API
 * @param opciones método, headers y body del fetch
 * @throws igual que `pedir`
 */
export async function pedirSinRespuesta(ruta: string, opciones?: RequestInit): Promise<void> {
  await pedir(ruta, opciones);
}

/**
 * Arma las opciones de un pedido que manda un body JSON.
 * @param method POST o PATCH
 * @param body datos a mandar (los `undefined` se descartan: para borrar un campo, `null`)
 * @returns las opciones para `pedirJson`
 */
export function conCuerpo(method: 'POST' | 'PATCH', body: unknown): RequestInit {
  return { method, body: JSON.stringify(body) };
}
