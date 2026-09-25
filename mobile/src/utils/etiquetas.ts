/**
 * Textos para mostrar los valores de los modelos en la interfaz.
 */

/**
 * Texto de la edad: "1 año", "3 años" o "Menos de 1 año".
 * @param edad edad en años
 * @returns la edad lista para mostrar
 */
export function textoEdad(edad: number): string {
  if (edad < 1) return 'Menos de 1 año';
  return edad === 1 ? '1 año' : `${edad} años`;
}
