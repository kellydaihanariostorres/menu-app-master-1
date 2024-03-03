import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from './pages/Login';
import Administrador from './Usuarios/Administrador';
import Caja from './Usuarios/Caja';
import Bodega from './Usuarios/Bodega';
import Contador from './Usuarios/Contador';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false, title: "Login" }}
        />
        <Stack.Screen
          name="Administrador"
          component={Administrador}
          options={{ headerShown: false, title: "Administrador" }}
        />
        <Stack.Screen
          name="Contador"
          component={Contador}
          options={{ headerShown: false, title: "Contador" }}
        />
        <Stack.Screen
          name="Caja"
          component={Caja}
          options={{ headerShown: false, title: "Caja" }}
        />
        <Stack.Screen
          name="Bodega"
          component={Bodega}
          options={{ headerShown: false, title: "Bodega" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;