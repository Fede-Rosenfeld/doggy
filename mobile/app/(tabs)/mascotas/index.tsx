/**
 * Pantalla Mis Mascotas (primera tab).
 *
 * Lista las mascotas del usuario que vienen del contexto global. Tocar una
 * card abre su perfil y el FAB mostaza lleva al alta de una mascota nueva.
 */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Cargando, EstadoVacio } from '@/components/EstadoVista';
import { Fab } from '@/components/Fab';
import { PetCard } from '@/components/PetCard';
import { useApp } from '@/context/AppContext';
import { colors, sizes, spacing, typography } from '@/theme';
import type { Mascota } from '@/types/models';

/**
 * Listado de mascotas.
 * @returns la pantalla con el header, la lista y el FAB
 */
export default function MisMascotasScreen() {
  const { mascotas, cargando, error, recargar } = useApp();

  // --- Handlers ---
  /** Abre el perfil de la mascota tocada. */
  const abrirMascota = useCallback((mascota: Mascota) => {
    router.push({ pathname: '/mascotas/[id]', params: { id: String(mascota.id) } });
  }, []);

  /** Va al formulario de alta. */
  const agregarMascota = () => router.push('/mascotas/nueva');

  // --- Render ---
  /** Contenido cuando la lista está vacía: carga, error o sin mascotas. */
  const renderVacio = () => {
    if (cargando) return <Cargando mensaje="Cargando tus mascotas…" />;
    if (error) {
      return (
        <EstadoVacio
          icon="cloud-off"
          titulo="No pudimos cargar tus mascotas"
          mensaje={error}
          accion={{ titulo: 'Reintentar', onPress: recargar }}
        />
      );
    }
    return (
      <EstadoVacio
        titulo="Todavía no cargaste mascotas"
        mensaje="Agregá a tu primera mascota para generar su QR de identificación."
        accion={{ titulo: 'Agregar mascota', onPress: agregarMascota }}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader />
      <FlatList
        data={mascotas}
        keyExtractor={(mascota) => String(mascota.id)}
        renderItem={({ item }) => <PetCard mascota={item} onPress={abrirMascota} />}
        ListHeaderComponent={<Text style={styles.titulo}>Mis Mascotas</Text>}
        ListEmptyComponent={renderVacio}
        ItemSeparatorComponent={Separador}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
      <Fab icon="add" onPress={agregarMascota} accessibilityLabel="Agregar mascota" />
    </View>
  );
}

/** Espacio vertical entre cards. */
function Separador() {
  return <View style={styles.separador} />;
}

// --- Estilos ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lista: {
    flexGrow: 1,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.stackMd,
    // Deja lugar para que el FAB no tape la última card.
    paddingBottom: sizes.fab + spacing.stackLg,
  },
  titulo: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.stackMd,
  },
  separador: {
    height: spacing.stackMd,
  },
});
