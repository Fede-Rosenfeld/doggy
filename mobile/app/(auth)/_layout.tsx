/**
 * Grupo de autenticación: login y registro.
 * Stack sin header propio; cada pantalla dibuja su encabezado.
 */
import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Stack de las pantallas de autenticación. */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
