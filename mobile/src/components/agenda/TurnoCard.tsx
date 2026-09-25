/**
 * Card de un turno de la Agenda: hora, categoría, mascota, motivo y lugar,
 * con un borde izquierdo del color de la categoría.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { Turno } from '@/types/models';
import { categoriaTurno } from '@/utils/etiquetas';
import { formatearHora } from '@/utils/fechas';

type Props = {
  turno: Turno;
  /** Nombre de la mascota del turno. */
  mascota: string;
};

/**
 * Card de turno.
 * @param props.turno turno a mostrar
 * @param props.mascota nombre de la mascota
 * @returns la card
 */
export function TurnoCard({ turno, mascota }: Props) {
  const categoria = categoriaTurno(turno.categoria);

  /** Editar necesita el PATCH del backend: por ahora avisa. */
  const handleEditar = () => {
    Alert.alert('Editar turno', 'Disponible próximamente. Vas a poder cambiar la fecha, la hora y el lugar.');
  };

  return (
    <View style={[styles.card, { borderLeftColor: categoria.color }]}>
      <View style={styles.info}>
        <View style={styles.fila}>
          <Text style={styles.hora}>{formatearHora(turno.fecha)}</Text>
          <View style={[styles.chip, { backgroundColor: categoria.chipFondo }]}>
            <Text style={[styles.chipTexto, { color: categoria.chipTexto }]}>{categoria.chip}</Text>
          </View>
          <Text style={styles.mascota} numberOfLines={1}>
            • {mascota}
          </Text>
        </View>
        <Text style={styles.motivo}>{turno.motivo}</Text>
        <Text style={styles.lugar}>{turno.lugar}</Text>
      </View>
      <Pressable
        onPress={handleEditar}
        accessibilityRole="button"
        accessibilityLabel={`Editar turno de ${mascota}`}
        style={({ pressed }) => [styles.editar, pressed && styles.editarPressed]}
      >
        <MaterialIcons name="edit" size={sizes.iconSm} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    padding: spacing.stackSm + 2,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hora: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.onSurface,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  chipTexto: {
    ...typography.labelSm,
  },
  mascota: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  motivo: {
    ...typography.bodySm,
    fontFamily: typography.labelMd.fontFamily,
    color: colors.onSurface,
  },
  lugar: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  editar: {
    width: sizes.avatarSm - 8,
    height: sizes.avatarSm - 8,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editarPressed: {
    backgroundColor: colors.surfaceContainer,
  },
});
