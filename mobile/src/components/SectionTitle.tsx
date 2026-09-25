/**
 * Título de sección con ícono en círculo y un badge opcional a la derecha
 * ("Contacto de Emergencia · VITAL", "Familia y Cuidadores · 3 mascotas").
 */
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  icon: IconName;
  titulo: string;
  /** Colores del círculo del ícono. */
  iconoFondo?: string;
  iconoColor?: string;
  /** Elemento a la derecha (normalmente un Badge). */
  derecha?: ReactNode;
};

/** Diámetro del círculo del ícono. */
const CIRCULO = 28;

/**
 * Título de sección.
 * @param props ver `Props`
 * @returns el título
 */
export function SectionTitle({
  icon,
  titulo,
  iconoFondo = colors.secondaryContainer,
  iconoColor = colors.primary,
  derecha,
}: Props) {
  return (
    <View style={styles.fila}>
      <View style={styles.izquierda}>
        <View style={[styles.circulo, { backgroundColor: iconoFondo }]}>
          <MaterialIcons name={icon} size={18} color={iconoColor} />
        </View>
        <Text style={styles.titulo} accessibilityRole="header">
          {titulo}
        </Text>
      </View>
      {derecha}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  izquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  circulo: {
    width: CIRCULO,
    height: CIRCULO,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    ...typography.bodyLg,
    fontFamily: typography.headlineLg.fontFamily,
    color: colors.onSurface,
    flexShrink: 1,
  },
});
