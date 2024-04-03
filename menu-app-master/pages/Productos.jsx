import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';

const apiUrl = 'https://localhost:7284/api/productos';

export default class Producto extends React.Component {
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
      isEditing: false,
    };
  }

  componentDidMount() {
    this.retrieveData();
  }

  retrieveData = async () => {
    try {
      const productos = await AsyncStorage.getItem('productos');

      if (productos !== null) {
        this.setState({
          productos: JSON.parse(productos),
          filteredProductos: JSON.parse(productos),
        });
      } else {
        this.getProductos();
      }
    } catch (error) {
      console.error('Error al recuperar datos de la memoria caché:', error);
      this.getProductos();
    }
  };

  getProductos = () => {
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
        const filteredProductos = data.filter(
          producto => producto.estado === 'Activo'
        );
        this.setState({
          productos: data,
          filteredProductos: filteredProductos,
          loading: false
        });
        AsyncStorage.setItem('productos', JSON.stringify(data));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const { productos } = this.state;
  
    const filteredProductos = productos.filter(producto => {
      return (
        producto.nombreProducto.toLowerCase().includes(text.toLowerCase()) ||
        producto.marcaProducto.toString().toLowerCase().includes(text.toLowerCase())
      );
    });
  
    this.setState({ filteredProductos });
  };

  handleEdit = productoId => {
    const producto = this.state.productos.find(producto => producto.idProducto === productoId);
    this.setState({
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto,
      marcaProducto: producto.marcaProducto,
      clasificacionProducto: producto.clasificacionProducto,
      editingProductoId: productoId,
      modalVisible: true,
      isEditing: true,
    });
  };

  handleDelete = async (productoId, nombreProducto) => {
    try {
      const parametros = { estado: 'Desactivado' };
      await axios.put(`${apiUrl}/${productoId}`, parametros);
      alert(`Producto ${nombreProducto} desactivado exitosamente`);
      this.getProductos();
    } catch (error) {
      alert('Error al desactivar el producto');
      console.error(error);
    }
  };

  handleAdd = () => {
    this.setState({
      modalVisible: true,
      nombreProducto: '',
      precioProducto: '',
      marcaProducto: '',
      clasificacionProducto: '',
      editingProductoId: null,
      isEditing: false,
    });
  };

  handleSave = async () => {
    const {
      nombreProducto,
      precioProducto,
      marcaProducto,
      clasificacionProducto,
      editingProductoId,
      isEditing,
      productos,
    } = this.state;
  
    // Verificar si alguno de los campos está vacío
    if (!nombreProducto || !precioProducto || !marcaProducto || !clasificacionProducto) {
      alert('Por favor, completa todos los campos.');
      return;
    }
  
    const data = {
      nombreProducto,
      precioProducto,
      marcaProducto,
      clasificacionProducto,
      estado: 'Activo',
    };
  
    try {
      let response;
      if (isEditing) {
        // Si estamos editando, hacemos una solicitud PUT
        response = await axios.put(`${apiUrl}/${editingProductoId}`, data);
        if (response.status >= 200 && response.status < 300) {
          // Si la respuesta fue exitosa, actualizamos el estado local con los datos editados
          const updatedProductos = productos.map(producto => {
            if (producto.idProducto === editingProductoId) {
              return {
                ...producto,
                ...data
              };
            }
            return producto;
          });
  
          // Actualizar también filteredProductos si es necesario
          const updatedFilteredProductos = filteredProductos.map(producto => {
            if (producto.idProducto === editingProductoId) {
              return {
                ...producto,
                ...data
              };
            }
            return producto;
          });
  
          this.setState({
            productos: updatedProductos,
            filteredProductos: updatedFilteredProductos,
            modalVisible: false,
            nombreProducto: '',
            precioProducto: '',
            marcaProducto: '',
            clasificacionProducto: '',
            editingProductoId: null,
            isEditing: false,
          });
          alert('Los datos se han guardado correctamente.');
        } else {
          // Si la respuesta del servidor indica un error, mostramos un mensaje apropiado
          alert('Error al guardar cambios: ' + response.statusText);
        }
      } else {
        // Si no, hacemos una solicitud POST para agregar un nuevo producto
        response = await axios.post(apiUrl, data);
        if (response.status >= 200 && response.status < 300) {
          const nuevoProducto = response.data;
          this.setState(prevState => ({
            productos: [...prevState.productos, nuevoProducto],
            filteredProductos: [...prevState.filteredProductos, nuevoProducto],
            modalVisible: false,
            nombreProducto: '',
            precioProducto: '',
            marcaProducto: '',
            clasificacionProducto: '',
            isEditing: false,
          }));
          alert('Producto agregado correctamente.');
        } else {
          alert('Error al agregar producto: ' + response.statusText);
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
            placeholder="Buscar producto"
            onChangeText={this.handleSearch}
          />
        </View>

        <View>
          <View style={styles.row}>
            <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
            <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>NOMBRE</Text>
            <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>PRECIO</Text>
            <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>MARCA</Text>
            <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>CLASIFICACIÓN</Text>
            <View style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}></View>
          </View>
          <FlatList
            contentContainerStyle={styles.tableGroupDivider}
            data={this.state.filteredProductos.filter(producto => producto.estado === 'Activo')}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => this.handleEdit(item.idProducto)}>
                <View style={styles.row}>
                  <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                  <Text style={[styles.item, { flex: 2 }]}>{item.nombreProducto}</Text>
                  <Text style={[styles.item, { flex: 2 }]}>{item.precioProducto}</Text>
                  <Text style={[styles.item, { flex: 2 }]}>{item.marcaProducto}</Text>
                  <Text style={[styles.item, { flex: 2 }]}>{item.clasificacionProducto}</Text>
                  <View style={[styles.buttonGroup, { flex: 2 }]}>
                    <TouchableOpacity onPress={() => this.handleEdit(item.idProducto)}>
                      <Text style={[styles.button, styles.editButton]}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleDelete(item.idProducto, item.nombreProducto)}>
                      <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.idProducto.toString()}
          />
        </View>

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => {
            // Restablecer el estado del formulario al cerrar el modal sin guardar cambios
            this.setState({ 
              modalVisible: false,
              nombreProducto: '',
              precioProducto: '',
              marcaProducto: '',
              clasificacionProducto: '',
              editingProductoId: null,
              isEditing: false,
            });
          }}
        >
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Nombre"
              value={this.state.nombreProducto}
              onChangeText={nombreProducto => this.setState({ nombreProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="Precio"
              value={this.state.precioProducto}
              onChangeText={precioProducto => this.setState({ precioProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="Marca"
              value={this.state.marcaProducto}
              onChangeText={marcaProducto => this.setState({ marcaProducto })}
              style={styles.input}
            />
            <TextInput
              placeholder="Clasificación"
              value={this.state.clasificacionProducto}
              onChangeText={clasificacionProducto => this.setState({ clasificacionProducto })}
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
