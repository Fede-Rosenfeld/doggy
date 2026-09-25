/**
 * Botón principal de la app.
 *
 * Variantes:
 * - primary: teal de marca, para las acciones principales.
 * - secondary: mostaza, reservado para CTA críticos (ingresar, reportar).
 * - outline: borde teal y fondo transparente, para acciones secundarias.
 * Tamaños: `md` (56 de alto, el de los formularios) y `sm` (píldora chica
 * para acciones de encabezado, como "Nuevo turno").
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Ícono opcional, por defecto a la derecha del texto. */
  icon?: IconName;
  /** Pone el ícono antes del texto (como en "+ Nuevo turno"). */
  iconLeft?: boolean;
  /** Muestra un spinner y bloquea el botón. */
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
};

/** Colores de fondo, fondo presionado, texto y borde por variante. */
const palette: Record<ButtonVariant, { bg: string; pressed: string; text: string; border: string }> = {
  primary: {
    bg: colors.primaryContainer,
    pressed: colors.primary,
    text: colors.onPrimary,
    border: colors.primaryContainer,
  },
  secondary: {
    bg: colors.mustard,
    pressed: colors.mustardPressed,
    text: colors.onTertiaryFixed,
    border: colors.mustard,
  },
  outline: {
    bg: colors.transparent,
    pressed: colors.tealLight10,
    text: colors.primaryContainer,
    border: colors.primaryContainer,
  },
};

/**
 * Botón con variante, ícono y estado de carga.
 * @param props ver `Props`
 * @returns el botón
 */
export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconLeft = false,
  loading = false,
  disabled = false,
  size = 'md',
  style,
}: Props) {
  const tone = palette[variant];
  const blocked = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor: pressed ? tone.pressed : tone.bg, borderColor: tone.border },
        pressed && styles.pressed,
        blocked && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone.text} />
      ) : (
        <View style={[styles.content, iconLeft && styles.contentReverse]}>
          <Text style={[styles.label, { color: tone.text }]}>{title}</Text>
          {icon && <MaterialIcons name={icon} size={sizes.iconSm + 2} color={tone.text} />}
        </View>
      )}
    </Pressable>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  base: {
    height: sizes.inputHeight,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    height: sizes.avatarSm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  label: {
    ...typography.labelMd,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
