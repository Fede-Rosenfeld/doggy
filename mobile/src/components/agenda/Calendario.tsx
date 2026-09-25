/**
 * Calendario mensual de la Agenda, hecho a mano con View y Pressable.
 *
 * Recibe el mes a mostrar y las categorías de turnos de cada día (para los
 * puntos de color). La lógica de fechas está en utils/calendario.ts; acá solo
 * se dibuja la grilla, el día seleccionado, el de hoy y la leyenda.
 */
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';
import type { CategoriaTurno } from '@/types/models';
import { DIAS_SEMANA, generarMes, mismoDia, tituloMes } from '@/utils/calendario';
import { categoriaTurno, CATEGORIAS_TURNO } from '@/utils/etiquetas';

type Props = {
  anio: number;
  /** Mes de 0 a 11. */
  mes: number;
  seleccionado: Date;
  hoy: Date;
  /** Categorías de turnos por clave de día (AAAA-MM-DD). */
  categoriasPorDia: Record<string, CategoriaTurno[]>;
  onSeleccionar: (fecha: Date) => void;
  onCambiarMes: (delta: number) => void;
};

/** Alto de cada celda de día. */
const CELDA = 44;
/** Máximo de puntos por día (uno por categoría). */
const MAX_PUNTOS = 3;

/**
 * Calendario con navegación entre meses.
 * @param props ver `Props`
 * @returns la card del calendario
 */
export function Calendario({
  anio,
  mes,
  seleccionado,
  hoy,
  categoriasPorDia,
  onSeleccionar,
  onCambiarMes,
}: Props) {
  // La grilla solo se recalcula al cambiar de mes.
  const dias = useMemo(() => generarMes(anio, mes), [anio, mes]);

  /**
   * Selecciona un día con una vibración sutil.
   * @param fecha día tocado
   */
  const handleDia = (fecha: Date) => {
    Haptics.selectionAsync();
    onSeleccionar(fecha);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titulo}>
          <MaterialIcons name="calendar-month" size={sizes.iconMd - 2} color={colors.primary} />
          <Text
            style={styles.tituloTexto}
            numberOfLines={1}
            // En pantallas chicas "Septiembre 2026" se achica en vez de pisar las flechas.
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {tituloMes(anio, mes)}
          </Text>
        </View>
        <View style={styles.flechas}>
          <BotonMes icon="chevron-left" label="Mes anterior" onPress={() => onCambiarMes(-1)} />
          <BotonMes icon="chevron-right" label="Mes siguiente" onPress={() => onCambiarMes(1)} />
        </View>
      </View>

      <View style={styles.semana}>
        {DIAS_SEMANA.map((dia) => (
          <Text key={dia} style={styles.diaSemana}>
            {dia}
          </Text>
        ))}
      </View>

      <View style={styles.grilla}>
        {dias.map((dia) => {
          const esSeleccionado = dia.delMes && mismoDia(dia.fecha, seleccionado);
          const esHoy = dia.delMes && mismoDia(dia.fecha, hoy);
          const categorias = dia.delMes ? (categoriasPorDia[dia.clave] ?? []) : [];

          return (
            <View key={dia.clave} style={styles.celda}>
              <Pressable
                onPress={() => handleDia(dia.fecha)}
                disabled={!dia.delMes}
                accessibilityRole="button"
                accessibilityState={{ selected: esSeleccionado }}
                accessibilityLabel={`${dia.fecha.getDate()}${categorias.length ? `, ${categorias.length} turnos` : ''}`}
                style={({ pressed }) => [
                  styles.dia,
                  esHoy && !esSeleccionado && styles.diaHoy,
                  esSeleccionado && styles.diaSeleccionado,
                  pressed && !esSeleccionado && styles.diaPressed,
                ]}
              >
                <Text
                  style={[
                    styles.numero,
                    !dia.delMes && styles.numeroFuera,
                    esHoy && styles.numeroHoy,
                    esSeleccionado && styles.numeroSeleccionado,
                  ]}
                >
                  {dia.fecha.getDate()}
                </Text>
                <View style={styles.puntos}>
                  {categorias.slice(0, MAX_PUNTOS).map((categoria) => {
                    const info = categoriaTurno(categoria);
                    return (
                      <View
                        key={categoria}
                        style={[
                          styles.punto,
                          { backgroundColor: esSeleccionado ? info.colorSobreSeleccion : info.color },
                        ]}
                      />
                    );
                  })}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.leyenda}>
        {CATEGORIAS_TURNO.map((categoria) => (
          <View key={categoria.valor} style={styles.leyendaItem}>
            <View style={[styles.leyendaPunto, { backgroundColor: categoria.color }]} />
            <Text style={styles.leyendaTexto}>{categoria.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type BotonMesProps = {
  icon: 'chevron-left' | 'chevron-right';
  label: string;
  onPress: () => void;
};

/**
 * Flecha redonda para cambiar de mes.
 * @param props ícono, texto accesible y acción
 */
function BotonMes({ icon, label, onPress }: BotonMesProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={spacing.xs}
      style={({ pressed }) => [styles.flecha, pressed && styles.flechaPressed]}
    >
      <MaterialIcons name={icon} size={sizes.iconSm + 2} color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

// --- Estilos ---
const PUNTO = 6;

const styles = StyleSheet.create({
  card: {
    gap: spacing.stackSm,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titulo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tituloTexto: {
    ...typography.headlineMd,
    fontFamily: typography.headlineLg.fontFamily,
    color: colors.onSurface,
    flexShrink: 1,
  },
  flechas: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  flecha: {
    width: sizes.avatarSm - 8,
    height: sizes.avatarSm - 8,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  flechaPressed: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  semana: {
    flexDirection: 'row',
  },
  diaSemana: {
    // 7 columnas iguales: cada una ocupa 1/7 del ancho.
    width: `${100 / 7}%`,
    textAlign: 'center',
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celda: {
    width: `${100 / 7}%`,
    height: CELDA,
    padding: 2,
  },
  dia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md + 4,
  },
  diaHoy: {
    borderWidth: sizes.borderWidthFocus,
    borderColor: colors.tealLight,
  },
  diaSeleccionado: {
    backgroundColor: colors.primary,
    ...shadows.level1,
  },
  diaPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  numero: {
    ...typography.bodySm,
    color: colors.onSurface,
  },
  numeroFuera: {
    color: colors.outlineVariant,
  },
  numeroHoy: {
    fontFamily: typography.labelSm.fontFamily,
    color: colors.primary,
  },
  numeroSeleccionado: {
    fontFamily: typography.labelSm.fontFamily,
    color: colors.onPrimary,
  },
  puntos: {
    flexDirection: 'row',
    gap: 2,
    height: PUNTO,
    marginTop: 2,
  },
  punto: {
    width: PUNTO,
    height: PUNTO,
    borderRadius: radius.full,
  },
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.stackSm,
    borderTopWidth: sizes.borderWidth,
    borderTopColor: colors.surfaceContainerHigh,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  leyendaPunto: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  leyendaTexto: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
