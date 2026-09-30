/**
 * Pantalla Mi Perfil.
 *
 * Datos del usuario (foto editable desde la galería, nombre, ubicación y
 * cantidad de mascotas), contacto de emergencia, familia y cuidadores de cada
 * mascota, menú de opciones y cierre de sesión.
 *
 * Asignación de mascotas: un dueño genera un link con un rol (Dueño /
 * Invitado) desde la card de cada mascota; cualquiera puede desasignarse
 * (salvo el último dueño); y "Tengo un link de asignación" permite pegar un
 * link o código recibido para abrir la pantalla de aceptación.
 */
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/Badge';
import { Cargando } from '@/components/EstadoVista';
import { FormModal } from '@/components/FormModal';
import { FotoEditable } from '@/components/FotoEditable';
import { Input } from '@/components/Input';
import { MenuRow } from '@/components/MenuRow';
import { ContactoEmergencia } from '@/components/perfil/ContactoEmergencia';
import { CuidadoresMascota } from '@/components/perfil/CuidadoresMascota';
import { EditarPerfilForm } from '@/components/perfil/EditarPerfilForm';
import { InvitarForm } from '@/components/perfil/InvitarForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionTitle } from '@/components/SectionTitle';
import { useApp } from '@/context/AppContext';
import { useFototeca } from '@/hooks/useFototeca';
import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { Mascota } from '@/types/models';
import { tokenDeTexto } from '@/utils/invitaciones';

/** Versión que se muestra en el pie (sale de app.json). */
const VERSION = Constants.expoConfig?.version ?? '1.0.0';

/** Diámetro de la foto de perfil. */
const FOTO = 96;
/** Espera a que se cierre la hoja antes de abrir el modal de asignación (en iOS no se pueden pisar). */
const ESPERA_CIERRE_HOJA_MS = 300;

/** Hoja de asignación abierta. */
type HojaAsignacion = 'invitar' | 'desasignar' | 'link' | null;

/**
 * Pantalla de perfil del usuario.
 * @returns el perfil
 */
