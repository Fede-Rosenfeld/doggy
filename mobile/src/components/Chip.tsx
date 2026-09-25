/**
 * Chip tipo píldora para categorías (raza, edad, etiquetas).
 *
 * Por defecto es informativo: fondo teal claro al 10 % y texto teal. Si se le
 * pasa `onPress` se vuelve seleccionable y con `selected` se rellena de teal.
 * El tamaño `md` es el del perfil de la mascota (raza y edad bajo el nombre).
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  label: string;
  icon?: IconName;
  selected?: boolean;
  /** Si viene, el chip se puede tocar. */
  onPress?: () => void;
  size?: 'sm' | 'md';
};

/** Tamaño del ícono dentro del chip. */
const ICONO = 14;

/**
 * Chip informativo o seleccionable.
 * @param props ver `Props`
 * @returns el chip
 */
export function Chip({ label, icon, selected = false, onPress, size = 'sm' }: Props) {
  const colorBase = size === 'md' ? colors.onSecondaryContainer : colors.primary;
  const colorTexto = selected ? colors.onPrimary : colorBase;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
      accessibilityState={onPress ? { selected } : undefined}
      style={({ pressed }) => [
        styles.chip,
        size === 'md' && styles.chipMd,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {icon && <MaterialIcons name={icon} size={ICONO} color={colorTexto} />}
      <Text style={[size === 'md' ? styles.labelMd : styles.label, { color: colorTexto }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.tealLight10,
  },
  chipMd: {
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.secondaryContainer30,
  },
  selected: {
    backgroundColor: colors.primaryContainer,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    ...typography.labelSm,
  },
  labelMd: {
    ...typography.labelMd,
  },
});
