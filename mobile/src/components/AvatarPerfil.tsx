/**
 * Acceso al perfil del usuario: el círculo con su foto que va arriba a la
 * derecha en todos los headers (`AppHeader` y `ScreenHeader`). Tocarlo lleva
 * a la tab Perfil. Centralizarlo acá mantiene el mismo tamaño, borde y
 * feedback al tocar en todas las pantallas.
 */
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { useApp } from '@/context/AppContext';
import { colors, radius, sizes, spacing } from '@/theme';
import { Avatar } from './Avatar';

/**
 * Avatar clickeable del usuario logueado.
 * @returns el botón que abre el perfil
 */
export function AvatarPerfil() {
  const { usuario } = useApp();

  /** Abre la tab Perfil. */
  const irAlPerfil = () => router.navigate('/perfil');

  return (
    <Pressable
      onPress={irAlPerfil}
      accessibilityRole="button"
      accessibilityLabel="Ir a mi perfil"
      style={({ pressed }) => [styles.boton, pressed && styles.pressed]}
    >
      <Avatar
        foto={usuario?.foto}
        nombre={usuario?.nombre ?? 'Perfil'}
        size={sizes.avatarSm}
        borderColor={colors.surfaceContainerHighest}
      />
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  boton: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  pressed: {
    backgroundColor: colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
});
