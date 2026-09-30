/**
 * Header de la app para las pantallas principales.
 *
 * A la izquierda la huella y el nombre "Doggy"; a la derecha el avatar del
 * usuario (`AvatarPerfil`), que lleva a la tab Perfil y aparece siempre. En
 * pantallas internas (`backTo`) la huella se reemplaza por el botón de volver.
 * Con `acciones` se suman botones de ícono (buscar, filtrar) a la izquierda
 * del avatar. Respeta la safe area.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sizes, spacing, typography } from '@/theme';
import { AvatarPerfil } from './AvatarPerfil';
import { BackButton } from './BackButton';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

/** Botón de ícono del header. */
export type AccionHeader = {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Resalta el botón (por ejemplo, si el filtro está aplicado). */
  activo?: boolean;
};

type Props = {
  /** Si viene, muestra el botón de volver con esta ruta de respaldo. */
  backTo?: Href;
  /** Botones de ícono que se muestran antes del avatar. */
  acciones?: AccionHeader[];
};

/**
 * Barra superior con la marca y el acceso al perfil.
 * @param props.backTo ruta de respaldo del botón de volver (opcional)
 * @param props.acciones botones de ícono a la derecha (opcional)
 * @returns el header
 */
export function AppHeader({ backTo, acciones }: Props = {}) {
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
      <View style={styles.derecha}>
        {acciones?.map((accion) => (
          <Pressable
            key={accion.label}
            onPress={accion.onPress}
            accessibilityRole="button"
            accessibilityLabel={accion.label}
            accessibilityState={{ selected: !!accion.activo }}
            style={({ pressed }) => [
              styles.accion,
              accion.activo && styles.accionActiva,
              pressed && styles.accionPressed,
            ]}
          >
            <MaterialIcons
              name={accion.icon}
              size={sizes.iconMd}
              color={accion.activo ? colors.primary : colors.onSurfaceVariant}
            />
          </Pressable>
        ))}
        <AvatarPerfil />
      </View>
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
  derecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  accion: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accionActiva: {
    backgroundColor: colors.tealLight10,
  },
  accionPressed: {
    backgroundColor: colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
});
