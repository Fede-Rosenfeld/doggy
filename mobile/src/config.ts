/**
 * Configuración general de la app.
 *
 * API_URL apunta al backend Express que se suma en el Sprint 2. Se lee de la
 * variable EXPO_PUBLIC_API_URL (archivo .env de mobile/). Desde el celular
 * no sirve "localhost": hay que usar la IP local de la PC en la misma red.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Página oficial del Gobierno de la Ciudad con las reglas para pasear perros
 * en el espacio público: correa y collar o pretal, bozal si es agresivo,
 * chapita con nombre y teléfono, levantar la caca y soltarlo solo en caniles.
 * Esas obligaciones las sanciona el art. 1.3.12 del Código Contravencional
 * (texto según Ley 6839/2025) con multa de 150 a 1.000 unidades fijas.
 * Revisado en septiembre de 2026.
 */
export const GUIA_PASEO_URL =
  'https://buenosaires.gob.ar/gcaba_historico/agenciaambiental/animalesba/perros-y-gatos-en-el-espacio-publico';

/** Aviso para las acciones que necesitan el backend y todavía no están. */
export const AVISO_SPRINT_2 = 'Se va a implementar en el Sprint 2 con backend.';
