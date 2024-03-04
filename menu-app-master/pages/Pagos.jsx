import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, TouchableOpacity, Modal, ScrollView } from 'react-native';

export default class Nomina extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      nominas: [],
      filteredNominas: [],
      modalVisible: false,
      cuentaBancaria: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaCreacion: '',
      editingNominaId: null,
    };
  }

  componentDidMount() {
    this.getNominas();
  }

  getNominas = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/nomina')
      .then(res => res.json())
      .then(data => {
        this.setState({
          nominas: data,
          filteredNominas: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredNominas = this.state.nominas.filter(nomina => {
      return nomina.cuentaBancaria.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({ filteredNominas });
  };

  handleEdit = nominaId => {
    const nomina = this.state.nominas.find(nomina => nomina.nominaId === nominaId);
    this.setState({
      cuentaBancaria: nomina.cuentaBancaria,
      email: nomina.email,
      telefono: nomina.telefono,
      direccion: nomina.direccion,
      fechaCreacion: nomina.fechaCreacion,
      editingNominaId: nominaId,
      modalVisible: true,
    });
  };

  handleDelete = async nominaId => {
    try {
      await fetch(`https://localhost:7284/api/nomina/${nominaId}`, { method: 'DELETE' });
      this.getNominas();
    } catch (error) {
      console.error('Error deleting nomina:', error);
    }
  };

  handleSave = async () => {
    const { cuentaBancaria, email, telefono, direccion, fechaCreacion, editingNominaId } = this.state;
    const data = { cuentaBancaria, email, telefono, direccion, fechaCreacion };
    const url = editingNominaId ? `https://localhost:7284/api/nomina/${editingNominaId}` : 'https://localhost:7284/api/nomina';

    try {
      const method = editingNominaId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log('Response:', responseData);
      this.getNominas();
      this.setState({ modalVisible: false, cuentaBancaria: '', email: '', telefono: '', direccion: '', fechaCreacion: '', editingNominaId: null });
    } catch (error) {
      console.error('Error saving nomina:', error);
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
            placeholder="Buscar cuenta bancaria"
            onChangeText={this.handleSearch}
          />
        </View>
        <ScrollView horizontal>
          <View>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>CUENTA BANCARIA</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>EMAIL</Text>
              <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>TELÉFONO</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>DIRECCIÓN</Text>
              <Text style={[styles.tableHeader, { flex: 2, backgroundColor: '#440000' }]}>FECHA DE CREACIÓN</Text>
              <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
            </View>
            <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.filteredNominas}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.handleEdit(item.nominaId)}>
                  <View style={styles.row}>
                    <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.cuentaBancaria}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.email}</Text>
                    <Text style={[styles.item, { flex: 1.5 }]}>{item.telefono}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.direccion}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.fechaCreacion}</Text>
                    <View style={[styles.buttonGroup, { flex: 1 }]}>
                      <TouchableOpacity onPress={() => this.handleEdit(item.nominaId)}>
                        <Text style={[styles.button, styles.editButton]}>✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.handleDelete(item.nominaId)}>
                        <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.nominaId}
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
              placeholder="Cuenta Bancaria"
              value={this.state.cuentaBancaria}
              onChangeText={cuentaBancaria => this.setState({ cuentaBancaria })}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={this.state.email}
              onChangeText={email => this.setState({ email })}
              style={styles.input}
            />
            <TextInput
              placeholder="Teléfono"
              value={this.state.telefono}
              onChangeText={telefono => this.setState({ telefono })}
              style={styles.input}
            />
            <TextInput
              placeholder="Dirección"
              value={this.state.direccion}
              onChangeText={direccion => this.setState({ direccion })}
              style={styles.input}
            />
            <TextInput
              placeholder="Fecha de Creación"
              value={this.state.fechaCreacion}
              onChangeText={fechaCreacion => this.setState({ fechaCreacion })}
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
