/**
 * Modelos de datos de Doggy.
 *
 * Están pensados como los futuros modelos de Prisma del backend: ids
 * numéricos, fechas como string ISO 8601 y relaciones por id
 * (por ejemplo, `mascotaId`). Así, cuando los services pasen a usar fetch,
 * las pantallas no tienen que cambiar.
 */

/** Usuario dueño de la cuenta (tutor de las mascotas). */
export type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  /** Barrio y ciudad, por ejemplo "Palermo, Buenos Aires". */
  ubicacion: string;
  /** Clave de foto local o URI remota; null si no cargó foto. */
  foto: string | null;
  telefonoEmergencia: string;
  whatsappHabilitado: boolean;
};

/** Perro registrado por el usuario (Doggy es solo para perros). */
export type Mascota = {
  id: number;
  tutorId: number;
  nombre: string;
  raza: string;
  /** Edad en años. */
  edad: number;
  /** ID único que se codifica en el QR de la chapita: DOGGY-XXXX-NOMBRE. */
  codigo: string;
  /** Señas particulares para reconocerla. */
  senas: string;
  foto: string | null;
};

export type TipoRegistro = 'vacuna' | 'desparasitacion' | 'otro';
export type EstadoRegistro = 'aplicada' | 'pendiente';

/** Entrada del carnet sanitario de una mascota. */
export type RegistroSanitario = {
  id: number;
  mascotaId: number;
  tipo: TipoRegistro;
  /** Nombre de la vacuna, antiparasitario o práctica. */
  nombre: string;
  /** Fecha de aplicación, o fecha prevista si está pendiente. */
  fecha: string;
  /** Veterinario o clínica. */
  profesional: string;
  estado: EstadoRegistro;
};

export type CategoriaTurno = 'vacunas' | 'veterinario' | 'peluqueria';

/** Turno agendado para una mascota. */
export type Turno = {
  id: number;
  mascotaId: number;
  categoria: CategoriaTurno;
  /** Fecha y hora del turno. */
  fecha: string;
  motivo: string;
  lugar: string;
};

export type EstadoReporte = 'perdido' | 'encontrado';

/** Reporte de un perro perdido o encontrado en la vía pública. */
export type ReportePerdida = {
  id: number;
  /** Mascota registrada en la app, o null si la reportó alguien que la encontró. */
  mascotaId: number | null;
  /** Usuario que hizo el reporte. */
  autorId: number;
  estado: EstadoReporte;
  nombre: string;
  raza: string;
  descripcion: string;
  foto: string | null;
  /** Etiquetas libres ("Collar rojo", "Asustadizo"). En Prisma va a ser una tabla aparte. */
  etiquetas: string[];
  lat: number;
  lng: number;
  /** Zona legible, por ejemplo "Palermo, CABA". */
  zona: string;
  /** Momento en que se perdió o se encontró. */
  fecha: string;
};

export type TipoCuidador = 'familia' | 'clinica' | 'paseador';

/** Persona o institución de confianza asignada al cuidado de una mascota. */
export type Cuidador = {
  id: number;
  mascotaId: number;
  nombre: string;
  /** Rol que se muestra en el badge: "Co-tutor", "Clínica", "Paseador". */
  rol: string;
  /** Detalle del permiso o la tarea: "Acceso total y carnet". */
  detalle: string;
  tipo: TipoCuidador;
  foto: string | null;
};

/** Datos que se mandan para crear una mascota (el id y el código los asigna el servidor). */
export type NuevaMascota = Omit<Mascota, 'id' | 'codigo' | 'tutorId'>;
export type NuevoRegistro = Omit<RegistroSanitario, 'id'>;
export type NuevoTurno = Omit<Turno, 'id'>;
export type NuevoReporte = Omit<ReportePerdida, 'id' | 'autorId'>;
export type DatosUsuario = Partial<Omit<Usuario, 'id'>>;
