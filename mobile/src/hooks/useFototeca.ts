/**
 * Hook para conseguir una foto: elegirla de la galería o sacarla en el momento.
 *
 * HARDWARE / MÓDULO NATIVO: fototeca (galería de imágenes del sistema) y
 * cámara, las dos a través de expo-image-picker, que abre el selector o la
 * cámara nativa de iOS o Android con el recorte cuadrado incluido.
 * PERMISOS: acceso a fotos (NSPhotoLibraryUsageDescription en iOS; en Android
 * el selector del sistema lo resuelve) y cámara (NSCameraUsageDescription /
 * CAMERA). Cada uno se pide recién cuando el usuario elige esa opción. Los
 * textos que ve el usuario están en los plugins de app.json.
 * POR QUÉ: la foto es lo que más ayuda a reconocer a una mascota en la calle.
 * Sacarla en el momento sirve a quien no tiene una buena foto guardada, o a
 * quien encontró un perro y lo tiene adelante. Se usa en el alta y edición de
 * mascotas, en el reporte de mascota encontrada y en la foto de perfil.
 *
 * `pedirFoto` pregunta primero de dónde sacarla (hoja de acciones nativa en
 * iOS, aviso con botones en Android; en web va directo al selector de archivos).
 *
 * Sigue el patrón de permisos de la cátedra: consultar el permiso actual,
 * pedirlo si hace falta, mirar el resultado y, si el usuario lo negó y ya no
 * se puede volver a pedir (canAskAgain === false), ofrecer abrir los ajustes.
 */
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native';

import type { EstadoPermiso } from '@/types/permisos';

/** De dónde sale la foto. */
export type OrigenFoto = 'galeria' | 'camara';

type Opciones = {
  /** Relación de aspecto del recorte; por defecto cuadrado para avatares. */
  aspecto?: [number, number];
  /** Si es false no se ofrece recortar (por ejemplo, para leer un QR de una captura). */
  recortar?: boolean;
};

export type UseFototeca = {
  /** Estado del permiso del último origen que se intentó usar. */
  permiso: EstadoPermiso;
  /** Último origen que se intentó usar (para explicar qué permiso falta). */
  origen: OrigenFoto;
  /** false si el sistema ya no deja volver a pedir el permiso. */
  puedePreguntar: boolean;
  /** true mientras está abierta la galería o la cámara. */
  eligiendo: boolean;
  /**
   * Pregunta si sacar la foto o elegirla de la galería y devuelve la URI, o
   * null si se canceló o no hay permiso.
   */
  pedirFoto: () => Promise<string | null>;
  /** Abre la galería y devuelve la URI elegida, o null si se canceló o no hay permiso. */
  elegirFoto: () => Promise<string | null>;
  /** Abre la cámara y devuelve la URI de la foto, o null si se canceló o no hay permiso. */
  sacarFoto: () => Promise<string | null>;
  /** Vuelve a intentar con el último origen (lo usa el aviso de permiso denegado). */
  reintentar: () => Promise<string | null>;
  /** Abre los ajustes de la app para habilitar el permiso a mano. */
  abrirAjustes: () => Promise<void>;
};

/** Opciones de la hoja de acciones, en el orden en que se muestran. */
const OPCIONES_IOS = ['Sacar foto', 'Elegir de la galería', 'Cancelar'];

/**
 * Pregunta de dónde sacar la foto.
 * @returns el origen elegido, o null si se canceló
 */
function preguntarOrigen(): Promise<OrigenFoto | null> {
  // En web no hay hoja de acciones: el selector de archivos ya ofrece la cámara en el celular.
  if (Platform.OS === 'web') return Promise.resolve('galeria');
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { title: 'Foto', options: OPCIONES_IOS, cancelButtonIndex: OPCIONES_IOS.length - 1 },
        (indice) => resolve(indice === 0 ? 'camara' : indice === 1 ? 'galeria' : null),
      );
      return;
    }
    Alert.alert(
      'Foto',
      '¿Querés sacar una foto ahora o elegir una de tu galería?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
        { text: 'Galería', onPress: () => resolve('galeria') },
        { text: 'Sacar foto', onPress: () => resolve('camara') },
      ],
      // En Android se puede cerrar tocando afuera: cuenta como cancelar.
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

