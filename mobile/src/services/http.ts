/**
 * Utilidades compartidas por los services.
 *
 * Hoy los services trabajan contra datos en memoria y simulan la demora de
 * la red. En el Sprint 2 cada función pasa a hacer
 * `fetch(`${API_URL}/api/...`)` y a revisar `response.ok`, como en la
 * Práctica Prisma; `pedirJson` queda listo para eso.
 */
import { API_URL } from '@/config';

/** Demora simulada de una respuesta, en milisegundos. */
const LATENCIA_MS = 350;

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
 * Hace un pedido a la API y devuelve el JSON. Todavía no se usa: es la versión
 * real que van a llamar los services cuando exista el backend.
 * @param ruta ruta de la API, por ejemplo "/api/mascotas"
 * @param opciones método, headers y body del fetch
 * @returns el cuerpo de la respuesta ya parseado
 */
export async function pedirJson<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
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
