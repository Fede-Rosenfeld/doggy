/**
 * Menú de acciones rápidas de una mascota, el que se abre al mantener
 * presionada su card en "Mis Mascotas".
 *
 * Opciones: Editar, Reportar como perdida (o "Ya apareció" si tiene un
 * reporte activo) y Compartir QR. Son las mismas acciones que tiene el
 * perfil de la mascota, que sigue siendo la forma tocable de llegar a ellas.
 *
 * En iOS se muestra con `ActionSheetIOS`, y en Android con un Alert con
 * botones, como en `useFototeca`. El Alert de Android admite como mucho tres
 * botones: no lleva "Cancelar" y se cierra tocando afuera.
 */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { useApp } from '@/context/AppContext';
import type { Mascota } from '@/types/models';
import { compartirQr } from '@/utils/compartir';
import { reporteActivo } from '@/utils/selectores';
import { useCerrarReporte } from './useCerrarReporte';

type Opcion = {
  texto: string;
  accion: () => void;
};

type UseMenuMascota = {
  /**
   * Abre el menú nativo con las acciones de la mascota.
   * @param mascota mascota de la card que se mantuvo presionada
   */
  abrirMenu: (mascota: Mascota) => void;
};

/**
 * Menú de acciones rápidas de una mascota.
 * @returns la función para abrir el menú
 */
export function useMenuMascota(): UseMenuMascota {
  const { reportes } = useApp();
  const { pedirCierre } = useCerrarReporte();

  /**
   * Arma las tres opciones según si la mascota ya está reportada como perdida.
   * @param mascota mascota elegida
   * @returns las opciones en el orden en que se muestran
   */
  const armarOpciones = useCallback(
    (mascota: Mascota): Opcion[] => {
      const reporte = reporteActivo(reportes, mascota.id);
      const id = String(mascota.id);
      return [
        {
          texto: 'Editar',
          accion: () => router.push({ pathname: '/mascotas/[id]/editar', params: { id } }),
        },
        reporte
          ? { texto: 'Ya apareció', accion: () => pedirCierre(reporte) }
          : {
              texto: 'Reportar como perdida',
              accion: () =>
                router.push({ pathname: '/mi-mascota-perdida', params: { mascotaId: id } }),
            },
        { texto: 'Compartir QR', accion: () => compartirQr(mascota) },
      ];
    },
    [reportes, pedirCierre],
  );

  const abrirMenu = useCallback(
    (mascota: Mascota) => {
      const opciones = armarOpciones(mascota);
      if (Platform.OS === 'ios') {
        const textos = [...opciones.map((o) => o.texto), 'Cancelar'];
        ActionSheetIOS.showActionSheetWithOptions(
          { title: mascota.nombre, options: textos, cancelButtonIndex: textos.length - 1 },
          (indice) => opciones[indice]?.accion(),
        );
        return;
      }
      Alert.alert(
        mascota.nombre,
        undefined,
        opciones.map((o) => ({ text: o.texto, onPress: o.accion })),
        { cancelable: true },
      );
    },
    [armarOpciones],
  );

  return { abrirMenu };
}
