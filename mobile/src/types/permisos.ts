/**
 * Tipos compartidos por los hooks que piden permisos al sistema.
 */

/** Estado de un permiso después del último intento de pedirlo. */
export type EstadoPermiso = 'sin-consultar' | 'concedido' | 'denegado';
