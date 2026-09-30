/**
 * Selector horizontal de las mascotas del usuario (foto circular + nombre),
 * para elegir cuál se perdió. La elegida queda marcada con un aro teal.
 */
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';
import type { Mascota } from '@/types/models';
import { Avatar } from '../Avatar';

type Props = {
  mascotas: Mascota[];
  seleccionadaId: number | null;
  onSeleccionar: (mascota: Mascota) => void;
};

/**
 * Fila deslizable de mascotas.
 * @param props ver `Props`
 * @returns el selector
 */
export function SelectorMascota({ mascotas, seleccionadaId, onSeleccionar }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.fila}
    >
      {mascotas.map((mascota) => {
        const seleccionada = mascota.id === seleccionadaId;
        return (
          <Pressable
            key={mascota.id}
            onPress={() => onSeleccionar(mascota)}
            accessibilityRole="button"
            accessibilityLabel={`Elegir a ${mascota.nombre}`}
            accessibilityState={{ selected: seleccionada }}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Avatar
              foto={mascota.foto}
              nombre={mascota.nombre}
              size={sizes.avatarMd}
              borderColor={seleccionada ? colors.primary : colors.surfaceContainerHigh}
            />
            <Text
              style={[styles.nombre, seleccionada && styles.nombreSeleccionado]}
              numberOfLines={1}
            >
              {mascota.nombre}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  fila: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
    width: sizes.avatarMd + spacing.md,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  nombre: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  nombreSeleccionado: {
    color: colors.primary,
  },
});
