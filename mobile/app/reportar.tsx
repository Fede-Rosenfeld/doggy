/**
 * Encontré una mascota (modal).
 *
 * Reporte de alguien que encontró un perro en la calle (el de una mascota
 * propia es `mi-mascota-perdida.tsx`). Junta los tres componentes nativos:
 * - cámara: escanear el QR de la chapita para identificar a la mascota y
 *   autocompletar sus datos,
 * - fototeca: sacarle o elegir una foto,
 * - GPS: precargar en el mini mapa el punto donde se la encontró.
 * El nombre es opcional porque quien la encuentra muchas veces no lo sabe.
 * Al confirmar se crea el reporte "encontrado", vibra, se cierra el modal y
 * se muestra el nuevo marker en Perdidos.
 */
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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

import { FotoEditable } from '@/components/FotoEditable';
import { Input } from '@/components/Input';
import { PermissionNotice } from '@/components/PermissionNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EscanerQr, ResultadoLectura } from '@/components/reporte/EscanerQr';
import { EtiquetasInput } from '@/components/reporte/EtiquetasInput';
import { MapaSelector } from '@/components/reporte/MapaSelector';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useFototeca } from '@/hooks/useFototeca';
import { Coordenadas, DireccionLegible, useUbicacion } from '@/hooks/useUbicacion';
import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { Mascota } from '@/types/models';
import { CODIGO_MASCOTA_REGEX } from '@/utils/codigos';
import { CENTRO_CABA } from '@/utils/mapa';
import { buscarMascotaPorCodigo } from '@/utils/selectores';
import { validarRequerido } from '@/utils/validaciones';

type Errores = {
  descripcion?: string;
};

/** Nombre que se publica si quien la encontró no lo sabe. */
const SIN_NOMBRE = 'Sin identificar';

/**
 * Pantalla del reporte de mascota encontrada.
 * @returns el formulario de reporte
 */
