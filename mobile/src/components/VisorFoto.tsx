/**
 * Visor de foto a pantalla completa: fondo oscuro, la imagen entera lo más
 * grande que entre en la pantalla (sin recortar) y un botón de cerrar.
 * Tocar el fondo también cierra. Se puede abrir por encima de otro modal.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fuenteFoto } from '@/data/fotos';
import { colors, radius, sizes, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  /** Clave de foto local, URI o null. */
  foto: string | null | undefined;
  /** Texto que se muestra arriba y se lee en accesibilidad (por ejemplo, el nombre). */
  titulo: string;
  onClose: () => void;
};

/**
 * Modal con la foto en grande.
 * @param props ver `Props`
 * @returns el visor, o nada si no hay foto
 */
export function VisorFoto({ visible, foto, titulo, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const fuente = fuenteFoto(foto);
  if (!fuente) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.fondo}>
        {/* Tocar fuera de la foto cierra */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" />

        <View style={[styles.barra, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel="Cerrar foto"
            style={({ pressed }) => [styles.cerrar, pressed && styles.cerrarPressed]}
          >
            <MaterialIcons name="close" size={sizes.iconMd} color={colors.white} />
          </Pressable>
        </View>

        <Image
          source={fuente}
          style={styles.imagen}
          resizeMode="contain"
          accessibilityLabel={`Foto de ${titulo}`}
        />
      </View>
    </Modal>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.visorFondo,
  },
  barra: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.containerMargin,
  },
  titulo: {
    ...typography.headlineMd,
    color: colors.white,
    flex: 1,
  },
  cerrar: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cameraControl,
  },
  cerrarPressed: {
    opacity: 0.7,
  },
  imagen: {
    width: '100%',
    // Las fotos se eligen con recorte cuadrado; "contain" igual muestra entera cualquier otra.
    aspectRatio: 1,
  },
});
