import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Picker } from 'react-native';
import moment from 'moment';
import axios from 'axios';

// Aquí va el bloque de código corregido para AsyncStorage
let AsyncStorage;
if (typeof window !== 'undefined') {
  AsyncStorage = require('react-native').AsyncStorage;
} else {
  AsyncStorage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(null),
    removeItem: () => Promise.resolve(null),
  };
}

const apiUrl = 'https://localhost:7284/api/clientes';

export default class Cliente extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      clientes: [],
      filteredClientes: [],
      modalVisible: false,
      clienteId: '',
      nombre: '',
      apellido: '',
      edad: '',
      tipoDocumento: '',
      numDocumento: '',
      correo: '',
      estado: 'Activo', // Por defecto debe estar activo
      editingClienteId: null,
      isEditing: false,
    };
  }

  componentDidMount() {
    this.retrieveData();
  }

  retrieveData = async () => {
    try {
      const clientes = await AsyncStorage.getItem('clientes');

      if (clientes !== null) {
        this.setState({
          clientes: JSON.parse(clientes),
          filteredClientes: JSON.parse(clientes),
        });
      } else {
        this.getClientes();
      }
    } catch (error) {
      console.error('Error al recuperar datos de la memoria caché:', error);
      this.getClientes();
    }
  };

  getClientes = () => {
    this.setState({ loading: true });
  
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        const filteredClientes = data.filter(
          cliente => cliente.estado === 'Activo'
        );
        this.setState({
          clientes: data,
          filteredClientes: filteredClientes,
          loading: false
        });
        AsyncStorage.setItem('clientes', JSON.stringify(data));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };
  

  handleSearch = text => {
    const { clientes } = this.state;
  
    const filteredClientes = clientes.filter(cliente => {
      return (
        cliente.nombre.toLowerCase().includes(text.toLowerCase()) ||
        cliente.numDocumento.toString().toLowerCase().includes(text.toLowerCase())
      );
    });
  
    this.setState({ filteredClientes });
  };

  handleEdit = clienteId => {
    const cliente = this.state.clientes.find(cliente => cliente.clienteId === clienteId);
    this.setState({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      edad: cliente.edad,
      tipoDocumento: cliente.tipoDocumento,
      numDocumento: cliente.numDocumento,
      correo: cliente.correo,
      editingClienteId: clienteId,
      modalVisible: true,
      isEditing: true,
    });
  };
  
  handleDelete = async (clienteId, nombre, apellido, edad, tipoDocumento, numDocumento, correo) => {
    try {
      const parametros = { nombre, apellido, edad, tipoDocumento, numDocumento, correo, estado: 'Desactivado' };
      await axios.put(`${apiUrl}/${clienteId}`, parametros);
      alert(`Cliente ${nombre} desactivado exitosamente`);
      this.getClientes();
    } catch (error) {
      alert('Error al desactivar al cliente');
      console.error(error);
    }
  };

  handleAdd = () => {
    this.setState({
      modalVisible: true,
      nombre: '',
      apellido: '',
      edad: '',
      tipoDocumento: '',
      numDocumento: '',
      correo: '',
      editingClienteId: null,
      isEditing: false,
    });
  };

  handleSave = async () => {
    const {
      nombre,
      apellido,
      edad,
      tipoDocumento,
      numDocumento,
      correo,
      editingClienteId,
      isEditing,
      clientes,
      filteredClientes
    } = this.state;
  
    // Verificar si alguno de los campos está vacío
    if (!nombre || !apellido || !edad || !tipoDocumento || !numDocumento || !correo) {
      alert('Por favor, completa todos los campos.');
      return;
    }
  
    const data = {
      nombre,
      apellido,
      edad,
      tipoDocumento,
      numDocumento,
      correo,
      estado: 'Activo',
    };
  
    try {
      let response;
      if (isEditing) {
        // Si estamos editando, hacemos una solicitud PUT
        response = await axios.put(`${apiUrl}/${editingClienteId}`, data);
        if (response.status >= 200 && response.status < 300) {
          // Si la respuesta fue exitosa, actualizamos el estado local con los datos editados
          const updatedClientes = clientes.map(cliente => {
            if (cliente.clienteId === editingClienteId) {
              return {
                ...cliente,
                ...data
              };
            }
            return cliente;
          });
  
          // Actualizar también filteredClientes si es necesario
          const updatedFilteredClientes = filteredClientes.map(cliente => {
            if (cliente.clienteId === editingClienteId) {
              return {
                ...cliente,
                ...data
              };
            }
            return cliente;
          });
  
          this.setState({
            clientes: updatedClientes,
            filteredClientes: updatedFilteredClientes,
            modalVisible: false,
            nombre: '',
            apellido: '',
            edad: '',
            tipoDocumento: '',
            numDocumento: '',
            correo: '',
            editingClienteId: null,
            isEditing: false,
          });
          alert('Los datos se han guardado correctamente.');
        } else {
          // Si la respuesta del servidor indica un error, mostramos un mensaje apropiado
          alert('Error al guardar cambios: ' + response.statusText);
        }
      } else {
        // Si no, hacemos una solicitud POST para agregar un nuevo cliente
        response = await axios.post(apiUrl, data);
        if (response.status >= 200 && response.status < 300) {
          const nuevoCliente = response.data;
          this.setState(prevState => ({
            clientes: [...prevState.clientes, nuevoCliente],
            filteredClientes: [...prevState.filteredClientes, nuevoCliente],
            modalVisible: false,
            nombre: '',
            apellido: '',
            edad: '',
            tipoDocumento: '',
            numDocumento: '',
            correo: '',
            isEditing: false,
          }));
          alert('Cliente agregado correctamente.');
        } else {
          alert('Error al agregar cliente: ' + response.statusText);
        }
      }
    } catch (error) {
      // Manejo de errores
      console.error('Error saving changes:', error);
      alert('Error al guardar cambios: ' + error.message); // Mostramos el mensaje de error recibido
    }
  };

  
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={this.handleAdd}
            style={{
              backgroundColor: '#440000',
              padding: 10,
              borderRadius: 50,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white' }}>Agregar</Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente"
            onChangeText={this.handleSearch}
          />
        </View>

        <View>
          <View style={styles.row}>
            <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NOMBRE</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>APELLIDO</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>DOCUMENTO</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>CORREO</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>EDAD</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>TIPO DOCUMENTO</Text>
            <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
          </View>
          <FlatList
            contentContainerStyle={styles.tableGroupDivider}
            data={this.state.filteredClientes.filter(cliente => cliente.estado === 'Activo')}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => this.handleEdit(item.clienteId)}>
                <View style={styles.row}>
                  <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.nombre}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.apellido}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.numDocumento}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.correo}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.edad}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.tipoDocumento}</Text>
                  <View style={[styles.buttonGroup, { flex: 1 }]}>
                    <TouchableOpacity onPress={() => this.handleEdit(item.clienteId)}>
                      <Text style={[styles.button, styles.editButton]}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleDelete(item.clienteId, item.nombre, item.apellido, item.edad, item.tipoDocumento, item.numDocumento, item.correo)}>
                      <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.clienteId.toString()}
          />
        </View>

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => {
            // Restablecer el estado del formulario al cerrar el modal sin guardar cambios
            this.setState({ 
              modalVisible: false,
              nombre: '',
              apellido: '',
              edad: '',
              tipoDocumento: '',
              numDocumento: '',
              correo: '',
              editingClienteId: null,
              isEditing: false,
              successMessage: '',
            });
          }}
        >
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Nombre"
              value={this.state.nombre}
              onChangeText={nombre => this.setState({ nombre })}
              style={styles.input}
            />
            <TextInput
              placeholder="Apellido"
              value={this.state.apellido}
              onChangeText={apellido => this.setState({ apellido })}
              style={styles.input}
            />
            <TextInput
              placeholder="Edad"
              value={this.state.edad}
              onChangeText={edad => this.setState({ edad })}
              style={styles.input}
            />
            <TextInput
              placeholder="Tipo Documento"
              value={this.state.tipoDocumento}
              onChangeText={tipoDocumento => this.setState({ tipoDocumento })}
              style={styles.input}
            />
            <TextInput
              placeholder="Número Documento"
              value={this.state.numDocumento}
              onChangeText={numDocumento => this.setState({ numDocumento })}
              style={styles.input}
            />
            <TextInput
              placeholder="Correo"
              value={this.state.correo}
              onChangeText={correo => this.setState({ correo })}
              style={styles.input}
            />
            <TouchableOpacity onPress={this.handleSave} style={styles.button}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ modalVisible: false })} style={styles.button}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start', // Cambia de 'center' a 'flex-start'
    padding: 80,
    paddingTop: 50, // Añade un padding superior para hacer espacio para la barra de búsqueda
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10, // Añade un margen superior para separar los botones de la barra de búsqueda
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    padding: 10,
  },
  item: {
    textAlign: 'center',
    padding: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 5,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#440000',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
});
