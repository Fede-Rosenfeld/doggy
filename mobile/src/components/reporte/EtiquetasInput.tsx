/**
 * Editor de etiquetas del reporte ("Collar rojo", "Asustadizo").
 * Muestra las etiquetas como chips que se quitan al tocarlas, y el chip
 * "Añadir Etiqueta" abre un campo para escribir una nueva. Cada etiqueta se
 * valida como un nombre corto (letras y números, hasta 24 caracteres) y no
 * se puede repetir; si no cumple, se avisa debajo del campo.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { LIMITES, limpiarTexto, validarEtiqueta } from '@/utils/validaciones';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { PrimaryButton } from '../PrimaryButton';

type Props = {
  etiquetas: string[];
  onChange: (etiquetas: string[]) => void;
};

/** Máximo de etiquetas por reporte, para que las cards no se desborden. */
const MAXIMO = 5;

/**
 * Chips de etiquetas con alta y baja.
 * @param props etiquetas actuales y callback con la lista nueva
 * @returns el editor
 */
export function EtiquetasInput({ etiquetas, onChange }: Props) {
  const [agregando, setAgregando] = useState(false);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | undefined>();

  /** Cierra el campo de alta y lo deja vacío. */
  const cerrar = () => {
    setTexto('');
    setError(undefined);
    setAgregando(false);
  };

  /** Suma la etiqueta escrita si es válida y no está repetida; vacía, cierra el campo. */
  const agregar = () => {
    const nueva = limpiarTexto(texto);
    if (!nueva) return cerrar();
    const invalida = validarEtiqueta(nueva);
    if (invalida) return setError(invalida);
    if (etiquetas.some((e) => e.toLowerCase() === nueva.toLowerCase())) {
      return setError('Esa etiqueta ya está.');
    }
    onChange([...etiquetas, nueva]);
    cerrar();
  };

  /**
   * Quita una etiqueta.
   * @param etiqueta etiqueta a quitar
   */
  const quitar = (etiqueta: string) => onChange(etiquetas.filter((e) => e !== etiqueta));

  return (
    <View style={styles.contenedor}>
      <View style={styles.chips}>
        {etiquetas.map((etiqueta) => (
          <Chip key={etiqueta} label={etiqueta} icon="close" onPress={() => quitar(etiqueta)} />
        ))}
        {!agregando && etiquetas.length < MAXIMO && (
          <Chip label="Añadir Etiqueta" icon="add" onPress={() => setAgregando(true)} />
        )}
      </View>
      {agregando && (
        <View style={styles.fila}>
          <View style={styles.campo}>
            <Input
              placeholder="Ej: Collar rojo"
              value={texto}
              onChangeText={(valor) => {
                setTexto(valor);
                setError(undefined);
              }}
              error={error}
              maxLength={LIMITES.etiqueta}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={agregar}
            />
          </View>
          <PrimaryButton title="Agregar" variant="outline" onPress={agregar} />
        </View>
      )}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  contenedor: {
    gap: spacing.stackSm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  campo: {
    flex: 1,
  },
});
