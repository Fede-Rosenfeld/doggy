/**
 * Service de las personas asignadas a cada mascota y de los códigos de asignación.
 *
 * Reglas (las mismas que va a validar el backend):
 * - Solo un dueño de la mascota puede generar códigos de asignación.
 * - Un código sirve para una sola persona y vence a los 7 días.
 * - Cualquiera puede desasignarse, salvo que sea el último dueño: la mascota
 *   no puede quedar sin nadie que pueda administrarla.
 */
import {
  cuidadores as cuidadoresMock,
  invitaciones as invitacionesMock,
  usuario as usuarioMock,
  USUARIO_ID,
} from '@/data/mock';
import type { Cuidador, Invitacion, Mascota, RolMascota } from '@/types/models';
import { pedirJson, siguienteId, simularRespuesta } from './http';

// Listas en memoria para las escrituras, que todavía no están conectadas (Etapa 3).
// La lectura de cuidadores ya viene del servidor.
let cuidadores: Cuidador[] = cuidadoresMock;
let invitaciones: Invitacion[] = invitacionesMock;

/** Días que dura un código de asignación. */
const DIAS_VIGENCIA = 7;
const DIA_MS = 24 * 60 * 60 * 1000;
/** Caracteres del código de asignación (sin 0/O ni 1/I, que se confunden al leerlos). */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LARGO_TOKEN = 8;

/**
 * Genera un código de asignación al azar.
 * @returns código de 8 caracteres
 */
function generarToken(): string {
  let token = '';
  for (let i = 0; i < LARGO_TOKEN; i++) {
    token += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return token;
}

/**
 * Rol de un usuario sobre una mascota.
 * @param mascotaId mascota
 * @param usuarioId usuario
 * @returns el rol, o undefined si no está asignado
 */
function rolDe(mascotaId: number, usuarioId: number): RolMascota | undefined {
  return cuidadores.find((c) => c.mascotaId === mascotaId && c.usuarioId === usuarioId)?.rol;
}

/**
 * Ids de las mascotas a las que está asignado un usuario (con cualquier rol).
 * La usa el service de mascotas para devolver solo las del usuario logueado.
 * @param usuarioId usuario
 * @returns ids de mascotas
 */
export function idsMascotasDe(usuarioId: number): number[] {
  return cuidadores.filter((c) => c.usuarioId === usuarioId).map((c) => c.mascotaId);
}

/**
 * Asigna al usuario logueado como dueño de una mascota que acaba de dar de alta.
 * @param mascotaId mascota creada
 */
export function asignarCreador(mascotaId: number): void {
  cuidadores = [
    ...cuidadores,
    {
      id: siguienteId(cuidadores),
      mascotaId,
      usuarioId: USUARIO_ID,
      nombre: `${usuarioMock.nombre} ${usuarioMock.apellido}`,
      rol: 'dueno',
      detalle: 'Tutor/a',
      tipo: 'familia',
      foto: usuarioMock.foto,
    },
  ];
}

/**
 * Lista las personas asignadas a las mascotas del usuario logueado (él incluido).
 * Endpoint: GET /api/cuidadores -> 200 Cuidador[]
 * @returns las asignaciones
 */
export async function obtenerCuidadores(): Promise<Cuidador[]> {
  return pedirJson<Cuidador[]>('/api/cuidadores');
}

/**
 * Genera un código de asignación. Solo lo puede hacer un dueño de la mascota.
 * Endpoint futuro: POST /api/mascotas/:id/invitaciones  { rol } -> 201 Invitacion
 * @param mascota mascota a la que se invita
 * @param rol rol con el que va a quedar quien acepte
 * @returns la invitación con su código
 */
export async function crearInvitacion(mascota: Mascota, rol: RolMascota): Promise<Invitacion> {
  if (rolDe(mascota.id, USUARIO_ID) !== 'dueno') {
    throw new Error(`Solo un dueño de ${mascota.nombre} puede asignar a otras personas.`);
  }
  const nueva: Invitacion = {
    token: generarToken(),
    mascotaId: mascota.id,
    rol,
    creadaPorId: USUARIO_ID,
    vence: new Date(Date.now() + DIAS_VIGENCIA * DIA_MS).toISOString(),
    usada: false,
    mascota: { nombre: mascota.nombre, raza: mascota.raza, foto: mascota.foto },
  };
  invitaciones = [...invitaciones, nueva];
  return simularRespuesta(nueva);
}

/**
 * Busca un código de asignación y verifica que se pueda usar.
 * Endpoint futuro: GET /api/invitaciones/:token -> 200 Invitacion | 404 | 410
 * @param token código de asignación
 * @returns la invitación
 * @throws si no existe, ya se usó o venció
 */
export async function obtenerInvitacion(token: string): Promise<Invitacion> {
  const invitacion = invitaciones.find((i) => i.token === token.trim().toUpperCase());
  if (!invitacion) throw new Error('Este código de asignación no existe. Revisá que esté bien escrito.');
  if (invitacion.usada) throw new Error('Este código ya se usó. Pedile a un dueño que te mande uno nuevo.');
  if (new Date(invitacion.vence) < new Date()) {
    throw new Error('Este código venció. Pedile a un dueño que te mande uno nuevo.');
  }
  return simularRespuesta(invitacion);
}

/**
 * Acepta un código: asigna al usuario logueado a la mascota con el rol del código
 * y lo marca como usado.
 * Endpoint futuro: POST /api/invitaciones/:token/aceptar -> 200 Cuidador
 * @param token código de asignación
 * @returns la asignación creada
 * @throws si el código no se puede usar o el usuario ya está asignado
 */
export async function aceptarInvitacion(token: string): Promise<Cuidador> {
  const invitacion = await obtenerInvitacion(token);
  if (rolDe(invitacion.mascotaId, USUARIO_ID)) {
    throw new Error(`Ya estás asignado a ${invitacion.mascota.nombre}.`);
  }
  const nueva: Cuidador = {
    id: siguienteId(cuidadores),
    mascotaId: invitacion.mascotaId,
    usuarioId: USUARIO_ID,
    nombre: `${usuarioMock.nombre} ${usuarioMock.apellido}`,
    rol: invitacion.rol,
    detalle: invitacion.rol === 'dueno' ? 'Co-tutor/a' : 'Invitado/a',
    tipo: 'familia',
    foto: usuarioMock.foto,
  };
  cuidadores = [...cuidadores, nueva];
  invitaciones = invitaciones.map((i) => (i.token === invitacion.token ? { ...i, usada: true } : i));
  return simularRespuesta(nueva);
}

/**
 * Desasigna al usuario logueado de una mascota. El último dueño no puede irse.
 * Endpoint futuro: DELETE /api/mascotas/:id/cuidadores/me -> 204
 * @param mascotaId mascota de la que se va
 * @throws si no está asignado o es el único dueño
 */
export async function desasignarme(mascotaId: number): Promise<void> {
  const rol = rolDe(mascotaId, USUARIO_ID);
  if (!rol) throw new Error('No estás asignado a esta mascota.');
  const duenos = cuidadores.filter((c) => c.mascotaId === mascotaId && c.rol === 'dueno');
  if (rol === 'dueno' && duenos.length === 1) {
    throw new Error('Sos el único dueño. Asigná a otra persona como dueña antes de irte.');
  }
  cuidadores = cuidadores.filter((c) => !(c.mascotaId === mascotaId && c.usuarioId === USUARIO_ID));
  return simularRespuesta(undefined);
}
