/**
 * Espaciado, radios y medidas fijas de Doggy.
 *
 * Escala de 8 puntos, márgenes laterales de 20 y stacks de 12/24/40
 * para el ritmo vertical entre elementos y secciones.
 */

/** Espaciado en puntos. */
export const spacing = {
  /** Unidad base de la escala. */
  base: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  /** Margen lateral de las pantallas. */
  containerMargin: 20,
  /** Separación entre columnas o elementos en fila. */
  gutter: 16,
  /** Separación entre elementos relacionados. */
  stackSm: 12,
  /** Separación entre cards. */
  stackMd: 24,
  /** Separación entre secciones. */
  stackLg: 40,
} as const;

/** Radios de borde. */
export const radius = {
  sm: 4,
  /** Botones e inputs. */
  md: 8,
  /** Cards. */
  lg: 16,
  /** Contenedores grandes (formularios, reporte de perdida). */
  xl: 24,
  /** Avatares y píldoras. */
  full: 9999,
} as const;

/** Medidas fijas de componentes. */
export const sizes = {
  /** Alto de inputs y botones. */
  inputHeight: 56,
  iconSm: 18,
  iconMd: 24,
  iconLg: 32,
  avatarSm: 40,
  avatarMd: 64,
  avatarLg: 128,
  fab: 56,
  tabBarHeight: 64,
  borderWidth: 1,
  borderWidthFocus: 2,
} as const;
