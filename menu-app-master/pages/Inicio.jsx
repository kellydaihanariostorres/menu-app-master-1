import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

function Home() {
  return (
    <ImageBackground
      source={require('../assets/fondo-acuarela.avif')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido a nuestro sistema de licores.</Text>
        <Text style={styles.parrafo}>CAWLEY</Text>
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
    flex: 1,
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
    color: '#868585',
    fontSize: 28,
    fontFamily: 'Arial black',
  },
  parrafo: {
    textAlign: 'center',
    color: '#6E6D6D',
    fontSize: 45,
    fontFamily: 'Arial black',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 40,
    marginTop: 20,
    borderColor: '#4F4D4D',
    borderWidth: 1, // Grosor del borde
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default Home;