/**
 * Foto circular grande con un botón de cámara superpuesto.
 * Toda la foto es tocable; se usa para sacar o elegir la foto de una mascota o del usuario.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing } from '@/theme';
import { Avatar } from './Avatar';

type Props = {
  foto: string | null;
  /** Nombre para la inicial del respaldo y el texto accesible. */
  nombre: string;
  onPress: () => void;
  /** Muestra un spinner mientras se abre el selector. */
  cargando?: boolean;
  size?: number;
};

/** Diámetro del botón de cámara. */
const BOTON = 44;

/**
 * Foto editable.
 * @param props ver `Props`
 * @returns la foto con el botón de cámara
 */
export function FotoEditable({
  foto,
  nombre,
  onPress,
  cargando = false,
  size = sizes.avatarLg,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      accessibilityRole="button"
      accessibilityLabel={foto ? 'Cambiar foto' : 'Agregar foto'}
      accessibilityHint="Podés sacar una foto o elegir una de tu galería"
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
    >
      <View style={styles.foto}>
        {foto ? (
          <Avatar foto={foto} nombre={nombre || 'Mascota'} size={size} borderColor={colors.white} />
        ) : (
          // Sin foto todavía: un círculo vacío que invita a elegir una.
          <View style={[styles.vacio, { width: size, height: size }]}>
            <MaterialIcons name="add-a-photo" size={size * 0.3} color={colors.tealLight} />
          </View>
        )}
      </View>
      <View style={styles.boton}>
        {cargando ? (
          <ActivityIndicator color={colors.onPrimary} size="small" />
        ) : (
          <MaterialIcons name="photo-camera" size={sizes.iconSm + 2} color={colors.onPrimary} />
        )}
      </View>
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  foto: {
    borderRadius: radius.full,
    ...shadows.level2,
  },
  vacio: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealLight10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.tealLight,
  },
  boton: {
    position: 'absolute',
    right: 0,
    bottom: spacing.xs,
    width: BOTON,
    height: BOTON,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
