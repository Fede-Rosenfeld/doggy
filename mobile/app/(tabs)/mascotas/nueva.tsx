/**
 * Pantalla Agregar mascota.
 *
 * Formulario de alta de un perro: foto (elegida de la fototeca del
 * dispositivo), nombre, raza, edad y señas particulares. Al guardar, el service le
 * asigna el ID único DOGGY-XXXX-NOMBRE que después se usa en el QR, y se
 * vuelve al listado, donde la mascota ya aparece.
 */
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { FotoEditable } from '@/components/FotoEditable';
import { Input } from '@/components/Input';
import { PermissionNotice } from '@/components/PermissionNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useFototeca } from '@/hooks/useFototeca';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { volver } from '@/utils/navegacion';
import { validarEdad, validarRequerido } from '@/utils/validaciones';

type Formulario = {
  nombre: string;
  raza: string;
  edad: string;
  senas: string;
  foto: string | null;
};

type CampoTexto = 'nombre' | 'raza' | 'edad' | 'senas';
type Errores = Partial<Record<CampoTexto, string>>;

const FORM_INICIAL: Formulario = {
  nombre: '',
  raza: '',
  edad: '',
  senas: '',
  foto: null,
};

/**
 * Valida los campos de texto del formulario.
 * @param form valores actuales
 * @returns errores por campo
 */
function validarFormulario(form: Formulario): Errores {
  return {
    nombre: validarRequerido(form.nombre, 'Ingresá el nombre de tu mascota.'),
    raza: validarRequerido(form.raza, 'Ingresá la raza (o "Mestizo").'),
    edad: validarEdad(form.edad),
    senas: validarRequerido(form.senas, 'Contá alguna seña para reconocerla.'),
  };
}

/**
 * Formulario de alta de mascota.
 * @returns la pantalla
 */
export default function NuevaMascotaScreen() {
  const { agregarMascota } = useApp();
  const fototeca = useFototeca();

  // --- Estado ---
  const [form, setForm] = useState<Formulario>(FORM_INICIAL);
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

  /** Valida, guarda la mascota en el contexto y vuelve al listado. */
  const handleGuardar = async () => {
    const nuevos = validarFormulario(form);
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) return;

    setGuardando(true);
    try {
      const creada = await agregarMascota({
        nombre: form.nombre.trim(),
        raza: form.raza.trim(),
        edad: Number(form.edad),
        senas: form.senas.trim(),
        foto: form.foto,
      });
      volver('/mascotas');
      Alert.alert('¡Listo!', `${creada.nombre} ya tiene su ID único: ${creada.codigo}`);
    } catch {
      Alert.alert('No se pudo guardar', 'Revisá tu conexión e intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  // --- Render ---
  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Agregar mascota"
        subtitle="Completá sus datos para generar su QR de identificación."
      />

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
          maxLength={200}
        />
      </View>

      <PrimaryButton title="Guardar" icon="check" onPress={handleGuardar} loading={guardando} />
    </ScreenContainer>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  content: {
    gap: spacing.stackMd,
    paddingBottom: spacing.stackLg,
  },
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
