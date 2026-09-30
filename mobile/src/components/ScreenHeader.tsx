/**
 * Encabezado de pantallas internas: botón de volver, título y subtítulo opcional.
 * Se usa en las pantallas que se apilan sobre una tab (alta, carnet, etc.).
 * La variante `bar` es una barra fija arriba (con safe area y sombra leve) y
 * el título en teal, como en el carnet sanitario.
 * A la derecha va siempre el avatar del usuario (`AvatarPerfil`), igual que
 * en `AppHeader`, para que el acceso al perfil esté en todas las pantallas.
 */
import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';
import { AvatarPerfil } from './AvatarPerfil';
import { BackButton } from './BackButton';

type Props = {
  title: string;
  subtitle?: string;
  /** Ruta de respaldo si no hay historial para volver. */
  fallback?: Href;
  variant?: 'plain' | 'bar';
};

/**
 * Header con volver y título.
 * @param props ver `Props`
 * @returns el encabezado
 */
export function ScreenHeader({ title, subtitle, fallback = '/mascotas', variant = 'plain' }: Props) {
  const insets = useSafeAreaInsets();
  const esBarra = variant === 'bar';

  return (
    <View style={[styles.header, esBarra && [styles.bar, { paddingTop: insets.top + spacing.sm }]]}>
      <BackButton fallback={fallback} />
      <View style={styles.texts}>
        <Text style={[styles.title, esBarra && styles.titleBar]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <AvatarPerfil />
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
  bar: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
    zIndex: 1,
  },
  texts: {
    flex: 1,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  titleBar: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
