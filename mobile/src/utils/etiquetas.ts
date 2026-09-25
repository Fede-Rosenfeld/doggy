/**
 * Textos para mostrar los valores de los modelos en la interfaz
 * (los modelos guardan claves sin tildes, la UI muestra el texto en español).
 */
import type { Especie, Tamano } from '@/types/models';

export const ESPECIES: { valor: Especie; label: string }[] = [
  { valor: 'perro', label: 'Perro' },
  { valor: 'gato', label: 'Gato' },
];

export const TAMANOS: { valor: Tamano; label: string }[] = [
  { valor: 'pequeno', label: 'Pequeño' },
  { valor: 'mediano', label: 'Mediano' },
  { valor: 'grande', label: 'Grande' },
];

/**
 * Texto de la edad: "1 año", "3 años" o "Menos de 1 año".
 * @param edad edad en años
 * @returns la edad lista para mostrar
 */
export function textoEdad(edad: number): string {
  if (edad < 1) return 'Menos de 1 año';
  return edad === 1 ? '1 año' : `${edad} años`;
}

/**
 * Texto de una especie.
 * @param especie clave del modelo
 * @returns "Perro" o "Gato"
 */
export function textoEspecie(especie: Especie): string {
  return ESPECIES.find((e) => e.valor === especie)?.label ?? especie;
}

/**
 * Texto de un tamaño.
 * @param tamano clave del modelo
 * @returns "Pequeño", "Mediano" o "Grande"
 */
export function textoTamano(tamano: Tamano): string {
  return TAMANOS.find((t) => t.valor === tamano)?.label ?? tamano;
}
