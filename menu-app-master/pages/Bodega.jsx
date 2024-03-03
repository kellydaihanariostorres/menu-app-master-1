import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal } from 'react-native';

const ManageBodegas = () => {
  const [bodegas, setBodegas] = useState([]);
  const [bodegaId, setBodegaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [title, setTitle] = useState('');
  const [operation, setOperation] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  // useEffect(() => {
  //   getBodegas(); // Si deseas cargar datos desde una API, descomenta esta línea
  // }, []);

  // Función para obtener las bodegas (ejemplo con datos de prueba)
  const getBodegas = () => {
    const data = [
      { bodegaId: 1, nombre: 'Bodega 1', estado: 'Activo', direccion: 'Calle 123', ciudad: 'Ciudad 1' },
      { bodegaId: 2, nombre: 'Bodega 2', estado: 'Inactivo', direccion: 'Avenida XYZ', ciudad: 'Ciudad 2' },
    ];
    setBodegas(data);
  };

  const openModal = (op, id, nombre, direccion, estado, ciudad) => {
    setOperation(op);
    setBodegaId(id);

    if (op === 1) {
      setTitle('Registrar bodega');
      setNombre('');
      setEstado('');
      setDireccion('');
      setCiudad('');
    } else if (op === 2) {
      setTitle('Editar bodega');
      setNombre(nombre);
      setEstado(estado);
      setDireccion(direccion);
      setCiudad(ciudad);
    }

    setModalVisible(true);
  };

  const validar = () => {
    if (nombre.trim() === '' || direccion.trim() === '' || estado.trim() === '' || ciudad.trim() === '') {
      alert('Completa todos los campos');
    } else {
      // Simulación de envío de datos a API (en este ejemplo, se mostrará un alert)
      const parametros = { nombre, direccion, estado, ciudad };
      const msj = `Datos enviados: ${JSON.stringify(parametros)}`;
      alert(msj);
      setModalVisible(false);
    }
  };

  const deleteBodega = async (bodegaId, nombre) => {
    // Simulación de eliminación de bodega (en este ejemplo, se mostrará un alert)
    alert(`Bodega eliminada: ${nombre}`);
    // Actualización de la lista de bodegas (opcional)
    setBodegas(bodegas.filter(bodega => bodega.bodegaId !== bodegaId));
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
      <Button title="Añadir" onPress={() => openModal(1)} />
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 10 }}>
        <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>ID</Text>
        <Text style={{ flex: 3, fontWeight: 'bold', textAlign: 'center' }}>Nombre</Text>
        <Text style={{ flex: 2, fontWeight: 'bold', textAlign: 'center' }}>Estado</Text>
        <Text style={{ flex: 3, fontWeight: 'bold', textAlign: 'center' }}>Dirección</Text>
        <Text style={{ flex: 2, fontWeight: 'bold', textAlign: 'center' }}>Ciudad</Text>
      </View>
      {bodegas.length === 0 ? (
        <Text style={{ marginTop: 10 }}>No hay bodegas disponibles.</Text>
      ) : (
        <FlatList
          data={bodegas}
          keyExtractor={(item) => item.bodegaId.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 10 }}>
              <Text style={{ flex: 1, textAlign: 'center' }}>{item.bodegaId}</Text>
              <Text style={{ flex: 3, textAlign: 'center' }}>{item.nombre}</Text>
              <Text style={{ flex: 2, textAlign: 'center' }}>{item.estado}</Text>
              <Text style={{ flex: 3, textAlign: 'center' }}>{item.direccion}</Text>
              <Text style={{ flex: 2, textAlign: 'center' }}>{item.ciudad}</Text>
              <TouchableOpacity onPress={() => openModal(2, item.bodegaId, item.nombre, item.direccion, item.estado, item.ciudad)}>
                <Text style={{ marginLeft: 10, color: 'blue' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteBodega(item.bodegaId, item.nombre)}>
                <Text style={{ marginLeft: 10, color: 'red' }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
          <Text>{title}</Text>
          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={(text) => setNombre(text)}
            style={{ borderBottomWidth: 1, marginBottom: 10, paddingHorizontal: 5 }}
          />
          <TextInput
            placeholder="Dirección"
            value={direccion}
            onChangeText={(text) => setDireccion(text)}
            style={{ borderBottomWidth: 1, marginBottom: 10, paddingHorizontal: 5 }}
          />
          <TextInput
            placeholder="Estado"
            value={estado}
            onChangeText={(text) => setEstado(text)}
            style={{ borderBottomWidth: 1, marginBottom: 10, paddingHorizontal: 5 }}
          />
          <TextInput
            placeholder="Ciudad"
            value={ciudad}
            onChangeText={(text) => setCiudad(text)}
            style={{ borderBottomWidth: 1, marginBottom: 10, paddingHorizontal: 5 }}
          />
          <Button title="Guardar" onPress={validar} />
          <Button title="Cerrar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

export default ManageBodegas;
