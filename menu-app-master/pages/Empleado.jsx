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
    const {
      nombre,
      apellido,
      documento,
      cargo,
      fechaInicio,
      fechaFin,
      sueldo,
      bodegaId,
      editingEmpleadoId,
      isEditing,
      empleados,
      filteredEmpleados
    } = this.state;
  
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
      let response;
      if (isEditing) {
        // Si estamos editando, hacemos una solicitud PUT
        response = await axios.put(`${apiUrl}/${editingEmpleadoId}`, data);
        if (response.status >= 200 && response.status < 300) {
          // Si la respuesta fue exitosa, actualizamos el estado local con los datos editados
          const updatedEmpleados = empleados.map(empleado => {
            if (empleado.empleadoId === editingEmpleadoId) {
              return {
                ...empleado,
                ...data
              };
            }
            return empleado;
          });
  
          // Actualizar también filteredEmpleados si es necesario
          const updatedFilteredEmpleados = filteredEmpleados.map(empleado => {
            if (empleado.empleadoId === editingEmpleadoId) {
              return {
                ...empleado,
                ...data
              };
            }
            return empleado;
          });
  
          this.setState({
            empleados: updatedEmpleados,
            filteredEmpleados: updatedFilteredEmpleados,
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
          });
          alert('Los datos se han guardado correctamente.');
        } else {
          // Si la respuesta del servidor indica un error, mostramos un mensaje apropiado
          alert('Error al guardar cambios: ' + response.statusText);
        }
      } else {
        // Si no, hacemos una solicitud POST para agregar un nuevo empleado
        response = await axios.post(apiUrl, data);
        if (response.status >= 200 && response.status < 300) {
          const nuevoEmpleado = response.data;
          this.setState(prevState => ({
            empleados: [...prevState.empleados, nuevoEmpleado],
            filteredEmpleados: [...prevState.filteredEmpleados, nuevoEmpleado],
            modalVisible: false,
            nombre: '',
            apellido: '',
            documento: '',
            cargo: '',
            fechaInicio: '',
            fechaFin: '',
            sueldo: '',
            bodegaId: '',
            isEditing: false,
          }));
          alert('Empleado agregado correctamente.');
        } else {
          alert('Error al agregar empleado: ' + response.statusText);
        }
      }
    } catch (error) {
      // Manejo de errores
      console.error('Error saving changes:', error);
      alert('Error al guardar cambios: ' + error.message); // Mostramos el mensaje de error recibido
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
