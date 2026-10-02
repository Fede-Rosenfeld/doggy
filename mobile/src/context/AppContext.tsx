/**
 * Estado global de la app (Context API).
 *
 * Al montarse carga en paralelo todos los datos desde los services y los
 * expone a las pantallas junto con las acciones para modificarlos. Cada
 * acción llama primero al service (que en el Sprint 2 va a ser la API) y
 * recién con la respuesta actualiza el estado, siempre creando arrays nuevos.
 */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authService from '@/services/auth';
import * as cuidadoresService from '@/services/cuidadores';
import * as mascotasService from '@/services/mascotas';
import * as registrosService from '@/services/registros';
import * as reportesService from '@/services/reportes';
import * as turnosService from '@/services/turnos';
import * as usuarioService from '@/services/usuario';
import type {
  Cuidador,
  DatosUsuario,
  Invitacion,
  Mascota,
  NuevaMascota,
  NuevoRegistro,
  NuevoReporte,
  NuevoTurno,
  RegistroSanitario,
  ReportePerdida,
  RolMascota,
  Turno,
  Usuario,
} from '@/types/models';

type AppContextValue = {
  // --- Datos ---
  usuario: Usuario | null;
  mascotas: Mascota[];
  registros: RegistroSanitario[];
  turnos: Turno[];
  reportes: ReportePerdida[];
  cuidadores: Cuidador[];
  /** true mientras se hace la carga inicial. */
  cargando: boolean;
  /** Mensaje de error de la última carga, si falló. */
  error: string | null;
  // --- Acciones ---
  recargar: () => Promise<void>;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  agregarMascota: (datos: NuevaMascota) => Promise<Mascota>;
  editarMascota: (id: number, cambios: Partial<NuevaMascota>) => Promise<Mascota>;
  crearReporte: (datos: NuevoReporte) => Promise<ReportePerdida>;
  editarReporte: (id: number, cambios: Partial<NuevoReporte>) => Promise<ReportePerdida>;
  /** Cierra un reporte porque la mascota apareció: sale del mapa. */
  cerrarReporte: (id: number) => Promise<void>;
  agregarRegistro: (datos: NuevoRegistro) => Promise<RegistroSanitario>;
  editarRegistro: (id: number, datos: NuevoRegistro) => Promise<RegistroSanitario>;
  agregarTurno: (datos: NuevoTurno) => Promise<Turno>;
  editarTurno: (id: number, datos: NuevoTurno) => Promise<Turno>;
  actualizarUsuario: (datos: DatosUsuario) => Promise<Usuario>;
  // --- Asignación de mascotas ---
  generarInvitacion: (mascota: Mascota, rol: RolMascota) => Promise<Invitacion>;
  verInvitacion: (token: string) => Promise<Invitacion>;
  /** Acepta un link y devuelve la mascota que se sumó a la cuenta. */
  aceptarInvitacion: (token: string) => Promise<Mascota>;
  desasignarme: (mascotaId: number) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

/**
 * Extrae un mensaje legible de un error desconocido.
 * @param error lo que se capturó en el catch
 * @returns el mensaje para mostrar
 */
function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

/**
 * Provider que envuelve la app y mantiene el estado global.
 * @param props.children el árbol de la app
 * @returns el provider con el estado y las acciones
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // --- Estado ---
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [registros, setRegistros] = useState<RegistroSanitario[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [reportes, setReportes] = useState<ReportePerdida[]>([]);
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga inicial ---
  /** Trae todos los datos en paralelo (evita pedir uno detrás de otro). */
  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [u, m, r, t, rep, c] = await Promise.all([
        usuarioService.obtenerUsuario(),
        mascotasService.obtenerMascotas(),
        registrosService.obtenerRegistros(),
        turnosService.obtenerTurnos(),
        reportesService.obtenerReportes(),
        cuidadoresService.obtenerCuidadores(),
      ]);
      setUsuario(u);
      setMascotas(m);
      setRegistros(r);
      setTurnos(t);
      setReportes(rep);
      setCuidadores(c);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // --- Acciones ---
  /** Inicia sesión y guarda el usuario que devuelve el servidor. */
  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const u = await authService.iniciarSesion(email, password);
    setUsuario(u);
  }, []);

  /** Cierra la sesión y olvida al usuario. */
  const cerrarSesion = useCallback(async () => {
    await authService.cerrarSesion();
    setUsuario(null);
  }, []);

  /** Crea una mascota, la suma al final de la lista y trae su asignación (el usuario como dueño). */
  const agregarMascota = useCallback(async (datos: NuevaMascota) => {
    const nueva = await mascotasService.crearMascota(datos);
    setMascotas((prev) => [...prev, nueva]);
    setCuidadores(await cuidadoresService.obtenerCuidadores());
    return nueva;
  }, []);

  /** Modifica los datos de una mascota y la reemplaza en la lista. */
  const editarMascota = useCallback(async (id: number, cambios: Partial<NuevaMascota>) => {
    const actualizada = await mascotasService.actualizarMascota(id, cambios);
    setMascotas((prev) => prev.map((m) => (m.id === id ? actualizada : m)));
    return actualizada;
  }, []);

  /** Publica un reporte de mascota perdida o encontrada. */
  const crearReporte = useCallback(async (datos: NuevoReporte) => {
    const nuevo = await reportesService.crearReporte(datos);
    setReportes((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  /** Modifica un reporte publicado y lo reemplaza en la lista. */
  const editarReporte = useCallback(async (id: number, cambios: Partial<NuevoReporte>) => {
    const actualizado = await reportesService.actualizarReporte(id, cambios);
    setReportes((prev) => prev.map((r) => (r.id === id ? actualizado : r)));
    return actualizado;
  }, []);

  /** Cierra un reporte (la mascota ya apareció) y lo saca de la lista. */
  const cerrarReporte = useCallback(async (id: number) => {
    await reportesService.cerrarReporte(id);
    setReportes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /** Agrega un registro al carnet sanitario. */
  const agregarRegistro = useCallback(async (datos: NuevoRegistro) => {
    const nuevo = await registrosService.crearRegistro(datos);
    setRegistros((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  /** Corrige un registro del carnet y lo reemplaza en la lista. */
  const editarRegistro = useCallback(async (id: number, datos: NuevoRegistro) => {
    const actualizado = await registrosService.actualizarRegistro(id, datos);
    setRegistros((prev) => prev.map((r) => (r.id === id ? actualizado : r)));
    return actualizado;
  }, []);

  /** Agenda un turno. */
  const agregarTurno = useCallback(async (datos: NuevoTurno) => {
    const nuevo = await turnosService.crearTurno(datos);
    setTurnos((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  /** Modifica un turno y lo reemplaza en la lista. */
  const editarTurno = useCallback(async (id: number, datos: NuevoTurno) => {
    const actualizado = await turnosService.actualizarTurno(id, datos);
    setTurnos((prev) => prev.map((t) => (t.id === id ? actualizado : t)));
    return actualizado;
  }, []);

  /** Actualiza los datos personales del usuario. */
  const actualizarUsuario = useCallback(async (datos: DatosUsuario) => {
    const actualizado = await usuarioService.actualizarUsuario(datos);
    setUsuario(actualizado);
    return actualizado;
  }, []);

  /** Genera un link de asignación (solo si el usuario es dueño de la mascota). */
  const generarInvitacion = useCallback(
    (mascota: Mascota, rol: RolMascota) => cuidadoresService.crearInvitacion(mascota, rol),
    [],
  );

  /** Trae un link para mostrarlo antes de aceptarlo. */
  const verInvitacion = useCallback(
    (token: string) => cuidadoresService.obtenerInvitacion(token),
    [],
  );

  /**
   * Acepta un link: el usuario queda asignado y la mascota aparece en su cuenta
   * (se vuelven a traer las mascotas y las asignaciones).
   */
  const aceptarInvitacion = useCallback(async (token: string) => {
    const asignacion = await cuidadoresService.aceptarInvitacion(token);
    const [m, c] = await Promise.all([
      mascotasService.obtenerMascotas(),
      cuidadoresService.obtenerCuidadores(),
    ]);
    setMascotas(m);
    setCuidadores(c);
    const mascota = m.find((x) => x.id === asignacion.mascotaId);
    if (!mascota) throw new Error('No encontramos la mascota asignada.');
    return mascota;
  }, []);

  /** Desasigna al usuario: la mascota y todo lo suyo salen de su cuenta. */
  const desasignarme = useCallback(async (mascotaId: number) => {
    await cuidadoresService.desasignarme(mascotaId);
    setMascotas((prev) => prev.filter((m) => m.id !== mascotaId));
    setCuidadores((prev) => prev.filter((c) => c.mascotaId !== mascotaId));
    setRegistros((prev) => prev.filter((r) => r.mascotaId !== mascotaId));
    setTurnos((prev) => prev.filter((t) => t.mascotaId !== mascotaId));
  }, []);

  // useMemo evita re-renderizar a todos los consumidores si no cambió nada.
  const value = useMemo<AppContextValue>(
    () => ({
      usuario,
      mascotas,
      registros,
      turnos,
      reportes,
      cuidadores,
      cargando,
      error,
      recargar,
      iniciarSesion,
      cerrarSesion,
      agregarMascota,
      editarMascota,
      crearReporte,
      editarReporte,
      cerrarReporte,
      agregarRegistro,
      editarRegistro,
      agregarTurno,
      editarTurno,
      actualizarUsuario,
      generarInvitacion,
      verInvitacion,
      aceptarInvitacion,
      desasignarme,
    }),
    [
      usuario,
      mascotas,
      registros,
      turnos,
      reportes,
      cuidadores,
      cargando,
      error,
      recargar,
      iniciarSesion,
      cerrarSesion,
      agregarMascota,
      editarMascota,
      crearReporte,
      editarReporte,
      cerrarReporte,
      agregarRegistro,
      editarRegistro,
      agregarTurno,
      editarTurno,
      actualizarUsuario,
      generarInvitacion,
      verInvitacion,
      aceptarInvitacion,
      desasignarme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook para leer el estado global desde cualquier pantalla.
 * @returns el valor del contexto
 * @throws si se usa fuera de AppProvider
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp tiene que usarse dentro de AppProvider.');
  return ctx;
}
