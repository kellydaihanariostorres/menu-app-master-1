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
        <TouchableOpacity 
          onPress={() => window.location.href = '/inicio'} // Redireccionar al hacer clic
          style={styles.button}
        >
          <Text style={styles.buttonText}>Cerrar Sesion</Text>
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
    marginTop: 1,
    marginBottom: 390,
    color: 'white',
    fontSize: 50,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
    bottom: 20,
    position: 'relative'
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
  },
});

export default Home;

