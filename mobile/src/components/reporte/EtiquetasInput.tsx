/**
 * Editor de etiquetas del reporte ("Collar rojo", "Asustadizo").
 * Muestra las etiquetas como chips que se quitan al tocarlas, y el chip
 * "Añadir Etiqueta" abre un campo para escribir una nueva.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { PrimaryButton } from '../PrimaryButton';

type Props = {
  etiquetas: string[];
  onChange: (etiquetas: string[]) => void;
};

/** Máximo de etiquetas por reporte, para que las cards no se desborden. */
const MAXIMO = 5;
/** Largo máximo de cada etiqueta. */
const LARGO_MAXIMO = 24;

/**
 * Chips de etiquetas con alta y baja.
 * @param props etiquetas actuales y callback con la lista nueva
 * @returns el editor
 */
export function EtiquetasInput({ etiquetas, onChange }: Props) {
  const [agregando, setAgregando] = useState(false);
  const [texto, setTexto] = useState('');

  /** Suma la etiqueta escrita si no está vacía ni repetida. */
  const agregar = () => {
    const nueva = texto.trim();
    const repetida = etiquetas.some((e) => e.toLowerCase() === nueva.toLowerCase());
    if (nueva && !repetida) onChange([...etiquetas, nueva]);
    setTexto('');
    setAgregando(false);
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
              onChangeText={setTexto}
              maxLength={LARGO_MAXIMO}
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
