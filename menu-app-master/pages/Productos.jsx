import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';

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
      isEditing:false,
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
    const producto = this.state.productos.find(producto => producto.productoId === productoId); // Corrección
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

  handleSave = async () => {
    const { nombreProducto, precioProducto, marcaProducto, clasificacionProducto, editingProductoId } = this.state;
    const data = { nombreProducto, precioProducto, marcaProducto, clasificacionProducto };
  
    // Validaciones
    if (!/^[A-Za-z\s]+$/.test(nombreProducto)) {
      alert('Nombre debe contener solo letras y espacios');
      return;
    }
  
    // Corrección en la expresión regular para el precio
    if (!/^\$?(\d{1,3}(\.\d{1,2})?)+$/.test(precioProducto)) {
      alert('Precio debe estar en formato de precio ($)');
      return;
    }
  
    if (!/^[A-Za-z\s]+$/.test(marcaProducto)) {
      alert('Marca debe contener solo letras y espacios');
      return;
    }
  
    if (!/^[A-Za-z\s]+$/.test(clasificacionProducto)) {
      alert('Clasificación debe contener solo letras y espacios');
      return;
    }
    
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
        nombreProducto: '',
        precioProducto: '',
        marcaProducto: '',
        clasificacionProducto: '',
        editingProductoId: null,
        isEditing:false,
      });
  
      // Actualizar la lista de productos después de guardar los cambios
      await this.getProductos(); // Corrección
    } catch (error) {
      console.error('Error parsing JSON response:', error);
    }
  };

  handleDelete = async productoId => {
    try {
      await fetch(`https://localhost:7284/api/productos/${productoId}`, { method: 'DELETE' });
      
      // Filtrar los productos para excluir el que se está eliminando
      const updatedProductos = this.state.productos.filter(producto => producto.productoId !== productoId);
      const updatedFilteredProductos = this.state.filteredProductos.filter(producto => producto.productoId !== productoId);
      
      // Actualizar el estado con los productos filtrados
      this.setState({ productos: updatedProductos, filteredProductos: updatedFilteredProductos });
    } catch (error) {
      console.error('Error deleting producto:', error);
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
                <TouchableOpacity onPress={() => this.handleEdit(item.productoId)}>
                  <View style={styles.row} key={item.productoId}>
                    <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.nombreProducto}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.precioProducto}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.marcaProducto}</Text>
                    <Text style={[styles.item, { flex: 3 }]}>{item.clasificacionProducto}</Text>
                    <View style={[styles.buttonGroup, { flex: 1 }]}>
                      <TouchableOpacity onPress={() => this.handleEdit(item.productoId)}>
                        <Text style={[styles.button, styles.editButton]}>✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.handleDelete(item.productoId)}>
                        <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => String(item.productoId)} 
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
