import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://localhost:7284/api/authentication/login', { username, password });
      const userRole = response.data.role;
      const loggedInUsername = response.data.username;

      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('authUser', loggedInUsername);
      await AsyncStorage.setItem('selectedCargo', userRole);

      switch (userRole) {
        case 'Administrador':
          navigation.navigate('Administrador');
          break;
        case 'Bodega':
          navigation.navigate('Bodega');
          break;
        case 'Caja':
          navigation.navigate('Caja');
          break;
        default:
          navigation.navigate('/');
      }
    } catch (error) {
      Alert.alert('Error', 'Nombre de usuario o contraseña incorrectos');
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logoempresa.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>BIENVENIDO</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su usuario"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su contraseña"
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
    backgroundColor: '#640000',
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
    backgroundColor: 'black',
    borderRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'black',
    color: 'white',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'white',
    padding: 10,
    marginBottom: 5,
    textAlign: 'left',
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
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;
