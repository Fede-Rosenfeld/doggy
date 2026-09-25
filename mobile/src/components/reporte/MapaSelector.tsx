/**
 * Mini mapa para marcar dónde se perdió la mascota (versión nativa).
 *
 * Muestra un pin arrastrable; también se puede tocar cualquier punto del mapa
 * para mover el pin ahí. Cuando las coordenadas cambian desde afuera (por
 * ejemplo, cuando llega la posición del GPS) la cámara se mueve sola.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors, radius, sizes, spacing, typography } from '@/theme';
import { DELTA_BARRIO, regionAlrededor } from '@/utils/mapa';
import type { MapaSelectorProps } from './MapaSelector.types';

/** Alto del mini mapa. */
const ALTO = 200;
/** Duración de la animación de cámara, en ms. */
const ANIMACION_MS = 400;

/**
 * Mapa con pin arrastrable.
 * @param props coordenadas actuales y callback de cambio
 * @returns el mini mapa
 */
export function MapaSelector({ coords, onChange }: MapaSelectorProps) {
  const mapaRef = useRef<MapView>(null);

  // Sigue al pin cuando cambia (GPS, arrastre o toque).
  useEffect(() => {
    mapaRef.current?.animateToRegion(regionAlrededor(coords, DELTA_BARRIO), ANIMACION_MS);
  }, [coords]);

  return (
    <View style={styles.contenedor}>
      <MapView
        ref={mapaRef}
        style={StyleSheet.absoluteFill}
        initialRegion={regionAlrededor(coords, DELTA_BARRIO)}
        onPress={(e) =>
          onChange({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })
        }
        toolbarEnabled={false}
        showsPointsOfInterests={false}
      >
        <Marker
          coordinate={{ latitude: coords.lat, longitude: coords.lng }}
          draggable
          pinColor={colors.mustard}
          onDragEnd={(e) =>
            onChange({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })
          }
        />
      </MapView>
      <View style={styles.indicacion} pointerEvents="none">
        <MaterialIcons name="touch-app" size={sizes.iconSm} color={colors.primary} />
        <Text style={styles.indicacionTexto}>Tocá para ajustar</Text>
      </View>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  contenedor: {
    height: ALTO,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  indicacion: {
    position: 'absolute',
    bottom: spacing.stackSm,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.whiteTranslucent,
  },
  indicacionTexto: {
    ...typography.labelMd,
    color: colors.primary,
  },
});
