import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, TouchableOpacity, Modal, ScrollView } from 'react-native';

export default class Proveedores extends React.Component {
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
      telefono: '',
      correo: '',
      nombreEntidadBancaria: '',
      numeroCuentaBancaria: '',
      editingProveedorId: null,
    };
  }

  componentDidMount() {
    this.getProveedores();
  }

  getProveedores = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/proveedores')
      .then(res => res.json())
      .then(data => {
        this.setState({
          proveedores: data,
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
      return proveedor.nombre.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({ filteredProveedores });
  };

  handleEdit = proveedorId => {
    const proveedor = this.state.proveedores.find(proveedor => proveedor.id === proveedorId);
    this.setState({
      nombre: proveedor.nombre,
      numDocumento: proveedor.numDocumento,
      edad: proveedor.edad.toString(),
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      nombreEntidadBancaria: proveedor.nombreEntidadBancaria,
      numeroCuentaBancaria: proveedor.numeroCuentaBancaria.toString(),
      editingProveedorId: proveedorId,
      modalVisible: true,
    });
  };

  handleDelete = async proveedorId => {
    try {
      await fetch(`https://localhost:7284/api/proveedores/${proveedorId}`, { method: 'DELETE' });
      this.getProveedores();
    } catch (error) {
      console.error('Error deleting proveedor:', error);
    }
  };

  handleSave = async () => {
    const { nombre, numDocumento, edad, telefono, correo, nombreEntidadBancaria, numeroCuentaBancaria, editingProveedorId } = this.state;
    const data = { nombre, numDocumento, edad: parseInt(edad), telefono, correo, nombreEntidadBancaria, numeroCuentaBancaria: parseInt(numeroCuentaBancaria) };
    const url = editingProveedorId ? `https://localhost:7284/api/proveedores/${editingProveedorId}` : 'https://localhost:7284/api/proveedores';

    try {
      const method = editingProveedorId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log('Response:', responseData);
      this.getProveedores();
      this.setState({ modalVisible: false, nombre: '', numDocumento: '', edad: '', telefono: '', correo: '', nombreEntidadBancaria: '', numeroCuentaBancaria: '', editingProveedorId: null });
    } catch (error) {
      console.error('Error saving proveedor:', error);
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
              borderRadius: 5,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white' }}>Agregar</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar proveedor"
            onChangeText={this.handleSearch}
          />
        </View>
        <ScrollView horizontal>
          <View>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>NOMBRE</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NÚM. DOCUMENTO</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>EDAD</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>TELÉFONO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>CORREO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>ENTIDAD BANCARIA</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>NÚM. CUENTA BANCARIA</Text>
              <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
            </View>
            <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.filteredProveedores}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.handleEdit(item.id)}>
                  <View style={styles.row}>
                    <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.nombre}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.numDocumento}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.edad}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.telefono}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.correo}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.nombreEntidadBancaria}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.numeroCuentaBancaria}</Text>
                    <View style={[styles.buttonGroup, { flex: 1 }]}>
                      <TouchableOpacity onPress={() => this.handleEdit(item.id)}>
                        <Text style={[styles.button, styles.editButton]}>✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.handleDelete(item.id)}>
                        <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
          </View>
        </ScrollView>

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false })}
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
    borderRadius: 5,
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
    padding: 5,
    borderRadius: 5,
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
    backgroundColor: '#440000',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
