/**
 * Estados de pantalla reutilizables: cargando, vacío y error.
 * Se usan cuando una lista todavía no tiene datos para mostrar.
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';
import { PrimaryButton } from './PrimaryButton';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Spinner con un texto de carga.
 * @param props.mensaje texto debajo del spinner
 * @returns la vista de carga
 */
export function Cargando({ mensaje = 'Cargando…' }: { mensaje?: string }) {
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primaryContainer} />
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

type VacioProps = {
  icon?: IconName;
  titulo: string;
  mensaje?: string;
  /** Acción opcional, por ejemplo "Agregar mascota" o "Reintentar". */
  accion?: { titulo: string; onPress: () => void };
};

/**
 * Estado vacío o de error con ícono, texto y acción opcional.
 * @param props ver `VacioProps`
 * @returns la vista del estado
 */
export function EstadoVacio({ icon = 'pets', titulo, mensaje, accion }: VacioProps) {
  return (
    <View style={styles.center}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={sizes.iconLg} color={colors.primaryContainer} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {mensaje && <Text style={styles.texto}>{mensaje}</Text>}
      {accion && (
        <PrimaryButton
          title={accion.titulo}
          variant="outline"
          onPress={accion.onPress}
          style={styles.accion}
        />
      )}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.stackSm,
    paddingVertical: spacing.stackLg,
  },
  iconCircle: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealLight10,
  },
  titulo: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  texto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  accion: {
    marginTop: spacing.sm,
  },
});
