/**
 * Pantalla Editar mascota.
 *
 * Toma la mascota del contexto según el `id` de la ruta y abre el formulario
 * compartido `MascotaForm` con sus datos precargados (foto, nombre, raza, edad
 * y señas particulares). Al guardar actualiza la mascota y vuelve a su perfil.
 * El ID único DOGGY-XXXX-NOMBRE no cambia aunque cambie el nombre, para que la
 * placa del collar que ya está grabada siga funcionando.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Cargando, EstadoVacio } from '@/components/EstadoVista';
import { MascotaForm } from '@/components/mascotas/MascotaForm';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { colors, radius, sizes, spacing, typography } from '@/theme';
import type { NuevaMascota } from '@/types/models';
import { volver } from '@/utils/navegacion';
import { buscarMascota } from '@/utils/selectores';

/**
 * Formulario de edición de una mascota.
 * @returns la pantalla, o un estado de carga / no encontrada
 */
export default function EditarMascotaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mascotas, cargando, editarMascota } = useApp();

  // --- Datos derivados ---
  const mascota = useMemo(() => buscarMascota(mascotas, id), [mascotas, id]);

  // --- Handlers ---
  /**
   * Guarda los cambios y vuelve al perfil de la mascota.
   * @param datos datos validados del formulario
   */
  const handleGuardar = async (datos: NuevaMascota) => {
    if (!mascota) return;
    try {
      const actualizada = await editarMascota(mascota.id, datos);
      volver({ pathname: '/mascotas/[id]', params: { id: String(mascota.id) } });
      Alert.alert('¡Listo!', `Guardamos los cambios de ${actualizada.nombre}.`);
    } catch {
      Alert.alert('No se pudo guardar', 'Revisá tu conexión e intentá de nuevo.');
    }
  };

  // --- Render ---
  if (!mascota) {
    return (
      <ScreenContainer contentStyle={styles.content}>
        <ScreenHeader title="Editar mascota" />
        {cargando ? (
          <Cargando />
        ) : (
          <EstadoVacio
            icon="search-off"
            titulo="No encontramos esta mascota"
            accion={{ titulo: 'Volver a mis mascotas', onPress: () => volver('/mascotas') }}
          />
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Editar mascota"
        subtitle={`Actualizá los datos de ${mascota.nombre}.`}
        fallback={{ pathname: '/mascotas/[id]', params: { id: String(mascota.id) } }}
      />

      {/* El código del QR se mantiene para no invalidar la placa ya grabada. */}
      <View style={styles.aviso}>
        <MaterialIcons name="qr-code-2" size={sizes.iconMd} color={colors.primary} />
        <Text style={styles.avisoTexto}>
          Su ID <Text style={styles.codigo}>{mascota.codigo}</Text> no cambia, así la placa del
          collar sigue funcionando.
        </Text>
      </View>

      {/* key: si cambia la mascota de la ruta, el formulario arranca de cero con sus datos. */}
      <MascotaForm
        key={mascota.id}
        inicial={mascota}
        textoBoton="Guardar cambios"
        onGuardar={handleGuardar}
      />
    </ScreenContainer>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  content: {
    gap: spacing.stackMd,
    paddingBottom: spacing.stackLg,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.tealLight10,
  },
  avisoTexto: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  codigo: {
    ...typography.labelMd,
    color: colors.primary,
  },
});
