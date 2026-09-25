/**
 * Mapa de reportes (versión nativa, con react-native-maps).
 *
 * Usa el mapa del sistema (Apple Maps en iOS, Google Maps en Android, ambos
 * disponibles en Expo Go). Arranca mostrando CABA y expone `centrar` por ref
 * para que la pantalla mueva la cámara al tocar una card o "mi ubicación".
 */
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

import { CENTRO_CABA, DELTA_BARRIO, DELTA_CIUDAD, regionAlrededor } from '@/utils/mapa';
import type { MapaReportesHandle, MapaReportesProps } from './MapaReportes.types';
import { ReporteMarker } from './ReporteMarker';

export type { MapaReportesHandle } from './MapaReportes.types';

/** Duración de la animación de cámara, en ms. */
const ANIMACION_MS = 500;

/**
 * Mapa con un marker por reporte.
 * @param props reportes, selección, callback y si se muestra al usuario
 * @returns el MapView
 */
export const MapaReportes = forwardRef<MapaReportesHandle, MapaReportesProps>(
  function MapaReportes({ reportes, onSeleccionar, seleccionadoId, mostrarUsuario, style }, ref) {
    const mapaRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      centrar: (coords, delta = DELTA_BARRIO) => {
        mapaRef.current?.animateToRegion(regionAlrededor(coords, delta), ANIMACION_MS);
      },
    }));

    return (
      <MapView
        ref={mapaRef}
        style={[styles.mapa, style]}
        initialRegion={regionAlrededor(CENTRO_CABA, DELTA_CIUDAD)}
        showsUserLocation={mostrarUsuario}
        // El botón propio de "mi ubicación" reemplaza al del sistema.
        showsMyLocationButton={false}
        toolbarEnabled={false}
        showsPointsOfInterests={false}
      >
        {reportes.map((reporte) => (
          <ReporteMarker
            key={reporte.id}
            reporte={reporte}
            seleccionado={reporte.id === seleccionadoId}
            onPress={onSeleccionar}
          />
        ))}
      </MapView>
    );
  },
);

// --- Estilos ---
const styles = StyleSheet.create({
  mapa: {
    flex: 1,
  },
});
