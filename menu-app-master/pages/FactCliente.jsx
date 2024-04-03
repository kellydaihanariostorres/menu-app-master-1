import React, { Component } from 'react';
import { View, Text, Modal, Button, FlatList, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';

class ManageFacturas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      facturas: [],
      detalleFactura: null,
      cacheKey: '',
      currentPage: 1,
      itemsPerPage: 5,
      searchTerm: '',
      productos: [],
    };
  }

  componentDidMount() {
    this.getFacturas();
    this.getProductos();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchTerm !== this.state.searchTerm || prevState.cacheKey !== this.state.cacheKey) {
      this.getFacturas();
    }
  }

  getProductos = async () => {
    try {
      const response = await axios.get('https://localhost:7284/api/productos');
      this.setState({ productos: response.data });
    } catch (error) {
      console.error(error);
    }
  };

  getFacturas = async () => {
    try {
      const { cacheKey, searchTerm } = this.state;
      const response = await axios.get(`https://localhost:7284/api/factura?cacheKey=${cacheKey}&forceRefresh=${Date.now()}`);
      const filterFactura = response.data.filter(
        (factura) => factura.estado !== 'Desactivado' && !localStorage.getItem(`eliminado_${factura.idFactura}`)
      );

      const filteredFacturas = searchTerm ? filterFactura.filter(factura => factura.clienteId.toLowerCase().includes(searchTerm.toLowerCase())) : filterFactura;

      this.setState({ facturas: filteredFacturas });
    } catch (error) {
      console.error(error);
    }
  };

  showDetalleFactura = async (facturaId) => {
    try {
      const { productos, facturas } = this.state;
      const detallesResponse = await axios.get(`https://localhost:7284/api/DetalleFactura?idFactura=${facturaId}`);
      const detalles = detallesResponse.data;
      const detallesConNombres = await Promise.all(detalles.map(async (detalle) => {
        if (productos.length > 0) {
          const producto = productos.find(producto => producto.idProducto === detalle.idProducto);
          const nombreProducto = producto ? producto.nombreProducto : 'Nombre no encontrado';
          return { ...detalle, nombreProducto };
        } else {
          return { ...detalle, nombreProducto: 'Nombre no encontrado' };
        }
      }));

      const detallesFacturaSeleccionada = detallesConNombres.filter(detalle => detalle.idFactura === facturaId);
      const factura = facturas.find(factura => factura.idFactura === facturaId);
      const facturaConDetalles = { ...factura, detalles: detallesFacturaSeleccionada };
      this.setState({ detalleFactura: facturaConDetalles });
    } catch (error) {
      console.error(error);
    }
  };

  desactivarFactura = async (idFactura, nombre) => {
    try {
      const factura = await axios.get(`https://localhost:7284/api/factura/${idFactura}`);
      const parametros = {
        idFactura: factura.data.idFactura,
        fechaCompra: factura.data.fechaCompra,
        ivaCompra: factura.data.ivaCompra,
        subtotal: factura.data.subtotal,
        total: factura.data.total,
        estado: 'Desactivado',
        clienteId: factura.data.clienteId,
        empleadoId: factura.data.empleadoId
      };
      await axios.put(`https://localhost:7284/api/factura/${idFactura}`, parametros);
      alert(`Factura ${nombre} desactivada exitosamente`);
      this.getFacturas();
      this.setState({ cacheKey: Date.now().toString() });
    } catch (error) {
      console.error(error);
      alert('Error', 'Ha ocurrido un error al desactivar la factura');
    }
  };

  render() {
    const { facturas, detalleFactura, currentPage, itemsPerPage, searchTerm } = this.state;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = facturas.slice(indexOfFirstItem, indexOfLastItem);

    const filteredFacturas = currentItems.filter(factura =>
      factura.clienteId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <View>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
          placeholder="Buscar factura"
          onChangeText={text => this.setState({ searchTerm: text })}
        />
        <FlatList
          data={filteredFacturas}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'gray', paddingVertical: 10 }}>
              <Text>{item.idFactura}</Text>
              <Text>{item.fechaCompra}</Text>
              <Text>{item.ivaCompra}</Text>
              <Text>{item.subtotal}</Text>
              <Text>{item.total}</Text>
              <Text>{item.clienteId}</Text>
              <Text>{item.empleadoId}</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => this.showDetalleFactura(item.idFactura)} style={{ marginRight: 10 }}>
                  <Text style={{ backgroundColor: '#440000', color: 'white', padding: 5 }}>Detalles</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.desactivarFactura(item.idFactura, item.nombre)} style={{ marginRight: 10 }}>
                  <Text style={{ backgroundColor: '#440000', color: 'white', padding: 5 }}>Desactivar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={item => item.idFactura.toString()}
        />

        <Modal visible={detalleFactura !== null} animationType="slide" onRequestClose={() => this.setState({ detalleFactura: null })}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {detalleFactura && (
              <View>
                <Text>ID de Factura: {detalleFactura.idFactura}</Text>
                <Text>Fecha de Compra: {detalleFactura.fechaCompra}</Text>
                <Text>IVA Compra: {detalleFactura.ivaCompra}</Text>
                <Text>Subtotal: {detalleFactura.subtotal}</Text>
                <Text>Total: {detalleFactura.total}</Text>
                <Text>Cliente ID: {detalleFactura.clienteId}</Text>
                <Text>Empleado ID: {detalleFactura.empleadoId}</Text>
                <Text>Detalles:</Text>
                <FlatList
                  data={detalleFactura.detalles}
                  renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text>{item.nombreProducto}</Text>
                      <Text>{item.cantidad}</Text>
                    </View>
                  )}
                  keyExtractor={item => item.idProducto.toString()}
                />
              </View>
            )}
            <Button title="Cerrar" onPress={() => this.setState({ detalleFactura: null })} />
          </View>
        </Modal>
      </View>
    );
  }
}

export default ManageFacturas;
