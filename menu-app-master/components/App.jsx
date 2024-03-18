import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode'; // Importa la librería jwt-decode para decodificar tokens JWT

// Función para verificar el token de autenticación
const verifyToken = async () => {
  try {
    // Obtener el token de autenticación almacenado
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('No se proporcionó un token de autenticación');
    }

    // Decodificar el token
    const decoded = jwt_decode(token);

    // Continuar con la lógica de la aplicación
    console.log('Usuario autenticado:', decoded);
  } catch (error) {
    console.error('Error:', error.message);
    // Manejar el error, por ejemplo, redirigir al usuario a la pantalla de inicio de sesión
  }
};

const ProtectedScreen = () => {
  useEffect(() => {
    // Verificar el token de autenticación al cargar la pantalla
    verifyToken();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Ruta protegida, usuario autenticado</Text>
    </View>
  );
};

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Otras pantallas de la aplicación</Text>
      <ProtectedScreen />
    </View>
  );
};

export default App;
