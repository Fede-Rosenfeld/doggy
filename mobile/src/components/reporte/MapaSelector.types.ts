/**
 * Tipos compartidos por las versiones nativa y web del selector de ubicación.
 */
import type { Coordenadas } from '@/hooks/useUbicacion';

export type MapaSelectorProps = {
  /** Punto marcado actualmente. */
  coords: Coordenadas;
  /** Se llama cuando el usuario arrastra el pin o toca otro lugar del mapa. */
  onChange: (coords: Coordenadas) => void;
  /**
   * Si viene, dibuja un círculo de ese radio (en metros) alrededor del pin y
   * ajusta el zoom para que entre completo. Se usa en "Se perdió mi mascota".
   */
  radioMetros?: number;
};
