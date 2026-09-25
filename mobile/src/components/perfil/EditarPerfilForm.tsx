/**
 * Formulario "Editar datos personales": nombre, apellido, ubicación, email,
 * teléfono de emergencia y si tiene WhatsApp. Guarda en el contexto global.
 */
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { useApp } from '@/context/AppContext';
import { colors, spacing, typography } from '@/theme';
import type { Usuario } from '@/types/models';
import { validarEmail, validarRequerido, validarTelefono } from '@/utils/validaciones';
import { Input } from '../Input';
import { PrimaryButton } from '../PrimaryButton';

type Props = {
  usuario: Usuario;
  onGuardado: () => void;
};

type Campo = 'nombre' | 'apellido' | 'ubicacion' | 'email' | 'telefonoEmergencia';
type Formulario = Record<Campo, string>;
type Errores = Partial<Record<Campo, string>>;

/**
 * Valida el formulario completo.
 * @param form valores actuales
 * @returns errores por campo
 */
function validar(form: Formulario): Errores {
  return {
    nombre: validarRequerido(form.nombre, 'Ingresá tu nombre.'),
    apellido: validarRequerido(form.apellido, 'Ingresá tu apellido.'),
    ubicacion: validarRequerido(form.ubicacion, 'Ingresá tu barrio y ciudad.'),
    email: validarEmail(form.email),
    telefonoEmergencia: validarTelefono(form.telefonoEmergencia),
  };
}

/**
 * Formulario de edición del perfil.
 * @param props usuario actual y callback al guardar
 * @returns el formulario
 */
export function EditarPerfilForm({ usuario, onGuardado }: Props) {
  const { actualizarUsuario } = useApp();

  // --- Estado ---
  const [form, setForm] = useState<Formulario>({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    ubicacion: usuario.ubicacion,
    email: usuario.email,
    telefonoEmergencia: usuario.telefonoEmergencia,
  });
  const [whatsapp, setWhatsapp] = useState(usuario.whatsappHabilitado);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  // --- Handlers ---
  /**
   * Handler de cambio de un campo: actualiza el valor y limpia su error.
   * @param campo campo editado
   */
  const handleChange = (campo: Campo) => (texto: string) => {
    setForm((prev) => ({ ...prev, [campo]: texto }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /** Valida y guarda los cambios (en el Sprint 2: PATCH /api/usuarios/me). */
  const handleGuardar = async () => {
    const nuevos = validar(form);
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) return;

    setGuardando(true);
    try {
      await actualizarUsuario({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        ubicacion: form.ubicacion.trim(),
        email: form.email.trim().toLowerCase(),
        telefonoEmergencia: form.telefonoEmergencia.trim(),
        whatsappHabilitado: whatsapp,
      });
      onGuardado();
    } catch {
      Alert.alert('No se pudo guardar', 'Revisá tu conexión e intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  // --- Render ---
  return (
    <View style={styles.form}>
      <View style={styles.fila}>
        <View style={styles.mitad}>
          <Input
            label="Nombre"
            value={form.nombre}
            onChangeText={handleChange('nombre')}
            error={errores.nombre}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.mitad}>
          <Input
            label="Apellido"
            value={form.apellido}
            onChangeText={handleChange('apellido')}
            error={errores.apellido}
            autoCapitalize="words"
          />
        </View>
      </View>
      <Input
        label="Ubicación"
        icon="location-on"
        placeholder="Ej: Palermo, Buenos Aires"
        value={form.ubicacion}
        onChangeText={handleChange('ubicacion')}
        error={errores.ubicacion}
        autoCapitalize="words"
      />
      <Input
        label="Email"
        icon="mail"
        value={form.email}
        onChangeText={handleChange('email')}
        error={errores.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Input
        label="Teléfono de emergencia"
        icon="phone-iphone"
        placeholder="+54 9 11 1234-5678"
        value={form.telefonoEmergencia}
        onChangeText={handleChange('telefonoEmergencia')}
        error={errores.telefonoEmergencia}
        keyboardType="phone-pad"
      />
      <View style={styles.switchFila}>
        <View style={styles.switchTexto}>
          <Text style={styles.switchTitulo}>WhatsApp habilitado</Text>
          <Text style={styles.switchAyuda}>Quien encuentre a tu mascota va a poder escribirte.</Text>
        </View>
        <Switch
          value={whatsapp}
          onValueChange={setWhatsapp}
          trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
          thumbColor={colors.white}
          accessibilityLabel="WhatsApp habilitado"
        />
      </View>

      <PrimaryButton
        title="Guardar cambios"
        icon="check"
        onPress={handleGuardar}
        loading={guardando}
        style={styles.boton}
      />
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  fila: {
    flexDirection: 'row',
    gap: spacing.stackSm,
  },
  mitad: {
    flex: 1,
  },
  switchFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  switchTexto: {
    flex: 1,
  },
  switchTitulo: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  switchAyuda: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  boton: {
    marginTop: spacing.sm,
  },
});
