import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, TouchableOpacity, Modal, ScrollView } from 'react-native';

export default class Inventario extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      inventarios: [],
      filteredInventarios: [],
      modalVisible: false,
      nombreProducto: '',
      idProducto: '',
      idFactura: '',
      precioProducto: '',
      cantidadProducto: '',
      marcaProducto: '',
      clasificacionProducto: '',
      editingInventarioId: null,
    };
  }

  componentDidMount() {
    this.getInventarios();
  }

  getInventarios = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/inventarios')
      .then(res => res.json())
      .then(data => {
        this.setState({
          inventarios: data,
          filteredInventarios: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredInventarios = this.state.inventarios.filter(inventario => {
      return inventario.nombreProducto.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({ filteredInventarios });
  };

  handleEdit = id => {
    const inventario = this.state.inventarios.find(inventario => inventario.id === id);
    this.setState({
      nombreProducto: inventario.nombreProducto,
      idProducto: inventario.idProducto,
      idFactura: inventario.idFactura,
      precioProducto: inventario.precioProducto,
      cantidadProducto: inventario.cantidadProducto,
      marcaProducto: inventario.marcaProducto,
      clasificacionProducto: inventario.clasificacionProducto,
      editingInventarioId: id,
      modalVisible: true,
    });
  };

  handleDelete = async id => {
    try {
      await fetch(`https://localhost:7284/api/inventarios/${id}`, { method: 'DELETE' });
      this.getInventarios();
    } catch (error) {
      console.error('Error deleting inventario:', error);
    }
  };

  handleSave = async () => {
    const { nombreProducto, idProducto, idFactura, precioProducto, cantidadProducto, marcaProducto, clasificacionProducto, editingInventarioId } = this.state;
    const data = { nombreProducto, idProducto, idFactura, precioProducto, cantidadProducto, marcaProducto, clasificacionProducto };
    const url = editingInventarioId ? `https://localhost:7284/api/inventarios/${editingInventarioId}` : 'https://localhost:7284/api/inventarios';

    try {
      const method = editingInventarioId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log('Response:', responseData);
      this.getInventarios();
      this.setState({ modalVisible: false, nombreProducto: '', idProducto: '', idFactura: '', precioProducto: '', cantidadProducto: '', marcaProducto: '', clasificacionProducto: '', editingInventarioId: null });
    } catch (error) {
      console.error('Error saving inventario:', error);
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
            placeholder="Buscar producto"
            onChangeText={this.handleSearch}
          />
        </View>
        
          <View>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
              <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>NOMBRE PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>ID PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>ID FACTURA</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>PRECIO PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>CANTIDAD PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>MARCA PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>CLASIFICACIÓN PRODUCTO</Text>
              <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
            </View>
            <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.filteredInventarios}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.handleEdit(item.id)}>
                  <View style={styles.row}>
                    <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 1.5 }]}>{item.nombreProducto}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.idProducto}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.idFactura}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.precioProducto}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.cantidadProducto}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.marcaProducto}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.clasificacionProducto}</Text>
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
       

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Nombre Producto"
              value={this.state.nombreProducto}
              onChangeText={nombreProducto => this.setState({ nombreProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="ID Producto"
              value={this.state.idProducto}
              onChangeText={idProducto => this.setState({ idProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="ID Factura"
              value={this.state.idFactura}
              onChangeText={idFactura => this.setState({ idFactura })}
              style={styles.input}
            />
            <TextInput
              placeholder="Precio Producto"
              value={this.state.precioProducto}
              onChangeText={precioProducto => this.setState({ precioProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="Cantidad Producto"
              value={this.state.cantidadProducto}
              onChangeText={cantidadProducto => this.setState({ cantidadProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="Marca Producto"
              value={this.state.marcaProducto}
              onChangeText={marcaProducto => this.setState({ marcaProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="Clasificación Producto"
              value={this.state.clasificacionProducto}
              onChangeText={clasificacionProducto => this.setState({ clasificacionProducto })}
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
    borderRadius: 50,
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
