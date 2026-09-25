/**
 * Selector de ubicación (versión web). react-native-maps no funciona en el
 * navegador, así que se muestra el punto marcado en texto; en el celular se
 * usa MapaSelector.tsx con el pin arrastrable.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';
import type { MapaSelectorProps } from './MapaSelector.types';

/**
 * Reemplazo del mini mapa para web.
 * @param props.coords punto marcado
 * @returns un recuadro con las coordenadas
 */
export function MapaSelector({ coords }: MapaSelectorProps) {
  return (
    <View style={styles.contenedor}>
      <MaterialIcons name="location-on" size={sizes.iconLg} color={colors.mustard} />
      <Text style={styles.texto}>
        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
      </Text>
      <Text style={styles.ayuda}>En la app del celular podés mover el pin en el mapa.</Text>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  contenedor: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  texto: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  ayuda: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
