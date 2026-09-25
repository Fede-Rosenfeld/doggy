/**
 * Card "Código QR de Identificación" del perfil de la mascota.
 *
 * Genera un QR real (react-native-qrcode-svg) con el ID único de la mascota.
 * Es el mismo código que se graba en la placa del collar: quien la encuentre
 * lo escanea y la app identifica a la mascota y a su tutor.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { colors, radius, sizes, spacing, typography } from '@/theme';
import type { Mascota } from '@/types/models';
import { Badge } from './Badge';
import { SectionCard } from './SectionCard';

const logo = require('@/assets/images/logo.png');

/** Lado del QR en puntos. */
const QR_SIZE = 96;

type Props = {
  mascota: Mascota;
};

/**
 * Card con el QR y las acciones de descargar y compartir.
 * @param props.mascota mascota a identificar
 * @returns la card del QR
 */
export function QrIdentificacion({ mascota }: Props) {
  // --- Handlers ---
  /** Guardar el QR como imagen requiere permisos de galería de escritura: queda para más adelante. */
  const handleDescargar = () => {
    Alert.alert(
      'Descargar QR',
      'Disponible próximamente. Vas a poder guardar el QR en tu galería para imprimirlo o grabarlo en la placa.',
    );
  };

  /** Abre la hoja de compartir del sistema con el ID de la mascota. */
  const handleCompartir = async () => {
    try {
      await Share.share({
        message:
          `${mascota.nombre} tiene su identificación en Doggy. ` +
          `ID único: ${mascota.codigo}. ` +
          `Si encontrás a ${mascota.nombre}, escaneá el QR de su collar con la app para contactar a su tutor.`,
      });
    } catch {
      Alert.alert('No se pudo compartir', 'Probá de nuevo en unos segundos.');
    }
  };

  // --- Render ---
  return (
    <SectionCard>
      <View style={styles.header}>
        <View style={styles.titulo}>
          <MaterialIcons name="qr-code-2" size={sizes.iconSm + 2} color={colors.primary} />
          <Text style={styles.tituloTexto}>Código QR de Identificación</Text>
        </View>
        <Badge label="Placa & Collar" />
      </View>

      <View style={styles.cuerpo}>
        <View style={styles.qr} accessibilityLabel={`Código QR con el ID ${mascota.codigo}`}>
          <QRCode
            value={mascota.codigo}
            size={QR_SIZE}
            color={colors.primary}
            backgroundColor={colors.white}
            logo={logo}
            logoSize={QR_SIZE * 0.26}
            logoBackgroundColor={colors.white}
            logoBorderRadius={radius.full}
            // Corrección de errores alta: el logo tapa parte del código y se sigue leyendo.
            ecl="H"
          />
        </View>

        <View style={styles.info}>
          <View style={styles.idFila}>
            <Text style={styles.idLabel}>ID ÚNICO:</Text>
            <Text style={styles.idValor} selectable>
              {mascota.codigo}
            </Text>
          </View>
          <Text style={styles.ayuda}>
            Escaneá para ver ficha médica de emergencia y contacto del tutor.
          </Text>
          <View style={styles.acciones}>
            <Pressable
              onPress={handleDescargar}
              accessibilityRole="button"
              style={({ pressed }) => [styles.boton, styles.botonPrimario, pressed && styles.pressed]}
            >
              <MaterialIcons name="download" size={sizes.iconSm - 2} color={colors.onPrimary} />
              <Text style={[styles.botonTexto, styles.botonTextoPrimario]}>Descargar QR</Text>
            </Pressable>
            <Pressable
              onPress={handleCompartir}
              accessibilityRole="button"
              style={({ pressed }) => [styles.boton, styles.botonOutline, pressed && styles.pressed]}
            >
              <MaterialIcons name="share" size={sizes.iconSm - 2} color={colors.primary} />
              <Text style={[styles.botonTexto, styles.botonTextoOutline]}>Compartir</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SectionCard>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
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
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    letterSpacing: 0,
    color: colors.primary,
    flexShrink: 1,
  },
  cuerpo: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.stackSm + 2,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.background,
  },
  qr: {
    padding: spacing.sm,
    borderRadius: radius.md + 4,
    borderWidth: sizes.borderWidth,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.white,
  },
  info: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  idFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  idLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  idValor: {
    ...typography.labelMd,
    fontFamily: typography.labelSm.fontFamily,
    color: colors.primary,
  },
  ayuda: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  acciones: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: sizes.avatarSm,
    paddingHorizontal: spacing.stackSm,
    borderRadius: radius.md,
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
  },
  botonOutline: {
    borderWidth: sizes.borderWidth,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  botonTexto: {
    ...typography.labelSm,
  },
  botonTextoPrimario: {
    color: colors.onPrimary,
  },
  botonTextoOutline: {
    color: colors.primary,
  },
});
