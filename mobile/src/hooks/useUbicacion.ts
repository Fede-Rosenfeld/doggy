/**
 * Hook de ubicación del dispositivo.
 *
 * HARDWARE: receptor GPS (con ayuda de Wi-Fi y red celular que usa el sistema
 * para ubicar más rápido) a través de expo-location.
 * PERMISO: ubicación en primer plano ("mientras se usa la app"). El texto que
 * ve el usuario está en el plugin de expo-location en app.json. No se pide
 * ubicación en segundo plano: la app solo la usa con la pantalla abierta.
 * POR QUÉ: sin la posición no se puede mostrar qué mascotas perdidas hay
 * cerca ni marcar con precisión dónde se perdió una. La dirección legible
 * (reverse geocoding) hace que el reporte se entienda sin mirar el mapa.
 *
 * Sigue el patrón de hook tipado de la cátedra:
 * 1. verificar disponibilidad (servicios de ubicación activos),
 * 2. pedir permiso (consultar → pedir → resultado),
 * 3. leer la posición (consulta puntual, sin suscripción que limpiar),
 * y en el useEffect se cancela la actualización de estado si el componente
 * se desmonta antes de que llegue la respuesta.
 */
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';

import type { EstadoPermiso } from '@/types/permisos';

export type Coordenadas = {
  lat: number;
  lng: number;
};

/** Dirección legible de un punto del mapa. */
export type DireccionLegible = {
  /** Calle, número y barrio: "Av. Santa Fe 3200, Palermo". */
  texto: string;
  /** Solo el barrio o la ciudad, para agrupar reportes: "Palermo". */
  zona: string | null;
};

type Opciones = {
  /** Si es true, pide la ubicación apenas se monta el componente. */
  automatico?: boolean;
};

type UseUbicacion = {
  ubicacion: Coordenadas | null;
  cargando: boolean;
  /** Mensaje de error si el GPS está apagado o falló la lectura. */
  error: string | null;
  permiso: EstadoPermiso;
  /** false si el sistema ya no deja volver a mostrar el diálogo de permiso. */
  puedePreguntar: boolean;
  /** Lee la posición actual (pidiendo permiso si hace falta). */
  obtenerUbicacion: () => Promise<Coordenadas | null>;
  /** Convierte coordenadas en una dirección legible ("Av. Santa Fe 3200, Palermo"). */
  obtenerDireccion: (coords: Coordenadas) => Promise<DireccionLegible | null>;
  abrirAjustes: () => Promise<void>;
};

/**
 * Pide el permiso de ubicación en primer plano: consultar → pedir → resultado.
 * @returns si quedó concedido y si se puede volver a preguntar
 */
async function asegurarPermiso(): Promise<{ concedido: boolean; puedePreguntar: boolean }> {
  const actual = await Location.getForegroundPermissionsAsync();
  if (actual.granted) return { concedido: true, puedePreguntar: true };

  const respuesta = await Location.requestForegroundPermissionsAsync();
  return { concedido: respuesta.granted, puedePreguntar: respuesta.canAskAgain };
}

/**
 * Arma un texto corto a partir de la dirección que devuelve el sistema.
 * @param direccion resultado de reverseGeocodeAsync
 * @returns calle y número con el barrio, y el barrio solo
 */
function formatearDireccion(direccion: Location.LocationGeocodedAddress): DireccionLegible {
  const calle = [direccion.street, direccion.streetNumber].filter(Boolean).join(' ');
  const zona = direccion.district ?? direccion.subregion ?? direccion.city;
  return {
    texto: [calle, zona].filter(Boolean).join(', ') || 'Ubicación sin nombre',
    zona,
  };
}

/**
 * Resultado de una lectura del GPS, sin tocar el estado de React.
 * `permiso` es null si no se llegó a consultar (por ejemplo, con la ubicación
 * del sistema apagada) y `coords` es null si no se obtuvo la posición.
 */
type LecturaGps = {
  coords: Coordenadas | null;
  permiso: EstadoPermiso | null;
  puedePreguntar: boolean | null;
  error: string | null;
};

