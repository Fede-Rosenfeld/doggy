/**
 * Card de sección del perfil (QR, carnet, turnos...).
 *
 * Fondo blanco, radio de 16, sombra suave y una "gota" decorativa en la
 * esquina superior derecha. Opcionalmente es tocable entera y puede tener un
 * pie con un link ("Ver historial completo →").
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';

export type SectionTone = 'teal' | 'mustard';

type Props = {
  children: ReactNode;
  /** Color de la decoración y del link del pie. */
  tone?: SectionTone;
  /** Si viene, la card entera se puede tocar. */
  onPress?: () => void;
  /** Texto del link del pie (con flecha). */
  footer?: string;
  accessibilityLabel?: string;
};

/** Diámetro de la gota decorativa. */
const DECORACION = 96;

/** Colores por tono. */
const TONOS: Record<SectionTone, { decor: string; link: string }> = {
  teal: { decor: colors.secondaryContainer20, link: colors.secondary },
  mustard: { decor: colors.tertiaryContainer10, link: colors.tertiary },
};

/**
 * Card con decoración, contenido y pie opcional.
 * @param props ver `Props`
 * @returns la card
 */
export function SectionCard({ children, tone = 'teal', onPress, footer, accessibilityLabel }: Props) {
  const colores = TONOS[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.sombra, pressed && styles.pressed]}
    >
      {/* La sombra va afuera: en iOS overflow hidden la recortaría. */}
      <View style={styles.card}>
        <View style={[styles.decoracion, { backgroundColor: colores.decor }]} pointerEvents="none" />
        {children}
        {footer && (
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colores.link }]}>{footer}</Text>
            <MaterialIcons name="arrow-forward" size={sizes.iconSm} color={colores.link} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  sombra: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  card: {
    gap: spacing.md,
    padding: spacing.containerMargin,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  decoracion: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DECORACION,
    height: DECORACION,
    borderBottomLeftRadius: DECORACION,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.stackSm,
    borderTopWidth: sizes.borderWidth,
    borderTopColor: colors.surfaceContainerHigh,
  },
  footerText: {
    ...typography.labelMd,
  },
});
