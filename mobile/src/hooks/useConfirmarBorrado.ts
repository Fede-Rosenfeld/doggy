/**
 * Hook para borrar algo (un turno, un registro del carnet) pidiendo
 * confirmación antes.
 *
 * Lo usan el swipe de las cards y el botón "Eliminar" de los formularios,
 * para que la respuesta sea la misma en los dos lugares: Alert nativo de
 * confirmación, borrado en el servidor (la acción del `AppContext` que se
 * pase) y vibración al terminar. Si se cancela o falla, avisa con
 * `onDescartado` (por ejemplo, para cerrar el swipe).
 *
 * Háptica: usa el motor de vibración del celular con `expo-haptics` para
 * confirmar que se borró (o avisar que falló). No pide permisos.
 */
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export type OpcionesBorrado = {
  /** Título del Alert de confirmación. */
  titulo: string;
  /** Explicación de lo que se va a borrar. */
  mensaje: string;
  /** Acción que borra en el servidor (por ejemplo, `() => borrarTurno(id)`). */
  borrar: () => Promise<void>;
  /** Se llama cuando ya se borró. */
  onBorrado?: () => void;
  /** Se llama si se cancela la confirmación o si el borrado falla. */
  onDescartado?: () => void;
};

type UseConfirmarBorrado = {
  /** true mientras se está borrando. */
  borrando: boolean;
  /**
   * Pide confirmación y, si se acepta, borra.
   * @param opciones textos del Alert, acción de borrado y callbacks
   */
  pedirBorrado: (opciones: OpcionesBorrado) => void;
};

/**
 * Borrado con confirmación y vibración.
 * @returns el estado de carga y la función para pedir el borrado
 */
export function useConfirmarBorrado(): UseConfirmarBorrado {
  const [borrando, setBorrando] = useState(false);

  /**
   * Borra lo ya confirmado y avisa cómo salió.
   * @param opciones las mismas que recibió `pedirBorrado`
   */
  const borrar = useCallback(async ({ borrar, onBorrado, onDescartado }: OpcionesBorrado) => {
    setBorrando(true);
    try {
      await borrar();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onBorrado?.();
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('No se pudo eliminar', e instanceof Error ? e.message : 'Intentá de nuevo.');
      onDescartado?.();
    } finally {
      setBorrando(false);
    }
  }, []);

  const pedirBorrado = useCallback(
    (opciones: OpcionesBorrado) => {
      Alert.alert(
        opciones.titulo,
        opciones.mensaje,
        [
          { text: 'Cancelar', style: 'cancel', onPress: opciones.onDescartado },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => borrar(opciones),
          },
        ],
        // En Android se puede cerrar tocando afuera: cuenta como cancelar.
        { cancelable: true, onDismiss: opciones.onDescartado },
      );
    },
    [borrar],
  );

  return { borrando, pedirBorrado };
}
