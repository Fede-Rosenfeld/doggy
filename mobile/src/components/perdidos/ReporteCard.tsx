/**
 * Card de un reporte de mascota perdida o encontrada: foto con el estado
 * encima, nombre, hace cuánto, zona y chips (raza y etiquetas).
 * Se usa en el carrusel debajo del mapa y en el modo lista.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { fuenteFoto } from '@/data/fotos';
import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { ReportePerdida } from '@/types/models';
import { tiempoTranscurrido } from '@/utils/fechas';

type Props = {
  reporte: ReportePerdida;
  onPress: (reporte: ReportePerdida) => void;
  /** Resalta la card (la que está centrada en el mapa). */
  seleccionado?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Lado de la foto cuadrada. */
const FOTO = 96;
/** Cantidad máxima de chips para que la card no crezca. */
const MAX_CHIPS = 2;

/**
 * Card de reporte.
 * @param props ver `Props`
 * @returns la card tocable
 */
export function ReporteCard({ reporte, onPress, seleccionado = false, style }: Props) {
  const perdido = reporte.estado === 'perdido';
  const fuente = fuenteFoto(reporte.foto);
  const chips = [reporte.raza, ...reporte.etiquetas].slice(0, MAX_CHIPS);

  return (
    <Pressable
      onPress={() => onPress(reporte)}
      accessibilityRole="button"
      accessibilityLabel={`${perdido ? 'Perdido' : 'Encontrado'}: ${reporte.nombre}, ${reporte.zona}`}
      style={({ pressed }) => [
        styles.card,
        seleccionado && styles.seleccionado,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.foto}>
        {fuente ? (
          <Image source={fuente} style={styles.imagen} />
        ) : (
          <View style={[styles.imagen, styles.sinFoto]}>
            <MaterialIcons name="pets" size={sizes.iconLg} color={colors.tealLight} />
          </View>
        )}
        <View style={[styles.estado, perdido ? styles.estadoPerdido : styles.estadoEncontrado]}>
          <Text style={styles.estadoTexto}>{perdido ? 'PERDIDO' : 'ENCONTRADO'}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.fila}>
          <Text style={styles.nombre} numberOfLines={1}>
            {reporte.nombre}
          </Text>
          <Text style={styles.tiempo}>{tiempoTranscurrido(reporte.fecha)}</Text>
        </View>
        <View style={styles.zona}>
          <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.zonaTexto} numberOfLines={1}>
            {reporte.zona}
          </Text>
        </View>
        <View style={styles.chips}>
          {chips.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipTexto} numberOfLines={1}>
                {chip}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.stackSm,
    borderRadius: radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.transparent,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  seleccionado: {
    borderColor: colors.tealLight,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  foto: {
    width: FOTO,
    height: FOTO,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  sinFoto: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealLight10,
  },
  estado: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  estadoPerdido: {
    backgroundColor: colors.mustard,
  },
  estadoEncontrado: {
    backgroundColor: colors.primaryContainer,
  },
  estadoTexto: {
    ...typography.labelSm,
    fontSize: 10,
    lineHeight: 12,
    color: colors.white,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nombre: {
    ...typography.bodyLg,
    fontFamily: typography.headlineMd.fontFamily,
    color: colors.onSurface,
    flex: 1,
  },
  tiempo: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  zona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  zonaTexto: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    flexShrink: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.tealLight10,
  },
  chipTexto: {
    ...typography.labelSm,
    color: colors.primaryContainer,
  },
});
