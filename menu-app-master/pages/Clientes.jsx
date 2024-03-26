import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';

export default class Cliente extends React.Component {
  constructor(props) {
    super(props);   

    this.state = {
      loading: false,
      clientes: [],
      filteredClientes: [],
      modalVisible: false,
      nombre: '',
      apellido: '',
      edad: '',
      tipoDocumento: '',
      numDocumento: '',
      correo: '',
      editingClienteId: null,
      isEditing: false,
    };
  }

  componentDidMount() {
    this.getClientes();
  }

  getClientes = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/clientes', {
      method: 'GET', // Método GET
      headers: {
        'Cache-Control': 'no-cache', // Encabezado Cache-Control: no-cache
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          clientes: data,
          filteredClientes: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredClientes = this.state.clientes.filter(cliente => {
      return cliente.nombre.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({ filteredClientes });
  };

  handleDelete = async (clienteId) => {
    try {
      const response = await fetch(`https://localhost:7284/api/clientes/${clienteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
  
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }
  
      // Filtrar los clientes para excluir al cliente eliminado
      const updatedClientes = this.state.clientes.filter(cliente => cliente.clienteId !== clienteId);
      this.setState({
        clientes: updatedClientes,
        filteredClientes: updatedClientes,
      });
  
      console.log('Cliente eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      alert('Error al eliminar el cliente. Por favor, inténtalo de nuevo.');
    }
  };

  handleEdit = clienteId => {
    const cliente = this.state.clientes.find(cliente => cliente.clienteId === clienteId);
    this.setState({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      edad: String(cliente.edad),
      tipoDocumento: cliente.tipoDocumento,
      numDocumento: String(cliente.numDocumento),
      correo: cliente.correo,
      editingClienteId: clienteId,
      modalVisible: true,
      isEditing: true,
    });
  };


  handleSave = async () => {
    const { nombre, apellido, edad, tipoDocumento, numDocumento, correo, editingClienteId } = this.state;
    const data = { 
      nombre,
      apellido,
      edad: parseInt(edad),
      tipoDocumento,
      numDocumento: parseInt(numDocumento),
      correo
    };
  
    // Validaciones de datos
    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
      alert('El nombre solo puede contener letras.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(apellido)) {
      alert('El apellido solo puede contener letras.');
      return;
    }
    if (tipoDocumento !== 'CC' && tipoDocumento !== 'CE') {
      alert('El tipo de documento solo puede ser CC o CE.');
      return;
    }
    if (!/^\d{7,10}$/.test(numDocumento)) {
      alert('El número de documento debe contener entre 7 y 10 dígitos.');
      return;
    }
    if (!/^\d+$/.test(edad) || parseInt(edad) < 18 || parseInt(edad) > 100) {
      alert('La edad debe ser un número entero mayor o igual a 18 y menor a 100');
      return;
    }
    if (!correo.endsWith('@gmail.com')) {
      alert('El correo debe terminar en @gmail.com.');
      return;
    }
  
    const url = editingClienteId ? `https://localhost:7284/api/clientes/${editingClienteId}` : 'https://localhost:7284/api/clientes';
    const method = editingClienteId ? 'PUT' : 'POST';
  
    try {
      // Realiza la solicitud para guardar los cambios
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(data),
      });
    
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }
    
      let responseData; // Define responseData aquí para que esté disponible en todo el bloque try
    
      if (response.status === 204) {
        console.log('No hay contenido para devolver');
      } else {
        responseData = await response.json(); // Asigna el valor de responseData
        console.log('Response:', responseData);
      }
    
      // Si estás guardando un nuevo cliente, agrega el nuevo cliente a la lista actual
      // Si estás editando un cliente existente, actualiza los datos del cliente en la lista
      if (editingClienteId) {
        // Actualiza los datos del cliente en la lista
        const updatedClientes = this.state.clientes.map(cliente => {
          if (cliente.clienteId === editingClienteId) {
            return { ...cliente, ...data };
          }
          return cliente;
        });
        this.setState({
          clientes: updatedClientes,
          filteredClientes: updatedClientes, // Actualiza también los clientes filtrados
        });
      } else {
        // Agrega el nuevo cliente a la lista
        const newCliente = { clienteId: responseData.clienteId, ...data };
        this.setState(prevState => ({
          clientes: [...prevState.clientes, newCliente],
          filteredClientes: [...prevState.clientes, newCliente], // Actualiza también los clientes filtrados
        }));
      }
    
      // Limpia el estado y cierra el modal
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
        successMessage: 'Los cambios se han guardado correctamente',
      });
    
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    }
    
  };
  
  
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          {/*<TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              backgroundColor: '#440000',
              padding: 10,
              borderRadius: 50,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white' }}>Agregar</Text>
          </TouchableOpacity> /*}

          {/* Agregar un View para crear un espacio */}
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
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>EDAD</Text>
              <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>TIPO DE DOCUMENTO</Text>
              <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>NÚMERO DE DOCUMENTO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>CORREO</Text>
              <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
            </View>
            <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.filteredClientes}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.handleEdit(item.clienteId)}>
                  <View style={styles.row}>
                    <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.nombre}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.apellido}</Text>
                    <Text style={[styles.item, { flex: 0.5 }]}>{item.edad}</Text>
                    <Text style={[styles.item, { flex: 1.5 }]}>{item.tipoDocumento}</Text>
                    <Text style={[styles.item, { flex: 1.5 }]}>{item.numDocumento}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.correo}</Text>
                    <View style={[styles.buttonGroup, { flex: 1 }]}>
                      <TouchableOpacity onPress={() => this.handleEdit(item.clienteId)}>
                        <Text style={[styles.button, styles.editButton]}>✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.handleDelete(item.clienteId)}>
                        <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.clienteId}
            />
        </View>

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => {
            // Limpia el estado y cierra el modal
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
              successMessage: '', // Limpiar mensaje de éxito al cerrar el modal
            });
          }}
        >
          <View style={styles.modalContainer}>
            {/* Aquí es donde puedes encontrar los campos de entrada de texto para la edición */}
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
              keyboardType="numeric" // Teclado numérico para la edad
            />
            <TextInput
              placeholder="Tipo de Documento"
              value={this.state.tipoDocumento}
              onChangeText={tipoDocumento => this.setState({ tipoDocumento })}
              style={styles.input}
            />
            <TextInput
              placeholder="Número de Documento"
              value={this.state.numDocumento}
              onChangeText={numDocumento => this.setState({ numDocumento })}
              style={styles.input}
              keyboardType="numeric" // Teclado numérico para el número de documento
            />
            <TextInput
              placeholder="Correo"
              value={this.state.correo}
              onChangeText={correo => this.setState({ correo })}
              style={styles.input}
            />
            {/* Fin de los campos de entrada de texto */}
            
            {/* Botones de guardar y cerrar el modal */}
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
    backgroundColor: '#a9a9a9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#440000',
    borderWidth: 1,
    flex: 1,
    paddingLeft: 10,
    borderRadius: 10,
    color: 'black',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  item: {
    flex: 1,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#440000',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: '#440000',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#440000',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableHeader: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    paddingVertical: 5,
  },
  tableGroupDivider: {
    backgroundColor: '#dcdcdc',
  },
});