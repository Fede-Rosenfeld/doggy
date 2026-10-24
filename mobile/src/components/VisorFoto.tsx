/**
 * Visor de foto a pantalla completa: fondo oscuro, la imagen entera lo más
 * grande que entre en la pantalla (sin recortar) y un botón de cerrar.
 * Tocar el fondo también cierra. Se puede abrir por encima de otro modal.
 *
 * Gestos (react-native-gesture-handler 3 + react-native-reanimated 4):
 * - Arrastrar con un dedo mueve la foto. En `onBegin` se guarda la posición
 *   y en `onUpdate` se le suma `translationX/Y`.
 * - Pellizcar hace zoom multiplicando la escala guardada por `scale`. Con
 *   `focalX/Y` se corrige la posición para que el zoom ocurra donde están los
 *   dedos. Al soltar, si quedó por debajo de 1x o por encima de 5x, vuelve al
 *   límite con `withSpring`.
 * - Girar con dos dedos rota la foto. Pan, pinch y rotación son simultáneos
 *   (`useSimultaneousGestures`).
 * - Doble tap vuelve todo al estado inicial. Tiene prioridad sobre los demás
 *   (`useExclusiveGestures`).
 * - Con la foto sin zoom, arrastrar en vertical la cierra: el fondo se va
 *   aclarando y, si se soltó a más de 150 px, se cierra con una vibración leve
 *   (`expo-haptics`, el motor de vibración del celular, que no pide permiso).
 *   Si no, vuelve a su lugar.
 *
 * Todo se anima en el hilo de UI con shared values. Solo se vuelve al hilo de
 * JS (con `scheduleOnRN`) al terminar el arrastre para cerrar, nunca en
 * `onUpdate`. El botón de cerrar sigue estando para quien no puede hacer el
 * gesto, y al abrir el visor o cambiar de foto se resetea todo.
 */
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useExclusiveGestures,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { fuenteFoto } from '@/data/fotos';
import { colors, radius, sizes, spacing, typography } from '@/theme';

/** Zoom mínimo y máximo que queda al soltar el pellizco. */
const ESCALA_MIN = 1;
const ESCALA_MAX = 5;
/** Distancia vertical (px) a partir de la cual soltar el arrastre cierra el visor. */
const UMBRAL_CERRAR = 150;
/** Distancia de arrastre en la que el fondo llega a su opacidad mínima. */
const DISTANCIA_FONDO = UMBRAL_CERRAR * 2;
/** Opacidad mínima del fondo mientras se arrastra para cerrar. */
const OPACIDAD_FONDO_MIN = 0.3;

type Props = {
  visible: boolean;
  /** Clave de foto local, URI o null. */
  foto: string | null | undefined;
  /** Texto que se muestra arriba y se lee en accesibilidad (por ejemplo, el nombre). */
  titulo: string;
  onClose: () => void;
};

/**
 * Modal con la foto en grande, con zoom, arrastre, rotación y arrastre para cerrar.
 * @param props ver `Props`
 * @returns el visor, o nada si no hay foto
 */
