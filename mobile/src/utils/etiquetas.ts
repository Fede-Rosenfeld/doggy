/**
 * Textos para mostrar los valores de los modelos en la interfaz
 * (los modelos guardan claves sin tildes, la UI muestra el texto en español).
 */
import { colors } from '@/theme';
import type { CategoriaTurno, TipoRegistro } from '@/types/models';

/**
 * Texto de la edad: "1 año", "3 años" o "Menos de 1 año".
 * @param edad edad en años
 * @returns la edad lista para mostrar
 */
export function textoEdad(edad: number): string {
  if (edad < 1) return 'Menos de 1 año';
  return edad === 1 ? '1 año' : `${edad} años`;
}

/** Textos de cada tipo de registro sanitario. */
export const TIPOS_REGISTRO: {
  valor: TipoRegistro;
  /** Nombre de la pestaña del carnet. */
  pestana: string;
  /** Nombre en singular, para el formulario. */
  singular: string;
  /** Título de la lista en el carnet. */
  historial: string;
  /** Título de la card del próximo refuerzo y del campo opcional del formulario. */
  proximo: string;
  /** Título del estado vacío. */
  vacio: string;
  /** Ícono de MaterialIcons de las cards y del formulario. */
  icono: 'vaccines' | 'bug-report' | 'medical-services';
}[] = [
  {
    valor: 'vacuna',
    icono: 'vaccines',
    pestana: 'Vacunas',
    singular: 'Vacuna',
    historial: 'Historial de Vacunación',
    proximo: 'Próximo refuerzo',
    vacio: 'Sin vacunas registradas',
  },
  {
    valor: 'desparasitacion',
    icono: 'bug-report',
    pestana: 'Desparasitación',
    singular: 'Desparasitación',
    historial: 'Historial de Desparasitación',
    proximo: 'Próxima dosis',
    vacio: 'Sin desparasitaciones registradas',
  },
  {
    valor: 'otro',
    icono: 'medical-services',
    pestana: 'Otros',
    singular: 'Otro',
    historial: 'Otros registros',
    proximo: 'Próximo control',
    vacio: 'Sin otros registros',
  },
];

/** Textos y colores de cada categoría de turno (puntos del calendario, leyenda y chips). */
export const CATEGORIAS_TURNO: {
  valor: CategoriaTurno;
  label: string;
  /** Texto del chip en la card del turno. */
  chip: string;
  /** Color del punto y del borde de la card. */
  color: string;
  /** Color del punto cuando el día está seleccionado (fondo teal oscuro). */
  colorSobreSeleccion: string;
  /** Fondo y texto del chip. */
  chipFondo: string;
  chipTexto: string;
}[] = [
  {
    valor: 'vacunas',
    label: 'Vacunas',
    chip: 'Vacunas',
    color: colors.secondary,
    colorSobreSeleccion: colors.secondaryContainer,
    chipFondo: colors.secondaryContainer30,
    chipTexto: colors.onSecondaryContainer,
  },
  {
    valor: 'veterinario',
    label: 'Veterinario',
    chip: 'Clínica',
    color: colors.tertiaryFixedDim,
    colorSobreSeleccion: colors.tertiaryFixed,
    chipFondo: colors.tertiaryFixed,
    chipTexto: colors.onTertiaryFixed,
  },
  {
    valor: 'peluqueria',
    label: 'Peluquería',
    chip: 'Peluquería',
    color: colors.secondaryFixed,
    colorSobreSeleccion: colors.white,
    chipFondo: colors.secondaryContainer20,
    chipTexto: colors.onSecondaryFixedVariant,
  },
];

/**
 * Datos de presentación de una categoría de turno.
 * @param categoria clave del modelo
 * @returns textos y colores
 */
export function categoriaTurno(categoria: CategoriaTurno): (typeof CATEGORIAS_TURNO)[number] {
  return CATEGORIAS_TURNO.find((c) => c.valor === categoria) ?? CATEGORIAS_TURNO[0];
}
