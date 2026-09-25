/**
 * Sombras suaves teñidas de teal.
 *
 * iOS usa shadow* y Android usa elevation, así que cada nivel define las dos
 * cosas para que se vea parecido en ambas plataformas.
 */
import { ViewStyle } from 'react-native';
import { colors } from './colors';

type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

/** Niveles de elevación. */
export const shadows = {
  /** Cards apoyadas sobre el fondo crema. */
  level1: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  /** Modales, pop-ups y contenedores destacados. */
  level2: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} satisfies Record<string, Shadow>;
