/**
 * Selector de opciones excluyentes. Es genérico: recibe las opciones y avisa
 * cuál se eligió. Dos variantes:
 * - `underline`: pestañas con subrayado (Vacunas / Desparasitación / Otros).
 * - `pill`: botones en una cápsula gris con la opción activa en blanco (Mapa / Lista).
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';

type Opcion<T extends string> = {
  valor: T;
  label: string;
};

type Props<T extends string> = {
  opciones: Opcion<T>[];
  valor: T;
  onChange: (valor: T) => void;
  variant?: 'underline' | 'pill';
};

/**
 * Pestañas con subrayado en la opción activa.
 * @param props opciones, valor actual y callback de cambio
 * @returns el selector
 */
export function SegmentedControl<T extends string>({
  opciones,
  valor,
  onChange,
  variant = 'underline',
}: Props<T>) {
  if (variant === 'pill') {
    return (
      <View style={styles.pillContenedor} accessibilityRole="tablist">
        {opciones.map((opcion) => {
          const activa = opcion.valor === valor;
          return (
            <Pressable
              key={opcion.valor}
              onPress={() => onChange(opcion.valor)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              accessibilityLabel={opcion.label}
              style={({ pressed }) => [styles.pill, activa && styles.pillActiva, pressed && styles.pressed]}
            >
              <Text style={[styles.pillLabel, activa && styles.pillLabelActiva]}>{opcion.label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.contenedor}
      accessibilityRole="tablist"
    >
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            key={opcion.valor}
            onPress={() => onChange(opcion.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            accessibilityLabel={opcion.label}
            style={({ pressed }) => [styles.tab, activa && styles.tabActiva, pressed && styles.pressed]}
          >
            <Text style={[styles.label, activa && styles.labelActiva]}>{opcion.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    borderBottomWidth: sizes.borderWidth,
    borderBottomColor: colors.surfaceVariant,
  },
  contenedor: {
    flexGrow: 1,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.stackSm,
    borderBottomWidth: sizes.borderWidthFocus,
    borderBottomColor: colors.transparent,
    // Tapa el borde del contenedor para que el subrayado activo quede encima.
    marginBottom: -sizes.borderWidth,
  },
  tabActiva: {
    borderBottomColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  labelActiva: {
    color: colors.primary,
  },
  pillContenedor: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  pillActiva: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  pillLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  pillLabelActiva: {
    color: colors.onSurface,
  },
});
