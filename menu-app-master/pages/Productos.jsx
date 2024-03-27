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
      cantidadProducto: '',
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
    fetch('https://localhost:7284/api/productos',{
      method: 'GET', // Método GET
      headers: {
        'Cache-Control': 'no-cache', // Encabezado Cache-Control: no-cache
        'Content-Type': 'application/json',
      },
    })
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

  handleDelete = async (productoId) => {
    // Verificar si editingProductoId está definido
    if (!productoId) {
      console.error('El productoId es inválido:', productoId);
      return;
    }
  
    try {
      const response = await fetch(`https://localhost:7284/api/productos/${productoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
  
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }
  
      const updatedProductos = this.state.productos.filter(producto => producto.productoId !== productoId);
      this.setState({
        productos: updatedProductos,
        filteredProductos: updatedProductos,
      });
  
      console.log('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      alert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
    }
  };
  
  

  handleEdit = productoId => {
    const producto = this.state.productos.find(producto => producto.productoId === productoId);
    if (producto) {
      // El producto se encontró, puedes acceder a sus propiedades de forma segura
      this.setState({
        nombreProducto: producto.nombreProducto,
        precioProducto: producto.precioProducto,
        cantidadProducto: String (producto.cantidadProducto),
        marcaProducto: producto.marcaProducto,
        clasificacionProducto: producto.clasificacionProducto,
        editingProductoId: productoId,
        modalVisible: true,
        isEditing: true,
      });
    } else {
      // El producto no se encontró, puedes manejar este caso según sea necesario
      console.log('Producto no encontrado');
    }
  };

  handleSave = async () => {
    const { nombreProducto, precioProducto, cantidadProducto, marcaProducto, clasificacionProducto, editingProductoId } = this.state;
    const data = { 
      nombreProducto, 
      precioProducto, 
      cantidadProducto: parseInt(cantidadProducto),
      marcaProducto, 
      clasificacionProducto };
  
    // Validaciones
    if (!/^[A-Za-z\s]+$/.test(nombreProducto)) {
      alert('Nombre debe contener solo letras y espacios');
      return;
    }
  
     {/*if (!/^(\d{1,3})(\.\d{3})*(\,\d{1,2})?$/.test(precioProducto)) {
      alert('El precio debe tener el formato correcto (ejemplo: 1.000, 10.000, 100.000, etc.)');
      return;
    }*/}
    if (!/^\$?(\d{1,3}(\.\d{1,2})?)+$/.test(precioProducto)) {
      alert('Precio debe estar en formato de precio ($)');
      return;
    }

    if (isNaN(cantidadProducto) || cantidadProducto < 0 || cantidadProducto >1000 ) {
      alert('La cantidad del producto debe ser mayor o igual a 0 y menor que 999');
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
    const method = editingProductoId ? 'PUT' : 'POST';

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
  
      // Verifica si la respuesta tiene datos
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }

      let responseData; 
      // Verifica si la respuesta está vacía o no es válida antes de intentar analizarla como JSON
      if (response.status === 204) {
        // Si la respuesta es un código 204 (No Content), significa que la solicitud se realizó con éxito pero no hay contenido para devolver.
        // En este caso, no necesitas analizar la respuesta JSON.
        console.log('No hay contenido para devolver');
      } else {
        // Analiza la respuesta JSON
        responseData = await response.json(); // Corregido
        console.log('Response:', responseData);
      }

      // Si estás guardando un nuevo producto, agrega el nuevo producto a la lista actual
      // Si estás editando un producto existente, actualiza los datos del producto en la lista
      if (editingProductoId) {
        // Actualiza los datos del producto en la lista
        const updatedProductos = this.state.productos.map(producto => {
          if (producto.productoId === editingProductoId) {
            return { ...producto, ...data };
          }
          return producto;
        });
        this.setState({
          productos: updatedProductos,
          filteredProductos: updatedProductos, // Actualiza también los productos filtrados
        });
      } else {
        // Agrega el nuevo producto a la lista
        const newProducto = { productoId: responseData.productoId, ...data };
        this.setState(prevState => ({
          productos: [...prevState.productos, newProducto],
          filteredProductos: [...prevState.productos, newProducto], // Actualiza también los productos filtrados
        }));
      }
    
  
      // Limpia el estado y cierra el modal
      this.setState({
        modalVisible: false,
        nombreProducto: '',
        precioProducto: '',
        cantidadProducto: '',
        marcaProducto: '',
        clasificacionProducto: '',
        editingProductoId: null,
        isEditing:false,
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
            placeholder="Buscar producto"
            onChangeText={this.handleSearch}
          />
        </View>
        
          <View>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>NOMBRE PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>PRECIO PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>CANTIDAD PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>MARCA PRODUCTO</Text>
              <Text style={[styles.tableHeader, { flex: 3, backgroundColor: '#440000' }]}>CLASIFICACIÓN PRODUCTO</Text>
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
                    <Text style={[styles.item, { flex: 2 }]}>{item.cantidadProducto}</Text>
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
              //keyExtractor={item => item.productoId} 
              keyExtractor={(item, index) => index.toString()}
            />

          </View>
        

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => {
            // Limpia el estado y cierra el modal
            this.setState({ 
              modalVisible: false,
              nombreProducto: '',
              precioProducto: '',
              cantidadProducto: '',
              marcaProducto: '',
              clasificacionProducto: '',
              editingProductoId: null,
              isEditing:false,
              successMessage: '', // Limpiar mensaje de éxito al cerrar el modal
            });
          }}
        >
          <View style={styles.modalContainer}>
            {/* Aquí es donde puedes encontrar los campos de entrada de texto para la edición */}
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
              placeholder="Cantidad"
              value={this.state.cantidadProducto}
              onChangeText={cantidadProducto => this.setState({ cantidadProducto })}
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
            {/* Fin de los campos de entrada de texto */}
            
            {/* Botones de guardar y cerrar el modal */}
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
