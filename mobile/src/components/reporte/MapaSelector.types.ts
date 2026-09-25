/**
 * Tipos compartidos por las versiones nativa y web del selector de ubicación.
 */
import type { Coordenadas } from '@/hooks/useUbicacion';

export type MapaSelectorProps = {
  /** Punto marcado actualmente. */
  coords: Coordenadas;
  /** Se llama cuando el usuario arrastra el pin o toca otro lugar del mapa. */
  onChange: (coords: Coordenadas) => void;
};
