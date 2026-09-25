/**
 * Helpers de navegación compartidos por las pantallas.
 */
import { Href, router } from 'expo-router';

/**
 * Vuelve a la pantalla anterior. Si no hay historial (por ejemplo, si se abrió
 * la pantalla desde un link o se recargó la app), va a la ruta de respaldo.
 * @param fallback ruta a la que ir si no se puede volver
 */
export function volver(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
