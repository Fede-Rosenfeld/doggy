/**
 * Se perdió mi mascota (modal).
 *
 * Reporte que hace el tutor de una de SUS mascotas, distinto del de alguien
 * que encontró un perro en la calle (`reportar.tsx`):
 * - elige cuál de sus mascotas se perdió (llega preelegida si se abre desde
 *   su perfil) y los datos salen de su perfil, sin volver a cargarlos,
 * - marca en el mapa dónde la vio por última vez y un radio de búsqueda
 *   (200 m a 2 km) que se dibuja como un círculo alrededor del punto,
 * - suma información del día: ropa, arnés, cómo reacciona, etiquetas.
 * Al publicar se crea el reporte "perdido", vibra, se cierra el modal y se
 * muestra el nuevo marker (con su círculo) en Perdidos.
 */
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { EstadoVacio } from '@/components/EstadoVista';
import { Input } from '@/components/Input';
import { PermissionNotice } from '@/components/PermissionNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EtiquetasInput } from '@/components/reporte/EtiquetasInput';
import { MapaSelector } from '@/components/reporte/MapaSelector';
import { ResumenMascota } from '@/components/reporte/ResumenMascota';
import { SelectorMascota } from '@/components/reporte/SelectorMascota';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { Coordenadas, DireccionLegible, useUbicacion } from '@/hooks/useUbicacion';
import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import { CENTRO_CABA, RADIO_POR_DEFECTO, RADIOS_BUSQUEDA, textoRadio } from '@/utils/mapa';
import { buscarMascota } from '@/utils/selectores';

/**
 * Pantalla del reporte de una mascota propia.
 * @returns el formulario, o un estado vacío si el usuario no tiene mascotas
 */
