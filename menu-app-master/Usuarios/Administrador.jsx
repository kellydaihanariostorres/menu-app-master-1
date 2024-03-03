import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Contacto } from '../pages/Contacto';
import { Acercade } from "../pages/Acercade";
import { Inicio } from "../pages/Inicio";

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
      <Menu.Screen name="Contacto" component={Contacto} />
      <Menu.Screen name="Acercade" component={Acercade} />
    </Menu.Navigator>
  );
}
