/**
 * Datos de ejemplo de la app.
 *
 * Reemplazan a la base de datos mientras no exista el backend. Los services
 * los devuelven como si vinieran de la API. Las fechas de los reportes se
 * calculan respecto de "ahora" para que "hace 2 h" siempre tenga sentido;
 * el resto son fechas fijas de 2026.
 */
import type {
  Cuidador,
  Invitacion,
  Mascota,
  RegistroSanitario,
  ReportePerdida,
  Turno,
  Usuario,
} from '@/types/models';

const HORA_MS = 60 * 60 * 1000;

/**
 * Devuelve la fecha ISO de hace una cantidad de horas.
 * @param horas horas hacia atrás desde ahora
 * @returns fecha en formato ISO
 */
function haceHoras(horas: number): string {
  return new Date(Date.now() - horas * HORA_MS).toISOString();
}

export const USUARIO_ID = 1;

export const usuario: Usuario = {
  id: USUARIO_ID,
  nombre: 'Sofía',
  apellido: 'Romero',
  email: 'sofia.romero@mail.com',
  ubicacion: 'Palermo, Buenos Aires',
  foto: 'sofia',
  telefonoEmergencia: '+54 9 11 4589-2310',
  whatsappHabilitado: true,
};

export const mascotas: Mascota[] = [
  {
    id: 1,
    tutorId: USUARIO_ID,
    nombre: 'Luna',
    raza: 'Golden Retriever',
    edad: 3,
    codigo: 'DOGGY-8492-LUNA',
    senas: 'Mancha blanca en el pecho',
    foto: 'luna',
  },
  {
    id: 2,
    tutorId: USUARIO_ID,
    nombre: 'Roco',
    raza: 'Bulldog Francés',
    edad: 1,
    codigo: 'DOGGY-3127-ROCO',
    senas: 'Collar verde con chapita. Oreja izquierda un poco caída.',
    foto: 'roco',
  },
  {
    id: 3,
    tutorId: USUARIO_ID,
    nombre: 'Milo',
    raza: 'Mestizo',
    edad: 5,
    codigo: 'DOGGY-5610-MILO',
    senas: 'Pelo claro con manchas marrones en las orejas.',
    foto: 'milo',
  },
  // Mascota de otra usuaria (Lucía): Sofía no la ve hasta aceptar el link de asignación.
  {
    id: 4,
    tutorId: 20,
    nombre: 'Toby',
    raza: 'Beagle',
    edad: 4,
    codigo: 'DOGGY-7741-TOBY',
    senas: 'Tricolor, con la punta de la cola blanca.',
    foto: null,
  },
];

export const registrosSanitarios: RegistroSanitario[] = [
  {
    id: 1,
    mascotaId: 1,
    tipo: 'vacuna',
    nombre: 'Antirrábica',
    fecha: '2025-11-15',
    profesional: 'Vet. San Roque',
    proximaDosis: '2026-11-15',
  },
  {
    id: 2,
    mascotaId: 1,
    tipo: 'vacuna',
    nombre: 'Séxtuple',
    fecha: '2026-05-10',
    profesional: 'Dra. Martínez',
    proximaDosis: '2027-05-10',
  },
  {
    id: 3,
    mascotaId: 1,
    tipo: 'vacuna',
    nombre: 'Tos de las Perreras',
    fecha: '2026-01-12',
    profesional: 'Clínica Veterinaria Sur',
  },
  {
    id: 4,
    mascotaId: 1,
    tipo: 'desparasitacion',
    nombre: 'Antiparasitario interno',
    fecha: '2026-08-02',
    profesional: 'Dra. Martínez',
  },
  {
    id: 5,
    mascotaId: 1,
    tipo: 'desparasitacion',
    nombre: 'Pipeta antipulgas',
    fecha: '2026-09-01',
    profesional: 'Vet. San Roque',
    proximaDosis: '2026-10-01',
  },
  {
    id: 6,
    mascotaId: 2,
    tipo: 'vacuna',
    nombre: 'Séxtuple (Dosis 1)',
    fecha: '2026-09-18',
    profesional: 'Clínica Belgrano Pet',
    proximaDosis: '2026-10-23',
  },
  {
    id: 7,
    mascotaId: 3,
    tipo: 'vacuna',
    nombre: 'Antirrábica',
    fecha: '2026-04-20',
    profesional: 'Vet. San Roque',
    proximaDosis: '2027-04-20',
  },
];

export const turnos: Turno[] = [
  {
    id: 1,
    mascotaId: 3,
    categoria: 'peluqueria',
    fecha: '2026-10-09T15:00:00-03:00',
    motivo: 'Baño y corte de pelo',
    lugar: 'Peluquería Canina Patitas, Palermo',
  },
  {
    id: 2,
    mascotaId: 1,
    categoria: 'veterinario',
    fecha: '2026-10-23T10:30:00-03:00',
    motivo: 'Chequeo General Anual',
    lugar: 'Vet. San Roque, Palermo',
  },
  {
    id: 3,
    mascotaId: 2,
    categoria: 'vacunas',
    fecha: '2026-10-23T17:00:00-03:00',
    motivo: 'Vacuna Séxtuple (Dosis 2)',
    lugar: 'Clínica Belgrano Pet',
  },
  {
    id: 4,
    mascotaId: 1,
    categoria: 'peluqueria',
    fecha: '2026-10-30T11:00:00-03:00',
    motivo: 'Baño y deslanado',
    lugar: 'Peluquería Canina Patitas, Palermo',
  },
];

