/**
 * Hook para sacar una mascota de "perdidos" cuando aparece.
 *
 * Lo usan el detalle del reporte en Perdidos, el perfil de la mascota y la
 * edición del reporte, para que la respuesta sea igual en los tres lugares.
 * Cerrar el reporte necesita el backend (DELETE /api/reportes/:id), así que
 * por ahora solo avisa que llega en el Sprint 2.
 */
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { AVISO_SPRINT_2 } from '@/config';
import type { ReportePerdida } from '@/types/models';

type UseCerrarReporte = {
  /** true mientras se cierra el reporte. */
  cerrando: boolean;
  /**
   * Pide el cierre del reporte.
   * @param reporte reporte de la mascota que apareció
   */
  pedirCierre: (reporte: ReportePerdida) => void;
};

/**
 * Cierre de un reporte de perdido.
 * @returns el estado de carga y la función para pedir el cierre
 */
export function useCerrarReporte(): UseCerrarReporte {
  const pedirCierre = useCallback((reporte: ReportePerdida) => {
    Alert.alert(`¿${reporte.nombre} ya apareció?`, AVISO_SPRINT_2);
  }, []);

  return { cerrando: false, pedirCierre };
}
