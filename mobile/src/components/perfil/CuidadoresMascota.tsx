/**
 * Card de "Familia y Cuidadores" de una mascota: la mascota con su raza, la
 * lista de personas o instituciones asignadas y el botón para sumar otra.
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { Cuidador, Mascota, TipoCuidador } from '@/types/models';
import { Avatar } from '../Avatar';

type Props = {
  mascota: Mascota;
  cuidadores: Cuidador[];
};

type IconName = ComponentProps<typeof MaterialIcons>['name'];

/** Ícono y colores del rol según el tipo de cuidador. */
const TIPOS: Record<TipoCuidador, { icon: IconName; fondo: string; texto: string }> = {
  familia: { icon: 'family-restroom', fondo: colors.primaryFixed, texto: colors.onPrimaryFixedVariant },
  clinica: { icon: 'local-hospital', fondo: colors.tertiaryFixed, texto: colors.onTertiaryFixed },
  paseador: { icon: 'directions-walk', fondo: colors.surfaceContainerHigh, texto: colors.onSurfaceVariant },
};

/** Diámetro del avatar de cada cuidador. */
const AVATAR = 36;

/**
 * Texto con la cantidad de cuidadores.
 * @param cantidad cuántos hay
 * @returns "Sin cuidadores asignados", "1 cuidador asignado" o "N cuidadores asignados"
 */
function textoCantidad(cantidad: number): string {
  if (cantidad === 0) return 'Sin cuidadores asignados';
  return cantidad === 1 ? '1 cuidador asignado' : `${cantidad} cuidadores asignados`;
}

/**
 * Card de cuidadores de una mascota.
 * @param props mascota y sus cuidadores
 * @returns la card
 */
export function CuidadoresMascota({ mascota, cuidadores }: Props) {
  /** Gestionar permisos necesita el backend: por ahora avisa. */
  const handlePermisos = () => {
    Alert.alert('Permisos', `Disponible próximamente. Vas a poder definir qué ve cada cuidador de ${mascota.nombre}.`);
  };

  /** Asignar un cuidador necesita invitar a otro usuario: por ahora avisa. */
  const handleAsignar = () => {
    Alert.alert('Asignar cuidador', `Disponible próximamente. Vas a poder invitar a alguien a cuidar a ${mascota.nombre}.`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar foto={mascota.foto} nombre={mascota.nombre} size={sizes.avatarSm} />
        <View style={styles.headerTexto}>
          <View style={styles.nombreFila}>
            <Text style={styles.nombre}>{mascota.nombre}</Text>
            <View style={styles.raza}>
              <Text style={styles.razaTexto} numberOfLines={1}>
                {mascota.raza}
              </Text>
            </View>
          </View>
          <Text style={styles.cantidad}>{textoCantidad(cuidadores.length)}</Text>
        </View>
        <Pressable
          onPress={handlePermisos}
          accessibilityRole="button"
          accessibilityLabel={`Gestionar permisos de ${mascota.nombre}`}
          style={({ pressed }) => [styles.ajustes, pressed && styles.ajustesPressed]}
        >
          <MaterialIcons name="tune" size={sizes.iconSm + 2} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      {cuidadores.map((cuidador) => {
        const tipo = TIPOS[cuidador.tipo];
        return (
          <View key={cuidador.id} style={styles.cuidador}>
            {cuidador.foto ? (
              <Avatar foto={cuidador.foto} nombre={cuidador.nombre} size={AVATAR} borderColor={colors.white} />
            ) : (
              <View style={[styles.iconoCuidador, { backgroundColor: tipo.fondo }]}>
                <MaterialIcons name={tipo.icon} size={sizes.iconSm} color={tipo.texto} />
              </View>
            )}
            <View style={styles.cuidadorTexto}>
              <Text style={styles.cuidadorNombre} numberOfLines={1}>
                {cuidador.nombre}
              </Text>
              <Text style={styles.cuidadorDetalle} numberOfLines={1}>
                {cuidador.detalle}
              </Text>
            </View>
            <View style={[styles.rol, { backgroundColor: tipo.fondo }]}>
              <Text style={[styles.rolTexto, { color: tipo.texto }]}>{cuidador.rol}</Text>
            </View>
          </View>
        );
      })}

      <Pressable
        onPress={handleAsignar}
        accessibilityRole="button"
        style={({ pressed }) => [styles.asignar, pressed && styles.asignarPressed]}
      >
        <MaterialIcons name="person-add" size={sizes.iconSm} color={colors.primary} />
        <Text style={styles.asignarTexto}>+ Asignar a {mascota.nombre}</Text>
      </Pressable>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    gap: spacing.sm + 2,
    padding: spacing.stackSm + 2,
    borderRadius: radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    borderBottomWidth: sizes.borderWidth,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  headerTexto: {
    flex: 1,
  },
  nombreFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  nombre: {
    ...typography.bodyMd,
    fontFamily: typography.headlineLg.fontFamily,
    color: colors.onSurface,
  },
  raza: {
    flexShrink: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer30,
  },
  razaTexto: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onSecondaryContainer,
  },
  cantidad: {
    ...typography.labelSm,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.onSurfaceVariant,
  },
  ajustes: {
    width: sizes.avatarSm - 8,
    height: sizes.avatarSm - 8,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ajustesPressed: {
    backgroundColor: colors.surfaceContainer,
  },
  cuidador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  iconoCuidador: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuidadorTexto: {
    flex: 1,
  },
  cuidadorNombre: {
    ...typography.bodySm,
    fontFamily: typography.headlineLg.fontFamily,
    color: colors.onSurface,
  },
  cuidadorDetalle: {
    ...typography.bodySm,
    fontSize: 12,
    lineHeight: 16,
    color: colors.onSurfaceVariant,
  },
  rol: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  rolTexto: {
    ...typography.labelSm,
    fontSize: 11,
  },
  asignar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.secondaryContainer30,
  },
  asignarPressed: {
    backgroundColor: colors.secondaryContainer,
  },
  asignarTexto: {
    ...typography.labelSm,
    color: colors.primary,
  },
});