export const reportes: ReportePerdida[] = [
  {
    id: 1,
    mascotaId: null,
    autorId: 2,
    estado: 'perdido',
    nombre: 'Simba',
    raza: 'Golden Retriever',
    descripcion: 'Collar azul sin chapita. Muy amigable, responde a su nombre.',
    foto: 'simba',
    etiquetas: ['Collar azul'],
    lat: -34.5889,
    lng: -58.4306,
    zona: 'Palermo, CABA',
    fecha: haceHoras(2),
    radioMetros: 1000,
    infoAdicional: 'Tenía puesto un pretal rojo. Se asusta con las motos.',
  },
  {
    id: 2,
    mascotaId: null,
    autorId: 3,
    estado: 'encontrado',
    nombre: 'Sin collar',
    raza: 'Mestizo',
    descripcion: 'Lo encontramos cerca de Barrancas de Belgrano. Está en tránsito con nosotros.',
    foto: 'sin-collar',
    etiquetas: ['En tránsito'],
    lat: -34.5627,
    lng: -58.4583,
    zona: 'Belgrano, CABA',
    fecha: haceHoras(26),
  },
  {
    id: 3,
    mascotaId: null,
    autorId: 4,
    estado: 'perdido',
    nombre: 'Nieve',
    raza: 'Mestiza',
    descripcion: 'Perrita blanca de pelo largo. Se asustó con la pirotecnia y salió corriendo.',
    foto: null,
    etiquetas: ['Asustadiza', 'Pelo largo'],
    lat: -34.5875,
    lng: -58.3974,
    zona: 'Recoleta, CABA',
    fecha: haceHoras(22),
    radioMetros: 500,
  },
];

/** Usuaria dueña de Toby: sirve para probar un link de asignación de otra persona. */
const LUCIA_ID = 20;

/**
 * Asignaciones de personas a mascotas. Sofía (la usuaria logueada) figura
 * como dueña de sus tres mascotas; el resto son familia, clínica y paseador.
 */
export const cuidadores: Cuidador[] = [
  {
    id: 1,
    mascotaId: 1,
    usuarioId: USUARIO_ID,
    nombre: 'Sofía Romero',
    rol: 'dueno',
    detalle: 'Tutora',
    tipo: 'familia',
    foto: 'sofia',
  },
  {
    id: 2,
    mascotaId: 1,
    usuarioId: 11,
    nombre: 'Carlos Romero',
    rol: 'dueno',
    detalle: 'Co-tutor',
    tipo: 'familia',
    foto: 'carlos',
  },
  {
    id: 3,
    mascotaId: 1,
    usuarioId: 12,
    nombre: 'Vet. San Roque',
    rol: 'invitado',
    detalle: 'Dra. Martínez',
    tipo: 'clinica',
    foto: null,
  },
  {
    id: 4,
    mascotaId: 2,
    usuarioId: USUARIO_ID,
    nombre: 'Sofía Romero',
    rol: 'dueno',
    detalle: 'Tutora',
    tipo: 'familia',
    foto: 'sofia',
  },
  {
    id: 5,
    mascotaId: 2,
    usuarioId: 13,
    nombre: 'Marcos Díaz',
    rol: 'invitado',
    detalle: 'Paseos de lunes a viernes (10-12 hs)',
    tipo: 'paseador',
    foto: null,
  },
  {
    id: 6,
    mascotaId: 3,
    usuarioId: USUARIO_ID,
    nombre: 'Sofía Romero',
    rol: 'dueno',
    detalle: 'Tutora',
    tipo: 'familia',
    foto: 'sofia',
  },
  {
    id: 7,
    mascotaId: 3,
    usuarioId: 14,
    nombre: 'Sol Romero',
    rol: 'dueno',
    detalle: 'Hogar secundario',
    tipo: 'familia',
    foto: null,
  },
  {
    id: 8,
    mascotaId: 4,
    usuarioId: LUCIA_ID,
    nombre: 'Lucía Gómez',
    rol: 'dueno',
    detalle: 'Tutora',
    tipo: 'familia',
    foto: null,
  },
];

/**
 * Links de asignación ya generados. El de Toby lo creó Lucía para que Sofía
 * lo acepte: se prueba desde Perfil → "Tengo un link de asignación" con el
 * código TOBY2026.
 */
export const invitaciones: Invitacion[] = [
  {
    token: 'TOBY2026',
    mascotaId: 4,
    rol: 'invitado',
    creadaPorId: LUCIA_ID,
    vence: '2027-12-31T23:59:59.000Z',
    usada: false,
    mascota: { nombre: 'Toby', raza: 'Beagle', foto: null },
  },
];
