import React from "react";
import { View, Text, StyleSheet } from "react-native";

function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, espero que tenga un bonito día</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 20,
  },
});

export default Home;
