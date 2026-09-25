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
    especie: 'perro',
    raza: 'Golden Retriever',
    edad: 3,
    tamano: 'grande',
    codigo: 'DOGGY-8492-LUNA',
    senas: 'Mancha blanca en el pecho',
    foto: 'luna',
  },
  {
    id: 2,
    tutorId: USUARIO_ID,
    nombre: 'Roco',
    especie: 'perro',
    raza: 'Bulldog Francés',
    edad: 1,
    tamano: 'pequeno',
    codigo: 'DOGGY-3127-ROCO',
    senas: 'Collar verde con chapita. Oreja izquierda un poco caída.',
    foto: 'roco',
  },
  {
    id: 3,
    tutorId: USUARIO_ID,
    nombre: 'Milo',
    especie: 'perro',
    raza: 'Mestizo',
    edad: 5,
    tamano: 'mediano',
    codigo: 'DOGGY-5610-MILO',
    senas: 'Pelo claro con manchas marrones en las orejas.',
    foto: 'milo',
  },
];

export const registrosSanitarios: RegistroSanitario[] = [
  {
    id: 1,
    mascotaId: 1,
    tipo: 'vacuna',
    nombre: 'Antirrábica',
    fecha: '2026-11-15',
    profesional: 'Vet. San Roque',
    estado: 'pendiente',
  },
  {
    id: 2,
    mascotaId: 1,
    tipo: 'vacuna',
    nombre: 'Séxtuple',
    fecha: '2026-05-10',
    profesional: 'Dra. Martínez',
    estado: 'aplicada',
  },
  {
    id: 3,
    mascotaId: 1,
    tipo: 'vacuna',
    nombre: 'Tos de las Perreras',
    fecha: '2026-01-12',
    profesional: 'Clínica Veterinaria Sur',
    estado: 'aplicada',
  },
  {
    id: 4,
    mascotaId: 1,
    tipo: 'desparasitacion',
    nombre: 'Antiparasitario interno',
    fecha: '2026-08-02',
    profesional: 'Dra. Martínez',
    estado: 'aplicada',
  },
  {
    id: 5,
    mascotaId: 1,
    tipo: 'desparasitacion',
    nombre: 'Pipeta antipulgas',
    fecha: '2026-09-01',
    profesional: 'Vet. San Roque',
    estado: 'aplicada',
  },
  {
    id: 6,
    mascotaId: 2,
    tipo: 'vacuna',
    nombre: 'Séxtuple (Dosis 1)',
    fecha: '2026-09-18',
    profesional: 'Clínica Belgrano Pet',
    estado: 'aplicada',
  },
  {
    id: 7,
    mascotaId: 2,
    tipo: 'vacuna',
    nombre: 'Séxtuple (Dosis 2)',
    fecha: '2026-10-23',
    profesional: 'Clínica Belgrano Pet',
    estado: 'pendiente',
  },
  {
    id: 8,
    mascotaId: 3,
    tipo: 'vacuna',
    nombre: 'Antirrábica',
    fecha: '2026-04-20',
    profesional: 'Vet. San Roque',
    estado: 'aplicada',
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
    especie: 'perro',
    raza: 'Golden Retriever',
    tamano: 'grande',
    descripcion: 'Collar azul sin chapita. Muy amigable, responde a su nombre.',
    foto: 'simba',
    etiquetas: ['Collar azul'],
    lat: -34.5889,
    lng: -58.4306,
    zona: 'Palermo, CABA',
    fecha: haceHoras(2),
  },
  {
    id: 2,
    mascotaId: null,
    autorId: 3,
    estado: 'encontrado',
    nombre: 'Sin collar',
    especie: 'perro',
    raza: 'Mestizo',
    tamano: 'pequeno',
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
    especie: 'gato',
    raza: 'Gata blanca',
    tamano: 'pequeno',
    descripcion: 'Gata blanca de ojos celestes. Se escapó por el balcón, es asustadiza.',
    foto: 'nieve',
    etiquetas: ['Asustadiza', 'Ojos celestes'],
    lat: -34.5875,
    lng: -58.3974,
    zona: 'Recoleta, CABA',
    fecha: haceHoras(22),
  },
];

export const cuidadores: Cuidador[] = [
  {
    id: 1,
    mascotaId: 1,
    nombre: 'Carlos Romero',
    rol: 'Co-tutor',
    detalle: 'Acceso total y carnet',
    tipo: 'familia',
    foto: 'carlos',
  },
  {
    id: 2,
    mascotaId: 1,
    nombre: 'Vet. San Roque',
    rol: 'Clínica',
    detalle: 'Dra. Martínez',
    tipo: 'clinica',
    foto: null,
  },
  {
    id: 3,
    mascotaId: 2,
    nombre: 'Marcos Díaz',
    rol: 'Paseador',
    detalle: 'Paseos de lunes a viernes (10-12 hs)',
    tipo: 'paseador',
    foto: null,
  },
  {
    id: 4,
    mascotaId: 3,
    nombre: 'Sol Romero',
    rol: 'Co-tutora',
    detalle: 'Hogar secundario',
    tipo: 'familia',
    foto: null,
  },
];
