/**
 * Pantalla Agregar mascota.
 *
 * Alta de un perro con el formulario compartido `MascotaForm` (foto, nombre,
 * raza, edad y señas particulares). Al guardar, el service le asigna el ID
 * único DOGGY-XXXX-NOMBRE que después se usa en el QR, y se vuelve al
 * listado, donde la mascota ya aparece.
 */
import { Alert, StyleSheet } from 'react-native';

import { MascotaForm } from '@/components/mascotas/MascotaForm';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { spacing } from '@/theme';
import type { NuevaMascota } from '@/types/models';
import { volver } from '@/utils/navegacion';

/**
 * Formulario de alta de mascota.
 * @returns la pantalla
 */
export default function NuevaMascotaScreen() {
  const { agregarMascota } = useApp();

  // --- Handlers ---
  /**
   * Guarda la mascota en el contexto y vuelve al listado.
   * @param datos datos validados del formulario
   */
  const handleGuardar = async (datos: NuevaMascota) => {
    try {
      const creada = await agregarMascota(datos);
      volver('/mascotas');
      Alert.alert('¡Listo!', `${creada.nombre} ya tiene su ID único: ${creada.codigo}`);
    } catch {
      Alert.alert('No se pudo guardar', 'Revisá tu conexión e intentá de nuevo.');
    }
  };

  // --- Render ---
  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Agregar mascota"
        subtitle="Completá sus datos para generar su QR de identificación."
      />
      <MascotaForm onGuardar={handleGuardar} />
    </ScreenContainer>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  content: {
    gap: spacing.stackMd,
    paddingBottom: spacing.stackLg,
  },
});
