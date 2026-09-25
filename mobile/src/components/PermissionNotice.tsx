/**
 * Aviso de permiso denegado.
 *
 * Explica para qué necesita la app el permiso y ofrece la salida que
 * corresponda: volver a pedirlo o, si el sistema ya no deja preguntar,
 * abrir los ajustes de la app (Linking.openSettings). La versión `compacto`
 * es una sola fila, para pantallas donde el espacio importa (como el mapa).
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';
import { PrimaryButton } from './PrimaryButton';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  icon: IconName;
  titulo: string;
  /** Por qué la app necesita el permiso. */
  mensaje: string;
  /** false si el sistema ya no permite volver a mostrar el diálogo. */
  puedePreguntar: boolean;
  /** Vuelve a intentar pedir el permiso. */
  onReintentar: () => void;
  onAbrirAjustes: () => void;
  compacto?: boolean;
};

/**
 * Card de aviso con la acción para habilitar el permiso.
 * @param props ver `Props`
 * @returns el aviso
 */
export function PermissionNotice({
  icon,
  titulo,
  mensaje,
  puedePreguntar,
  onReintentar,
  onAbrirAjustes,
  compacto = false,
}: Props) {
  const accion = puedePreguntar ? onReintentar : onAbrirAjustes;
  const textoAccion = puedePreguntar ? 'Dar permiso' : 'Abrir ajustes';

  if (compacto) {
    return (
      <View style={[styles.card, styles.row, styles.compacto]} accessibilityRole="alert">
        <MaterialIcons name={icon} size={sizes.iconMd} color={colors.onTertiaryFixedVariant} />
        <View style={styles.texts}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje} numberOfLines={3}>
            {mensaje}
          </Text>
        </View>
        <Pressable onPress={accion} hitSlop={spacing.sm} accessibilityRole="button">
          {({ pressed }) => (
            <Text style={[styles.link, pressed && styles.linkPressed]}>{textoAccion}</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card} accessibilityRole="alert">
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <MaterialIcons name={icon} size={sizes.iconMd} color={colors.onTertiaryFixedVariant} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>
        </View>
      </View>
      {puedePreguntar ? (
        <PrimaryButton title="Dar permiso" variant="outline" onPress={onReintentar} />
      ) : (
        <PrimaryButton
          title="Abrir ajustes"
          icon="settings"
          variant="outline"
          onPress={onAbrirAjustes}
        />
      )}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.mustard,
    backgroundColor: colors.surfaceContainerLowest,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.stackSm,
  },
  compacto: {
    alignItems: 'center',
    paddingVertical: spacing.stackSm,
  },
  link: {
    ...typography.labelMd,
    color: colors.primary,
  },
  linkPressed: {
    opacity: 0.6,
  },
  iconCircle: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiaryFixed,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  titulo: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  mensaje: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
