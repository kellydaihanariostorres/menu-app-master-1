import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';

const apiUrl = 'https://localhost:7284/api/bodegas';

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
      ciudad: '',
      editingBodegaId: null,
      isEditing: false,
    };
  }

  componentDidMount() {
    this.getBodegas();
  }

  getBodegas = () => {
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
    const { bodegas } = this.state;

    const filteredBodegas = bodegas.filter(bodega => {
      return (
        bodega.nombre.toLowerCase().includes(text.toLowerCase()) ||
        bodega.ciudad.toLowerCase().includes(text.toLowerCase())
      );
    });

    this.setState({ filteredBodegas });
  };

  handleEdit = bodegaId => {
    const bodega = this.state.bodegas.find(bodega => bodega.bodegaId === bodegaId);
    this.setState({
      nombre: bodega.nombre,
      direccion: bodega.direccion,
      ciudad: bodega.ciudad,
      editingBodegaId: bodegaId,
      modalVisible: true,
      isEditing: true,
    });
  };

  handleDelete = async bodegaId => {
    try {
      const bodega = this.state.bodegas.find(bodega => bodega.bodegaId === bodegaId);
      const data = {
        nombre: bodega.nombre,
        direccion: bodega.direccion,
        ciudad: bodega.ciudad,
        estado: 'Desactivado',
      };
      await axios.put(`${apiUrl}/${bodegaId}`, data);
      alert(`Bodega desactivada exitosamente`);
      this.getBodegas();
    } catch (error) {
      alert('Error al desactivar la bodega');
      console.error(error);
    }
  };
  
  

  handleAdd = () => {
    this.setState({
      modalVisible: true,
      nombre: '',
      direccion: '',
      ciudad: '',
      editingBodegaId: null,
      isEditing: false,
    });
  };

  handleSave = async () => {
    const { nombre, direccion, ciudad, editingBodegaId, isEditing } = this.state;

    if (!nombre || !direccion || !ciudad) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const data = {
      nombre,
      direccion,
      ciudad,
      estado: 'Activo',
    };

    try {
      let response;
      if (isEditing) {
        response = await axios.put(`${apiUrl}/${editingBodegaId}`, data);
        if (response.status >= 200 && response.status < 300) {
          const updatedBodegas = this.state.bodegas.map(bodega => {
            if (bodega.bodegaId === editingBodegaId) {
              return {
                ...bodega,
                ...data
              };
            }
            return bodega;
          });

          this.setState({
            bodegas: updatedBodegas,
            filteredBodegas: updatedBodegas,
            modalVisible: false,
            nombre: '',
            direccion: '',
            ciudad: '',
            editingBodegaId: null,
            isEditing: false,
          });
          alert('Los datos se han guardado correctamente.');
        } else {
          alert('Error al guardar cambios: ' + response.statusText);
        }
      } else {
        response = await axios.post(apiUrl, data);
        if (response.status >= 200 && response.status < 300) {
          const nuevaBodega = response.data;
          this.setState(prevState => ({
            bodegas: [...prevState.bodegas, nuevaBodega],
            filteredBodegas: [...prevState.filteredBodegas, nuevaBodega],
            modalVisible: false,
            nombre: '',
            direccion: '',
            ciudad: '',
            isEditing: false,
          }));
          alert('Bodega agregada correctamente.');
        } else {
          alert('Error al agregar la bodega: ' + response.statusText);
        }
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error al guardar cambios: ' + error.message);
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
            placeholder="Buscar bodega"
            onChangeText={this.handleSearch}
          />
        </View>

        <View>
          <View style={styles.row}>
            <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NOMBRE</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>DIRECCIÓN</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>CIUDAD</Text>
            <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
          </View>
          <FlatList
            contentContainerStyle={styles.tableGroupDivider}
            data={this.state.filteredBodegas.filter(bodega => bodega.estado === 'Activo')}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => this.handleEdit(item.bodegaId)}>
                <View style={styles.row}>
                  <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.nombre}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.direccion}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.ciudad}</Text>
                  <View style={[styles.buttonGroup, { flex: 1 }]}>
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
            keyExtractor={item => item.bodegaId.toString()}
          />
        </View>

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => {
            this.setState({ 
              modalVisible: false,
              nombre: '',
              direccion: '',
              ciudad: '',
              editingBodegaId: null,
              isEditing: false,
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
              placeholder="Dirección"
              value={this.state.direccion}
              onChangeText={direccion => this.setState({ direccion })}
              style={styles.input}
            />
            <TextInput
              placeholder="Ciudad"
              value={this.state.ciudad}
              onChangeText={ciudad => this.setState({ ciudad })}
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
    backgroundColor: 'black', // Color de fondo del botón
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