export default function MiMascotaPerdidaScreen() {
  const { mascotaId: mascotaIdParam } = useLocalSearchParams<{ mascotaId?: string }>();
  const { mascotas, reportes, crearReporte } = useApp();
  const gps = useUbicacion({ automatico: true });
  const insets = useSafeAreaInsets();

  // --- Estado ---
  /** Mascota que tocó el usuario en el selector; null = la del param o la primera. */
  const [elegidaId, setElegidaId] = useState<number | null>(null);
  const [coords, setCoords] = useState<Coordenadas>(CENTRO_CABA);
  const [radioMetros, setRadioMetros] = useState<number>(RADIO_POR_DEFECTO);
  const [direccion, setDireccion] = useState<DireccionLegible | null>(null);
  const [infoAdicional, setInfoAdicional] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  // Si el usuario movió el pin, la posición del GPS ya no lo pisa.
  const pinAjustado = useRef(false);

  // --- Datos derivados ---
  const mascota =
    buscarMascota(mascotas, elegidaId !== null ? String(elegidaId) : mascotaIdParam) ?? mascotas[0];
  // Aviso para no duplicar: ya hay un reporte de "perdido" abierto para esta mascota.
  const yaReportada = !!mascota && reportes.some((r) => r.mascotaId === mascota.id && r.estado === 'perdido');

  // Cuando llega la posición del GPS, se usa como último lugar donde se la vio.
  useEffect(() => {
    if (gps.ubicacion && !pinAjustado.current) setCoords(gps.ubicacion);
  }, [gps.ubicacion]);

  // Cada vez que cambia el punto se busca la dirección legible.
  useEffect(() => {
    let vigente = true;
    gps.obtenerDireccion(coords).then((resultado) => {
      if (vigente) setDireccion(resultado);
    });
    return () => {
      vigente = false;
    };
  }, [coords, gps.obtenerDireccion]);

  // --- Handlers ---
  /**
   * Mueve el punto a donde lo dejó el usuario.
   * @param nuevas coordenadas del pin
   */
  const handleMoverPin = (nuevas: Coordenadas) => {
    pinAjustado.current = true;
    setCoords(nuevas);
  };

  /** Vuelve a leer el GPS y pone el pin en la posición actual. */
  const usarMiUbicacion = async () => {
    const actual = await gps.obtenerUbicacion();
    if (actual) {
      pinAjustado.current = false;
      setCoords(actual);
    }
  };

  /** Cierra el modal y abre el alta de mascota (para quien todavía no cargó ninguna). */
  const irAAgregarMascota = () => {
    if (router.canGoBack()) router.back();
    router.navigate('/mascotas/nueva');
  };

  /** Crea el reporte con los datos del perfil, vibra y vuelve a Perdidos mostrando el marker. */
  const handlePublicar = async () => {
    if (!mascota) return;
    setEnviando(true);
    try {
      const reporte = await crearReporte({
        mascotaId: mascota.id,
        estado: 'perdido',
        nombre: mascota.nombre,
        raza: mascota.raza,
        descripcion: mascota.senas,
        foto: mascota.foto,
        etiquetas,
        lat: coords.lat,
        lng: coords.lng,
        // Si no se pudo traducir el punto a un barrio, queda la ciudad.
        zona: direccion?.zona ?? 'CABA',
        fecha: new Date().toISOString(),
        radioMetros,
        ...(infoAdicional.trim() && { infoAdicional: infoAdicional.trim() }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (router.canGoBack()) router.back();
      router.navigate({ pathname: '/perdidos', params: { reporteId: String(reporte.id) } });
    } catch {
      Alert.alert('No se pudo publicar', 'Revisá tu conexión e intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  // --- Render ---
  if (!mascota) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Se perdió mi mascota" variant="bar" fallback="/perdidos" />
        <EstadoVacio
          icon="pets"
          titulo="Todavía no cargaste mascotas"
          mensaje="Para reportar una mascota tuya primero tiene que estar en tu perfil. Si encontraste un perro en la calle, usá “Encontré una mascota”."
          accion={{ titulo: 'Agregar mascota', onPress: irAAgregarMascota }}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Se perdió mi mascota" variant="bar" fallback="/perdidos" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.stackLg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={styles.titulo}>Reportar a mi mascota</Text>
            <Text style={styles.subtitulo}>
              Usamos los datos de su perfil. Marcá dónde la viste por última vez y contanos todo lo
              que ayude a reconocerla.
            </Text>
          </View>

          {/* Quién se perdió */}
          {mascotas.length > 1 && (
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>¿Quién se perdió?</Text>
              <SelectorMascota
                mascotas={mascotas}
                seleccionadaId={mascota.id}
                onSeleccionar={(m) => setElegidaId(m.id)}
              />
            </View>
          )}

          <ResumenMascota mascota={mascota} />

          {yaReportada && (
            <View style={styles.aviso} accessibilityLiveRegion="polite">
              <MaterialIcons name="campaign" size={sizes.iconMd} color={colors.tertiaryContainer} />
              <Text style={styles.avisoTexto}>
                {mascota.nombre} ya tiene un reporte de perdida activo. Si publicás otro, van a
                aparecer los dos en el mapa.
              </Text>
            </View>
          )}

          {/* Última vez que se la vio, con radio de búsqueda */}
          <View style={styles.card}>
            <View style={styles.cardTitulo}>
              <MaterialIcons name="radar" size={sizes.iconMd} color={colors.primary} />
              <Text style={styles.cardTituloTexto}>¿Dónde la viste por última vez?</Text>
            </View>
            <MapaSelector coords={coords} onChange={handleMoverPin} radioMetros={radioMetros} />
            <View style={styles.direccion}>
              <Text style={styles.direccionTexto} numberOfLines={2}>
                {direccion?.texto ??
                  (gps.cargando ? 'Buscando tu ubicación…' : 'Mové el pin hasta donde la viste')}
              </Text>
              <Pressable onPress={usarMiUbicacion} hitSlop={spacing.sm} accessibilityRole="button">
                {({ pressed }) => (
                  <Text style={[styles.link, pressed && styles.linkPressed]}>Usar mi ubicación</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.label}>Radio de búsqueda</Text>
            <View style={styles.chips}>
              {RADIOS_BUSQUEDA.map((metros) => (
                <Chip
                  key={metros}
                  label={textoRadio(metros)}
                  selected={radioMetros === metros}
                  onPress={() => setRadioMetros(metros)}
                />
              ))}
            </View>
            <Text style={styles.ayuda}>
              Es la zona donde puede estar. Los vecinos la ven como un círculo en el mapa.
            </Text>

            {gps.permiso === 'denegado' && (
              <PermissionNotice
                icon="location-off"
                titulo="Sin acceso a tu ubicación"
                mensaje="Marcá el punto a mano en el mapa, o habilitá la ubicación."
                puedePreguntar={gps.puedePreguntar}
                onReintentar={usarMiUbicacion}
                onAbrirAjustes={gps.abrirAjustes}
                compacto
              />
            )}
          </View>

          {/* Información del día */}
          <View style={styles.card}>
            <View style={styles.cardTitulo}>
              <MaterialIcons name="checkroom" size={sizes.iconMd} color={colors.primary} />
              <Text style={styles.cardTituloTexto}>Información adicional</Text>
            </View>
            <Input
              label="¿Qué tenía puesto? ¿Algo más para saber?"
              placeholder="Ej: buzo rojo y arnés negro, sin chapita. Se asusta con las motos."
              value={infoAdicional}
              onChangeText={setInfoAdicional}
              multiline
              maxLength={300}
            />
            <EtiquetasInput etiquetas={etiquetas} onChange={setEtiquetas} />
          </View>

          <PrimaryButton
            title="Publicar como perdida"
            icon="campaign"
            variant="secondary"
            onPress={handlePublicar}
            loading={enviando}
            style={styles.boton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.stackMd,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.stackMd,
  },
  intro: {
    gap: spacing.stackSm,
  },
  titulo: {
    ...typography.headlineLgMobile,
    color: colors.onSurface,
  },
  subtitulo: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  seccion: {
    gap: spacing.sm,
  },
  seccionTitulo: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.tertiaryContainer10,
  },
  avisoTexto: {
    ...typography.bodySm,
    color: colors.onSurface,
    flex: 1,
  },
  card: {
    gap: spacing.stackSm,
    padding: spacing.containerMargin,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  cardTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTituloTexto: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  direccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.stackSm,
  },
  direccionTexto: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  link: {
    ...typography.labelMd,
    color: colors.primary,
  },
  linkPressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ayuda: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  boton: {
    height: sizes.inputHeight + spacing.sm,
    borderRadius: radius.md + 4,
  },
});
