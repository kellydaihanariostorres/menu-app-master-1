import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Picker } from 'react-native';

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
        <Text style={styles.title}>BIENVENIDO</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          <Text style={styles.label}>Cargo</Text>
          <Picker
            selectedValue={selectedRole}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedRole(itemValue)}
          >
            <Picker.Item label="Administrador" value="1" />
            <Picker.Item label="Bodega" value="2" />
            <Picker.Item label="Contador" value="3" />
            <Picker.Item label="Caja" value="4" />
          </Picker>
        </View>
        <Pressable
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    padding: 20,
    backgroundColor: '#9c0101',
    borderRadius: 10,
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
  },
  input: {
    backgroundColor: '#640000',
    color: 'white',
    borderWidth: 1,
    borderColor: '#4c0101',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#640000',
    color: 'white',
    borderWidth: 1,
    borderColor: '#4c0101',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#640000',
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Login;