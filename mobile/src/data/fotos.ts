/**
 * Fotos incluidas en la app para los datos de ejemplo.
 *
 * Los modelos guardan la foto como string: puede ser una de estas claves
 * (foto local empaquetada) o una URI (una foto elegida de la galería o, más
 * adelante, una URL del backend). `fuenteFoto` resuelve cualquiera de los dos
 * casos al formato que espera el componente Image.
 */
import type { ImageSourcePropType } from 'react-native';

const FOTOS_LOCALES = {
  luna: require('@/assets/images/luna.jpg'),
  'luna-parque': require('@/assets/images/luna-parque.jpg'),
  roco: require('@/assets/images/roco.jpg'),
  milo: require('@/assets/images/milo.jpg'),
  simba: require('@/assets/images/simba.jpg'),
  'sin-collar': require('@/assets/images/sin-collar.jpg'),
  nieve: require('@/assets/images/nieve.jpg'),
  sofia: require('@/assets/images/sofia.jpg'),
  carlos: require('@/assets/images/carlos.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export type ClaveFotoLocal = keyof typeof FOTOS_LOCALES;

/**
 * Convierte el valor guardado en un modelo en una fuente para Image.
 * @param foto clave local, URI o null
 * @returns la fuente de la imagen, o null si no hay foto
 */
export function fuenteFoto(foto: string | null | undefined): ImageSourcePropType | null {
  if (!foto) return null;
  if (foto in FOTOS_LOCALES) return FOTOS_LOCALES[foto as ClaveFotoLocal];
  return { uri: foto };
}
