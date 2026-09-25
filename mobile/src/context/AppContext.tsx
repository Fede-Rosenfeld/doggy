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
  Mascota,
  NuevaMascota,
  NuevoRegistro,
  NuevoReporte,
  NuevoTurno,
  RegistroSanitario,
  ReportePerdida,
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
  crearReporte: (datos: NuevoReporte) => Promise<ReportePerdida>;
  agregarRegistro: (datos: NuevoRegistro) => Promise<RegistroSanitario>;
  agregarTurno: (datos: NuevoTurno) => Promise<Turno>;
  actualizarUsuario: (datos: DatosUsuario) => Promise<Usuario>;
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

  /** Crea una mascota y la suma al final de la lista. */
  const agregarMascota = useCallback(async (datos: NuevaMascota) => {
    const nueva = await mascotasService.crearMascota(datos);
    setMascotas((prev) => [...prev, nueva]);
    return nueva;
  }, []);

  /** Publica un reporte de mascota perdida o encontrada. */
  const crearReporte = useCallback(async (datos: NuevoReporte) => {
    const nuevo = await reportesService.crearReporte(datos);
    setReportes((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  /** Agrega un registro al carnet sanitario. */
  const agregarRegistro = useCallback(async (datos: NuevoRegistro) => {
    const nuevo = await registrosService.crearRegistro(datos);
    setRegistros((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  /** Agenda un turno. */
  const agregarTurno = useCallback(async (datos: NuevoTurno) => {
    const nuevo = await turnosService.crearTurno(datos);
    setTurnos((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  /** Actualiza los datos personales del usuario. */
  const actualizarUsuario = useCallback(async (datos: DatosUsuario) => {
    const actualizado = await usuarioService.actualizarUsuario(datos);
    setUsuario(actualizado);
    return actualizado;
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
      crearReporte,
      agregarRegistro,
      agregarTurno,
      actualizarUsuario,
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
      crearReporte,
      agregarRegistro,
      agregarTurno,
      actualizarUsuario,
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
