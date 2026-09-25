/**
 * Pantalla provisoria para las rutas que todavía no están implementadas.
 * Muestra el título de la sección y un aviso de "En construcción" con los
 * colores de la marca, así la navegación se puede recorrer completa.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';

type Props = {
  /** Título de la pantalla. */
  title: string;
};

/**
 * Placeholder con título y aviso.
 * @param props.title nombre de la pantalla
 * @returns la vista provisoria
 */
export function ScreenPlaceholder({ title }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        <MaterialIcons name="pets" size={sizes.iconLg} color={colors.primaryContainer} />
        <Text style={styles.cardText}>En construcción</Text>
      </View>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.stackMd,
    gap: spacing.stackMd,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.onSurface,
  },
  card: {
    alignItems: 'center',
    gap: spacing.stackSm,
    padding: spacing.stackMd,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  cardText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
