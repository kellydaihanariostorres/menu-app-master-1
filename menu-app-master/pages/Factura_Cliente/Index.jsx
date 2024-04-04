import React, { useState, useEffect } from "react";
import axios from "axios";
import RegistroCliente from "./BusquedCliente";
import Detallefactura from './Detallefactura';

function EnterpriseInfo() {
  const [buscarCliente, setBuscarCliente] = useState(false);
  const [clienteExistente, setClienteExistente] = useState(false);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [mostrarFormularioRegistro, setMostrarFormularioRegistro] = useState(false);
  const [clienteRegistrado, setClienteRegistrado] = useState(null);
  const [fechaActual, setFechaActual] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(""); 
  const [mostrarDetalleFactura, setMostrarDetalleFactura] = useState(false);  
  const [idFacturaCreada, setIdFacturaCreada] = useState("");
  const [mostrarBotones, setMostrarBotones] = useState(true); 
  const [documentoClienteEncontrado, setDocumentoClienteEncontrado] = useState("");
  const [facturaCreada, setFacturaCreada] = useState(false);

  useEffect(() => {
    localStorage.setItem("empleadoSeleccionado", empleadoSeleccionado);
  }, [empleadoSeleccionado]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("https://localhost:7284/api/clientes", {
          headers: {
            "Cache-Control": "no-cache"
          }
        });
        setClientes(response.data);
        console.log("Clientes cargados:", response.data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
        setError("Error al obtener clientes");
      }
    };

    const fetchEmpleados = async () => {
      try {
        const response = await axios.get("https://localhost:7284/api/empleados", {
          headers: {
            "Cache-Control": "no-cache"
          }
        });
    
        // Filtrar empleados activos
        const empleadosActivos = response.data.filter(empleado => empleado.estado === 'Activo');
    
        setEmpleados(empleadosActivos);
        console.log("Empleados activos cargados:", empleadosActivos);
      } catch (error) {
        console.error("Error al obtener empleados:", error);
        setError("Error al obtener empleados");
      }
    };


    fetchClientes();
    fetchEmpleados();

    // Obtener la fecha actual al cargar el componente
    const fecha = new Date();
    const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    setFechaActual(fechaFormateada);
  }, [buscarCliente]);

  useEffect(() => {
    // Efecto para restablecer el estado cuando mostrarDetalleFactura cambie a false
    if (!mostrarDetalleFactura) {
      setFacturaCreada(false);
      setMostrarBotones(true);
    }
  }, [mostrarDetalleFactura]);

  const handleInputChange = (event) => {
    const input = event.target.value;
    // Expresión regular para permitir solo números
    const onlyNumbers = /^[0-9\b]+$/;
    if (input === "" || onlyNumbers.test(input)) {
      setNumeroDocumento(input);
    }
  };
  

  const crearFactura = async () => {
    try {
      if (!clienteRegistrado || !empleadoSeleccionado) {
        setError('Por favor, selecciona un cliente y un empleado antes de crear la factura.');
        return;
      }
  
      // Generar una factura temporal con valores temporales
      const facturaTemporal = {
        idFactura: "64b512e7-46ae-4989-a049-a446118099c4",
        fechaCompra: new Date().toISOString(),
        ivaCompra: 1, // Valor temporal
        subtotal: 1, // Valor temporal
        total: 1, // Valor temporal
        clienteId: clienteRegistrado.clienteId,
        empleadoId: empleadoSeleccionado,
        Estado: 'Activo' // Corrección aquí
      };
      
  
      // Enviar la factura temporal al servidor para su creación
      const response = await axios.post("https://localhost:7284/api/factura", facturaTemporal);
  
      // Si la creación de la factura fue exitosa, puedes hacer algo con la respuesta si es necesario
      console.log("Factura creada:", response.data);
      setIdFacturaCreada(response.data.idFactura);
      setMostrarDetalleFactura(true);
      setMostrarBotones(false);
      setFacturaCreada(true);
      
      
    } catch (error) {
      console.error("Error al crear la factura:", error);
      setError('Hubo un error al crear la factura. Por favor, inténtalo de nuevo.');
    }
  };
  
  const handleBuscarCliente = () => {
    const clienteEncontrado = clientes.find(
      (cliente) => cliente.numDocumento === parseInt(numeroDocumento.trim())
    );
  
    console.log("Cliente encontrado:", clienteEncontrado);
  
    if (clienteEncontrado) {
      if (clienteEncontrado.estado === 'Desactivado') {
        console.log('Cliente desactivado'); // Mensaje de cliente desactivado
        setClienteExistente(false); // Aquí deberías establecer clienteExistente como falso ya que el cliente está inactivo
        setDocumentoClienteEncontrado(clienteEncontrado.numDocumento); // Almacenar el número de documento del cliente encontrado
      } else {
        console.log('Cliente activo'); // Mensaje de cliente activo
        setClienteExistente(true);
        setClienteRegistrado(clienteEncontrado); // Almacenar los datos del cliente encontrado
      }
    } else {
      console.log('Cliente no encontrado. Mostrando formulario de registro.'); // Mensaje de cliente no encontrado
      setClienteExistente(false);
      setMostrarFormularioRegistro(true);
    }
    
    setBuscarCliente(true);
  };

  const handleCancelarRegistro = () => {
    setBuscarCliente(false);
    setNumeroDocumento("");
    setMostrarFormularioRegistro(false);
  };

  const handleClienteRegistrado = (cliente) => {
    setBuscarCliente(true);
    setMostrarFormularioRegistro(false);
    setClienteRegistrado(cliente);
  };
  
  const handleEmpleadoChange = (event) => {
    setEmpleadoSeleccionado(event.target.value);
  };

  const handleCancelarCliente = () => {
    setClienteRegistrado(null);
    setBuscarCliente(false);
    setClienteExistente(false);
    setMostrarBotones(true);
    setDocumentoClienteEncontrado(""); // Reset documentoClienteEncontrado
  };

  console.log("mostrarDetalleFactura:", mostrarDetalleFactura);
