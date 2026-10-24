/**
 * Compartir la identificación de una mascota con la hoja de compartir del
 * sistema. Lo usan la card del QR del perfil y el menú de la `PetCard`, para
 * que el mensaje sea el mismo en los dos lugares.
 */
import { Alert, Share } from 'react-native';

import type { Mascota } from '@/types/models';

/**
 * Abre la hoja de compartir con el ID único de la mascota. Si falla, avisa con un Alert.
 * @param mascota nombre y código de la mascota
 */
export async function compartirQr(mascota: Pick<Mascota, 'nombre' | 'codigo'>): Promise<void> {
  try {
    await Share.share({
      message:
        `${mascota.nombre} tiene su identificación en Doggy. ` +
        `ID único: ${mascota.codigo}. ` +
        `Si encontrás a ${mascota.nombre}, escaneá el QR de su collar con la app para contactar a su tutor.`,
    });
  } catch {
    Alert.alert('No se pudo compartir', 'Probá de nuevo en unos segundos.');
  }
}
