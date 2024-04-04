import React, { Component } from "react";
import axios from "axios";
import Detallefactura from './Detallefactura';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

class EnterpriseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buscarProveedor: false,
      proveedorExistente: false,
      numeroDocumento: "",
      proveedores: [],
      error: null,
      mostrarFormularioRegistro: false,
      proveedorRegistrado: null,
      fechaActual: "",
      bodegas: [],
      bodegaSeleccionada: "",
      mostrarDetalleFactura: false,
      idFacturaCreada: "",
      mostrarBotones: true,
      documentoProveedorEncontrado: "",
      facturaCreada: false,
      fechaexpedicion: new Date(),
      fechavencimiento: new Date(),
      idProveedor: ""
    };
  }

  componentDidMount() {
    this.fetchProveedores();
    this.fetchBodegas();
    const fecha = new Date();
    const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    this.setState({ fechaActual: fechaFormateada });
  }

  async fetchProveedores() {
    try {
      const response = await axios.get("https://localhost:7284/api/proveedor", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      this.setState({ proveedores: response.data });
      console.log("Proveedores cargados:", response.data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      this.setState({ error: "Error al obtener proveedores" });
    }
  }

  async fetchBodegas() {
    try {
      const response = await axios.get("https://localhost:7284/api/bodegas", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      const bodegasActivas = response.data.filter(bodega => bodega.estado === 'Activo');
      this.setState({ bodegas: bodegasActivas });
      console.log("Bodegas activas cargadas:", bodegasActivas);
    } catch (error) {
      console.error("Error al obtener bodegas:", error);
      this.setState({ error: "Error al obtener bodegas" });
    }
  }

  handleInputChange = (event) => {
    const input = event.target.value;
    const onlyNumbers = /^[0-9\b]+$/;
    if (input === "" || onlyNumbers.test(input)) {
      this.setState({ numeroDocumento: input });
    }
  };

  crearFactura = async () => {
    try {
      const { proveedorRegistrado, bodegaSeleccionada, fechaexpedicion, fechavencimiento } = this.state;
      if (!proveedorRegistrado || !bodegaSeleccionada) {
        alert('¡Atención! Por favor, selecciona un proveedor y una bodega antes de crear la factura.');
        return;
      }

      const fechaGeneracion = new Date().toISOString();
      const facturaTemporal = {
        idFacturaProveedor: "85ab7ca7-664d-4b20-b5de-024705497d4a",
        fechageneracion: fechaGeneracion,
        fechaexpedicion: fechaexpedicion.toISOString(),
        fechavencimiento: fechavencimiento.toISOString(),
        cantidad: 1,
        totalBruto: 200000,
        totalretefuente: 10000,
        totalpago: 210000,
        estado: "Activo",
        idProveedor: proveedorRegistrado.idProveedor,
        bodegaId: bodegaSeleccionada,
      };

      const response = await axios.post("https://localhost:7284/api/facturaproveedor", facturaTemporal);
      console.log("Factura creada:", response.data);
      alert('Creado exitosamente. Puede comenzar su factura.');

      this.setState({
        idFacturaCreada: response.data.idFacturaProveedor,
        mostrarDetalleFactura: true,
        mostrarBotones: false,
        facturaCreada: true
      });

    } catch (error) {
      console.error("Error al crear la factura:", error);
      alert('Error al crear la factura. Hubo un error al crear la factura. Por favor, inténtalo de nuevo.');
    }
  };

  handleBuscarProveedor = () => {
    const { proveedores, numeroDocumento } = this.state;
    const proveedorEncontrado = proveedores.find(
      (proveedor) => proveedor.numDocumento === parseInt(numeroDocumento.trim())
    );

    console.log("Proveedor encontrado:", proveedorEncontrado);

    if (proveedorEncontrado) {
      if (proveedorEncontrado.estado === 'Desactivado') {
        console.log('Proveedor desactivado');
        this.setState({ proveedorExistente: false, documentoProveedorEncontrado: proveedorEncontrado.numDocumento });
      } else {
        console.log('Proveedor activo');
        this.setState({ proveedorExistente: true, proveedorRegistrado: proveedorEncontrado, idProveedor: proveedorEncontrado.idProveedor });
      }
    } else {
      console.log('Proveedor no encontrado. Mostrando formulario de registro.');
      this.setState({ proveedorExistente: false, mostrarFormularioRegistro: true });
    }

    this.setState({ buscarProveedor: true });
  };

  handleCancelarRegistro = () => {
    this.setState({ buscarProveedor: false, numeroDocumento: "", mostrarFormularioRegistro: false });
  };

  handleBodegaChange = (event) => {
    this.setState({ bodegaSeleccionada: event.target.value });
  };

  handleCancelarProveedor = () => {
    this.setState({
      proveedorRegistrado: null,
      buscarProveedor: false,
      proveedorExistente: false,
      mostrarBotones: true,
      documentoProveedorEncontrado: ""
    });
  };

  render() {
    const { fechaActual, bodegas, bodegaSeleccionada, mostrarBotones, facturaCreada, mostrarDetalleFactura, idFacturaCreada } = this.state;

    return (
      <>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{
            width: "100%",
            minHeight: "80vh",
            height: "auto",
            justifyContent: "center",
            padding: "-135px",
            alignItems: "center",
          }}
        >
          <div className="row" style={{ border: "1px solid white", boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)", backgroundColor: "white" }} >
            <div className="col-md-6 mb-3">
              <h1>Informacion de factura</h1>
              <div className="row">
                <div className="col-md-6">
                  <p>Fecha actual:</p>
                  <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black" }}>{fechaActual}</p>
                </div>
                <div className="col-md-6">
                  <p>Direccion:</p>
                  <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black" }}>Calle 57</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <p>Fecha de vencimiento</p>
                  <div>
                    <DatePicker
                      className='form-control'
                      selected={this.state.fechavencimiento}
                      onChange={(date) => this.setState({ fechavencimiento: date })}
                      dateFormat='yyyy-MM-dd'
                      minDate={new Date()}
                      style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black" }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <p>Fecha de expedicion:</p>
                  <div>
                    <DatePicker
                      className='form-control'
                      selected={this.state.fechaexpedicion}
                      onChange={(date) => this.setState({ fechaexpedicion: date })}
                      dateFormat='yyyy-MM-dd'
                      minDate={new Date()}
                      style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black" }}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <p>Telefono:</p>
                  <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black" }}>3142678354</p>
                </div>
                <div className="col-md-6">
                  <p>Bodega:</p>
                  <select
                    id="bodega"
                    value={bodegaSeleccionada}
                    onChange={this.handleBodegaChange}
                    disabled={facturaCreada}
                    style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px" }}
                  >
                    <option value="">Seleccionar bodega</option>
                    {bodegas.map((bodega) => (
                      <option key={bodega.bodegaId} value={bodega.bodegaId}>{bodega.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <h1>Informacion del proveedor</h1>
              {this.state.proveedorRegistrado && (
                <div>
                  <p className="text-success" style={{color:'green'}}>Proveedor existente.</p>
                  <p>Número de documento: </p>
                  <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black" }}>{this.state.proveedorRegistrado.numDocumento}</p>
                  {mostrarBotones && (
                    <button type="button" className="btn btn-primary mt-2" onClick={this.handleCancelarProveedor}style={{backgroundColor: "red",
                    borderRadius: "50px",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    cursor: "pointer" }}>
                      Quitar Proveedor
                    </button>
                  )}
                </div>
              )}
              {!this.state.proveedorExistente && (
                <div style={{ marginTop: '10px' }}>
                  {this.state.documentoProveedorEncontrado && (
                    <div>
                      <p className="text-danger" style={{color:'red'}}>
                        El proveedor con número de documento {this.state.documentoProveedorEncontrado} está desactivado.
                      </p>
                      {mostrarBotones && (
                        <button type="button" className="btn btn-primary mt-2" onClick={this.handleCancelarProveedor} style={{backgroundColor: "red",
                        borderRadius: "50px",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer" }}>
                          Quitar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!this.state.buscarProveedor && (
                <div className="d-grid">
                  <p>Buscar proveedor</p>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.numeroDocumento}
                    onChange={this.handleInputChange}
                    placeholder="Ingrese el número de documento"
                    aria-label="Número de documento"
                    name="numeroDocumento"
                    id="numeroDocumento"
                    style={{ border: "1px solid black" }}
                  />
                  <button type="button" className="btn btn-primary mt-2" onClick={this.handleBuscarProveedor} style={{backgroundColor: "green",
                        borderRadius: "50px",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer" }}>
                    Buscar proveedor
                  </button>
                  {this.state.error && <p className="text-danger">{this.state.error}</p>}
                </div>
              )}
              {!this.state.proveedorExistente && this.state.mostrarFormularioRegistro && (
                <div className="d-grid">
                  <p className="text-danger mt-2" style={{color:'red'}}>Proveedor no encontrado. Por favor, registre al proveedor.</p>
                  <button type="button" className="btn btn-primary mt-2" onClick={this.handleCancelarRegistro} style={{backgroundColor: "red",
                        borderRadius: "50px",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer" }}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '10px', width: '104%', marginLeft: '-2.8%', margin: "0 auto" }}>
            {mostrarDetalleFactura && idFacturaCreada && (
              <div style={{ border: "1px solid white", backgroundColor: "white", boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)", padding: '-5vh', }}>
                <Detallefactura idFacturaProveedor={idFacturaCreada} />
              </div>
            )}
          </div>

          {mostrarBotones && (
            <div>
              <button type="button" className="btn btn-primary mt-2" onClick={this.crearFactura} style={{backgroundColor: "green",
                        borderRadius: "50px",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer" }}>
                Comenzar Factura
              </button>
            </div>
          )}
        </form>
      </>
    );
  }
}

export default EnterpriseInfo;
