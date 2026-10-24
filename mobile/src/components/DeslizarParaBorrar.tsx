/**
 * Envoltorio para deslizar una card hacia la izquierda y mostrar el botón
 * "Eliminar". Lo usan `TurnoCard` y `RegistroCard`.
 *
 * Gestos (react-native-gesture-handler 3 + react-native-reanimated 4):
 * - Usa `ReanimatedSwipeable`, que en gesture-handler 3.3 sigue siendo el
 *   componente recomendado y ya está hecho con la API nueva de hooks
 *   (`usePanGesture` y `scheduleOnRN` por dentro).
 * - Para que no se dispare sin querer: `friction` 2 (la card se mueve la
 *   mitad que el dedo), recién se abre si se suelta pasado el 60 % del botón
 *   (`rightThreshold`) y el arrastre solo arranca después de 20 px en
 *   horizontal (`dragOffsetFromRight`). Así un scroll vertical de la lista
 *   nunca lo activa.
 * - Deslizar no borra: deja a la vista el botón, que pide confirmación.
 * - El botón aparece con `opacity` y `scale` según el progreso del swipe, en
 *   el hilo de UI. Al cruzar el umbral vibra una vez (`expo-haptics`, el
 *   motor de vibración del celular, que no pide permiso): con
 *   `useAnimatedReaction` se vuelve al hilo de JS solo en el cruce, no en
 *   cada cuadro.
 *
 * Alternativa tocable: el botón "Eliminar" de los formularios de edición.
 */
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type ReactNode, useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';

/** Ancho del botón "Eliminar". */
const ANCHO_ACCION = 96;
/** La card se mueve 1/FRICCION de lo que se mueve el dedo. */
const FRICCION = 2;
/** Fracción del botón que hay que descubrir para que quede abierto al soltar. */
const UMBRAL = 0.6;
/** Distancia horizontal (px) antes de que el swipe le gane al scroll. */
const ARRANQUE = 20;
/** Escala del botón cuando recién empieza a aparecer. */
const ESCALA_INICIAL = 0.8;

type Props = {
  children: ReactNode;
  /** Texto accesible del botón (por ejemplo, "Eliminar turno de Luna"). */
  etiqueta: string;
  /**
   * Se llama al tocar "Eliminar".
   * @param cerrar cierra el swipe (para cuando se cancela o falla)
   */
  onEliminar: (cerrar: () => void) => void;
};

/** Vibración leve al cruzar el umbral. Corre en el hilo de JS. */
function vibrarUmbral() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Card deslizable con la acción de eliminar a la derecha.
 * @param props ver `Props`
 * @returns la card envuelta
 */
export function DeslizarParaBorrar({ children, etiqueta, onEliminar }: Props) {
  const swipeRef = useRef<SwipeableMethods>(null);

  /** Vuelve la card a su lugar. */
  const cerrar = useCallback(() => swipeRef.current?.close(), []);

  // --- Render ---
  return (
    // La sombra va afuera: el Swipeable recorta lo que sobresale (overflow hidden).
    <View style={styles.sombra}>
      <ReanimatedSwipeable
        ref={swipeRef}
        friction={FRICCION}
        rightThreshold={ANCHO_ACCION * UMBRAL}
        overshootRight={false}
        dragOffsetFromRight={-ARRANQUE}
        containerStyle={styles.contenedor}
        renderRightActions={(progreso) => (
          <AccionEliminar
            progreso={progreso}
            etiqueta={etiqueta}
            onPress={() => onEliminar(cerrar)}
          />
        )}
      >
        {children}
      </ReanimatedSwipeable>
    </View>
  );
}

type AccionProps = {
  /** 0 con la card cerrada, 1 con el botón entero a la vista. */
  progreso: SharedValue<number>;
  etiqueta: string;
  onPress: () => void;
};

/**
 * Botón "Eliminar" que aparece detrás de la card.
 * @param props progreso del swipe, texto accesible y acción
 * @returns el botón
 */
function AccionEliminar({ progreso, etiqueta, onPress }: AccionProps) {
  // Vibra una sola vez cada vez que el progreso pasa el umbral.
  useAnimatedReaction(
    () => progreso.get() >= UMBRAL,
    (paso, antes) => {
      if (paso && antes === false) scheduleOnRN(vibrarUmbral);
    },
  );

  const estilo = useAnimatedStyle(() => ({
    opacity: interpolate(progreso.get(), [0, UMBRAL], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(progreso.get(), [0, 1], [ESCALA_INICIAL, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [styles.accion, pressed && styles.accionPressed]}
    >
      <Animated.View style={[styles.accionContenido, estilo]}>
        <MaterialIcons name="delete-outline" size={sizes.iconMd} color={colors.error} />
        <Text style={styles.accionTexto}>Eliminar</Text>
      </Animated.View>
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  sombra: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  contenedor: {
    borderRadius: radius.lg,
  },
  accion: {
    width: ANCHO_ACCION,
    alignItems: 'center',
    justifyContent: 'center',
    // Mismo par de colores que la variante `danger` de PrimaryButton.
    backgroundColor: colors.errorContainer,
  },
  accionPressed: {
    opacity: 0.7,
  },
  accionContenido: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  accionTexto: {
    ...typography.labelSm,
    color: colors.error,
  },
});
