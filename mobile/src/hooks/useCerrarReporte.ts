/**
 * Hook para sacar una mascota de "perdidos" cuando aparece.
 *
 * Lo usan el detalle del reporte en Perdidos, el perfil de la mascota y la
 * edición del reporte, para que la confirmación y la respuesta sean iguales
 * en los tres lugares: pregunta con un Alert nativo (cerrar un reporte no se
 * puede deshacer), cierra el reporte, vibra y avisa si falló.
 */
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useApp } from '@/context/AppContext';
import type { ReportePerdida } from '@/types/models';

type UseCerrarReporte = {
  /** true mientras se cierra el reporte. */
  cerrando: boolean;
  /**
   * Pide confirmación y cierra el reporte.
   * @param reporte reporte de la mascota que apareció
   * @param alCerrar se llama después de cerrarlo (por ejemplo, para cerrar la pantalla)
   */
  pedirCierre: (reporte: ReportePerdida, alCerrar?: () => void) => void;
};

/**
 * Confirmación y cierre de un reporte de perdido.
 * @returns el estado de carga y la función para pedir el cierre
 */
export function useCerrarReporte(): UseCerrarReporte {
  const { cerrarReporte } = useApp();
  const [cerrando, setCerrando] = useState(false);

  /**
   * Cierra el reporte y avisa el resultado.
   * @param reporte reporte a cerrar
   * @param alCerrar callback después de cerrarlo
   */
  const cerrar = useCallback(
    async (reporte: ReportePerdida, alCerrar?: () => void) => {
      setCerrando(true);
      try {
        await cerrarReporte(reporte.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alCerrar?.();
      } catch {
        Alert.alert('No se pudo actualizar', 'Revisá tu conexión e intentá de nuevo.');
      } finally {
        setCerrando(false);
      }
    },
    [cerrarReporte],
  );

  const pedirCierre = useCallback(
    (reporte: ReportePerdida, alCerrar?: () => void) => {
      Alert.alert(
        `¿${reporte.nombre} ya apareció?`,
        'El reporte se cierra y deja de verse en el mapa de Perdidos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí, ya apareció', onPress: () => cerrar(reporte, alCerrar) },
        ],
      );
    },
    [cerrar],
  );

  return { cerrando, pedirCierre };
}
