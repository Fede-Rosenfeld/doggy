/**
 * Header de la app para las pantallas principales.
 *
 * A la izquierda la huella y el nombre "Doggy"; a la derecha el avatar del
 * usuario (`AvatarPerfil`), que lleva a la tab Perfil y aparece siempre. En
 * pantallas internas (`backTo`) la huella se reemplaza por el botón de volver.
 * Respeta la safe area.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes, spacing, typography } from '@/theme';
import { AvatarPerfil } from './AvatarPerfil';
import { BackButton } from './BackButton';

type Props = {
  /** Si viene, muestra el botón de volver con esta ruta de respaldo. */
  backTo?: Href;
};

/**
 * Barra superior con la marca y el acceso al perfil.
 * @param props.backTo ruta de respaldo del botón de volver (opcional)
 * @returns el header
 */
export function AppHeader({ backTo }: Props = {}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.brand}>
        {backTo ? (
          <BackButton fallback={backTo} />
        ) : (
          <MaterialIcons name="pets" size={sizes.iconMd + 4} color={colors.primary} />
        )}
        <Text style={styles.title}>Doggy</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
    // Sombra muy leve para separar el header del contenido que scrollea.
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.primary,
  },
});