export function VisorFoto({ visible, foto, titulo, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const fuente = fuenteFoto(foto);
  // La foto ocupa un cuadrado del ancho de la pantalla: su centro está en width / 2.
  const centro = width / 2;

  // --- Estado ---
  const escala = useSharedValue(1);
  const escalaGuardada = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const xGuardada = useSharedValue(0);
  const yGuardada = useSharedValue(0);
  const rotacion = useSharedValue(0);
  const rotacionGuardada = useSharedValue(0);
  /** true si el arrastre actual es el de cerrar (empezó sin zoom y con un dedo). */
  const cerrando = useSharedValue(false);

  // Al abrir el visor o cambiar de foto, la imagen arranca centrada y sin zoom.
  useEffect(() => {
    escala.set(1);
    escalaGuardada.set(1);
    x.set(0);
    y.set(0);
    xGuardada.set(0);
    yGuardada.set(0);
    rotacion.set(0);
    rotacionGuardada.set(0);
    cerrando.set(false);
  }, [visible, foto, escala, escalaGuardada, x, y, xGuardada, yGuardada, rotacion, rotacionGuardada, cerrando]);

  // --- Handlers ---
  /** Vibra y cierra. Corre en el hilo de JS: se llama con `scheduleOnRN`. */
  const cerrarConVibracion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  /** Vuelve todo al estado inicial con un resorte. Corre en el hilo de UI. */
  const resetearAnimado = () => {
    'worklet';
    escala.set(withSpring(1));
    x.set(withSpring(0));
    y.set(withSpring(0));
    rotacion.set(withSpring(0));
    escalaGuardada.set(1);
    xGuardada.set(0);
    yGuardada.set(0);
    rotacionGuardada.set(0);
  };

  /** Arrastre: mueve la foto o, sin zoom, la arrastra en vertical para cerrar. */
  const pan = usePanGesture({
    onBegin: () => {
      xGuardada.set(x.get());
      yGuardada.set(y.get());
      cerrando.set(escala.get() === ESCALA_MIN);
    },
    onUpdate: (e) => {
      // Si entra un segundo dedo o hay zoom, deja de ser el arrastre para cerrar.
      if (cerrando.get() && (e.numberOfPointers > 1 || escala.get() !== ESCALA_MIN)) {
        cerrando.set(false);
      }
      if (cerrando.get()) {
        y.set(e.translationY);
        return;
      }
      x.set(xGuardada.get() + e.translationX);
      y.set(yGuardada.get() + e.translationY);
    },
    onDeactivate: (e) => {
      if (!cerrando.get()) return;
      cerrando.set(false);
      if (Math.abs(e.translationY) > UMBRAL_CERRAR) {
        scheduleOnRN(cerrarConVibracion);
      } else {
        y.set(withSpring(0));
      }
    },
  });

  /** Pellizco: zoom sobre la escala guardada, centrado entre los dedos. */
  const pinch = usePinchGesture({
    onBegin: () => {
      escalaGuardada.set(escala.get());
    },
    onUpdate: (e) => {
      const nueva = escalaGuardada.get() * e.scale;
      // Cuánto creció desde el cuadro anterior: el punto entre los dedos tiene
      // que quedar quieto, así que la foto se corre hacia afuera de él.
      const factor = nueva / escala.get();
      const dx = (e.focalX - centro - x.get()) * (1 - factor);
      const dy = (e.focalY - centro - y.get()) * (1 - factor);
      x.set(x.get() + dx);
      y.set(y.get() + dy);
      // También se corre la base del pan, por si se está arrastrando a la vez.
      xGuardada.set(xGuardada.get() + dx);
      yGuardada.set(yGuardada.get() + dy);
      escala.set(nueva);
    },
    onDeactivate: () => {
      if (escala.get() < ESCALA_MIN) {
        escala.set(withSpring(ESCALA_MIN));
        x.set(withSpring(0));
        y.set(withSpring(0));
      } else if (escala.get() > ESCALA_MAX) {
        escala.set(withSpring(ESCALA_MAX));
      }
    },
  });

  /** Rotación con dos dedos, sumada a la rotación guardada. */
  const rotar = useRotationGesture({
    onBegin: () => {
      rotacionGuardada.set(rotacion.get());
    },
    onUpdate: (e) => {
      rotacion.set(rotacionGuardada.get() + e.rotation);
    },
  });

  /** Doble tap: vuelve al tamaño, la posición y el giro originales. */
  const dobleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      resetearAnimado();
    },
  });

  const simultaneos = useSimultaneousGestures(pan, pinch, rotar);
  const gesto = useExclusiveGestures(dobleTap, simultaneos);

  const estiloImagen = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.get() },
      { translateY: y.get() },
      { scale: escala.get() },
      { rotate: `${rotacion.get()}rad` },
    ],
  }));

  // Sin zoom, el fondo se aclara a medida que la foto se aleja del centro.
  const estiloFondo = useAnimatedStyle(() => ({
    opacity:
      escala.get() <= ESCALA_MIN
        ? interpolate(
            Math.abs(y.get()),
            [0, DISTANCIA_FONDO],
            [1, OPACIDAD_FONDO_MIN],
            Extrapolation.CLAMP,
          )
        : 1,
  }));

  if (!fuente) return null;

  // --- Render ---
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* El Modal se dibuja fuera de la raíz de la app: sin su propia raíz, los gestos no responden en Android. */}
      <GestureHandlerRootView style={styles.contenido}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.fondo, estiloFondo]} />

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

        <GestureDetector gesture={gesto}>
          {/* El contenedor no se transforma: así focalX/Y siempre se miden sobre el mismo cuadrado. */}
          <View style={styles.marco}>
            <Animated.Image
              source={fuente}
              style={[styles.imagen, estiloImagen]}
              resizeMode="contain"
              accessibilityLabel={`Foto de ${titulo}`}
              accessibilityHint="Pellizcá para hacer zoom, tocá dos veces para volver al tamaño original o arrastrá hacia abajo para cerrar."
            />
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  contenido: {
    flex: 1,
    justifyContent: 'center',
  },
  fondo: {
    backgroundColor: colors.visorFondo,
  },
  barra: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Por encima de la foto: con zoom, la imagen no tapa el botón de cerrar.
    zIndex: 1,
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
  marco: {
    width: '100%',
    // Las fotos se eligen con recorte cuadrado; "contain" igual muestra entera cualquier otra.
    aspectRatio: 1,
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
});
