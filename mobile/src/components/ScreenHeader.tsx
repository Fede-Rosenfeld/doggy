/**
 * Encabezado de pantallas internas: botón de volver, título y subtítulo opcional.
 * Se usa en las pantallas que se apilan sobre una tab (alta, carnet, etc.).
 */
import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { BackButton } from './BackButton';

type Props = {
  title: string;
  subtitle?: string;
  /** Ruta de respaldo si no hay historial para volver. */
  fallback?: Href;
};

/**
 * Header con volver y título.
 * @param props ver `Props`
 * @returns el encabezado
 */
export function ScreenHeader({ title, subtitle, fallback = '/mascotas' }: Props) {
  return (
    <View style={styles.header}>
      <BackButton fallback={fallback} />
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    paddingVertical: spacing.stackSm,
  },
  texts: {
    flex: 1,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
