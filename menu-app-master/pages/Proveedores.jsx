import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';

export default class Proveedor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      proveedores: [],
      filteredProveedores: [],
      modalVisible: false,
      nombre: '',
      numDocumento: '',
      edad: '',
      direccion: '',
      telefono: '',
      correo: '',
      nombreEntidadBancaria: '',
      numeroCuentaBancaria: '',
      editingProveedorId: null,
      isEditing: false,
    };
  }

  componentDidMount() {
    this.getProveedores();
  }

  getProveedores = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/proveedor', {
      method: 'GET', // Método GET
      headers: {
        'Cache-Control': 'no-cache', // Encabezado Cache-Control: no-cache
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          bodegas: data,
          filteredProveedores: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredProveedores = this.state.proveedores.filter(proveedor => {
      if (proveedor && proveedor.nombre) {
        return proveedor.nombre.toLowerCase().includes(text.toLowerCase());
      }
      return false;
    });
    this.setState({ filteredProveedores });
  };
  

  handleDelete = async (proveedorId) => {
    try {
      const response = await fetch(`https://localhost:7284/api/proveedor/${proveedorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
  
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }
  
      // Filtrar los proveedores para excluir al proveedor eliminado
      const updatedProveedores = this.state.proveedores.filter(proveedor => proveedor.proveedorId !== proveedorId);
      this.setState({
        proveedores: updatedProveedores,
        filteredProveedores: updatedProveedores,
      });
  
      console.log('Proveedor eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el proveedor:', error);
      alert('Error al eliminar el proveedor. Por favor, inténtalo de nuevo.');
    }
  };

  
  handleEdit = proveedorId => {
    const proveedor = this.state.proveedores.find(proveedor => proveedor.proveedorId === clienteId);
    this.setState({
      nombre: proveedor.nombre,
      numDocumento: String(proveedor.numDocumento),
      edad: String(proveedor.edad),
      direccion: proveedor.direccion, 
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      nombreEntidadBancaria: proveedor.nombreEntidadBancaria,
      numeroCuentaBancaria: String(proveedor.numeroCuentaBancaria),
      editingProveedorId: proveedorId,
      modalVisible: true,
      isEditing: true,
    });
  };


  handleSave = async () => {
    const { nombre, numDocumento, edad, direccion, telefono, correo, nombreEntidadBancaria, numeroCuentaBancaria, editingProveedorId } = this.state;  
    const data = {
      nombre,
      numDocumento: parseInt(numDocumento),
      edad: parseInt(edad),
      direccion,
      telefono,
      correo,
      nombreEntidadBancaria,
      numeroCuentaBancaria: parseInt(numeroCuentaBancaria)
    };

    //validacion de datos
  
    const url = editingProveedorId ? `https://localhost:7284/api/proveedor/${editingProveedorId}` : 'https://localhost:7284/api/proveedor';
    const method = editingProveedorId ? 'PUT' : 'POST';
  
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
  
      let responseData;
  
      if (response.status === 204) {
        console.log('No hay contenido para devolver');
      } else {
        responseData = await response.json(); // Asigna el valor de responseData
        console.log('Response:', responseData);
      }
  
      if (editingProveedorId) {
        // Actualiza los datos del proveedor en la lista
        const updatedProveedores = proveedores.map(proveedor => {
          if (proveedor.proveedorId === editingProveedorId) {
            return { ...proveedor, ...data };
          }
          return proveedor;
        });
        this.setState({
          proveedores: updatedProveedores,
          filteredProveedores: updatedProveedores, // Actualiza también los proveedores filtrados
        });
      } else {
        // Agrega el nuevo Proveedor a la lista
        const newProveedor = { proveedorId: responseData.proveedorId, ...data };
        this.setState(prevState => ({
          proveedores: [...prevState.proveedores, newProveedor], // Agrega el nuevo proveedor a la lista existente
          filteredProveedores: [...prevState.proveedores, newProveedor], // Actualiza también los Proveedores filtrados
        }));
      }
  
      // Limpia el estado y cierra el modal 
      this.setState({
        modalVisible: false,
        nombre: '',
        numDocumento: '',
        edad: '',
        direccion: '',
        telefono: '',
        correo: '',
        nombreEntidadBancaria: '',
        numeroCuentaBancaria: '',
        editingProveedorId: null,
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
            placeholder="Buscar proveedor"
            onChangeText={this.handleSearch}
          />
        </View>
        
        <View>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NOMBRE</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NÚM. DOCUMENTO</Text>
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>EDAD</Text>
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>DIRECCION</Text>
              <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>TÉLEFONO</Text>
              <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>CORREO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>ENTIDAD BANCARIA</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>NÚM. CUENTA BANCARIA</Text>
              <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
            </View>
            <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.filteredProveedores}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.handleEdit(item.proveedorId)}>
                  <View style={styles.row} key={item.proveedorId}>
                    <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.nombre}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.numDocumento}</Text>
                    <Text style={[styles.item, { flex: 0.5 }]}>{item.edad}</Text>
                    <Text style={[styles.item, { flex: 1.5 }]}>{item.direccion}</Text>
                    <Text style={[styles.item, { flex: 1.5 }]}>{item.telefono}</Text>
                    <Text style={[styles.item, { flex: 1.5 }]}>{item.correo}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.nombreEntidadBancaria}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.numeroCuentaBancaria}</Text>
                    <View style={[styles.buttonGroup, { flex: 1 }]}>
                      <TouchableOpacity onPress={() => this.handleEdit(item.proveedorId)}>
                        <Text style={[styles.button, styles.editButton]}>✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.handleDelete(item.proveedorId)}>
                        <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => item.proveedorId ? item.proveedorId.toString() : index.toString()}

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
                numDocumento: '',
                edad: '',
                direccion: '',
                telefono: '',
                correo: '',
                nombreEntidadBancaria: '',
                numeroCuentaBancaria: '',
                editingClienteId: null, 
                isEditing: false, 
                successMessage: '', // Limpiar mensaje de éxito al cerrar el modal
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
                  placeholder="Núm. Documento"
                  value={this.state.numDocumento}
                  onChangeText={numDocumento => this.setState({ numDocumento })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Edad"
                  value={this.state.edad}
                  onChangeText={edad => this.setState({ edad })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Direccion"
                  value={this.state.direccion}
                  onChangeText={direccion => this.setState({ direccion })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Teléfono"
                  value={this.state.telefono}
                  onChangeText={telefono => this.setState({ telefono })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Correo"
                  value={this.state.correo}
                  onChangeText={correo => this.setState({ correo })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Nombre Entidad Bancaria"
                  value={this.state.nombreEntidadBancaria}
                  onChangeText={nombreEntidadBancaria => this.setState({ nombreEntidadBancaria })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Número Cuenta Bancaria"
                  value={this.state.numeroCuentaBancaria}
                  onChangeText={numeroCuentaBancaria => this.setState({ numeroCuentaBancaria })}
                  style={styles.input}
                />
            <TouchableOpacity onPress={this.handleSave} style={styles.buttont}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ modalVisible: false })} style={styles.buttont}>
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
    color :'black',
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
    padding: 5,
    borderRadius: 5, // Ajuste: Cambiar a 5 para que sea ovalado
    textAlign: 'center',
    borderWidth: 1,
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
  buttont: {
    backgroundColor: '#440000', // Color de fondo del botón
    padding: 10, // Espaciado interno del botón
    borderRadius: 50, // Bordes redondeados del botón
    marginBottom: 10, // Espaciado inferior del botón
    width: '40%', // Ancho del botón
    alignItems: 'center', // Alinear contenido del botón al centro
  },
  buttonText: {
    color: 'white', // Color del texto del botón
    fontWeight: 'bold', // Negrita del texto del botón
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
