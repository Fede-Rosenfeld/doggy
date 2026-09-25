/**
 * Mapa de reportes (versión web).
 *
 * react-native-maps no funciona en el navegador. Esta versión muestra un
 * aviso en el lugar del mapa para que la pantalla se pueda recorrer igual
 * desde la web; en el celular (Expo Go) se usa MapaReportes.tsx.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { MapaReportesHandle, MapaReportesProps } from './MapaReportes.types';

export type { MapaReportesHandle } from './MapaReportes.types';

/**
 * Reemplazo del mapa para web.
 * @param props mismas props que la versión nativa
 * @returns un aviso con la cantidad de reportes
 */
export const MapaReportes = forwardRef<MapaReportesHandle, MapaReportesProps>(
  function MapaReportes({ reportes, style }, ref) {
    // Mismo contrato que la versión nativa; en web no hay cámara que mover.
    useImperativeHandle(ref, () => ({ centrar: () => undefined }));

    return (
      <View style={[styles.contenedor, style]}>
        <MaterialIcons name="map" size={40} color={colors.primaryContainer} />
        <Text style={styles.texto}>
          El mapa se ve en la app del celular. Hay {reportes.length} reportes en la zona.
        </Text>
      </View>
    );
  },
);

// --- Estilos ---
const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  texto: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
