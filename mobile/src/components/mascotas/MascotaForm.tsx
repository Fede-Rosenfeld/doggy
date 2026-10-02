/**
 * Formulario de datos de una mascota, compartido por el alta y la edición.
 *
 * Tiene la foto (elegida de la fototeca del dispositivo), nombre, raza, edad y
 * señas particulares, con validación local (largo máximo y caracteres
 * permitidos en cada campo, ver `validaciones.ts`). No sabe si está creando o
 * editando: recibe los valores iniciales y le entrega los datos ya validados
 * y limpios a `onGuardar`, que decide qué hacer con ellos. Mientras
 * `onGuardar` corre, el botón muestra el estado de carga.
 */
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { FotoEditable } from '@/components/FotoEditable';
import { Input } from '@/components/Input';
import { PermissionNotice } from '@/components/PermissionNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useFototeca } from '@/hooks/useFototeca';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import type { NuevaMascota } from '@/types/models';
import {
  LIMITES,
  limpiarTexto,
  validarEdad,
  validarNombreMascota,
  validarRaza,
  validarTexto,
} from '@/utils/validaciones';

type Formulario = {
  nombre: string;
  raza: string;
  /** Texto del input; se convierte a número al guardar. */
  edad: string;
  senas: string;
  foto: string | null;
};

type CampoTexto = 'nombre' | 'raza' | 'edad' | 'senas';
type Errores = Partial<Record<CampoTexto, string>>;

type Props = {
  /** Datos con los que arranca el formulario (vacío en el alta). */
  inicial?: NuevaMascota;
  /** Texto del botón de guardar. */
  textoBoton?: string;
  /** Recibe los datos validados. Si lanza un error, lo maneja la pantalla. */
  onGuardar: (datos: NuevaMascota) => Promise<void>;
};

/**
 * Pasa los datos de una mascota al formato de los inputs.
 * @param mascota datos iniciales (opcional)
 * @returns el estado inicial del formulario
 */
function aFormulario(mascota?: NuevaMascota): Formulario {
  return {
    nombre: mascota?.nombre ?? '',
    raza: mascota?.raza ?? '',
    edad: mascota ? String(mascota.edad) : '',
    senas: mascota?.senas ?? '',
    foto: mascota?.foto ?? null,
  };
}

/**
 * Valida los campos de texto del formulario.
 * @param form valores actuales
 * @returns errores por campo
 */
function validarFormulario(form: Formulario): Errores {
  return {
    nombre: validarNombreMascota(form.nombre),
    raza: validarRaza(form.raza),
    edad: validarEdad(form.edad),
    senas: validarTexto(form.senas, {
      requerido: 'Contá alguna seña para reconocerla.',
      min: 5,
      max: LIMITES.senas,
      formato: 'texto',
      multilinea: true,
    }),
  };
}

/**
 * Formulario de mascota.
 * @param props ver `Props`
 * @returns la foto, los campos y el botón de guardar
 */
export function MascotaForm({ inicial, textoBoton = 'Guardar', onGuardar }: Props) {
  const fototeca = useFototeca();

  // --- Estado ---
  const [form, setForm] = useState<Formulario>(() => aFormulario(inicial));
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const razaRef = useRef<TextInput>(null);
  const edadRef = useRef<TextInput>(null);
  const senasRef = useRef<TextInput>(null);

  // --- Handlers ---
  /**
   * Devuelve el handler de cambio de un campo de texto.
   * @param campo campo a actualizar
   */
  const handleChange = (campo: CampoTexto) => (texto: string) => {
    setForm((prev) => ({ ...prev, [campo]: texto }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /** Abre la galería y, si el usuario elige una imagen, la pone como foto. */
  const handleElegirFoto = async () => {
    try {
      const uri = await fototeca.elegirFoto();
      if (uri) setForm((prev) => ({ ...prev, foto: uri }));
    } catch {
      Alert.alert('No se pudo abrir la galería', 'Probá de nuevo en unos segundos.');
    }
  };

  /** Valida y, si está todo bien, le pasa los datos limpios a la pantalla. */
  const handleGuardar = async () => {
    const nuevos = validarFormulario(form);
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) return;

    setGuardando(true);
    try {
      await onGuardar({
        nombre: limpiarTexto(form.nombre),
        raza: limpiarTexto(form.raza),
        edad: Number(form.edad),
        senas: limpiarTexto(form.senas, true),
        foto: form.foto,
      });
    } finally {
      setGuardando(false);
    }
  };

  // --- Render ---
  return (
    <>
      <View style={styles.fotoSection}>
        <FotoEditable
          foto={form.foto}
          nombre={form.nombre}
          onPress={handleElegirFoto}
          cargando={fototeca.eligiendo}
        />
        <Text style={styles.fotoAyuda}>
          {form.foto ? 'Tocá la foto para cambiarla' : 'Tocá para elegir una foto de tu galería'}
        </Text>
      </View>

      {fototeca.permiso === 'denegado' && (
        <PermissionNotice
          icon="photo-library"
          titulo="Necesitamos acceso a tus fotos"
          mensaje="La foto es lo que más ayuda a que alguien reconozca a tu mascota si se pierde. Podés habilitar el acceso cuando quieras."
          puedePreguntar={fototeca.puedePreguntar}
          onReintentar={handleElegirFoto}
          onAbrirAjustes={fototeca.abrirAjustes}
        />
      )}

      <View style={styles.card}>
        <Input
          label="Nombre"
          icon="pets"
          placeholder="Ej: Luna"
          value={form.nombre}
          onChangeText={handleChange('nombre')}
          error={errores.nombre}
          autoCapitalize="words"
          maxLength={LIMITES.nombreMascota}
          returnKeyType="next"
          onSubmitEditing={() => razaRef.current?.focus()}
          submitBehavior="submit"
        />

        <View style={styles.fila}>
          <View style={styles.filaRaza}>
            <Input
              ref={razaRef}
              label="Raza"
              placeholder="Ej: Golden Retriever"
              value={form.raza}
              onChangeText={handleChange('raza')}
              error={errores.raza}
              autoCapitalize="words"
              maxLength={LIMITES.raza}
              returnKeyType="next"
              onSubmitEditing={() => edadRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>
          <View style={styles.filaEdad}>
            <Input
              ref={edadRef}
              label="Edad (años)"
              placeholder="3"
              value={form.edad}
              // Algunos teclados dejan pegar letras: se descartan antes de guardar el valor.
              onChangeText={(texto) => handleChange('edad')(texto.replace(/\D/g, ''))}
              error={errores.edad}
              keyboardType="number-pad"
              maxLength={2}
              returnKeyType="next"
              onSubmitEditing={() => senasRef.current?.focus()}
              submitBehavior="submit"
            />
          </View>
        </View>

        <Input
          ref={senasRef}
          label="Señas particulares"
          icon="info-outline"
          placeholder="Ej: Mancha blanca en el pecho, collar rojo"
          value={form.senas}
          onChangeText={handleChange('senas')}
          error={errores.senas}
          multiline
          maxLength={LIMITES.senas}
        />
      </View>

      <PrimaryButton title={textoBoton} icon="check" onPress={handleGuardar} loading={guardando} />
    </>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  fotoSection: {
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  fotoAyuda: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  card: {
    gap: spacing.md,
    padding: spacing.containerMargin,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  fila: {
    flexDirection: 'row',
    gap: spacing.stackSm,
  },
  filaRaza: {
    flex: 2,
  },
  filaEdad: {
    flex: 1,
  },
});
