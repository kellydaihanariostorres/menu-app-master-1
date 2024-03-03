import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal } from 'react-native';


const ManageBodegas = () => {
  const apiUrl = 'https://localhost:7284/api/clientes';
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numDocumento, setNumDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [title, setTitle] = useState('');
  const [operation, setOperation] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getClientes();
  }, []);

  const getClientes = async () => {
    try {
      const response = await axios.get(apiUrl);
      setClientes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (op, id, nombre, apellido, edad, tipoDocumento, numDocumento, correo) => {
    setOperation(op);
    setClienteId(id);
    setModalVisible(true);

    if (op === 1) {
      setTitle('Registrar cliente');
      setNombre('');
      setApellido('');
      setEdad('');
      setTipoDocumento('');
      setNumDocumento('');
      setCorreo('');
    } else if (op === 2) {
      setTitle('Editar cliente');
      setNombre(nombre);
      setApellido(apellido);
      setEdad(edad.toString());
      setTipoDocumento(tipoDocumento);
      setNumDocumento(numDocumento.toString());
      setCorreo(correo);
    }
  };

  const validar = () => {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      (typeof edad !== 'string') ||
      !edad.trim() ||
      !tipoDocumento.trim() ||
      (typeof numDocumento !== 'string') ||
      !numDocumento.trim() ||
      !correo.trim()
    ) {
      show_alerta('Completa todos los campos', 'warning');
    } else {
      const parametros = { nombre, apellido, edad, tipoDocumento, numDocumento, correo };
      const metodo = operation === 1 ? 'POST' : 'PUT';
      enviarSolicitud(metodo, parametros);
    }
  };

  const enviarSolicitud = async (metodo, parametros) => {
    const clienteIdParam = clienteId || '';
    try {
      const response = await axios[metodo.toLowerCase()](
        clienteIdParam ? `${apiUrl}/${clienteIdParam}` : apiUrl,
        parametros
      );
      console.log('Response:', response);
      const tipo = response.data[0];
      const msj = response.data[1];
      show_alerta(msj, tipo);
      getClientes();
      setClienteId(null);
      setNombre('');
      setApellido('');
      setEdad('');
      setTipoDocumento('');
      setNumDocumento('');
      setCorreo('');
    } catch (error) {
      show_alerta('Error de solicitud', 'error');
      console.error(error);
    }
  };
  
  const deleteCliente = async (clienteId, nombre) => {
    Alert.alert(
      `¿Seguro quieres eliminar al cliente ${nombre}?`,
      'No se podrá dar marcha atrás',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, eliminar',
          onPress: async () => {
            try {
              await axios.delete(`${apiUrl}/${clienteId}`);
              show_alerta('Cliente eliminado exitosamente', 'success');
            } catch (error) {
              show_alerta('Error al eliminar al cliente', 'error');
              console.error(error);
            } finally {
              getClientes();
              setClienteId(null);
              setNombre('');
              setApellido('');
              setEdad('');
              setTipoDocumento('');
              setNumDocumento('');
              setCorreo('');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Button
        onPress={() => openModal(1)}
        title="Añadir"
        color="#440000"
      />
      <FlatList
        data={clientes}
        renderItem={({ item, index }) => (
          <View>
            <Text>{index + 1}</Text>
            <Text>{item.nombre}</Text>
            <Text>{item.apellido}</Text>
            <Text>{item.edad}</Text>
            <Text>{item.tipoDocumento}</Text>
            <Text>{item.numDocumento}</Text>
            <Text>{item.correo}</Text>
            <TouchableOpacity onPress={() => openModal(2, item.clienteId, item.nombre, item.apellido, item.edad, item.tipoDocumento, item.numDocumento, item.correo)}>
              <Text>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteCliente(item.clienteId, item.nombre)}>
              <Text>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.clienteId.toString()}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>
            <Text>{title}</Text>
            <TextInput
              placeholder="Nombre"
              value={nombre}
              onChangeText={(text) => setNombre(text)}
            />
            <TextInput
              placeholder="Apellido"
              value={apellido}
              onChangeText={(text) => setApellido(text)}
            />
            <TextInput
              placeholder="Edad"
              value={edad}
              onChangeText={(text) => setEdad(text)}
            />
            <TextInput
              placeholder="Tipo de Documento"
              value={tipoDocumento}
              onChangeText={(text) => setTipoDocumento(text)}
            />
            <TextInput
              placeholder="Número de Documento"
              value={numDocumento}
              onChangeText={(text) => setNumDocumento(text)}
            />
            <TextInput
              placeholder="Correo"
              value={correo}
              onChangeText={(text) => setCorreo(text)}
            />
            <Button onPress={() => validar(clienteId)} title="Guardar" color="#440000" />
            <Button onPress={() => setModalVisible(!modalVisible)} title="Cerrar" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageBodegas;
