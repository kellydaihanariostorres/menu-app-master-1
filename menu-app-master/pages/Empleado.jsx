import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';


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
    };
  }

  componentDidMount() {
    this.getEmpleados();
  }

  getEmpleados = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/empleados', {
      method: 'GET', // Método GET
      headers: {
        'Cache-Control': 'no-cache', // Encabezado Cache-Control: no-cache
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          empleados: data,
          filteredEmpleados: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredEmpleados = this.state.empleados.filter(empleado => {
      return empleado.nombre.toLowerCase().includes(text.toLowerCase());
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

  handleDelete = async (empleadoId) => { 
    try {
      const response = await fetch(`https://localhost:7284/api/empleados/${empleadoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
  
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }
  
      // Filtrar los empleados para excluir al empleado eliminado
      const updatedEmpleados = this.state.empleados.filter(empleado => empleado.empleadoId !== empleadoId);
      this.setState({
        empleados: updatedEmpleados,
        filteredEmpleados: updatedEmpleados,
      });
  
      console.log('Empleado eliminado empleado correctamente');
    } catch (error) {
      console.error('Error al eliminar el empleado:', error);
      alert('Error al eliminar el empleado. Por favor, inténtalo de nuevo.');
    }
  };
  handleSave = async () => {
    const { nombre, apellido, documento, cargo, fechaInicio, fechaFin, sueldo, bodegaId, editingEmpleadoId } = this.state;
    const data = { 
      nombre, 
      apellido, 
      documento, 
      cargo, 
      fechaInicio, 
      fechaFin, 
      sueldo, 
      bodegaId 
    };
  
    //Validacion de datos 
    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
      alert('El nombre solo puede contener letras.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(apellido)) {
      alert('El apellido solo puede contener letras.');
      return;
    }
    if (!/^\d{7,10}$/.test(documento)) {
      alert('El número de documento debe contener entre 7 y 10 dígitos.');
      return;
    }
  
    // Determinar el método HTTP a utilizar según si estamos editando o creando un empleado
    const method = editingEmpleadoId ? 'PUT' : 'POST';
  
    // Construir la URL para la solicitud
    const url = editingEmpleadoId ? `https://localhost:7284/api/empleados/${editingEmpleadoId}` : 'https://localhost:7284/api/empleados';
  
    try {
      // Realizar la solicitud para guardar los cambios
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('La respuesta de la red no estuvo bien');
      }
  
      let responseData; // Define responseData aquí para que esté disponible en todo el bloque try
  
      if (response.status === 204) {
        console.log('No hay contenido para devolver');
      } else {
        responseData = await response.json(); // Asigna el valor de responseData
        console.log('Response:', responseData);
      }
  
      // Si estás guardando un nuevo empleado, agrega el nuevo empleado a la lista actual
      // Si estás editando un empleado existente, actualiza los datos del empleado en la lista
      if (editingEmpleadoId) {
        // Actualiza los datos del empleado en la lista
        const updatedEmpleados = this.state.empleados.map(empleado => {
          if (empleado.empleadoId === editingEmpleadoId) {
            return { ...empleado, ...data };
          }
          return empleado;
        });
        this.setState({
          empleados: updatedEmpleados,
          filteredEmpleados: updatedEmpleados, // Actualiza también los empleadoss filtrados
        });
      } else {
        // Agrega el nuevo empleados a la lista
        const newEmpleado = { EmpleadoeId: responseData.empleadoId, ...data };
        this.setState(prevState => ({
          empleados: [...prevState.empleados, newEmpleado],
          filteredEmpleados: [...prevState.empleados, newEmpleado], // Actualiza también los empleados filtrados
        }));
      }
  
      // Limpia el estado y cierra el modal
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
        editingClienteId: null,
        isEditing: false,
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
              data={this.state.filteredEmpleados}
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
                      <TouchableOpacity onPress={() => this.handleDelete(item.empleadoId)}>
                        <Text style={[styles.button, styles.deleteButton]}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.empleadoId}
            />
          </View>
        

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          onRequestClose={() => {
            // Limpia el estado y cierra el modal
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
              successMessage: '', // Limpiar mensaje de éxito al cerrar el modal
            });
          }}
        >
          <View style={styles.modalContainer}>
             {/* Aquí es donde puedes encontrar los campos de entrada de texto para la edición */}
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
              placeholder="Cargo"
              value={this.state.cargo}
              onChangeText={cargo => this.setState({ cargo })}
              style={styles.input}
            />
            <TextInput
              placeholder="Fecha Inicio"
              value={this.state.fechaInicio}
              onChangeText={fechaInicio => this.setState({ fechaInicio })}
              style={styles.input}
            />
            <TextInput
              placeholder="Fecha Fin"
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
            <TextInput
              placeholder="Bodega ID"
              value={this.state.bodegaId}
              onChangeText={bodegaId => this.setState({ bodegaId })}
              style={styles.input}
            />
             {/* Fin de los campos de entrada de texto */}
            
            {/* Botones de guardar y cerrar el modal */}
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
    borderRadius: 10,
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
    backgroundColor: '#440000',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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

