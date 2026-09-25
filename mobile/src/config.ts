/**
 * Configuración general de la app.
 *
 * API_URL apunta al backend Express que se suma en el Sprint 2. Se lee de la
 * variable EXPO_PUBLIC_API_URL (archivo .env de mobile/). Desde el celular
 * no sirve "localhost": hay que usar la IP local de la PC en la misma red.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
