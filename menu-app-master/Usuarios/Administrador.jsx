import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import Bodega  from '../pages/Bodega';
import Clientes from '../pages/Clientes';
import Inicio  from "../pages/Inicio";
import Proveedores from '../pages/Proveedores';
import Inventario from '../pages/Inventarios';
import Empleado from '../pages/Empleado';
import Productos from '../pages/Productos';

const Menu = createDrawerNavigator();

export default function Administrador() {
  return (
    <Menu.Navigator>
      <Menu.Screen
        name="INICIO"
        options={{
          headerTitle: "INICIO",
        }}
        component={Inicio}
      />
      <Menu.Screen name="BODEGA" component={Bodega} />
      <Menu.Screen name="CLIENTE" component={Clientes} />
      <Menu.Screen name="INVENTARIO" component={Inventario} />
      <Menu.Screen name="PROVEEDORES" component={Proveedores} />
      <Menu.Screen name="EMPLEADOS" component={Empleado} />
      <Menu.Screen name="PRODUCTOS" component={Productos} />
    </Menu.Navigator>
  );
}
