/**
 * Pantalla Perdidos: mapa comunitario de mascotas perdidas y encontradas.
 *
 * Modo Mapa: un marker por reporte (mostaza perdido, teal encontrado), botón
 * "mi ubicación" que centra el mapa con el GPS y un carrusel de cards; tocar
 * una card centra el mapa en ese reporte. Modo Lista: las mismas cards en
 * vertical. El buscador filtra en local por nombre o zona y el filtro por
 * estado. Si se deniega la ubicación, el mapa queda en CABA con un aviso.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Chip } from '@/components/Chip';
import { EstadoVacio } from '@/components/EstadoVista';
import { Fab } from '@/components/Fab';
import { FormModal } from '@/components/FormModal';
import { Input } from '@/components/Input';
import { PermissionNotice } from '@/components/PermissionNotice';
import { MapaReportes, MapaReportesHandle } from '@/components/perdidos/MapaReportes';
import { ReporteCard } from '@/components/perdidos/ReporteCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useApp } from '@/context/AppContext';
import { useUbicacion } from '@/hooks/useUbicacion';
import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { ReportePerdida } from '@/types/models';
import { filtrarReportes, FiltroEstado } from '@/utils/selectores';

type Modo = 'mapa' | 'lista';

const MODOS: { valor: Modo; label: string }[] = [
  { valor: 'mapa', label: 'Mapa' },
  { valor: 'lista', label: 'Lista' },
];

const FILTROS: { valor: FiltroEstado; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'perdido', label: 'Perdidos' },
  { valor: 'encontrado', label: 'Encontrados' },
];

/** Cuánto se asoma la card siguiente del carrusel. */
const ASOMA = 32;

/**
 * Pantalla de mascotas perdidas.
 * @returns el mapa o la lista de reportes
 */
