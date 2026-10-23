/**
 * Ruta de entrada ("/"). No tiene interfaz propia: con una sesión guardada
 * entra directo a las tabs y, si no, va al login. Mientras se lee el token no
 * dibuja nada (la splash sigue visible), así no se ve el login un instante.
 */
import { Redirect } from 'expo-router';

import { useApp } from '@/context/AppContext';

/** Redirige a las tabs o al login según haya sesión. */
export default function Index() {
  const { sesion } = useApp();
  if (sesion === 'restaurando') return null;
  return <Redirect href={sesion === 'abierta' ? '/mascotas' : '/login'} />;
}
