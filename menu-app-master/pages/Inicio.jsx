import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";

function Home() {
  return (
    <ImageBackground
      source={require('../assets/prueba1.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>CAWLEY</Text>
        <Text style={styles.parrafo}>Bienvenido a nuestro sistema</Text>
        <TouchableOpacity 
          onPress={() => window.location.href = '/inicio'} // Redireccionar al hacer clic
          style={styles.button}
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 20,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  title: {
    textAlign: 'center',
    marginTop: 300,
    marginBottom: 390,
    color: '#4c0101',
    fontSize: 50,
  },
  parrafo: {
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 390,
    color: '#4c0101',
    fontSize: 50,
    fontFamily: 'Arial',
  },
  button: {
    backgroundColor: '#4c0101',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
    bottom: 20,
    position: 'relative'
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default Home;