/**
 * Pide el permiso del origen elegido siguiendo los pasos consultar → pedir → resultado.
 * @param origen galería o cámara
 * @returns si quedó concedido y si se puede volver a preguntar
 */
async function asegurarPermiso(
  origen: OrigenFoto,
): Promise<{ concedido: boolean; puedePreguntar: boolean }> {
  const actual =
    origen === 'camara'
      ? await ImagePicker.getCameraPermissionsAsync()
      : await ImagePicker.getMediaLibraryPermissionsAsync();
  if (actual.granted) return { concedido: true, puedePreguntar: true };

  const respuesta =
    origen === 'camara'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  return { concedido: respuesta.granted, puedePreguntar: respuesta.canAskAgain };
}

/**
 * Hook de la fototeca y la cámara.
 * @param opciones aspecto del recorte y si se permite recortar
 * @returns estado del permiso y funciones para conseguir una foto o abrir ajustes
 */
export function useFototeca({ aspecto = [1, 1], recortar = true }: Opciones = {}): UseFototeca {
  const [permiso, setPermiso] = useState<EstadoPermiso>('sin-consultar');
  const [origen, setOrigen] = useState<OrigenFoto>('galeria');
  const [puedePreguntar, setPuedePreguntar] = useState(true);
  const [eligiendo, setEligiendo] = useState(false);
  const [ancho, alto] = aspecto;

  /**
   * Asegura el permiso y abre la galería o la cámara con recorte.
   * @param desde origen de la foto
   * @returns la URI de la foto, o null
   */
  const obtenerFoto = useCallback(
    async (desde: OrigenFoto): Promise<string | null> => {
      setOrigen(desde);
      setEligiendo(true);
      try {
        const { concedido, puedePreguntar: sePuede } = await asegurarPermiso(desde);
        setPuedePreguntar(sePuede);
        if (!concedido) {
          setPermiso('denegado');
          return null;
        }
        setPermiso('concedido');

        const opciones: ImagePicker.ImagePickerOptions = {
          mediaTypes: ['images'],
          allowsEditing: recortar,
          aspect: [ancho, alto],
          // Calidad media: alcanza para reconocer a la mascota y pesa poco.
          quality: 0.7,
        };
        const resultado =
          desde === 'camara'
            ? await ImagePicker.launchCameraAsync({
                ...opciones,
                cameraType: ImagePicker.CameraType.back,
              })
            : await ImagePicker.launchImageLibraryAsync(opciones);
        if (resultado.canceled || resultado.assets.length === 0) return null;
        return resultado.assets[0].uri;
      } finally {
        setEligiendo(false);
      }
    },
    [ancho, alto, recortar],
  );

  const elegirFoto = useCallback(() => obtenerFoto('galeria'), [obtenerFoto]);
  const sacarFoto = useCallback(() => obtenerFoto('camara'), [obtenerFoto]);
  const reintentar = useCallback(() => obtenerFoto(origen), [obtenerFoto, origen]);

  /** Pregunta el origen y consigue la foto desde ahí. */
  const pedirFoto = useCallback(async (): Promise<string | null> => {
    const elegido = await preguntarOrigen();
    return elegido ? obtenerFoto(elegido) : null;
  }, [obtenerFoto]);

  /** Lleva a los ajustes del sistema para habilitar el permiso a mano. */
  const abrirAjustes = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  return {
    permiso,
    origen,
    puedePreguntar,
    eligiendo,
    pedirFoto,
    elegirFoto,
    sacarFoto,
    reintentar,
    abrirAjustes,
  };
}
