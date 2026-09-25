/**
 * Textos para mostrar los valores de los modelos en la interfaz
 * (los modelos guardan claves sin tildes, la UI muestra el texto en español).
 */
import type { EstadoRegistro, TipoRegistro } from '@/types/models';

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
}[] = [
  { valor: 'vacuna', pestana: 'Vacunas', singular: 'Vacuna', historial: 'Historial de Vacunación' },
  {
    valor: 'desparasitacion',
    pestana: 'Desparasitación',
    singular: 'Desparasitación',
    historial: 'Historial de Desparasitación',
  },
  { valor: 'otro', pestana: 'Otros', singular: 'Otro', historial: 'Otros registros' },
];

/** Textos de los estados de un registro. */
export const ESTADOS_REGISTRO: { valor: EstadoRegistro; label: string }[] = [
  { valor: 'aplicada', label: 'Aplicada' },
  { valor: 'pendiente', label: 'Pendiente' },
];
