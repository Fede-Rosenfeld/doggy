/**
 * Formulario de un turno: mascota, categoría, fecha, hora, motivo y lugar.
 * Se muestra dentro de un FormModal y guarda el turno en el contexto.
 *
 * Sirve para agendar y para editar: si recibe `turno`, arranca con sus datos
 * y al guardar lo reemplaza; si no, crea uno nuevo en el día elegido.
 * Motivo y lugar tienen largo máximo y caracteres permitidos, y la fecha no
 * puede estar a más de 2 años (ver `validaciones.ts`).
 */
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '@/context/AppContext';
import { colors, spacing, typography } from '@/theme';
import type { CategoriaTurno, NuevoTurno, Turno } from '@/types/models';
import { CATEGORIAS_TURNO } from '@/utils/etiquetas';
import {
  enmascararFecha,
  enmascararHora,
  fechaATexto,
  fechaIngresadaAIso,
  horaATexto,
  parsearFecha,
  parsearHora,
} from '@/utils/fechas';
import {
  LIMITES,
  limpiarTexto,
  validarFechaTurno,
  validarHora,
  validarTexto,
} from '@/utils/validaciones';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { PrimaryButton } from '../PrimaryButton';

type Props = {
  /** Día preseleccionado en el alta (el elegido en el calendario). */
  diaInicial: Date;
  /** Turno a editar. Si no viene, el formulario agenda uno nuevo. */
  turno?: Turno;
  /** Se llama con el turno ya guardado. */
  onGuardado: (turno: Turno) => void;
};

type Campo = 'mascota' | 'fecha' | 'hora' | 'motivo' | 'lugar';
type Errores = Partial<Record<Campo, string>>;

/**
 * Combina una fecha dd/mm/aaaa y una hora HH:MM en un Date local.
 * @param fecha texto de la fecha
 * @param hora texto de la hora
 * @returns el Date, o null si alguno de los dos no es válido
 */
function combinarFechaHora(fecha: string, hora: string): Date | null {
  const iso = fechaIngresadaAIso(fecha);
  const partes = parsearHora(hora);
  if (!iso || !partes) return null;
  const dia = parsearFecha(iso);
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), partes.horas, partes.minutos);
}

/**
 * Formulario de alta o edición de turno.
 * @param props día inicial, turno a editar (opcional) y callback con el turno guardado
 * @returns el formulario
 */
