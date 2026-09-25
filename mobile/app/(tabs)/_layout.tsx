/**
 * Bottom Tab Navigator principal: Mascotas, Perdidos, Agenda y Perfil.
 * Usa una barra personalizada (TabBar) con la píldora de tab activa.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { TabBar } from '@/components/navigation/TabBar';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Genera la función tabBarIcon para un ícono de MaterialIcons.
 * @param name nombre del ícono
 * @returns función que recibe color y tamaño y dibuja el ícono
 */
function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <MaterialIcons name={name} color={color} size={size} />
  );
}

/** Layout de tabs de la app. */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.onSecondaryContainer,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        sceneStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="mascotas" options={{ title: 'Mascotas', tabBarIcon: tabIcon('pets') }} />
      <Tabs.Screen name="perdidos" options={{ title: 'Perdidos', tabBarIcon: tabIcon('map') }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: tabIcon('calendar-today') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
