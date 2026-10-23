/**
 * Utilidades compartidas por los services para hablar con la API.
 *
 * `pedirJson` es para las respuestas con body (GET, POST, PATCH) y
 * `pedirSinRespuesta` para los 204 de los DELETE, que no traen nada para leer.
 * Los dos lanzan un `Error` con el mensaje del servidor si algo sale mal.
 */
import { API_URL } from '@/config';

/**
 * Tiempo máximo de espera de un pedido. Si la IP de la API está mal o la PC
 * no está en la misma red, fetch puede tardar mucho en fallar: así la app
 * muestra el error en vez de quedarse cargando.
 */
const TIEMPO_MAXIMO_MS = 10000;
/** Mensaje cuando no se pudo llegar al servidor (sin red, IP equivocada o API apagada). */
const MENSAJE_SIN_CONEXION = 'No pudimos conectarnos con el servidor. Revisá tu conexión y probá de nuevo.';

/**
 * Hace un pedido a la API y revisa que haya salido bien.
 * @param ruta ruta de la API, por ejemplo "/api/mascotas"
 * @param opciones método, headers y body del fetch
 * @returns la respuesta, sin leer el body
 * @throws con el `{ error }` del servidor, o con un mensaje de conexión si no
 *   respondió dentro de `TIEMPO_MAXIMO_MS`
 */
async function pedir(ruta: string, opciones?: RequestInit): Promise<Response> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
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
  if (!response.ok) {
    const cuerpo = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(cuerpo.error ?? `Error ${response.status} al llamar a ${ruta}`);
  }
  return response;
}

/**
 * Hace un pedido a la API y devuelve el JSON.
 * @param ruta ruta de la API, por ejemplo "/api/mascotas"
 * @param opciones método, headers y body del fetch
 * @returns el cuerpo de la respuesta ya parseado
 * @throws igual que `pedir`
 */
export async function pedirJson<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const response = await pedir(ruta, opciones);
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
