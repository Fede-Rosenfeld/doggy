/**
 * Constantes y helpers del mapa.
 */
import type { Coordenadas } from '@/hooks/useUbicacion';

/** Región del mapa, con el mismo formato que usa react-native-maps. */
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/** Centro aproximado de CABA (Obelisco). Es la vista por defecto sin GPS. */
export const CENTRO_CABA: Coordenadas = { lat: -34.6037, lng: -58.3816 };

/** Zoom que muestra casi toda la ciudad. */
export const DELTA_CIUDAD = 0.14;
/** Zoom de barrio, para centrarse en un reporte o en el usuario. */
export const DELTA_BARRIO = 0.02;

/**
 * Arma una región centrada en unas coordenadas.
 * @param coords centro
 * @param delta amplitud en grados (más chico = más zoom)
 * @returns la región para el mapa
 */
export function regionAlrededor(coords: Coordenadas, delta: number = DELTA_BARRIO): Region {
  return {
    latitude: coords.lat,
    longitude: coords.lng,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}
