/**
 * Link "Ver etiqueta" de una vacuna: abre la foto de la etiqueta en grande
 * (`VisorFoto`). Lo usan la card del historial y la del próximo refuerzo.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';
import type { RegistroSanitario } from '@/types/models';
import { VisorFoto } from '../VisorFoto';

type Props = {
  /** Vacuna con `fotoEtiqueta`. */
  registro: RegistroSanitario;
  /** Color del texto, para que combine con el fondo de la card. */
  color?: string;
};

/**
 * Link a la foto de la etiqueta.
 * @param props ver `Props`
 * @returns el link con su visor, o nada si la vacuna no tiene foto
 */
export function VerEtiqueta({ registro, color = colors.primary }: Props) {
  const [visible, setVisible] = useState(false);
  if (!registro.fotoEtiqueta) return null;

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        hitSlop={spacing.sm}
        accessibilityRole="button"
        accessibilityLabel={`Ver la etiqueta de ${registro.nombre}`}
        style={({ pressed }) => [styles.link, pressed && styles.pressed]}
      >
        <MaterialIcons name="photo" size={sizes.iconSm} color={color} />
        <Text style={[styles.texto, { color }]}>Ver etiqueta</Text>
      </Pressable>
      <VisorFoto
        visible={visible}
        foto={registro.fotoEtiqueta}
        titulo={`Etiqueta · ${registro.nombre}`}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  texto: {
    ...typography.labelMd,
  },
});
