/**
 * Botón flotante (FAB) mostaza.
 *
 * Se posiciona abajo a la derecha de la pantalla. Sin `label` es un cuadrado
 * redondeado con un ícono; con `label` se extiende y muestra el texto al lado.
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  icon: IconName;
  onPress: () => void;
  /** Texto accesible (obligatorio porque el botón puede no tener texto visible). */
  accessibilityLabel: string;
  /** Texto opcional para la versión extendida. */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * FAB con ícono y texto opcional.
 * @param props ver `Props`
 * @returns el botón flotante
 */
export function Fab({ icon, onPress, accessibilityLabel, label, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.fab,
        label ? styles.extended : styles.square,
        pressed && styles.pressed,
        style,
      ]}
    >
      <MaterialIcons name={icon} size={sizes.iconLg - 2} color={colors.onTertiaryFixed} />
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.containerMargin,
    bottom: spacing.stackMd,
    height: sizes.fab,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.mustard,
    // Sombra teñida de mostaza, como en el diseño.
    shadowColor: colors.mustard,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  square: {
    width: sizes.fab,
  },
  extended: {
    paddingHorizontal: spacing.containerMargin,
  },
  pressed: {
    backgroundColor: colors.mustardPressed,
    transform: [{ scale: 0.92 }],
  },
  label: {
    ...typography.labelMd,
    color: colors.onTertiaryFixed,
  },
});