export function TurnoForm({ diaInicial, turno, onGuardado }: Props) {
  const { mascotas, agregarTurno, editarTurno } = useApp();
  /** Fecha y hora originales del turno que se edita, en el formato de los campos. */
  const original = turno
    ? { fecha: fechaATexto(parsearFecha(turno.fecha)), hora: horaATexto(parsearFecha(turno.fecha)) }
    : null;

  // --- Estado ---
  const [mascotaId, setMascotaId] = useState<number | null>(
    turno?.mascotaId ?? mascotas[0]?.id ?? null,
  );
  const [categoria, setCategoria] = useState<CategoriaTurno>(turno?.categoria ?? 'veterinario');
  const [fecha, setFecha] = useState(original?.fecha ?? fechaATexto(diaInicial));
  const [hora, setHora] = useState(original?.hora ?? '');
  const [motivo, setMotivo] = useState(turno?.motivo ?? '');
  const [lugar, setLugar] = useState(turno?.lugar ?? '');
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const horaRef = useRef<TextInput>(null);
  const motivoRef = useRef<TextInput>(null);
  const lugarRef = useRef<TextInput>(null);

  // --- Handlers ---
  /**
   * Limpia el error de un campo cuando el usuario lo corrige.
   * @param campo campo editado
   */
  const limpiarError = (campo: Campo) => {
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /**
   * Valida el formulario; además del formato, el turno tiene que ser a futuro.
   * Al editar, esa regla solo aplica si se cambió la fecha o la hora: así se
   * puede corregir el motivo o el lugar de un turno que ya pasó.
   */
  const validar = (): Errores => {
    const nuevos: Errores = {
      mascota: mascotaId === null ? 'Elegí una mascota.' : undefined,
      fecha: validarFechaTurno(fecha),
      hora: validarHora(hora),
      motivo: validarTexto(motivo, {
        requerido: 'Contá el motivo del turno.',
        min: 3,
        max: LIMITES.motivo,
        formato: 'texto',
      }),
      lugar: validarTexto(lugar, {
        requerido: 'Indicá dónde es el turno.',
        min: 3,
        max: LIMITES.lugar,
        formato: 'texto',
      }),
    };
    const cuando = combinarFechaHora(fecha, hora);
    const cambioHorario = !original || original.fecha !== fecha || original.hora !== hora;
    if (!nuevos.fecha && !nuevos.hora && cuando && cambioHorario && cuando < new Date()) {
      nuevos.hora = 'Ese horario ya pasó.';
    }
    return nuevos;
  };

  /** Valida y guarda el turno (nuevo o editado). */
  const handleGuardar = async () => {
    const nuevos = validar();
    setErrores(nuevos);
    const cuando = combinarFechaHora(fecha, hora);
    if (Object.values(nuevos).some(Boolean) || !cuando || mascotaId === null) return;

    const datos: NuevoTurno = {
      mascotaId,
      categoria,
      fecha: cuando.toISOString(),
      motivo: limpiarTexto(motivo),
      lugar: limpiarTexto(lugar),
    };

    setGuardando(true);
    try {
      const guardado = turno ? await editarTurno(turno.id, datos) : await agregarTurno(datos);
      onGuardado(guardado);
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
        <Text style={styles.label}>Mascota</Text>
        <View style={styles.chips}>
          {mascotas.map((m) => (
            <Chip
              key={m.id}
              label={m.nombre}
              icon="pets"
              selected={mascotaId === m.id}
              onPress={() => {
                setMascotaId(m.id);
                limpiarError('mascota');
              }}
            />
          ))}
        </View>
        {errores.mascota && <Text style={styles.error}>{errores.mascota}</Text>}
      </View>

      <View style={styles.grupo}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.chips}>
          {CATEGORIAS_TURNO.map((c) => (
            <Chip
              key={c.valor}
              label={c.label}
              selected={categoria === c.valor}
              onPress={() => setCategoria(c.valor)}
            />
          ))}
        </View>
      </View>

      <View style={styles.fila}>
        <View style={styles.filaFecha}>
          <Input
            label="Fecha"
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
            onSubmitEditing={() => horaRef.current?.focus()}
            submitBehavior="submit"
          />
        </View>
        <View style={styles.filaHora}>
          <Input
            ref={horaRef}
            label="Hora"
            placeholder="10:30"
            value={hora}
            onChangeText={(texto) => {
              setHora(enmascararHora(texto));
              limpiarError('hora');
            }}
            error={errores.hora}
            keyboardType="number-pad"
            maxLength={5}
            returnKeyType="next"
            onSubmitEditing={() => motivoRef.current?.focus()}
            submitBehavior="submit"
          />
        </View>
      </View>

      <Input
        ref={motivoRef}
        label="Motivo"
        icon="medical-services"
        placeholder="Ej: Chequeo general"
        value={motivo}
        onChangeText={(texto) => {
          setMotivo(texto);
          limpiarError('motivo');
        }}
        error={errores.motivo}
        autoCapitalize="sentences"
        maxLength={LIMITES.motivo}
        returnKeyType="next"
        onSubmitEditing={() => lugarRef.current?.focus()}
        submitBehavior="submit"
      />
      <Input
        ref={lugarRef}
        label="Lugar"
        icon="place"
        placeholder="Ej: Vet. San Roque, Palermo"
        value={lugar}
        onChangeText={(texto) => {
          setLugar(texto);
          limpiarError('lugar');
        }}
        error={errores.lugar}
        autoCapitalize="words"
        maxLength={LIMITES.lugar}
        returnKeyType="done"
        onSubmitEditing={handleGuardar}
      />

      <PrimaryButton
        title={turno ? 'Guardar cambios' : 'Agendar turno'}
        icon={turno ? 'check' : 'event-available'}
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
  error: {
    ...typography.bodySm,
    color: colors.error,
  },
  fila: {
    flexDirection: 'row',
    gap: spacing.stackSm,
  },
  filaFecha: {
    flex: 3,
  },
  filaHora: {
    flex: 2,
  },
  boton: {
    marginTop: spacing.sm,
  },
});
