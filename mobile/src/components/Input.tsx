/**
 * Campo de texto de la app.
 *
 * Label arriba, ícono a la izquierda, borde teal claro con foco y mensaje de
 * error debajo. Con `password` oculta el texto y agrega el botón de
 * mostrar/ocultar. Acepta el resto de las props de TextInput.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps, forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = Omit<TextInputProps, 'secureTextEntry' | 'style'> & {
  label: string;
  icon?: IconName;
  /** Mensaje de error; si viene, el borde se pinta de rojo. */
  error?: string;
  /** Modo contraseña con botón para mostrar u ocultar. */
  password?: boolean;
};

/**
 * Input con label, ícono, foco, error y modo contraseña.
 * Se expone la ref del TextInput para poder pasar el foco al siguiente campo.
 */
export const Input = forwardRef<TextInput, Props>(function Input(
  { label, icon, error, password = false, onFocus, onBlur, ...inputProps },
  ref,
) {
  // --- Estado ---
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  // --- Handlers ---
  /** Marca el campo con foco y avisa al padre si pasó onFocus. */
  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  /** Quita el foco y avisa al padre si pasó onBlur. */
  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  /** Alterna entre mostrar y ocultar la contraseña. */
  const toggleHidden = () => setHidden((prev) => !prev);

  // --- Render ---
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={sizes.iconMd}
            color={focused ? colors.tealLight : colors.outline}
          />
        )}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.outline}
          secureTextEntry={password && hidden}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          {...inputProps}
        />
        {password && (
          <Pressable
            onPress={toggleHidden}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          >
            {({ pressed }) => (
              <MaterialIcons
                name={hidden ? 'visibility-off' : 'visibility'}
                size={sizes.iconMd}
                color={pressed ? colors.primaryContainer : colors.outline}
              />
            )}
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

// --- Estilos ---
const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.base,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  field: {
    height: sizes.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  fieldFocused: {
    borderColor: colors.tealLight,
    borderWidth: sizes.borderWidthFocus,
    // Compensa el borde más grueso para que el contenido no se mueva.
    paddingHorizontal: spacing.md - (sizes.borderWidthFocus - sizes.borderWidth),
  },
  fieldError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
});
