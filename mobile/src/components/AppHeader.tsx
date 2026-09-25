/**
 * Header de la app para las pantallas principales.
 *
 * A la izquierda la huella y el nombre "Doggy"; a la derecha el avatar del
 * usuario, que lleva a la tab Perfil. En pantallas internas (`backTo`) la
 * huella se reemplaza por el botón de volver. Con `acciones`, en lugar del
 * avatar se muestran botones de ícono (buscar, filtrar). Respeta la safe area.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { colors, radius, sizes, spacing, typography } from '@/theme';
import { Avatar } from './Avatar';
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
  /** Botones de ícono que reemplazan al avatar. */
  acciones?: AccionHeader[];
};

/**
 * Barra superior con la marca y el acceso al perfil.
 * @param props.backTo ruta de respaldo del botón de volver (opcional)
 * @param props.acciones botones de ícono a la derecha (opcional)
 * @returns el header
 */
export function AppHeader({ backTo, acciones }: Props = {}) {
  const { usuario } = useApp();
  const insets = useSafeAreaInsets();

  /** Abre la tab Perfil. */
  const irAlPerfil = () => router.navigate('/perfil');

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
      {acciones ? (
        <View style={styles.acciones}>
          {acciones.map((accion) => (
            <Pressable
              key={accion.label}
              onPress={accion.onPress}
              accessibilityRole="button"
              accessibilityLabel={accion.label}
              accessibilityState={{ selected: !!accion.activo }}
              style={({ pressed }) => [
                styles.accion,
                accion.activo && styles.accionActiva,
                pressed && styles.avatarPressed,
              ]}
            >
              <MaterialIcons
                name={accion.icon}
                size={sizes.iconMd}
                color={accion.activo ? colors.primary : colors.onSurfaceVariant}
              />
            </Pressable>
          ))}
        </View>
      ) : (
        <Pressable
          onPress={irAlPerfil}
          accessibilityRole="button"
          accessibilityLabel="Ir a mi perfil"
          style={({ pressed }) => [styles.avatarButton, pressed && styles.avatarPressed]}
        >
          <Avatar
            foto={usuario?.foto}
            nombre={usuario?.nombre ?? 'Perfil'}
            size={sizes.avatarSm}
            borderColor={colors.surfaceContainerHighest}
          />
        </Pressable>
      )}
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
  acciones: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  avatarButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  avatarPressed: {
    backgroundColor: colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
});
