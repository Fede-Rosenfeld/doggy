/**
 * Card de una mascota en el listado: foto circular, nombre y raza.
 * Toda la card es tocable y lleva al perfil de la mascota.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme';
import type { Mascota } from '@/types/models';
import { Avatar } from './Avatar';

type Props = {
  mascota: Mascota;
  onPress: (mascota: Mascota) => void;
};

/** Diámetro de la foto dentro de la card. */
const FOTO = 80;

/**
 * Card tocable de una mascota.
 * @param props.mascota datos a mostrar
 * @param props.onPress se llama con la mascota al tocar la card
 * @returns la card
 */
export function PetCard({ mascota, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(mascota)}
      accessibilityRole="button"
      accessibilityLabel={`${mascota.nombre}, ${mascota.raza}. Ver perfil`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar foto={mascota.foto} nombre={mascota.nombre} size={FOTO} />
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>
          {mascota.nombre}
        </Text>
        <Text style={styles.raza} numberOfLines={1}>
          {mascota.raza}
        </Text>
      </View>
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.containerMargin,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  nombre: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  raza: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
