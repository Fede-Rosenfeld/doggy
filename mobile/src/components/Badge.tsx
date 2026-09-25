/**
 * Badge: etiqueta chica de estado ("Placa & Collar", "Aplicada", "URGENTE").
 * A diferencia del Chip no se toca; solo informa.
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];
export type BadgeTone = 'teal' | 'mustard' | 'neutral';

type Props = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  /** Muestra un punto de color antes del texto (como en "• Aplicada"). */
  dot?: boolean;
};

/** Fondo y texto de cada tono. */
const TONOS: Record<BadgeTone, { bg: string; text: string }> = {
  teal: { bg: colors.secondaryContainer30, text: colors.onSecondaryContainer },
  mustard: { bg: colors.mustard, text: colors.onTertiaryFixed },
  neutral: { bg: colors.surfaceContainerHigh, text: colors.onSurfaceVariant },
};

/** Tamaño del ícono dentro del badge. */
const ICONO = 12;

/**
 * Badge de estado.
 * @param props ver `Props`
 * @returns el badge
 */
export function Badge({ label, tone = 'teal', icon, dot = false }: Props) {
  const colores = TONOS[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colores.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: colores.text }]} />}
      {icon && <MaterialIcons name={icon} size={ICONO} color={colores.text} />}
      <Text style={[styles.label, { color: colores.text }]}>{label}</Text>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  label: {
    ...typography.labelSm,
  },
});
