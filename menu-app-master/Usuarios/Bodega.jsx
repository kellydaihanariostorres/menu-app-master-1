import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import Bodega  from '../pages/Bodega';
import Clientes from '../pages/Clientes';
import Inicio  from "../pages/Inicio";

const Menu = createDrawerNavigator();

export default function Administrador() {
  return (
    <Menu.Navigator>
      <Menu.Screen
        name="Inicio"
        options={{
          headerTitle: "Inicio",
        }}
        component={Inicio}
      />
      <Menu.Screen name="Contacto" component={Bodega} />
      <Menu.Screen name="Acercade" component={Clientes} />
    </Menu.Navigator>
  );
}
