/**
 * Ruta de entrada ("/"). No tiene interfaz propia: redirige al login,
 * que es el primer paso del flujo.
 */
import { Redirect } from 'expo-router';

/** Redirige a la pantalla de ingreso. */
export default function Index() {
  return <Redirect href="/login" />;
}
