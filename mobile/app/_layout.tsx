/**
 * Layout raíz de la app.
 *
 * Carga las fuentes de la marca (Quicksand y Plus Jakarta Sans) y mantiene
 * la splash visible hasta que terminan de cargar, para que ninguna pantalla
 * se dibuje con la tipografía del sistema. Define el Stack raíz.
 */
import { Quicksand_600SemiBold } from '@expo-google-fonts/quicksand/600SemiBold';
import { Quicksand_700Bold } from '@expo-google-fonts/quicksand/700Bold';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { colors } from '@/theme';

// La splash queda visible hasta que se llame a hideAsync.
SplashScreen.preventAutoHideAsync();

/**
 * Componente raíz: espera las fuentes y monta el Stack principal.
 * @returns el Stack raíz, o null mientras las fuentes cargan
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    // Si falla la carga igual se oculta la splash: la app sigue usable con la fuente del sistema.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      />
    </>
  );
}
