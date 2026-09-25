/**
 * Botón circular de volver.
 *
 * Vuelve a la pantalla anterior del stack. Si no hay historial (por ejemplo,
 * si se entró directo por un link), navega a la ruta de respaldo que se le pase.
 * Tiene dos tonos: claro para fondos teal y oscuro para el fondo crema.
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, sizes } from '@/theme';
import { volver } from '@/utils/navegacion';

type Props = {
  /** Ruta a la que ir si no hay pantalla anterior. */
  fallback?: Href;
  /** 'light' para fondos oscuros (teal), 'dark' para fondos claros. */
  tone?: 'light' | 'dark';
};

/**
 * Botón de volver.
 * @param props ver `Props`
 * @returns el botón
 */
export function BackButton({ fallback = '/login', tone = 'dark' }: Props) {
  const iconColor = tone === 'light' ? colors.onPrimary : colors.primaryContainer;

  /** Vuelve atrás o, si no se puede, va a la ruta de respaldo. */
  const handlePress = () => volver(fallback);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      hitSlop={sizes.iconSm / 2}
      style={({ pressed }) => [
        styles.base,
        tone === 'light' ? styles.light : styles.dark,
        pressed && (tone === 'light' ? styles.lightPressed : styles.darkPressed),
      ]}
    >
      <MaterialIcons name="arrow-back" size={sizes.iconMd} color={iconColor} />
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  base: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  light: {
    backgroundColor: colors.whiteOverlay,
  },
  lightPressed: {
    backgroundColor: colors.whiteOverlayPressed,
  },
  dark: {
    backgroundColor: colors.tealLight10,
  },
  darkPressed: {
    backgroundColor: colors.secondaryContainer,
  },
});
