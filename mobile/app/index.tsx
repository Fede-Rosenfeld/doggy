/**
 * Pantalla inicial provisoria mientras se arma la navegación.
 */
import { StyleSheet, Text, View } from 'react-native';

/** Pantalla de bienvenida mínima. */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Doggy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
