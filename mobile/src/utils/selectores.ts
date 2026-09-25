/**
 * Selectores: funciones puras que derivan datos a partir del estado global
 * (por ejemplo, la última vacuna de una mascota). Así no se guarda en el
 * estado nada que se pueda calcular.
 */
import type { Mascota, RegistroSanitario, TipoRegistro, Turno } from '@/types/models';
import { parsearFecha } from './fechas';

/**
 * Busca una mascota por el id que llega en la ruta.
 * @param mascotas lista completa
 * @param id id como string (los params de la ruta siempre son texto)
 * @returns la mascota o undefined si no existe
 */
export function buscarMascota(mascotas: Mascota[], id: string | undefined): Mascota | undefined {
  const numero = Number(id);
  return mascotas.find((m) => m.id === numero);
}

/**
 * Última vacuna aplicada a una mascota.
 * @param registros todos los registros sanitarios
 * @param mascotaId id de la mascota
 * @returns el registro más reciente, o undefined si no tiene vacunas
 */
export function ultimaVacuna(
  registros: RegistroSanitario[],
  mascotaId: number,
): RegistroSanitario | undefined {
  return registros
    .filter((r) => r.mascotaId === mascotaId && r.tipo === 'vacuna' && r.estado === 'aplicada')
    .sort((a, b) => parsearFecha(b.fecha).getTime() - parsearFecha(a.fecha).getTime())[0];
}

/**
 * Próximo turno de una mascota a partir de ahora.
 * @param turnos todos los turnos
 * @param mascotaId id de la mascota
 * @param ahora fecha de referencia (se puede pasar para testear)
 * @returns el turno más cercano en el futuro, o undefined
 */
export function proximoTurno(
  turnos: Turno[],
  mascotaId: number,
  ahora: Date = new Date(),
): Turno | undefined {
  return turnos
    .filter((t) => t.mascotaId === mascotaId && parsearFecha(t.fecha) >= ahora)
    .sort((a, b) => parsearFecha(a.fecha).getTime() - parsearFecha(b.fecha).getTime())[0];
}

/**
 * Registros de una mascota y un tipo, del más nuevo al más viejo.
 * @param registros todos los registros
 * @param mascotaId id de la mascota
 * @param tipo tipo a filtrar
 * @returns la lista filtrada y ordenada
 */
export function registrosPorTipo(
  registros: RegistroSanitario[],
  mascotaId: number,
  tipo: TipoRegistro,
): RegistroSanitario[] {
  return registros
    .filter((r) => r.mascotaId === mascotaId && r.tipo === tipo)
    .sort((a, b) => parsearFecha(b.fecha).getTime() - parsearFecha(a.fecha).getTime());
}

/**
 * Próximo refuerzo pendiente: el registro pendiente con la fecha más cercana.
 * @param registros registros ya filtrados de una mascota y un tipo
 * @returns el registro pendiente más próximo, o undefined
 */
export function proximoRefuerzo(registros: RegistroSanitario[]): RegistroSanitario | undefined {
  return registros
    .filter((r) => r.estado === 'pendiente')
    .sort((a, b) => parsearFecha(a.fecha).getTime() - parsearFecha(b.fecha).getTime())[0];
}
