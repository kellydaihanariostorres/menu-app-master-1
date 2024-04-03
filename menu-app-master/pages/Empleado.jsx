import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Picker } from 'react-native';
import moment from 'moment';
import axios from 'axios';

// Aquí va el bloque de código corregido para AsyncStorage
let AsyncStorage;
if (typeof window !== 'undefined') {
  AsyncStorage = require('react-native').AsyncStorage;
} else {
  AsyncStorage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(null),
    removeItem: () => Promise.resolve(null),
  };
}


const apiUrl = 'https://localhost:7284/api/empleados';

export default class Empleado extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      empleados: [],
      filteredEmpleados: [],
      modalVisible: false,
      nombre: '',
      apellido: '',
      documento: '',
      cargo: '',
      fechaInicio: '',
      fechaFin: '',
      sueldo: '',
      bodegaId: '',
      editingEmpleadoId: null,
      isEditing: false,
      bodegas: [],
    };
  }

  componentDidMount() {
    this.retrieveData();
  }

  retrieveData = async () => {
    try {
      const empleados = await AsyncStorage.getItem('empleados');
      const bodegas = await AsyncStorage.getItem('bodegas');

      if (empleados !== null && bodegas !== null) {
        this.setState({
          empleados: JSON.parse(empleados),
          filteredEmpleados: JSON.parse(empleados),
          bodegas: JSON.parse(bodegas),
        });
      } else {
        this.getEmpleados();
        this.getBodegas();
      }
    } catch (error) {
      console.error('Error al recuperar datos de la memoria caché:', error);
      this.getEmpleados();
      this.getBodegas();
    }
  };

  getEmpleados = () => {
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
        const filteredEmpleados = data.filter(
          empleado => empleado.estado === 'Activo'
        );
        this.setState({
          empleados: data,
          filteredEmpleados: filteredEmpleados,
          loading: false
        });
        AsyncStorage.setItem('empleados', JSON.stringify(data));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };
  

  getBodegas = () => {
    fetch('https://localhost:7284/api/bodegas', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        const activeBodegas = data.filter(bodega => bodega.estado === 'Activo');
        this.setState({
          bodegas: activeBodegas,
        });
        AsyncStorage.setItem('bodegas', JSON.stringify(data));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  handleSearch = text => {
    const { empleados } = this.state;
  
    const filteredEmpleados = empleados.filter(empleado => {
      return (
        empleado.nombre.toLowerCase().includes(text.toLowerCase()) ||
        empleado.documento.toString().toLowerCase().includes(text.toLowerCase())
      );
    });
  
    this.setState({ filteredEmpleados });
  };

  handleEdit = empleadoId => {
    const empleado = this.state.empleados.find(empleado => empleado.empleadoId === empleadoId);
    this.setState({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      documento: empleado.documento,
      cargo: empleado.cargo,
      fechaInicio: empleado.fechaInicio,
      fechaFin: empleado.fechaFin,
      sueldo: empleado.sueldo,
      bodegaId: empleado.bodegaId,
      editingEmpleadoId: empleadoId,
      modalVisible: true,
      isEditing: true,
    });
  };
  
  

  handleDelete = async (empleadoId, nombre, apellido, documento, cargo, fechaInicio, fechaFin, sueldo, bodegaId) => {
    try {
      const parametros = { nombre, apellido, documento, cargo, fechaInicio, fechaFin, sueldo, bodegaId, estado: 'Desactivado' };
      await axios.put(`${apiUrl}/${empleadoId}`, parametros);
      alert(`Empleado ${nombre} desactivado exitosamente`);
      this.getEmpleados();
    } catch (error) {
      alert('Error al desactivar al empleado');
      console.error(error);
    }
  };

  handleAdd = () => {
    this.setState({
      modalVisible: true,
      nombre: '',
      apellido: '',
      documento: '',
      cargo: '',
      fechaInicio: '',
      fechaFin: '',
      sueldo: '',
      bodegaId: '',
      editingEmpleadoId: null,
      isEditing: false,
    });
  };

  handleSave = async () => {
    const { nombre, apellido, documento, cargo, fechaInicio, fechaFin, sueldo, bodegaId } = this.state;
    
    // Verificar si alguno de los campos está vacío
    if (!nombre || !apellido || !documento || !cargo || !fechaInicio || !fechaFin || !sueldo || !bodegaId) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const data = {
      nombre,
      apellido,
      documento,
      cargo,
      fechaInicio,
      fechaFin,
      sueldo,
      bodegaId,
      estado: 'Activo',
    };

    try {
      const response = await axios.post(apiUrl, data);
      if (response.status === 201) {
        // Si la respuesta es 201, el registro se ha creado exitosamente
        const nuevoEmpleado = response.data;
        this.setState(prevState => ({
          empleados: [...prevState.empleados, nuevoEmpleado],
          filteredEmpleados: [...prevState.filteredEmpleados, nuevoEmpleado],
        }));
        // Mostrar mensaje de éxito
        alert('Nuevo registro agregado exitosamente');
      } else {
        // Si la respuesta no es 201, mostrar un mensaje de error
        throw new Error('La respuesta del servidor no fue exitosa');
      }

      this.setState({
        modalVisible: false,
        nombre: '',
        apellido: '',
        documento: '',
        cargo: '',
        fechaInicio: '',
        fechaFin: '',
        sueldo: '',
        bodegaId: '',
        successMessage: 'Los cambios se han guardado correctamente',
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      // No mostrar la alerta de error aquí
    }
  };

  render() {
    const opcionesCargo = [
      { label: 'Seleccionar Cargo', value: '' },
      { label: 'Almacenista', value: 'Almacenista' },
      { label: 'Recepcionista de mercancía', value: 'Recepcionista de mercancía' },
      { label: 'Supervisor de calidad', value: 'Supervisor de calidad' },
      { label: 'Técnico de mantenimiento', value: 'Técnico de mantenimiento' },
      { label: 'Coordinador de logística', value: 'Coordinador de logística' },
      { label: 'Jefe de bodega', value: 'Jefe de bodega' },
      { label: 'Operario de montacargas', value: 'Operario de montacargas' },
      { label: 'Empacador', value: 'Empacador' },
    ];

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
            placeholder="Buscar empleado"
            onChangeText={this.handleSearch}
          />
        </View>

        <View>
          <View style={styles.row}>
            <Text style={[styles.tableHeader, { flex: 0.5, backgroundColor: '#440000' }]}>#</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>NOMBRE</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>APELLIDO</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>DOCUMENTO</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>CARGO</Text>
            <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>FECHA INICIO</Text>
            <Text style={[styles.tableHeader, { flex: 1.5, backgroundColor: '#440000' }]}>FECHA FIN</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>SUELDO</Text>
            <Text style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}>BODEGA ID</Text>
            <View style={[styles.tableHeader, { flex: 1, backgroundColor: '#440000' }]}></View>
          </View>
          <FlatList
            contentContainerStyle={styles.tableGroupDivider}
            data={this.state.filteredEmpleados.filter(empleado => empleado.estado === 'Activo')}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => this.handleEdit(item.empleadoId)}>
                <View style={styles.row}>
                  <Text style={[styles.item, { flex: 0.5 }]}>{index + 1}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.nombre}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.apellido}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.documento}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.cargo}</Text>
                  <Text style={[styles.item, { flex: 1.5 }]}>{item.fechaInicio}</Text>
                  <Text style={[styles.item, { flex: 1.5 }]}>{item.fechaFin}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.sueldo}</Text>
                  <Text style={[styles.item, { flex: 1 }]}>{item.bodegaId}</Text>
                  <View style={[styles.buttonGroup, { flex: 1 }]}>
                    <TouchableOpacity onPress={() => this.handleEdit(item.empleadoId)}>
                      <Text style={[styles.button, styles.editButton]}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleDelete(item.empleadoId, item.nombre, item.apellido, item.documento, item.cargo, item.fechaInicio, item.fechaFin, item.sueldo, item.bodegaId)}>
                      <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.empleadoId.toString()}
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
              apellido: '',
              documento: '',
              cargo: '',
              fechaInicio: '',
              fechaFin: '',
              sueldo: '',
              bodegaId: '',
              editingEmpleadoId: null,
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
              placeholder="Apellido"
              value={this.state.apellido}
              onChangeText={apellido => this.setState({ apellido })}
              style={styles.input}
            />
            <TextInput
              placeholder="Documento"
              value={this.state.documento}
              onChangeText={documento => this.setState({ documento })}
              style={styles.input}
            />
            <TextInput
              placeholder="Fecha Inicio (DD/MM/AAAA)"
              value={this.state.fechaInicio}
              onChangeText={fechaInicio => this.setState({ fechaInicio })}
              style={styles.input}
            />
            <TextInput
              placeholder="Fecha Fin (DD/MM/AAAA)"
              value={this.state.fechaFin}
              onChangeText={fechaFin => this.setState({ fechaFin })}
              style={styles.input}
            />
            <TextInput
              placeholder="Sueldo"
              value={this.state.sueldo}
              onChangeText={sueldo => this.setState({ sueldo })}
              style={styles.input}
            />
            <Picker
              selectedValue={this.state.bodegaId}
              style={styles.input}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ bodegaId: itemValue })
              }>
              <Picker.Item label="Seleccionar Bodega" value="" />
              {this.state.bodegas.map((bodega, index) => (
                <Picker.Item key={index} label={bodega.nombre} value={bodega.bodegaId} />
              ))}
            </Picker>
            <Picker
              selectedValue={this.state.cargo}
              style={styles.input}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ cargo: itemValue })
              }>
              {opcionesCargo.map((cargo, index) => (
                <Picker.Item key={index} label={cargo.label} value={cargo.value} />
              ))}
            </Picker>
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
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchInput: {
    backgroundColor: 'white',
    flex: 1,
    paddingLeft: 10,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  input: {
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#440000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tableGroupDivider: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#440000',
    borderRadius: 5,
    marginRight: 5,
  },
  tableHeader: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#440000',
    borderRadius: 5,
    marginRight: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#6a6aff',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#ff6a6a',
    marginLeft: 5,
  },
});
