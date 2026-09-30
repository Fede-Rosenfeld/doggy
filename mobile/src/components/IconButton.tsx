/**
 * Botón circular de un solo ícono (buscar, filtrar, etc.).
 * Con `activo` se resalta con fondo teal claro, por ejemplo cuando el filtro
 * está aplicado o el buscador está abierto.
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, sizes } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  icon: IconName;
  /** Texto para lectores de pantalla. */
  label: string;
  onPress: () => void;
  /** Resalta el botón. */
  activo?: boolean;
};

/**
 * Botón de ícono.
 * @param props ver `Props`
 * @returns el botón
 */
export function IconButton({ icon, label, onPress, activo = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: activo }}
      style={({ pressed }) => [styles.boton, activo && styles.activo, pressed && styles.pressed]}
    >
      <MaterialIcons
        name={icon}
        size={sizes.iconMd}
        color={activo ? colors.primary : colors.onSurfaceVariant}
      />
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  boton: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activo: {
    backgroundColor: colors.tealLight10,
  },
  pressed: {
    backgroundColor: colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
});
