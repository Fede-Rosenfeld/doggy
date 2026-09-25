/**
 * Carnet Sanitario de una mascota.
 *
 * Muestra el resumen de la mascota, pestañas para filtrar por tipo de
 * registro (vacunas, desparasitación u otros), el próximo refuerzo pendiente
 * destacado y el historial. El FAB abre un formulario para sumar un registro.
 */
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { NuevoRegistroForm } from '@/components/carnet/NuevoRegistroForm';
import { ProximoRefuerzoCard } from '@/components/carnet/ProximoRefuerzoCard';
import { RegistroCard } from '@/components/carnet/RegistroCard';
import { Cargando, EstadoVacio } from '@/components/EstadoVista';
import { Fab } from '@/components/Fab';
import { FormModal } from '@/components/FormModal';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useApp } from '@/context/AppContext';
import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { RegistroSanitario, TipoRegistro } from '@/types/models';
import { textoEdad, TIPOS_REGISTRO } from '@/utils/etiquetas';
import { volver } from '@/utils/navegacion';
import { buscarMascota, proximoRefuerzo, registrosPorTipo } from '@/utils/selectores';

/** Opciones del selector de pestañas. */
const PESTANAS = TIPOS_REGISTRO.map((t) => ({ valor: t.valor, label: t.pestana }));

/**
 * Pantalla del carnet sanitario.
 * @returns el carnet, o un estado de carga / no encontrada
 */
export default function CarnetSanitarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mascotas, registros, cargando } = useApp();

  // --- Estado ---
  const [tipo, setTipo] = useState<TipoRegistro>('vacuna');
  const [formVisible, setFormVisible] = useState(false);

  // --- Datos derivados ---
  const mascota = useMemo(() => buscarMascota(mascotas, id), [mascotas, id]);
  const delTipo = useMemo(
    () => (mascota ? registrosPorTipo(registros, mascota.id, tipo) : []),
    [registros, mascota, tipo],
  );
  const proximo = useMemo(() => proximoRefuerzo(delTipo), [delTipo]);
  // El refuerzo destacado no se repite en el historial.
  const historial = useMemo(
    () => delTipo.filter((r) => r.id !== proximo?.id),
    [delTipo, proximo],
  );
  const textos = TIPOS_REGISTRO.find((t) => t.valor === tipo) ?? TIPOS_REGISTRO[0];

  // --- Handlers ---
  /** Cierra el formulario y muestra la pestaña del registro recién creado. */
  const handleGuardado = useCallback((registro: RegistroSanitario) => {
    setFormVisible(false);
    setTipo(registro.tipo);
  }, []);

  /** Abre el formulario de nuevo registro. */
  const abrirFormulario = () => setFormVisible(true);
  /** Cierra el formulario sin guardar. */
  const cerrarFormulario = () => setFormVisible(false);

  // --- Render ---
  if (!mascota) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Carnet Sanitario" variant="bar" />
        {cargando ? (
          <Cargando />
        ) : (
          <EstadoVacio
            icon="search-off"
            titulo="No encontramos esta mascota"
            accion={{ titulo: 'Volver a mis mascotas', onPress: () => volver('/mascotas') }}
          />
        )}
      </View>
    );
  }

  const encabezado = (
    <View style={styles.encabezado}>
      <View style={styles.resumen}>
        <Avatar foto={mascota.foto} nombre={mascota.nombre} size={sizes.avatarMd} />
        <View style={styles.resumenTexto}>
          <Text style={styles.nombre}>{mascota.nombre}</Text>
          <Text style={styles.detalle}>
            {mascota.raza} • {textoEdad(mascota.edad)}
          </Text>
        </View>
      </View>

      <SegmentedControl opciones={PESTANAS} valor={tipo} onChange={setTipo} />

      {proximo && <ProximoRefuerzoCard registro={proximo} titulo={textos.proximo} />}

      {historial.length > 0 && <Text style={styles.seccion}>{textos.historial}</Text>}
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Carnet Sanitario"
        variant="bar"
        fallback={{ pathname: '/mascotas/[id]', params: { id: String(mascota.id) } }}
      />
      <FlatList
        data={historial}
        keyExtractor={(registro) => String(registro.id)}
        renderItem={({ item }) => <RegistroCard registro={item} />}
        ListHeaderComponent={encabezado}
        ListEmptyComponent={
          proximo ? null : (
            <EstadoVacio
              icon="vaccines"
              titulo={textos.vacio}
              mensaje="Cuando cargues uno, va a aparecer acá con su fecha y profesional."
              accion={{ titulo: 'Agregar registro', onPress: abrirFormulario }}
            />
          )
        }
        ItemSeparatorComponent={Separador}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
      <Fab
        icon="add"
        label="Agregar Registro"
        onPress={abrirFormulario}
        accessibilityLabel="Agregar registro al carnet"
      />

      <FormModal visible={formVisible} titulo="Nuevo registro" onClose={cerrarFormulario}>
        <NuevoRegistroForm
          mascotaId={mascota.id}
          tipoInicial={tipo}
          onGuardado={handleGuardado}
        />
      </FormModal>
    </View>
  );
}

/** Espacio entre cards del historial. */
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
    paddingTop: spacing.md,
    // Espacio para que el FAB no tape el último registro.
    paddingBottom: sizes.fab + spacing.stackLg,
  },
  encabezado: {
    gap: spacing.stackMd,
    marginBottom: spacing.stackSm,
  },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    padding: spacing.stackSm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  resumenTexto: {
    flex: 1,
    gap: spacing.xs,
  },
  nombre: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  detalle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  seccion: {
    ...typography.headlineMd,
    color: colors.onBackground,
  },
  separador: {
    height: spacing.stackSm,
  },
});
