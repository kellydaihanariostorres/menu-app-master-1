import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, TouchableOpacity, Modal } from 'react-native';

export default class Bodega extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      bodegas: [],
      filteredBodegas: [],
      modalVisible: false,
      nombre: '',
      direccion: '',
      estado: '',
      ciudad: '',
      editingBodegaId: null,
    };
  }

  componentDidMount() {
    this.getBodegas();
  }

  getBodegas = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/bodegas')
      .then(res => res.json())
      .then(data => {
        this.setState({
          bodegas: data,
          filteredBodegas: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredBodegas = this.state.bodegas.filter(bodega => {
      return bodega.nombre.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({ filteredBodegas });
  };

  handleEdit = bodegaId => {
    const bodega = this.state.bodegas.find(bodega => bodega.bodegaId === bodegaId);
    this.setState({
      nombre: bodega.nombre,
      direccion: bodega.direccion,
      estado: bodega.estado,
      ciudad: bodega.ciudad,
      editingBodegaId: bodegaId,
      modalVisible: true,
    });
  };

  handleDelete = async bodegaId => {
    try {
      await fetch(`https://localhost:7284/api/bodegas/${bodegaId}`, { method: 'DELETE' });
      this.getBodegas();
    } catch (error) {
      console.error('Error deleting bodega:', error);
    }
  };

  handleSave = async () => {
    const { nombre, direccion, estado, ciudad, editingBodegaId } = this.state;
    const data = { nombre, direccion, estado, ciudad };
    const url = editingBodegaId ? `https://localhost:7284/api/bodegas/${editingBodegaId}` : 'https://localhost:7284/api/bodegas';

    try {
      const method = editingBodegaId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log('Response:', responseData);
      this.getBodegas();
      this.setState({ modalVisible: false, nombre: '', direccion: '', estado: '', ciudad: '', editingBodegaId: null });
    } catch (error) {
      console.error('Error saving bodega:', error);
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
            placeholder="Buscar bodega"
            onChangeText={this.handleSearch}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.tableHeader, { backgroundColor: '#440000' }]}>#</Text>
          <Text style={[styles.tableHeader, { backgroundColor: '#440000' }]}>BODEGA</Text>
          <Text style={[styles.tableHeader, { backgroundColor: '#440000' }]}>ESTADO</Text>
          <Text style={[styles.tableHeader, { backgroundColor: '#440000' }]}>DIRECCIÓN</Text>
          <Text style={[styles.tableHeader, { backgroundColor: '#440000' }]}>CIUDAD</Text>
          <View style={[styles.tableHeader, { backgroundColor: '#440000' }]}></View>
        </View>
        <FlatList
          contentContainerStyle={styles.tableGroupDivider}
          data={this.state.filteredBodegas}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => this.handleEdit(item.bodegaId)}>
              <View style={styles.row}>
                <Text style={styles.item}>{index + 1}</Text>
                <Text style={styles.item}>{item.nombre}</Text>
                <Text style={styles.item}>{item.estado}</Text>
                <Text style={styles.item}>{item.direccion}</Text>
                <Text style={styles.item}>{item.ciudad}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity onPress={() => this.handleEdit(item.bodegaId)}>
                    <Text style={[styles.button, styles.editButton]}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.handleDelete(item.bodegaId)}>
                    <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.bodegaId}
        />

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
            placeholder="Dirección"
            value={this.state.direccion}
            onChangeText={direccion => this.setState({ direccion })}
            style={styles.input}
          />
          <TextInput
            placeholder="Estado"
            value={this.state.estado}
            onChangeText={estado => this.setState({ estado })}
            style={styles.input}
          />
          <TextInput
            placeholder="Ciudad"
            value={this.state.ciudad}
            onChangeText={ciudad => this.setState({ ciudad })}
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
    borderRadius: '45px',
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
  },
  button: {
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
    textAlign: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#440000',
    color: 'white',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#440000',
    color: 'white',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
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
  divider: {
    width: 1, // Ancho de la línea vertical
    height: '100%', // Altura igual a la altura del contenedor
    backgroundColor: 'white', // Color de la línea vertical
    marginHorizontal: 5, // Margen horizontal para separar la línea de los elementos
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white', // Color de fondo del modal
    padding: 20, // Espaciado interno del modal
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  buttont: {
    backgroundColor: '#440000', // Color de fondo del botón
    padding: 10, // Espaciado interno del botón
    borderRadius: 5, // Bordes redondeados del botón
    marginBottom: 10, // Espaciado inferior del botón
    width: '100%', // Ancho del botón
    alignItems: 'center', // Alinear contenido del botón al centro
  },
  buttonText: {
    color: 'white', // Color del texto del botón
    fontWeight: 'bold', // Negrita del texto del botón
  },
});
