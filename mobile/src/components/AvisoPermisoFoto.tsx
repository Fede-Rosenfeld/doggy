/**
 * Aviso de permiso denegado para conseguir una foto.
 *
 * Explica qué falta según lo que el usuario intentó usar (la galería o la
 * cámara), recuerda que tiene la otra opción y ofrece reintentar o abrir los
 * ajustes. Solo se muestra si el último intento quedó sin permiso.
 */
import type { UseFototeca } from '@/hooks/useFototeca';
import { PermissionNotice } from './PermissionNotice';

type Props = {
  /** Estado y acciones del hook de la foto. */
  fototeca: UseFototeca;
  /** Para qué se usa la foto, al final del mensaje ("La foto ayuda a…"). */
  motivo: string;
  /** Versión chica, para dentro de formularios. */
  compacto?: boolean;
  /** Recibe la foto si al reintentar el usuario la consigue. */
  onFoto: (uri: string) => void;
};

/**
 * Aviso de permiso de galería o cámara.
 * @param props ver `Props`
 * @returns el aviso, o nada si el permiso no está denegado
 */
export function AvisoPermisoFoto({ fototeca, motivo, compacto = false, onFoto }: Props) {
  if (fototeca.permiso !== 'denegado') return null;
  const camara = fototeca.origen === 'camara';

  /** Vuelve a pedir el mismo permiso y, si se concede, entrega la foto. */
  const reintentar = async () => {
    const uri = await fototeca.reintentar();
    if (uri) onFoto(uri);
  };

  return (
    <PermissionNotice
      icon={camara ? 'no-photography' : 'photo-library'}
      titulo={camara ? 'Necesitamos acceso a la cámara' : 'Necesitamos acceso a tus fotos'}
      mensaje={`${motivo} ${
        camara
          ? 'Habilitá la cámara o elegí una foto de tu galería.'
          : 'Habilitá el acceso o sacá una foto con la cámara.'
      }`}
      puedePreguntar={fototeca.puedePreguntar}
      onReintentar={reintentar}
      onAbrirAjustes={fototeca.abrirAjustes}
      compacto={compacto}
    />
  );
}
