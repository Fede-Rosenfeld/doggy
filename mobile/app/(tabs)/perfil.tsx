/**
 * Pantalla Mi Perfil.
 *
 * Datos del usuario (foto editable desde la galería, nombre, ubicación y
 * cantidad de mascotas), contacto de emergencia, familia y cuidadores de cada
 * mascota, menú de opciones y cierre de sesión.
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
import { MenuRow } from '@/components/MenuRow';
import { ContactoEmergencia } from '@/components/perfil/ContactoEmergencia';
import { CuidadoresMascota } from '@/components/perfil/CuidadoresMascota';
import { EditarPerfilForm } from '@/components/perfil/EditarPerfilForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionTitle } from '@/components/SectionTitle';
import { useApp } from '@/context/AppContext';
import { useFototeca } from '@/hooks/useFototeca';
import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';

/** Versión que se muestra en el pie (sale de app.json). */
const VERSION = Constants.expoConfig?.version ?? '1.0.0';

/** Diámetro de la foto de perfil. */
const FOTO = 96;

/**
 * Pantalla de perfil del usuario.
 * @returns el perfil
 */
export default function PerfilScreen() {
  const { usuario, mascotas, cuidadores, reportes, actualizarUsuario, cerrarSesion } = useApp();
  const fototeca = useFototeca();

  // --- Estado ---
  const [editando, setEditando] = useState(false);
  const [notificaciones, setNotificaciones] = useState(true);

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
            Permisos y personas de confianza asignadas al cuidado de cada perrito.
          </Text>
          {mascotas.map((mascota) => (
            <CuidadoresMascota
              key={mascota.id}
              mascota={mascota}
              cuidadores={cuidadores.filter((c) => c.mascotaId === mascota.id)}
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
});
