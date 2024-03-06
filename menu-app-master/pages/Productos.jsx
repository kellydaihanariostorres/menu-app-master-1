import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, TouchableOpacity, Modal, ScrollView } from 'react-native';

export default class Productos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      productos: [],
      filteredProductos: [],
      modalVisible: false,
      nombreProducto: '',
      precioProducto: '',
      marcaProducto: '',
      clasificacionProducto: '',
      editingProductoId: null,
    };
  }

  componentDidMount() {
    this.getProductos();
  }

  getProductos = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/productos')
      .then(res => res.json())
      .then(data => {
        this.setState({
          productos: data,
          filteredProductos: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredProductos = this.state.productos.filter(producto => {
      return producto.nombreProducto.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({ filteredProductos });
  };

  handleEdit = productoId => {
    const producto = this.state.productos.find(producto => producto.id === productoId);
    this.setState({
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto,
      marcaProducto: producto.marcaProducto,
      clasificacionProducto: producto.clasificacionProducto,
      editingProductoId: productoId,
      modalVisible: true,
    });
  };

  handleDelete = async productoId => {
    try {
      await fetch(`https://localhost:7284/api/productos/${productoId}`, { method: 'DELETE' });
      this.getProductos();
    } catch (error) {
      console.error('Error deleting producto:', error);
    }
  };

  handleSave = async () => {
    const { nombreProducto, precioProducto, marcaProducto, clasificacionProducto, editingProductoId } = this.state;
    const data = { nombreProducto, precioProducto, marcaProducto, clasificacionProducto };
    const url = editingProductoId ? `https://localhost:7284/api/productos/${editingProductoId}` : 'https://localhost:7284/api/productos';

    try {
      const method = editingProductoId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log('Response:', responseData);
      this.getProductos();
      this.setState({ modalVisible: false, nombreProducto: '', precioProducto: '', marcaProducto: '', clasificacionProducto: '', editingProductoId: null });
    } catch (error) {
      console.error('Error saving producto:', error);
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
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>NOMBRE PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>PRECIO PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>MARCA PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>CLASIFICACIÓN PRODUCTO</Text>
              <View style={[styles.tableHeader, { flex: 3, backgroundColor: '#440000' }]}></View>
            </View>
            <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.filteredProductos}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.handleEdit(item.id)}>
                  <View style={styles.row}>
                    <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.nombreProducto}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.precioProducto}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.marcaProducto}</Text>
                    <Text style={[styles.item, { flex: 3 }]}>{item.clasificacionProducto}</Text>
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
              placeholder="Precio Producto"
              value={this.state.precioProducto}
              onChangeText={precioProducto => this.setState({ precioProducto })}
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
    justifyContent: 'flex-start',
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
    justifyContent: 'flex-end',
    width: '100%', // modified
  },
  button: {
    padding: 5,
    borderRadius: 50,
    textAlign: 'center',
    borderWidth: 1,
    marginLeft: 5,
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
    backgroundColor: '#440000',
    minWidth: 100,
    justifyContent: 'center', // modified
    alignItems: 'center', // modified
  },
  tableGroupDivider: {
    backgroundColor: '#dcdcdc',
  },
});
