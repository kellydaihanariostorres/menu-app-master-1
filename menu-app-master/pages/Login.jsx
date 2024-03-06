import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("1");

  const handleLogin = () => {
    // Aquí puedes realizar cualquier acción que desees al presionar el botón de login.
    // Por ejemplo, podrías validar los campos del formulario aquí antes de redirigir al usuario.

    // Redirigir al usuario a la pantalla correspondiente según el rol seleccionado
    switch (selectedRole) {
      case "1":
        navigation.navigate("Administrador");
        break;
      case "2":
        navigation.navigate("Bodega");
        break;
      case "3":
        navigation.navigate("Contador");
        break;
      case "4":
        navigation.navigate("Caja");
        break;
      default:
        console.error("Rol de usuario desconocido:", selectedRole);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Center the logo horizontally */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logoempresa.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>BIENVENIDO</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </View>
        </View>
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#640000', // Fondo vino tinto
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 95,
    height: 95,
    marginBottom: 10,
    borderRadius: 60,
  },
  card: {
    width: '80%',
    padding: 20,
    backgroundColor: 'black', // Tarjeta negra
    borderRadius: 0, // Sin bordes redondeados
    borderBottomLeftRadius: 0, // Esquina inferior izquierda puntiaguda
    borderBottomRightRadius: 0, // Esquina inferior derecha puntiaguda
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
    textAlign: 'center', // Centra el texto
  },
  inputWrapper: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'black', // Fondo negro
    color: 'white',
    borderWidth: 0,
    borderBottomWidth: 1, // Línea inferior
    borderColor: 'white', // Borde blanco
    padding: 10,
    marginBottom: 5,
    textAlign: 'left', // Centra el texto
  },
  button: {
    backgroundColor: '#640000',
    borderRadius: 50,
    padding: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  // New style for centering the logo
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;
