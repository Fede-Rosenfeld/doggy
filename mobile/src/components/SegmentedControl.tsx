/**
 * Selector de pestañas con subrayado (Vacunas / Desparasitación / Otros).
 * Es genérico: recibe las opciones y avisa cuál se eligió.
 */
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

type Opcion<T extends string> = {
  valor: T;
  label: string;
};

type Props<T extends string> = {
  opciones: Opcion<T>[];
  valor: T;
  onChange: (valor: T) => void;
};

/**
 * Pestañas con subrayado en la opción activa.
 * @param props opciones, valor actual y callback de cambio
 * @returns el selector
 */
export function SegmentedControl<T extends string>({ opciones, valor, onChange }: Props<T>) {
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
});
