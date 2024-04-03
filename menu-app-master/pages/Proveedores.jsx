import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';

const apiUrl = 'https://localhost:7284/api/proveedor';

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

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        const filteredProveedores = data.filter(
          proveedor => proveedor.estado === 'Activo'
        );
        this.setState({
          proveedores: data,
          filteredProveedores: filteredProveedores,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const { proveedores } = this.state;

    const filteredProveedores = proveedores.filter(proveedor => {
      return (
        proveedor.nombre.toLowerCase().includes(text.toLowerCase()) ||
        proveedor.numDocumento.toString().toLowerCase().includes(text.toLowerCase())
      );
    });

    this.setState({ filteredProveedores });
  };

  handleEdit = proveedorId => {
    const proveedor = this.state.proveedores.find(proveedor => proveedor.idProveedor === proveedorId);
    this.setState({
      nombre: proveedor.nombre,
      numDocumento: proveedor.numDocumento.toString(),
      edad: proveedor.edad.toString(),
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      nombreEntidadBancaria: proveedor.nombreEntidadBancaria,
      numeroCuentaBancaria: proveedor.numeroCuentaBancaria.toString(),
      editingProveedorId: proveedorId,
      modalVisible: true,
      isEditing: true,
    });
  };

  handleDelete = async (proveedorId, nombre, numDocumento, edad, direccion, telefono, correo, nombreEntidadBancaria, numeroCuentaBancaria) => {
    try {
      const parametros = { nombre, numDocumento, edad, direccion, telefono, correo, nombreEntidadBancaria, numeroCuentaBancaria, estado: 'Desactivado' };
      await axios.put(`${apiUrl}/${proveedorId}`, parametros);
      alert(`Proveedor ${nombre} desactivado exitosamente`);
      this.getProveedores();
    } catch (error) {
      alert('Error al desactivar al proveedor');
      console.error(error);
    }
  };

  handleAdd = () => {
    this.setState({
      modalVisible: true,
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
    });
  };

  handleSave = async () => {
    const {
      nombre,
      numDocumento,
      edad,
      direccion,
      telefono,
      correo,
      nombreEntidadBancaria,
      numeroCuentaBancaria,
      editingProveedorId,
      isEditing,
      proveedores,
      filteredProveedores
    } = this.state;

    // Verificar si alguno de los campos está vacío
    if (!nombre || !numDocumento || !edad || !direccion || !telefono || !correo || !nombreEntidadBancaria || !numeroCuentaBancaria) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const data = {
      nombre,
      numDocumento: parseInt(numDocumento),
      edad: parseInt(edad),
      direccion,
      telefono,
      correo,
      nombreEntidadBancaria,
      numeroCuentaBancaria: parseInt(numeroCuentaBancaria),
      estado: 'Activo',
    };

    try {
      let response;
      if (isEditing) {
        // Si estamos editando, hacemos una solicitud PUT
        response = await axios.put(`${apiUrl}/${editingProveedorId}`, data);
        if (response.status >= 200 && response.status < 300) {
          // Si la respuesta fue exitosa, actualizamos el estado local con los datos editados
          const updatedProveedores = proveedores.map(proveedor => {
            if (proveedor.idProveedor === editingProveedorId) {
              return {
                ...proveedor,
                ...data
              };
            }
            return proveedor;
          });

          // Actualizar también filteredProveedores si es necesario
          const updatedFilteredProveedores = filteredProveedores.map(proveedor => {
            if (proveedor.idProveedor === editingProveedorId) {
              return {
                ...proveedor,
                ...data
              };
            }
            return proveedor;
          });

          this.setState({
            proveedores: updatedProveedores,
            filteredProveedores: updatedFilteredProveedores,
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
          });
          alert('Los datos se han guardado correctamente.');
        } else {
          // Si la respuesta del servidor indica un error, mostramos un mensaje apropiado
          alert('Error al guardar cambios: ' + response.statusText);
        }
      } else {
        // Si no, hacemos una solicitud POST para agregar un nuevo proveedor
        response = await axios.post(apiUrl, data);
        if (response.status >= 200 && response.status < 300) {
          const nuevoProveedor = response.data;
          this.setState(prevState => ({
            proveedores: [...prevState.proveedores, nuevoProveedor],
            filteredProveedores: [...prevState.filteredProveedores, nuevoProveedor],
            modalVisible: false,
            nombre: '',
            numDocumento: '',
            edad: '',
            direccion: '',
            telefono: '',
            correo: '',
            nombreEntidadBancaria: '',
            numeroCuentaBancaria: '',
            isEditing: false,
          }));
          alert('Proveedor agregado correctamente.');
        } else {
          alert('Error al agregar proveedor: ' + response.statusText);
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
            placeholder="Buscar proveedor"
            onChangeText={this.handleSearch}
          />
        </View>

        <View>
          <View style={styles.row}>
            <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NOMBRE</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NUM. DOCUMENTO</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>EDAD</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>DIRECCIÓN</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>TELÉFONO</Text>
            <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>CORREO</Text>
            <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>ENTIDAD BANCARIA</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>CUENTA BANCARIA</Text>
            <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
          </View>
          <FlatList
            contentContainerStyle={styles.tableGroupDivider}
            data={this.state.filteredProveedores.filter(proveedor => proveedor.estado === 'Activo')}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => this.handleEdit(item.idProveedor)}>
                <View style={styles.row}>
                  <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.nombre}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.numDocumento}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.edad}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.direccion}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.telefono}</Text>
                  <Text style={[styles.item, { flex: 1.5 }]}>{item.correo}</Text>
                  <Text style={[styles.item, { flex: 1.5 }]}>{item.nombreEntidadBancaria}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.numeroCuentaBancaria}</Text>
                  <View style={[styles.buttonGroup, { flex: 1 }]}>
                    <TouchableOpacity onPress={() => this.handleEdit(item.idProveedor)}>
                      <Text style={[styles.button, styles.editButton]}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleDelete(item.idProveedor, item.nombre, item.numDocumento, item.edad, item.direccion, item.telefono, item.correo, item.nombreEntidadBancaria, item.numeroCuentaBancaria)}>
                      <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.idProveedor.toString()}
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
              numDocumento: '',
              edad: '',
              direccion: '',
              telefono: '',
              correo: '',
              nombreEntidadBancaria: '',
              numeroCuentaBancaria: '',
              editingProveedorId: null,
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
              placeholder="Número de Documento"
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
              placeholder="Dirección"
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
              placeholder="Número de Cuenta Bancaria"
              value={this.state.numeroCuentaBancaria}
              onChangeText={numeroCuentaBancaria => this.setState({ numeroCuentaBancaria })}
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
    borderRadius: '10px',
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