console.log("mostrarBotones:", mostrarBotones);

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          width: "100%",
          minHeight: "80vh",
          height: "auto",
          justifyContent: "center",
          padding: "10px",
          alignItems: "center",
        }}
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <h1>Informacion de factura</h1>
            <div className="row">
              <div className="col-md-6">
                <p>Fecha actual:</p>
                <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}>{fechaActual}</p>
              </div>
              <div className="col-md-6">
                <p>Direccion:</p>
                <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}>Calle 57</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <p>Telefono:</p>
                <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}>3142678354</p>
              </div>
              <div className="col-md-6">
                <p>Empleado:</p>
                <select
                  id="empleado"
                  value={empleadoSeleccionado}
                  onChange={handleEmpleadoChange}
                  disabled={facturaCreada}
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                >
                  <option value="">Seleccionar empleado</option>
                  {empleados.map((empleado) => (
                    <option key={empleado.empleadoId} value={empleado.empleadoId}>{empleado.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <h1>Informacion del cliente</h1>
            {clienteRegistrado && (
              <div>
                <p className="text-success" style={{color:'green'}}>Cliente existente.</p>
                <p>Número de documento: </p>
                <p style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}>{clienteRegistrado.numDocumento}</p>
                {mostrarBotones && (
                  <button type="button" className="btn btn-primary mt-2" onClick={handleCancelarCliente} style={{backgroundColor: "red",
                  borderRadius: "50px",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  cursor: "pointer" }}>
                    Quitar Cliente
                  </button>
                )}
              </div>
            )}
            {!clienteExistente && (
              <div style={{ marginTop: '10px' }}>
                {documentoClienteEncontrado && (
                  <div>
                    <p className="text-danger" style={{color:'red'}}>
                      El cliente con número de documento {documentoClienteEncontrado} está desactivado.
                    </p>
                    {mostrarBotones && (
                      <button type="button" className="btn btn-primary mt-2" onClick={handleCancelarCliente} style={{backgroundColor: "red",
                      borderRadius: "50px",
                      color: "white",
                      padding: "10px 20px",
                      border: "none",
                      cursor: "pointer" }}>
                        Quitar Cliente
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {mostrarFormularioRegistro && (
              <RegistroCliente
                numeroDocumento={numeroDocumento}
                onClienteRegistrado={handleClienteRegistrado}
              />
            )}
            {!buscarCliente && (
              <div className="d-grid">
                <p>Buscar cliente</p>
                <input
                  type="text"
                  className="form-control"
                  value={numeroDocumento}
                  onChange={handleInputChange}
                  placeholder="Ingrese el número de documento"
                  aria-label="Número de documento"
                  name="numeroDocumento"
                  id="numeroDocumento"
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                />
                <button type="button" className="btn btn-primary mt-2" onClick={handleBuscarCliente} style={{backgroundColor: "blue",
                        borderRadius: "50px",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer" }}>
                  Buscar Cliente
                </button>
                {error && <p className="text-danger">{error}</p>}
              </div>
            )}
            {!clienteExistente && mostrarFormularioRegistro && (
              <div className="d-grid">
                <p className="text-danger mt-2" style={{color:'red'}}>Cliente no encontrado. Por favor, registre al cliente.</p>
                <button type="button" className="btn btn-primary mt-2" onClick={handleCancelarRegistro} style={{backgroundColor: "red",
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
        <div className="row">
          <div className="col-md-12">
            <div style={{ padding: '10px' }}>
              {mostrarDetalleFactura && (
                <div>
                   <Detallefactura
                    idFactura={idFacturaCreada}
                    setClienteRegistrado={setClienteRegistrado}
                    setDocumentoClienteEncontrado={setDocumentoClienteEncontrado}
                    setBuscarCliente={setBuscarCliente}
                    setNumeroDocumento={setNumeroDocumento}
                    setMostrarDetalleFactura={setMostrarDetalleFactura}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {!mostrarDetalleFactura && mostrarBotones && !facturaCreada && (
          <div>
            <button type="button" className="btn btn-primary mt-2" onClick={crearFactura} style={{backgroundColor: "green",
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

export default EnterpriseInfo;