/**
 * Lee la posición siguiendo los pasos del hook: disponibilidad → permiso →
 * lectura puntual con precisión alta. No toca el estado: devuelve qué pasó.
 * @returns el resultado de la lectura
 */
async function leerGps(): Promise<LecturaGps> {
  let permiso: EstadoPermiso | null = null;
  let puedePreguntar: boolean | null = null;
  try {
    // 1. Disponibilidad: el usuario puede tener la ubicación apagada en el sistema.
    const serviciosActivos = await Location.hasServicesEnabledAsync();
    if (!serviciosActivos) {
      return {
        coords: null,
        permiso,
        puedePreguntar,
        error: 'Activá la ubicación del dispositivo para usar el mapa.',
      };
    }

    // 2. Permiso.
    const resultado = await asegurarPermiso();
    permiso = resultado.concedido ? 'concedido' : 'denegado';
    puedePreguntar = resultado.puedePreguntar;
    if (!resultado.concedido) return { coords: null, permiso, puedePreguntar, error: null };

    // 3. Lectura puntual de la posición.
    const posicion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const coords = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
    return { coords, permiso, puedePreguntar, error: null };
  } catch {
    return {
      coords: null,
      permiso,
      puedePreguntar,
      error: 'No pudimos obtener tu ubicación. Probá de nuevo.',
    };
  }
}

/**
 * Hook de GPS con estados de carga, error y permiso.
 * @param opciones `automatico` para leer la ubicación al montar
 * @returns la ubicación y las funciones para pedirla y traducirla a dirección
 */
export function useUbicacion({ automatico = false }: Opciones = {}): UseUbicacion {
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  // En modo automático arranca cargando: la lectura empieza apenas se monta.
  const [cargando, setCargando] = useState(automatico);
  const [error, setError] = useState<string | null>(null);
  const [permiso, setPermiso] = useState<EstadoPermiso>('sin-consultar');
  const [puedePreguntar, setPuedePreguntar] = useState(true);
  // Evita actualizar estado si la pantalla se cerró mientras el GPS respondía.
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  /**
   * Pasa al estado el resultado de una lectura del GPS (si la pantalla sigue abierta).
   * @param lectura lo que devolvió `leerGps`
   */
  const aplicarLectura = useCallback((lectura: LecturaGps) => {
    if (!montado.current) return;
    if (lectura.puedePreguntar !== null) setPuedePreguntar(lectura.puedePreguntar);
    if (lectura.permiso !== null) setPermiso(lectura.permiso);
    if (lectura.coords) setUbicacion(lectura.coords);
    setError(lectura.error);
    setCargando(false);
  }, []);

  /** Verifica servicios y permiso, y lee la posición con precisión alta. */
  const obtenerUbicacion = useCallback(async (): Promise<Coordenadas | null> => {
    setCargando(true);
    setError(null);
    const lectura = await leerGps();
    aplicarLectura(lectura);
    return lectura.coords;
  }, [aplicarLectura]);

  /** Traduce coordenadas a una dirección; si falla devuelve null y el llamador decide qué mostrar. */
  const obtenerDireccion = useCallback(async (coords: Coordenadas): Promise<DireccionLegible | null> => {
    try {
      const resultados = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lng,
      });
      return resultados.length > 0 ? formatearDireccion(resultados[0]) : null;
    } catch {
      return null;
    }
  }, []);

  /** Abre los ajustes de la app para habilitar el permiso a mano. */
  const abrirAjustes = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  // Lectura automática al montar: el estado inicial ya marca cargando y sin
  // error, así que solo se lee el GPS y el resultado se aplica en el callback.
  useEffect(() => {
    if (automatico) leerGps().then(aplicarLectura);
  }, [automatico, aplicarLectura]);

  return {
    ubicacion,
    cargando,
    error,
    permiso,
    puedePreguntar,
    obtenerUbicacion,
    obtenerDireccion,
    abrirAjustes,
  };
}
