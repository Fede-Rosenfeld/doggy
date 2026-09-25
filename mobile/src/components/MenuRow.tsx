/**
 * Fila de menú: ícono, título, subtítulo opcional y, a la derecha, un badge,
 * un elemento propio (por ejemplo, un Switch) o una flecha si es tocable.
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  icon: IconName;
  titulo: string;
  subtitulo?: string;
  /** Texto chico en una píldora a la derecha ("0 activos"). */
  badge?: string;
  /** Elemento a la derecha en lugar de la flecha (Switch, etc.). */
  derecha?: ReactNode;
  onPress?: () => void;
};

/**
 * Fila de menú.
 * @param props ver `Props`
 * @returns la fila
 */
export function MenuRow({ icon, titulo, subtitulo, badge, derecha, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={badge ? `${titulo}, ${badge}` : titulo}
      style={({ pressed }) => [styles.fila, pressed && styles.pressed]}
    >
      <MaterialIcons name={icon} size={sizes.iconMd} color={colors.primary} />
      <View style={styles.textos}>
        <View style={styles.tituloFila}>
          <Text style={styles.titulo}>{titulo}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      </View>
      {derecha ??
        (onPress && (
          <MaterialIcons name="chevron-right" size={sizes.iconMd} color={colors.onSurfaceVariant} />
        ))}
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md + 2,
  },
  pressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  titulo: {
    ...typography.bodyMd,
    fontFamily: typography.labelMd.fontFamily,
    color: colors.onSurface,
  },
  subtitulo: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  badgeTexto: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
