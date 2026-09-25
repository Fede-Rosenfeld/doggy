/**
 * Card destacada en mostaza con el próximo refuerzo pendiente del carnet.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { RegistroSanitario } from '@/types/models';
import { formatearFecha } from '@/utils/fechas';

type Props = {
  registro: RegistroSanitario;
  /** Título de la card; cambia según el tipo ("Próximo refuerzo", "Próxima dosis"...). */
  titulo?: string;
};

/**
 * Card del próximo refuerzo.
 * @param props.registro registro pendiente a destacar
 * @param props.titulo título de la card
 * @returns la card
 */
export function ProximoRefuerzoCard({ registro, titulo = 'Próximo refuerzo' }: Props) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.icono}>
        <MaterialIcons name="vaccines" size={sizes.iconMd} color={colors.tertiaryContainer} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.label}>{titulo.toUpperCase()}</Text>
        <Text style={styles.nombre}>{registro.nombre}</Text>
        <View style={styles.fecha}>
          <MaterialIcons name="calendar-today" size={sizes.iconSm} color={colors.onTertiaryFixedVariant} />
          <Text style={styles.fechaTexto}>{formatearFecha(registro.fecha)}</Text>
        </View>
      </View>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.stackSm,
    padding: spacing.containerMargin,
    borderRadius: radius.lg,
    backgroundColor: colors.tertiaryFixedDim,
    ...shadows.level1,
  },
  icono: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    marginTop: spacing.xs,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
  },
  textos: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    ...typography.labelSm,
    color: colors.tertiaryContainer,
  },
  nombre: {
    ...typography.headlineMd,
    color: colors.onBackground,
  },
  fecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fechaTexto: {
    ...typography.bodyMd,
    fontFamily: typography.labelMd.fontFamily,
    color: colors.onTertiaryFixedVariant,
  },
});
