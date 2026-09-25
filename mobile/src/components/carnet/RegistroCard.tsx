/**
 * Card de un registro del historial sanitario: nombre, estado, fecha y
 * profesional o clínica que lo aplicó.
 */
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme';
import type { RegistroSanitario } from '@/types/models';
import { formatearFecha } from '@/utils/fechas';
import { Badge } from '../Badge';

type Props = {
  registro: RegistroSanitario;
};

/** Tamaño de los íconos de la fila de detalle. */
const ICONO = 16;

/**
 * Indica si el profesional es una persona (Dr./Dra.) o una institución.
 * @param profesional texto cargado en el registro
 * @returns true si parece un médico veterinario
 */
function esVeterinario(profesional: string): boolean {
  return /^dra?\.?\s/i.test(profesional.trim());
}

/**
 * Card del historial.
 * @param props.registro registro a mostrar
 * @returns la card
 */
export function RegistroCard({ registro }: Props) {
  const aplicada = registro.estado === 'aplicada';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.nombre}>{registro.nombre}</Text>
        <Badge label={aplicada ? 'Aplicada' : 'Pendiente'} tone={aplicada ? 'teal' : 'neutral'} dot />
      </View>
      <View style={styles.detalle}>
        <View style={styles.dato}>
          <MaterialIcons name="event" size={ICONO} color={colors.onSurfaceVariant} />
          <Text style={styles.datoTexto}>{formatearFecha(registro.fecha)}</Text>
        </View>
        <View style={styles.dato}>
          {esVeterinario(registro.profesional) ? (
            <MaterialCommunityIcons name="stethoscope" size={ICONO} color={colors.onSurfaceVariant} />
          ) : (
            <MaterialIcons name="local-hospital" size={ICONO} color={colors.onSurfaceVariant} />
          )}
          <Text style={styles.datoTexto} numberOfLines={1}>
            {registro.profesional}
          </Text>
        </View>
      </View>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    gap: spacing.stackSm,
    padding: spacing.containerMargin,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nombre: {
    ...typography.bodyLg,
    fontFamily: typography.labelMd.fontFamily,
    color: colors.onSurface,
    flex: 1,
  },
  detalle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dato: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  datoTexto: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
});