export default function ReportarScreen() {
  const { mascotas, crearReporte } = useApp();
  const gps = useUbicacion({ automatico: true });
  const fototeca = useFototeca();
  const insets = useSafeAreaInsets();

  // --- Estado ---
  const [mascotaId, setMascotaId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [foto, setFoto] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordenadas>(CENTRO_CABA);
  const [direccion, setDireccion] = useState<DireccionLegible | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  // Si el usuario movió el pin, la posición del GPS ya no lo pisa.
  const pinAjustado = useRef(false);

  // --- Precarga ---
  /**
   * Completa el formulario con los datos de la mascota identificada por el QR.
   * @param mascota mascota registrada en la app
   */
  const precargar = useCallback((mascota: Mascota) => {
    setMascotaId(mascota.id);
    setNombre(mascota.nombre);
    setRaza(mascota.raza);
    setDescripcion(mascota.senas);
    setFoto(mascota.foto);
    setErrores({});
  }, []);

  // Cuando llega la posición del GPS, se usa como el punto donde se la encontró.
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
   * Procesa el texto leído del QR: valida el formato y busca la mascota.
   * @param codigo texto del QR
   * @returns si se pudo identificar a la mascota
   */
  const handleLectura = (codigo: string): ResultadoLectura => {
    const normalizado = codigo.trim().toUpperCase();
    if (!CODIGO_MASCOTA_REGEX.test(normalizado)) {
      return { ok: false, mensaje: 'Ese QR no es de una chapita Doggy.' };
    }
    const mascota = buscarMascotaPorCodigo(mascotas, normalizado);
    if (!mascota) {
      return { ok: false, mensaje: `No encontramos ninguna mascota registrada con el código ${normalizado}.` };
    }
    precargar(mascota);
    setAviso(`Identificamos a ${mascota.nombre}. Revisá los datos y confirmá el reporte.`);
    return { ok: true };
  };

  /**
   * Mueve el punto del hallazgo a donde lo dejó el usuario.
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

  /** Elige la foto de la mascota desde la galería. */
  const handleFoto = async () => {
    try {
      const uri = await fototeca.elegirFoto();
      if (uri) setFoto(uri);
    } catch {
      Alert.alert('No se pudo abrir la galería', 'Probá de nuevo en unos segundos.');
    }
  };

  /** Valida, crea el reporte, vibra y vuelve a Perdidos mostrando el nuevo marker. */
  const handleReportar = async () => {
    const nuevos: Errores = {
      descripcion: validarRequerido(descripcion, 'Describí cómo es para que su familia la reconozca.'),
    };
    setErrores(nuevos);
    if (nuevos.descripcion) return;

    setEnviando(true);
    try {
      const reporte = await crearReporte({
        mascotaId,
        estado: 'encontrado',
        nombre: nombre.trim() || SIN_NOMBRE,
        raza: raza.trim() || 'Sin especificar',
        descripcion: descripcion.trim(),
        foto,
        etiquetas,
        lat: coords.lat,
        lng: coords.lng,
        // Si no se pudo traducir el punto a un barrio, queda la ciudad.
        zona: direccion?.zona ?? 'CABA',
        fecha: new Date().toISOString(),
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
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Encontré una mascota" variant="bar" fallback="/perdidos" />
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
            <Text style={styles.titulo}>Reportar Mascota Encontrada</Text>
            <Text style={styles.subtitulo}>
              Si tiene chapita Doggy, escaneala y completamos sus datos. Si no, contanos cómo es y
              dónde la encontraste para que su familia la pueda ubicar.
            </Text>
          </View>

          <EscanerQr onLectura={handleLectura} />

          {aviso && (
            <View style={styles.aviso} accessibilityLiveRegion="polite">
              <MaterialIcons name="check-circle" size={sizes.iconMd} color={colors.primaryContainer} />
              <Text style={styles.avisoTexto}>{aviso}</Text>
            </View>
          )}

          {/* Datos de la mascota */}
          <View style={styles.card}>
            <View style={styles.fotoFila}>
              <FotoEditable
                foto={foto}
                nombre={nombre}
                onPress={handleFoto}
                cargando={fototeca.eligiendo}
                size={sizes.avatarLg - 32}
              />
              <Text style={styles.fotoAyuda}>
                {foto ? 'Tocá para cambiar la foto' : 'Sumá una foto: es lo que más ayuda a que su familia la reconozca'}
              </Text>
            </View>

            <Input
              label="Nombre (si lo sabés)"
              placeholder="Ej. Firulais"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
            <Input
              label="Raza"
              placeholder="Ej. Mestizo"
              value={raza}
              onChangeText={setRaza}
              autoCapitalize="words"
            />
            <Input
              label="Descripción / Señas particulares"
              placeholder="Describí el collar, marcas, tamaño, si está lastimada, etc."
              value={descripcion}
              onChangeText={(texto) => {
                setDescripcion(texto);
                if (errores.descripcion) setErrores((prev) => ({ ...prev, descripcion: undefined }));
              }}
              error={errores.descripcion}
              multiline
              maxLength={300}
            />
            <EtiquetasInput etiquetas={etiquetas} onChange={setEtiquetas} />
          </View>

          {/* Dónde se la encontró */}
          <View style={styles.card}>
            <View style={styles.cardTitulo}>
              <MaterialIcons name="location-on" size={sizes.iconMd} color={colors.primary} />
              <Text style={styles.cardTituloTexto}>¿Dónde la encontraste?</Text>
            </View>
            <MapaSelector coords={coords} onChange={handleMoverPin} />
            <View style={styles.direccion}>
              <Text style={styles.direccionTexto} numberOfLines={2}>
                {direccion?.texto ?? (gps.cargando ? 'Buscando tu ubicación…' : 'Mové el pin hasta donde la encontraste')}
              </Text>
              <Pressable onPress={usarMiUbicacion} hitSlop={spacing.sm} accessibilityRole="button">
                {({ pressed }) => (
                  <Text style={[styles.link, pressed && styles.linkPressed]}>Usar mi ubicación</Text>
                )}
              </Pressable>
            </View>
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

          <PrimaryButton
            title="Publicar como encontrada"
            icon="volunteer-activism"
            variant="primary"
            onPress={handleReportar}
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
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.secondaryContainer30,
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
  fotoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fotoAyuda: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
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
  boton: {
    height: sizes.inputHeight + spacing.sm,
    borderRadius: radius.md + 4,
  },
});
