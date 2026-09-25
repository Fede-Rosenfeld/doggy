/**
 * Barra de tabs inferior personalizada.
 *
 * Reemplaza la barra por defecto del Bottom Tab Navigator para lograr el
 * diseño de la marca: fondo blanco, esquinas superiores redondeadas y una
 * "píldora" de color detrás del ícono y el label de la tab activa.
 * Toma el título, el ícono y los colores de las opciones de cada Tabs.Screen.
 */
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';

/**
 * Dibuja la barra de tabs.
 * @param props estado del navigator, descriptores de cada ruta, navigation e insets
 * @returns la barra con un botón por tab
 */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused
          ? (options.tabBarActiveTintColor ?? colors.onSecondaryContainer)
          : (options.tabBarInactiveTintColor ?? colors.onSurfaceVariant);
        const label = options.title ?? route.name;

        /** Navega a la tab salvo que ya esté activa o algún listener lo cancele. */
        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={handlePress}
            style={styles.item}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.pill,
                  focused && styles.pillActive,
                  pressed && !focused && styles.pillPressed,
                ]}
              >
                {options.tabBarIcon?.({ focused, color, size: sizes.iconMd })}
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadows.level2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs / 2,
    minWidth: '88%',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  pillActive: {
    backgroundColor: colors.secondaryContainer,
  },
  pillPressed: {
    backgroundColor: colors.surfaceContainer,
  },
  label: {
    ...typography.labelMd,
    letterSpacing: 0,
  },
});
