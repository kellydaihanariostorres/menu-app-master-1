import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useTheme } from '@react-navigation/native';
import Bodega from '../pages/Bodega';
import Clientes from '../pages/Clientes';
import Inicio from "../pages/Inicio";
import Proveedores from '../pages/Proveedores';
import Inventario from '../pages/Inventarios';
import Empleado from '../pages/Empleado';
import Productos from '../pages/Productos';

const Menu = createDrawerNavigator();

export default function Administrador() {
  return (
    <Menu.Navigator
        screenOptions={{
          drawerActiveBackgroundColor: '#660000',
          drawerActiveTintColor: 'white',
          drawerInactiveTintColor: 'white',
          drawerStyle: {
            backgroundColor: 'black',
            width: 240,
            
          },
        }}
      >
        <Menu.Screen
          name="INICIO"
          options={{
            headerTitle: "INICIO",
          }}
          component={Inicio}
        />
        <Menu.Screen name="CLIENTES" component={Clientes}  />
        <Menu.Screen name="BODEGAS" component={Bodega} />
        <Menu.Screen name="PROVEEDORES" component={Proveedores} />
        <Menu.Screen name="EMPLEADOS" component={Empleado} />
        <Menu.Screen name="PRODUCTOS" component={Productos} />
        <Menu.Screen name="INVENTARIOS" component={Inventario} />
    </Menu.Navigator>
  );
}
