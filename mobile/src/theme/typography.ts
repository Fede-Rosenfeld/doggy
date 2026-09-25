/**
 * Tipografías de Doggy.
 *
 * Quicksand para títulos y Plus Jakarta Sans para texto y labels.
 * Las variantes replican la escala del sistema de diseño. En React Native
 * cada peso es una familia distinta, por eso se referencia el nombre exacto
 * con el que se cargó la fuente en el layout raíz.
 */
import { TextStyle } from 'react-native';

/** Nombres de las familias tal como se registran con useFonts. */
export const fonts = {
  quicksandSemiBold: 'Quicksand_600SemiBold',
  quicksandBold: 'Quicksand_700Bold',
  jakartaRegular: 'PlusJakartaSans_400Regular',
  jakartaSemiBold: 'PlusJakartaSans_600SemiBold',
  jakartaBold: 'PlusJakartaSans_700Bold',
} as const;

/**
 * Convierte un letter-spacing en em (como está en el diseño) a puntos.
 * @param fontSize tamaño de la fuente
 * @param em espaciado relativo, por ejemplo -0.02
 * @returns espaciado absoluto para React Native
 */
function em(fontSize: number, em: number): number {
  return Math.round(fontSize * em * 100) / 100;
}

type Variant = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>;

/** Variantes tipográficas del sistema de diseño. */
export const typography = {
  headlineXl: {
    fontFamily: fonts.quicksandBold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: em(40, -0.02),
  },
  headlineLg: {
    fontFamily: fonts.quicksandBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: em(32, -0.01),
  },
  headlineLgMobile: {
    fontFamily: fonts.quicksandBold,
    fontSize: 28,
    lineHeight: 34,
  },
  headlineMd: {
    fontFamily: fonts.quicksandSemiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: fonts.jakartaSemiBold,
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: em(14, 0.05),
  },
  labelSm: {
    fontFamily: fonts.jakartaBold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: em(12, 0.03),
  },
} satisfies Record<string, Variant>;

export type TypographyVariant = keyof typeof typography;
