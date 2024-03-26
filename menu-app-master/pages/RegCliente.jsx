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
    fetch('https://localhost:7284/api/clientes')
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

  handleEdit = clienteId => {
    const cliente = this.state.clientes.find(cliente => cliente.clienteId === clienteId);
    this.setState({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      edad: String(cliente.edad).toString(), // Convertir la edad a una cadena
      tipoDocumento: cliente.tipoDocumento,
      numDocumento: String(cliente.numDocumento).toString(), // Convertir el número de documento a una cadena
      correo: cliente.correo,
      editingClienteId: clienteId,
      modalVisible: true,
      isEditing: true,
    });
  };

  handleSave = async () => {
    const { nombre, apellido, edad, tipoDocumento, numDocumento, correo, editingClienteId } = this.state;
    const data = { 
      nombre: this.state.nombre,
      apellido: this.state.apellido,
      edad: parseInt(this.state.edad), // Asegúrate de convertir la edad de nuevo a un número antes de enviarla
      tipoDocumento: this.state.tipoDocumento,
      numDocumento: parseInt(this.state.numDocumento), // Asegúrate de convertir el número de documento de nuevo a un número
      correo: this.state.correo 
    };
  
    // Validaciones de datos
    if (!/^[a-zA-Z]+$/.test(nombre)) {
      alert('El nombre solo puede contener letras.');
      return;
    }
    if (!/^[a-zA-Z]+$/.test(apellido)) {
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
  
    try {
      const method = editingClienteId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      // Verifica si la respuesta tiene datos
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }
  
      // Verifica si la respuesta está vacía o no es válida antes de intentar analizarla como JSON
      if (response.status === 204) {
        // Si la respuesta es un código 204 (No Content), significa que la solicitud se realizó con éxito pero no hay contenido para devolver.
        // En este caso, no necesitas analizar la respuesta JSON.
        console.log('No hay contenido para devolver');
      } else {
        // Analiza la respuesta JSON
        const responseData = await response.json();
        console.log('Response:', responseData);
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
        successMessage: 'Los cambios se han guardado correctamente', // Agregar mensaje de éxito
      });
  
      // Actualizar la lista de clientes después de guardar los cambios
      await this.getClientes();
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    }
  };
  
  

  handleDelete = async clienteId => {
    try {
      await fetch(`https://localhost:7284/api/clientes/${clienteId}`, { method: 'DELETE' });
      // Eliminar la fila correspondiente de los datos del cliente y de los clientes filtrados
      const updatedClientes = this.state.clientes.filter(cliente => cliente.clienteId !== clienteId);
      const updatedFilteredClientes = this.state.filteredClientes.filter(cliente => cliente.clienteId !== clienteId);
      this.setState({ clientes: updatedClientes, filteredClientes: updatedFilteredClientes });
    } catch (error) {
      console.error('Error deleting cliente:', error);
    }
  };
  
  
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              backgroundColor: '#440000',
              padding: 10,
              borderRadius: 50,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white' }}>Agregar</Text>
          </TouchableOpacity> 

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