import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";

function Home() {
  return (
    <ImageBackground
      source={require('../assets/laquees.avif')}
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
    marginTop: 350,
    marginBottom: 300,
    color: 'white',
    fontSize: 80,
    fontFamily: 'Arial black',
    position: 'absolute'
  },
  parrafo: {
    textAlign: 'center',
    marginTop: 75,
    marginBottom: 390,
    color: 'white',
    fontSize: 50,
    fontFamily: 'Arial black',
    position: 'relative'
  },
  button: {
    backgroundColor: '#4c0101',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
    bottom: 20,
    position: 'relative',
    left: 550,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default Home;

