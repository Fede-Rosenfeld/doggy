/**
 * Hook para elegir una foto de la galería del dispositivo.
 *
 * HARDWARE / MÓDULO NATIVO: fototeca (galería de imágenes del sistema) a
 * través de expo-image-picker, que abre el selector nativo de iOS o Android.
 * PERMISO: acceso a fotos (NSPhotoLibraryUsageDescription en iOS; en Android
 * el selector del sistema lo resuelve). El texto que ve el usuario está en el
 * plugin de app.json.
 * POR QUÉ: la foto es lo que más ayuda a reconocer a una mascota en la calle.
 * Se usa en el alta de mascotas, en el reporte de perdidas y en el perfil.
 *
 * Sigue el patrón de permisos de la cátedra: consultar el permiso actual,
 * pedirlo si hace falta, mirar el resultado y, si el usuario lo negó y ya no
 * se puede volver a pedir (canAskAgain === false), ofrecer abrir los ajustes.
 */
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import type { EstadoPermiso } from '@/types/permisos';

type Opciones = {
  /** Relación de aspecto del recorte; por defecto cuadrado para avatares. */
  aspecto?: [number, number];
};

type UseFototeca = {
  /** Estado del permiso después del último intento. */
  permiso: EstadoPermiso;
  /** false si el sistema ya no deja volver a pedir el permiso. */
  puedePreguntar: boolean;
  /** true mientras está abierto el selector. */
  eligiendo: boolean;
  /** Abre la galería y devuelve la URI elegida, o null si se canceló o no hay permiso. */
  elegirFoto: () => Promise<string | null>;
  /** Abre los ajustes de la app para habilitar el permiso a mano. */
  abrirAjustes: () => Promise<void>;
};

/**
 * Pide el permiso de la galería siguiendo los pasos consultar → pedir → resultado.
 * @returns si quedó concedido y si se puede volver a preguntar
 */
async function asegurarPermiso(): Promise<{ concedido: boolean; puedePreguntar: boolean }> {
  const actual = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (actual.granted) return { concedido: true, puedePreguntar: true };

  const respuesta = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return { concedido: respuesta.granted, puedePreguntar: respuesta.canAskAgain };
}

/**
 * Hook de la fototeca.
 * @param opciones aspecto del recorte
 * @returns estado del permiso y funciones para elegir foto o abrir ajustes
 */
export function useFototeca({ aspecto = [1, 1] }: Opciones = {}): UseFototeca {
  const [permiso, setPermiso] = useState<EstadoPermiso>('sin-consultar');
  const [puedePreguntar, setPuedePreguntar] = useState(true);
  const [eligiendo, setEligiendo] = useState(false);
  const [ancho, alto] = aspecto;

  /** Asegura el permiso y abre el selector de la galería con recorte. */
  const elegirFoto = useCallback(async (): Promise<string | null> => {
    setEligiendo(true);
    try {
      const { concedido, puedePreguntar: sePuede } = await asegurarPermiso();
      setPuedePreguntar(sePuede);
      if (!concedido) {
        setPermiso('denegado');
        return null;
      }
      setPermiso('concedido');

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [ancho, alto],
        // Calidad media: alcanza para reconocer a la mascota y pesa poco.
        quality: 0.7,
      });
      if (resultado.canceled || resultado.assets.length === 0) return null;
      return resultado.assets[0].uri;
    } finally {
      setEligiendo(false);
    }
  }, [ancho, alto]);

  /** Lleva a los ajustes del sistema para habilitar el permiso a mano. */
  const abrirAjustes = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  return { permiso, puedePreguntar, eligiendo, elegirFoto, abrirAjustes };
}