export default function PerdidosScreen() {
  const { reportes } = useApp();
  const gps = useUbicacion({ automatico: true });
  const { width } = useWindowDimensions();

  // --- Estado ---
  const [modo, setModo] = useState<Modo>('mapa');
  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [filtroVisible, setFiltroVisible] = useState(false);
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const mapaRef = useRef<MapaReportesHandle>(null);
  const carruselRef = useRef<FlatList<ReportePerdida>>(null);

  // --- Datos derivados ---
  const visibles = useMemo(
    () => filtrarReportes(reportes, busqueda, filtro),
    [reportes, busqueda, filtro],
  );
  const anchoCard = width - spacing.containerMargin * 2 - ASOMA;

  // --- Handlers ---
  /** Card tocada: la marca y centra el mapa en el reporte. */
  const handleCard = useCallback((reporte: ReportePerdida) => {
    setSeleccionadoId(reporte.id);
    mapaRef.current?.centrar({ lat: reporte.lat, lng: reporte.lng });
  }, []);

  /** Marker tocado: lo marca y lleva el carrusel hasta su card. */
  const handleMarker = useCallback(
    (reporte: ReportePerdida) => {
      setSeleccionadoId(reporte.id);
      const indice = visibles.findIndex((r) => r.id === reporte.id);
      if (indice >= 0) carruselRef.current?.scrollToIndex({ index: indice, animated: true });
    },
    [visibles],
  );

  /** En modo lista, tocar una card vuelve al mapa centrado en ese reporte. */
  const abrirEnMapa = useCallback((reporte: ReportePerdida) => {
    setModo('mapa');
    setSeleccionadoId(reporte.id);
    // Se espera a que el mapa se monte antes de mover la cámara.
    setTimeout(() => mapaRef.current?.centrar({ lat: reporte.lat, lng: reporte.lng }), 300);
  }, []);

  /** Pide la posición al GPS y centra el mapa ahí. */
  const handleMiUbicacion = async () => {
    const coords = await gps.obtenerUbicacion();
    if (coords) {
      mapaRef.current?.centrar(coords);
    } else if (gps.permiso !== 'denegado') {
      Alert.alert('Ubicación no disponible', 'Revisá que la ubicación del celular esté activada.');
    }
  };

  /** Muestra u oculta el buscador; al cerrarlo se limpia el texto. */
  const toggleBuscador = () => {
    setBuscando((prev) => !prev);
    if (buscando) setBusqueda('');
  };

  const irAReportar = () => router.push('/reportar');

  // --- Render ---
  const acciones = [
    { icon: 'search' as const, label: 'Buscar', onPress: toggleBuscador, activo: buscando },
    {
      icon: 'filter-list' as const,
      label: 'Filtrar',
      onPress: () => setFiltroVisible(true),
      activo: filtro !== 'todos',
    },
  ];

  const vacio = (
    <EstadoVacio
      icon="search-off"
      titulo="No hay reportes"
      mensaje="Probá con otro nombre o barrio, o cambiá el filtro."
    />
  );

  return (
    <View style={styles.screen}>
      <AppHeader acciones={acciones} />

      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Mascotas Perdidas</Text>
        {buscando && (
          <Input
            icon="search"
            placeholder="Buscar por nombre o barrio"
            value={busqueda}
            onChangeText={setBusqueda}
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
          />
        )}
        {gps.permiso === 'denegado' && (
          <PermissionNotice
            icon="location-off"
            titulo="Sin acceso a tu ubicación"
            mensaje="Te mostramos CABA. Activala para ver las mascotas perdidas cerca tuyo."
            puedePreguntar={gps.puedePreguntar}
            onReintentar={gps.obtenerUbicacion}
            onAbrirAjustes={gps.abrirAjustes}
            compacto
          />
        )}
      </View>

      {modo === 'mapa' ? (
        <>
          <View style={styles.mapaArea}>
            <MapaReportes
              ref={mapaRef}
              reportes={visibles}
              onSeleccionar={handleMarker}
              seleccionadoId={seleccionadoId}
              mostrarUsuario={gps.permiso === 'concedido'}
            />
            <View style={styles.flotantes}>
              <Pressable
                onPress={handleMiUbicacion}
                accessibilityRole="button"
                accessibilityLabel="Centrar en mi ubicación"
                style={({ pressed }) => [styles.miUbicacion, pressed && styles.pressed]}
              >
                {gps.cargando ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <MaterialIcons name="my-location" size={sizes.iconMd} color={colors.primary} />
                )}
              </Pressable>
              <Fab
                icon="add"
                onPress={irAReportar}
                accessibilityLabel="Reportar mascota perdida"
                style={styles.fabEnMapa}
              />
            </View>
          </View>

          <View style={styles.panel}>
            <SegmentedControl opciones={MODOS} valor={modo} onChange={setModo} variant="pill" />
            {visibles.length === 0 ? (
              <Text style={styles.sinResultados}>No hay reportes con ese criterio.</Text>
            ) : (
              <FlatList
                ref={carruselRef}
                data={visibles}
                horizontal
                keyExtractor={(reporte) => String(reporte.id)}
                renderItem={({ item }) => (
                  <ReporteCard
                    reporte={item}
                    onPress={handleCard}
                    seleccionado={item.id === seleccionadoId}
                    style={{ width: anchoCard }}
                  />
                )}
                ItemSeparatorComponent={SeparadorHorizontal}
                // Cada card "encaja" al soltar el scroll.
                snapToInterval={anchoCard + spacing.stackSm}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                  length: anchoCard + spacing.stackSm,
                  offset: (anchoCard + spacing.stackSm) * index,
                  index,
                })}
                contentContainerStyle={styles.carrusel}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>
        </>
      ) : (
        <>
          <FlatList
            data={visibles}
            keyExtractor={(reporte) => String(reporte.id)}
            renderItem={({ item }) => <ReporteCard reporte={item} onPress={abrirEnMapa} />}
            ListHeaderComponent={
              <SegmentedControl opciones={MODOS} valor={modo} onChange={setModo} variant="pill" />
            }
            ListHeaderComponentStyle={styles.listaHeader}
            ListEmptyComponent={vacio}
            ItemSeparatorComponent={SeparadorVertical}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
          />
          <Fab icon="add" onPress={irAReportar} accessibilityLabel="Reportar mascota perdida" />
        </>
      )}

      <FormModal visible={filtroVisible} titulo="Filtrar reportes" onClose={() => setFiltroVisible(false)}>
        <Text style={styles.filtroLabel}>Estado</Text>
        <View style={styles.filtroChips}>
          {FILTROS.map((f) => (
            <Chip
              key={f.valor}
              label={f.label}
              selected={filtro === f.valor}
              onPress={() => setFiltro(f.valor)}
            />
          ))}
        </View>
        <PrimaryButton title="Listo" onPress={() => setFiltroVisible(false)} />
      </FormModal>
    </View>
  );
}

/** Separador entre cards del carrusel. */
function SeparadorHorizontal() {
  return <View style={styles.sepHorizontal} />;
}

/** Separador entre cards de la lista. */
function SeparadorVertical() {
  return <View style={styles.sepVertical} />;
}

// --- Estilos ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cabecera: {
    gap: spacing.stackSm,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.stackSm,
  },
  titulo: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  mapaArea: {
    flex: 1,
    overflow: 'hidden',
  },
  flotantes: {
    position: 'absolute',
    right: spacing.md,
    // Deja lugar para el borde redondeado del panel que se superpone.
    bottom: spacing.lg + spacing.md,
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  miUbicacion: {
    width: sizes.avatarSm + 4,
    height: sizes.avatarSm + 4,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  fabEnMapa: {
    position: 'relative',
    right: 0,
    bottom: 0,
  },
  panel: {
    gap: spacing.md,
    marginTop: -spacing.md,
    paddingTop: spacing.stackSm,
    paddingBottom: spacing.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background,
    ...shadows.level1,
  },
  carrusel: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.xs,
  },
  sinResultados: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  lista: {
    flexGrow: 1,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: sizes.fab + spacing.stackLg,
  },
  listaHeader: {
    marginBottom: spacing.stackMd,
  },
  sepHorizontal: {
    width: spacing.stackSm,
  },
  sepVertical: {
    height: spacing.stackSm,
  },
  filtroLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  filtroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
