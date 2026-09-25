/**
 * Marker del mapa para un reporte: pin mostaza si está perdido, teal si fue
 * encontrado. El pin seleccionado se dibuja un poco más grande.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { colors } from '@/theme';
import type { ReportePerdida } from '@/types/models';

type Props = {
  reporte: ReportePerdida;
  seleccionado: boolean;
  onPress: (reporte: ReportePerdida) => void;
};

/** Tamaño del pin normal y seleccionado. */
const PIN = 40;
const PIN_SELECCIONADO = 52;
/** Tiempo que el marker sigue redibujándose al cambiar, para que llegue a pintarse el ícono. */
const REDIBUJO_MS = 600;

/**
 * Marker personalizado.
 * @param props ver `Props`
 * @returns el marker
 */
export function ReporteMarker({ reporte, seleccionado, onPress }: Props) {
  // En Android un marker con vista propia se "congela" como imagen. Se deja que
  // siga actualizándose un momento después de cada cambio y después se apaga
  // (tracksViewChanges siempre en true consume mucha batería con varios pines).
  const [redibujar, setRedibujar] = useState(true);

  useEffect(() => {
    setRedibujar(true);
    const timer = setTimeout(() => setRedibujar(false), REDIBUJO_MS);
    return () => clearTimeout(timer);
  }, [seleccionado]);

  const color = reporte.estado === 'perdido' ? colors.mustard : colors.primaryContainer;

  return (
    <Marker
      coordinate={{ latitude: reporte.lat, longitude: reporte.lng }}
      onPress={() => onPress(reporte)}
      tracksViewChanges={redibujar}
      anchor={{ x: 0.5, y: 1 }}
      title={reporte.nombre}
      description={reporte.zona}
    >
      <View style={styles.pin}>
        <MaterialIcons
          name="location-on"
          size={seleccionado ? PIN_SELECCIONADO : PIN}
          color={color}
        />
      </View>
    </Marker>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  pin: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
