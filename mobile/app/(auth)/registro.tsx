/**
 * Pantalla de Registro.
 *
 * Mismo estilo que el Login: fondo teal y el formulario en una card clara.
 * Pide nombre, apellido, email y contraseña con confirmación, y valida todo
 * localmente. Como todavía no hay backend, al crear la cuenta se muestra una
 * confirmación y se entra a la tab Mascotas.
 */
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import {
  PASSWORD_MIN,
  validarConfirmacion,
  validarEmail,
  validarPasswordNueva,
  validarRequerido,
} from '@/utils/validaciones';

type Formulario = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmacion: string;
};

type Campo = keyof Formulario;
type Errores = Partial<Record<Campo, string>>;

const FORM_INICIAL: Formulario = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmacion: '',
};

/**
 * Valida el formulario completo.
 * @param form valores actuales
 * @returns un objeto con el error de cada campo (undefined si está bien)
 */
function validarFormulario(form: Formulario): Errores {
  return {
    nombre: validarRequerido(form.nombre, 'Ingresá tu nombre.'),
    apellido: validarRequerido(form.apellido, 'Ingresá tu apellido.'),
    email: validarEmail(form.email),
    password: validarPasswordNueva(form.password),
    confirmacion: validarConfirmacion(form.password, form.confirmacion),
  };
}

/**
 * Pantalla de creación de cuenta.
 * @returns el formulario de registro
 */
export default function RegistroScreen() {
  // --- Estado ---
  const [form, setForm] = useState<Formulario>(FORM_INICIAL);
  const [errores, setErrores] = useState<Errores>({});
  const apellidoRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmacionRef = useRef<TextInput>(null);

  // --- Handlers ---
  /**
   * Devuelve el handler de cambio de un campo: actualiza el valor y limpia su error.
   * @param campo nombre del campo del formulario
   */
  const handleChange = (campo: Campo) => (texto: string) => {
    setForm((prev) => ({ ...prev, [campo]: texto }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /** Valida y, si todo está bien, confirma el alta y entra a la app. */
  const handleCrearCuenta = () => {
    const nuevos = validarFormulario(form);
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) return;

    Alert.alert(
      'Cuenta creada',
      `¡Bienvenido/a a Doggy, ${form.nombre.trim()}! Ya podés empezar a cargar tus mascotas.`,
      [{ text: 'Continuar', onPress: () => router.replace('/mascotas') }],
    );
  };

  /** Vuelve al login (o lo abre si no hay historial). */
  const handleIngresar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  };

  // --- Render ---
  return (
    <ScreenContainer
      scroll
      backgroundColor={colors.primaryContainer}
      edges={['top', 'bottom', 'left', 'right']}
      contentStyle={styles.content}
    >
      <StatusBar style="light" />

      <View style={styles.header}>
        <BackButton tone="light" fallback="/login" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Registrate para cuidar a tus mascotas y ayudar a encontrar a las que se perdieron.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Input
              label="Nombre"
              placeholder="Sofía"
              value={form.nombre}
              onChangeText={handleChange('nombre')}
              error={errores.nombre}
              autoCapitalize="words"
              autoComplete="given-name"
              returnKeyType="next"
              onSubmitEditing={() => apellidoRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>
          <View style={styles.rowItem}>
            <Input
              ref={apellidoRef}
              label="Apellido"
              placeholder="Romero"
              value={form.apellido}
              onChangeText={handleChange('apellido')}
              error={errores.apellido}
              autoCapitalize="words"
              autoComplete="family-name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>
        </View>

        <Input
          ref={emailRef}
          label="Email"
          icon="mail"
          placeholder="tu@email.com"
          value={form.email}
          onChangeText={handleChange('email')}
          error={errores.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
        <Input
          ref={passwordRef}
          label="Contraseña"
          icon="lock"
          placeholder={`Mínimo ${PASSWORD_MIN} caracteres`}
          password
          value={form.password}
          onChangeText={handleChange('password')}
          error={errores.password}
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="next"
          onSubmitEditing={() => confirmacionRef.current?.focus()}
          submitBehavior="submit"
        />
        <Input
          ref={confirmacionRef}
          label="Confirmar contraseña"
          icon="lock-outline"
          placeholder="Repetí la contraseña"
          password
          value={form.confirmacion}
          onChangeText={handleChange('confirmacion')}
          error={errores.confirmacion}
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={handleCrearCuenta}
        />

        <PrimaryButton
          title="Crear cuenta"
          icon="person-add"
          variant="secondary"
          onPress={handleCrearCuenta}
          style={styles.submit}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tenés cuenta?</Text>
        <Pressable onPress={handleIngresar} hitSlop={spacing.sm} accessibilityRole="link">
          {({ pressed }) => (
            <Text style={[styles.footerLink, pressed && styles.linkPressed]}>Ingresar</Text>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  content: {
    gap: spacing.stackMd,
    paddingTop: spacing.md,
    paddingBottom: spacing.stackLg,
  },
  header: {
    gap: spacing.stackMd,
  },
  headerText: {
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.surfaceBright,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.surfaceContainerHighest,
  },
  card: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    gap: spacing.stackSm,
    padding: spacing.stackMd,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceBright,
    ...shadows.level2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.stackSm,
  },
  rowItem: {
    flex: 1,
  },
  submit: {
    marginTop: spacing.stackSm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.surfaceContainerHighest,
  },
  footerLink: {
    ...typography.labelMd,
    color: colors.surfaceBright,
    textDecorationLine: 'underline',
    textDecorationColor: colors.surfaceContainerHighest,
  },
  linkPressed: {
    opacity: 0.6,
  },
});