export default function PerfilScreen() {
  const { usuario, mascotas, cuidadores, reportes, actualizarUsuario, cerrarSesion, desasignarme } =
    useApp();
  const fototeca = useFototeca();

  // --- Estado ---
  const [editando, setEditando] = useState(false);
  const [notificaciones, setNotificaciones] = useState(true);
  const [hoja, setHoja] = useState<HojaAsignacion>(null);
  // La mascota de la hoja se guarda aparte para que no quede vacía mientras se cierra.
  const [mascotaHoja, setMascotaHoja] = useState<Mascota | null>(null);
  const [textoLink, setTextoLink] = useState('');
  const [errorLink, setErrorLink] = useState<string | undefined>(undefined);
  const [desasignando, setDesasignando] = useState(false);

  // --- Datos derivados ---
  const reportesActivos = useMemo(
    () => reportes.filter((r) => r.autorId === usuario?.id && r.estado === 'perdido').length,
    [reportes, usuario?.id],
  );

  // --- Handlers ---
  /** Cambia la foto de perfil con una imagen de la galería. */
  const handleFoto = async () => {
    try {
      const uri = await fototeca.elegirFoto();
      if (uri) await actualizarUsuario({ foto: uri });
    } catch {
      Alert.alert('No se pudo cambiar la foto', 'Probá de nuevo en unos segundos.');
    }
  };

  /**
   * Muestra un aviso para las secciones que todavía no están.
   * @param titulo nombre de la sección
   */
  const proximamente = (titulo: string) => () =>
    Alert.alert(titulo, 'Disponible próximamente.');

  /**
   * Abre una hoja de asignación para una mascota.
   * @param tipo hoja a abrir
   * @returns el handler que recibe la mascota
   */
  const abrirHoja = (tipo: 'invitar' | 'desasignar') => (mascota: Mascota) => {
    setMascotaHoja(mascota);
    setHoja(tipo);
  };

  /** Cierra la hoja de asignación abierta. */
  const cerrarHoja = () => setHoja(null);

  /**
   * true si el usuario es el único dueño de la mascota (entonces no puede desasignarse).
   * @param mascota mascota a revisar
   */
  const esUnicoDueno = (mascota: Mascota) => {
    const duenos = cuidadores.filter((c) => c.mascotaId === mascota.id && c.rol === 'dueno');
    return duenos.length === 1 && duenos[0].usuarioId === usuario?.id;
  };

  /** Confirma la desasignación: la mascota sale de la cuenta del usuario. */
  const handleDesasignarme = async () => {
    if (!mascotaHoja) return;
    setDesasignando(true);
    try {
      await desasignarme(mascotaHoja.id);
      setHoja(null);
      Alert.alert('Listo', `Ya no tenés a ${mascotaHoja.nombre} en tu cuenta.`);
    } catch (e) {
      Alert.alert('No se pudo desasignar', e instanceof Error ? e.message : 'Intentá de nuevo.');
    } finally {
      setDesasignando(false);
    }
  };

  /** Lee el link o código pegado y abre la pantalla para aceptarlo. */
  const handleAbrirLink = () => {
    const token = tokenDeTexto(textoLink);
    if (!token) {
      setErrorLink('Pegá el link completo o el código de 8 caracteres.');
      return;
    }
    setHoja(null);
    setTextoLink('');
    setTimeout(
      () => router.push({ pathname: '/asignar', params: { token } }),
      ESPERA_CIERRE_HOJA_MS,
    );
  };

  /** Cierra la sesión y vuelve al login sin dejar historial. */
  const handleCerrarSesion = async () => {
    await cerrarSesion();
    router.replace('/login');
  };

  // --- Render ---
  if (!usuario) {
    return (
      <View style={styles.screen}>
        <AppHeader />
        <Cargando />
      </View>
    );
  }

  const cantidadMascotas =
    mascotas.length === 1 ? '1 Mascota registrada' : `${mascotas.length} Mascotas registradas`;

  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Datos del usuario */}
        <View style={styles.perfilCard}>
          <View style={styles.degrade} pointerEvents="none" />
          <FotoEditable
            foto={usuario.foto}
            nombre={usuario.nombre}
            onPress={handleFoto}
            cargando={fototeca.eligiendo}
            size={FOTO}
          />
          <Text style={styles.nombre}>
            {usuario.nombre} {usuario.apellido}
          </Text>
          <View style={styles.ubicacion}>
            <MaterialIcons name="location-on" size={sizes.iconSm} color={colors.primary} />
            <Text style={styles.ubicacionTexto}>{usuario.ubicacion}</Text>
          </View>
          <View style={styles.mascotasBadge}>
            <MaterialIcons name="pets" size={sizes.iconSm} color={colors.primary} />
            <Text style={styles.mascotasTexto}>{cantidadMascotas}</Text>
          </View>
          <PrimaryButton
            title="Editar datos personales"
            icon="edit"
            iconLeft
            variant="tonal"
            size="sm"
            onPress={() => setEditando(true)}
            style={styles.editar}
          />
        </View>

        {/* 2. Contacto de emergencia */}
        <View style={styles.seccion}>
          <SectionTitle
            icon="shield"
            titulo="Contacto de Emergencia"
            iconoFondo={colors.tertiaryFixed}
            iconoColor={colors.onTertiaryFixed}
            derecha={<Badge label="VITAL" tone="mustard" />}
          />
          <ContactoEmergencia usuario={usuario} />
        </View>

        {/* 3. Familia y cuidadores */}
        <View style={styles.seccion}>
          <SectionTitle
            icon="group"
            titulo="Familia y Cuidadores"
            derecha={
              <Badge
                label={mascotas.length === 1 ? '1 mascota' : `${mascotas.length} mascotas`}
                tone="neutral"
              />
            }
          />
          <Text style={styles.seccionAyuda}>
            Personas asignadas a cada perrito. Los dueños pueden sumar a otras personas con un
            link; los invitados, no. Cualquiera puede desasignarse.
          </Text>
          {mascotas.map((mascota) => (
            <CuidadoresMascota
              key={mascota.id}
              mascota={mascota}
              cuidadores={cuidadores.filter((c) => c.mascotaId === mascota.id)}
              usuario={usuario}
              onAsignar={abrirHoja('invitar')}
              onDesasignarme={abrirHoja('desasignar')}
            />
          ))}
        </View>

        {/* 4. Menú */}
        <View style={styles.menu}>
          <MenuRow
            icon="notifications-active"
            titulo="Notificaciones"
            subtitulo="Vacunas, pipetas y turnos. Recordatorios vía WhatsApp y Push."
            derecha={
              <Switch
                value={notificaciones}
                onValueChange={setNotificaciones}
                trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
                thumbColor={colors.white}
                accessibilityLabel="Recordatorios activados"
              />
            }
          />
          <View style={styles.separador} />
          <MenuRow
            icon="campaign"
            titulo="Mis reportes activos"
            badge={reportesActivos === 1 ? '1 activo' : `${reportesActivos} activos`}
            onPress={() => router.navigate('/perdidos')}
          />
          <View style={styles.separador} />
          <MenuRow
            icon="link"
            titulo="Tengo un link de asignación"
            subtitulo="Pegá el link o el código que te mandaron para sumar una mascota."
            onPress={() => {
              setErrorLink(undefined);
              setHoja('link');
            }}
          />
          <View style={styles.separador} />
          <MenuRow icon="support-agent" titulo="Ayuda y Soporte" onPress={proximamente('Ayuda y Soporte')} />
          <View style={styles.separador} />
          <MenuRow
            icon="menu-book"
            titulo="Guía de paseos y normativas CABA"
            onPress={proximamente('Guía de paseos y normativas CABA')}
          />
        </View>

        <PrimaryButton
          title="Cerrar sesión"
          icon="logout"
          iconLeft
          variant="danger"
          size="sm"
          onPress={handleCerrarSesion}
          style={styles.cerrar}
        />
        <Text style={styles.version}>Doggy v{VERSION}</Text>
      </ScrollView>

      <FormModal visible={editando} titulo="Datos personales" onClose={() => setEditando(false)}>
        <EditarPerfilForm usuario={usuario} onGuardado={() => setEditando(false)} />
      </FormModal>

      {/* Generar un link de asignación (solo dueños llegan acá). */}
      <FormModal
        visible={hoja === 'invitar'}
        titulo={`Asignar a ${mascotaHoja?.nombre ?? ''}`}
        onClose={cerrarHoja}
      >
        {mascotaHoja && <InvitarForm key={mascotaHoja.id} mascota={mascotaHoja} />}
      </FormModal>

      {/* Confirmar la desasignación. */}
      <FormModal
        visible={hoja === 'desasignar'}
        titulo={`¿Desasignarte de ${mascotaHoja?.nombre ?? ''}?`}
        onClose={cerrarHoja}
      >
        {mascotaHoja && esUnicoDueno(mascotaHoja) ? (
          <>
            <Text style={styles.hojaTexto}>
              Sos el único dueño de {mascotaHoja.nombre}. Para desasignarte, primero sumá a otra
              persona como dueña con un link de asignación.
            </Text>
            <PrimaryButton title="Entendido" variant="outline" onPress={cerrarHoja} />
          </>
        ) : (
          <>
            <Text style={styles.hojaTexto}>
              {mascotaHoja?.nombre} va a salir de tu cuenta junto con su carnet y sus turnos. Las
              demás personas asignadas la siguen teniendo. Para volver, vas a necesitar un link nuevo.
            </Text>
            <PrimaryButton
              title="Desasignarme"
              icon="person-remove"
              iconLeft
              variant="danger"
              onPress={handleDesasignarme}
              loading={desasignando}
            />
            <PrimaryButton title="Cancelar" variant="outline" onPress={cerrarHoja} />
          </>
        )}
      </FormModal>

      {/* Pegar un link o código recibido. */}
      <FormModal visible={hoja === 'link'} titulo="Tengo un link de asignación" onClose={cerrarHoja}>
        <Input
          label="Link o código"
          icon="link"
          placeholder="Ej: TOBY2026"
          value={textoLink}
          onChangeText={(texto) => {
            setTextoLink(texto);
            setErrorLink(undefined);
          }}
          error={errorLink}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleAbrirLink}
        />
        <PrimaryButton title="Ver invitación" icon="arrow-forward" onPress={handleAbrirLink} />
      </FormModal>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    gap: spacing.stackMd,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.stackMd,
    paddingBottom: spacing.stackLg,
  },
  perfilCard: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.stackMd,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...shadows.level1,
  },
  degrade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.secondaryContainer20,
  },
  nombre: {
    ...typography.headlineMd,
    fontFamily: typography.headlineLg.fontFamily,
    color: colors.onSurface,
    marginTop: spacing.stackSm,
    textAlign: 'center',
  },
  ubicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ubicacionTexto: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  mascotasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.stackSm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer30,
  },
  mascotasTexto: {
    ...typography.labelMd,
    color: colors.primary,
  },
  editar: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    borderRadius: radius.md,
  },
  seccion: {
    gap: spacing.stackSm,
  },
  seccionAyuda: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.xs,
  },
  menu: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...shadows.level1,
  },
  separador: {
    height: sizes.borderWidth,
    marginHorizontal: spacing.containerMargin,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cerrar: {
    alignSelf: 'center',
  },
  version: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  hojaTexto: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
});
