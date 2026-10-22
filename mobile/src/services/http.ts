/**
 * Utilidades compartidas por los services.
 *
 * Las lecturas ya van a la API con `pedirJson`. Las escrituras todavía
 * trabajan contra datos en memoria con `simularRespuesta`, hasta que se
 * conecten en la Etapa 3.
 */
import { API_URL } from '@/config';

/** Demora simulada de una respuesta, en milisegundos. */
const LATENCIA_MS = 350;
/**
 * Tiempo máximo de espera de un pedido. Si la IP de la API está mal o la PC
 * no está en la misma red, fetch puede tardar mucho en fallar: así la app
 * muestra el error en vez de quedarse cargando.
 */
const TIEMPO_MAXIMO_MS = 10000;
/** Mensaje cuando no se pudo llegar al servidor (sin red, IP equivocada o API apagada). */
const MENSAJE_SIN_CONEXION = 'No pudimos conectarnos con el servidor. Revisá tu conexión y probá de nuevo.';

/**
 * Simula una respuesta del servidor: espera un poco y devuelve una copia de los datos,
 * así nadie puede modificar el "servidor" por referencia.
 * @param datos lo que respondería la API
 * @returns una promesa con la copia de los datos
 */
export function simularRespuesta<T>(datos: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(datos)) as T), LATENCIA_MS);
  });
}

/**
 * Hace un pedido a la API y devuelve el JSON.
 * @param ruta ruta de la API, por ejemplo "/api/mascotas"
 * @param opciones método, headers y body del fetch
 * @returns el cuerpo de la respuesta ya parseado
 * @throws con el `{ error }` del servidor, o con un mensaje de conexión si no
 *   respondió dentro de `TIEMPO_MAXIMO_MS`
 */
export async function pedirJson<T>(ruta: string, opciones?: RequestInit): Promise<T> {
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
  return (await response.json()) as T;
}

/**
 * Calcula el próximo id libre de una lista (imita el autoincrement de la base).
 * @param lista registros existentes
 * @returns el id siguiente al mayor
 */
export function siguienteId(lista: { id: number }[]): number {
  return lista.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}
