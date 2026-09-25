/**
 * Formulario para agregar un registro al carnet sanitario: tipo, estado,
 * nombre, fecha y veterinario o clínica. Se muestra dentro de un FormModal
 * y guarda el registro en el contexto global.
 */
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '@/context/AppContext';
import { colors, spacing, typography } from '@/theme';
import type { EstadoRegistro, RegistroSanitario, TipoRegistro } from '@/types/models';
import { ESTADOS_REGISTRO, TIPOS_REGISTRO } from '@/utils/etiquetas';
import { enmascararFecha, fechaIngresadaAIso } from '@/utils/fechas';
import {
  validarFechaIngresada,
  validarFechaSegunEstado,
  validarRequerido,
} from '@/utils/validaciones';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { PrimaryButton } from '../PrimaryButton';

type Props = {
  mascotaId: number;
  /** Tipo preseleccionado (el de la pestaña activa). */
  tipoInicial: TipoRegistro;
  /** Se llama con el registro ya guardado. */
  onGuardado: (registro: RegistroSanitario) => void;
};

type Campo = 'nombre' | 'fecha' | 'profesional';
type Errores = Partial<Record<Campo, string>>;

/** Ejemplos de nombre según el tipo, para el placeholder. */
const EJEMPLOS: Record<TipoRegistro, string> = {
  vacuna: 'Ej: Antirrábica',
  desparasitacion: 'Ej: Pipeta antipulgas',
  otro: 'Ej: Análisis de sangre',
};

/**
 * Formulario de alta de registro sanitario.
 * @param props ver `Props`
 * @returns el formulario
 */
export function NuevoRegistroForm({ mascotaId, tipoInicial, onGuardado }: Props) {
  const { agregarRegistro } = useApp();

  // --- Estado ---
  const [tipo, setTipo] = useState<TipoRegistro>(tipoInicial);
  const [estado, setEstado] = useState<EstadoRegistro>('aplicada');
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [profesional, setProfesional] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const fechaRef = useRef<TextInput>(null);
  const profesionalRef = useRef<TextInput>(null);

  // --- Handlers ---
  /**
   * Limpia el error de un campo cuando el usuario lo corrige.
   * @param campo campo editado
   */
  const limpiarError = (campo: Campo) => {
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /** Valida todos los campos y devuelve los errores encontrados. */
  const validar = (): Errores => ({
    nombre: validarRequerido(nombre, 'Ingresá el nombre del registro.'),
    fecha: validarFechaIngresada(fecha) ?? validarFechaSegunEstado(fecha, estado),
    profesional: validarRequerido(profesional, 'Indicá el veterinario o la clínica.'),
  });

  /** Valida y guarda el registro en el contexto. */
  const handleGuardar = async () => {
    const nuevos = validar();
    setErrores(nuevos);
    const iso = fechaIngresadaAIso(fecha);
    if (Object.values(nuevos).some(Boolean) || !iso) return;

    setGuardando(true);
    try {
      const registro = await agregarRegistro({
        mascotaId,
        tipo,
        estado,
        nombre: nombre.trim(),
        fecha: iso,
        profesional: profesional.trim(),
      });
      onGuardado(registro);
    } catch {
      Alert.alert('No se pudo guardar', 'Revisá tu conexión e intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  // --- Render ---
  return (
    <View style={styles.form}>
      <View style={styles.grupo}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.chips}>
          {TIPOS_REGISTRO.map((t) => (
            <Chip
              key={t.valor}
              label={t.singular}
              selected={tipo === t.valor}
              onPress={() => setTipo(t.valor)}
            />
          ))}
        </View>
      </View>

      <View style={styles.grupo}>
        <Text style={styles.label}>Estado</Text>
        <View style={styles.chips}>
          {ESTADOS_REGISTRO.map((e) => (
            <Chip
              key={e.valor}
              label={e.label}
              selected={estado === e.valor}
              onPress={() => {
                setEstado(e.valor);
                limpiarError('fecha');
              }}
            />
          ))}
        </View>
      </View>

      <Input
        label="Nombre"
        icon="vaccines"
        placeholder={EJEMPLOS[tipo]}
        value={nombre}
        onChangeText={(texto) => {
          setNombre(texto);
          limpiarError('nombre');
        }}
        error={errores.nombre}
        autoCapitalize="sentences"
        returnKeyType="next"
        onSubmitEditing={() => fechaRef.current?.focus()}
        submitBehavior="submit"
      />
      <Input
        ref={fechaRef}
        label={estado === 'aplicada' ? 'Fecha de aplicación' : 'Fecha prevista'}
        icon="event"
        placeholder="dd/mm/aaaa"
        value={fecha}
        onChangeText={(texto) => {
          setFecha(enmascararFecha(texto));
          limpiarError('fecha');
        }}
        error={errores.fecha}
        keyboardType="number-pad"
        maxLength={10}
        returnKeyType="next"
        onSubmitEditing={() => profesionalRef.current?.focus()}
        submitBehavior="submit"
      />
      <Input
        ref={profesionalRef}
        label="Veterinario o clínica"
        icon="local-hospital"
        placeholder="Ej: Dra. Martínez"
        value={profesional}
        onChangeText={(texto) => {
          setProfesional(texto);
          limpiarError('profesional');
        }}
        error={errores.profesional}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={handleGuardar}
      />

      <PrimaryButton
        title="Guardar registro"
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
  grupo: {
    gap: spacing.base,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  boton: {
    marginTop: spacing.sm,
  },
});
