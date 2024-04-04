import React, { Component } from "react";
import axios from "axios";

class RegistroCliente extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cliente: {
        nombre: "",
        apellido: "",
        edad: "",
        tipoDocumento: "CC",
        numDocumento: props.numeroDocumento ? props.numeroDocumento : "",
        correo: "",
        estado: "Activo" 
      },
      loading: false,
      error: null,
      registroExitoso: false
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;

    if (name === "nombre" || name === "apellido") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "edad") {
      newValue = value.replace(/\D/g, "");
      const parsedValue = parseInt(newValue);
      if (isNaN(parsedValue) || parsedValue < 18) {
        this.setState({ error: "La edad debe ser igual o mayor a 18 años." });
      } else {
        this.setState({ error: null });
      }
    } else if (name === "numDocumento") {
      newValue = value.replace(/\D/g, "");
    } else if (name === "tipoDocumento") {
      newValue = value.toUpperCase() === "CC" ? "CC" : "";
    } else if (name === "correo") {
      newValue = value.trim();
      const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newValue);
      if (!isValidEmail && newValue !== "") {
        this.setState({ error: "El correo electrónico ingresado no es válido." });
      } else {
        this.setState({ error: null });
      }
    }

    this.setState({
      cliente: {
        ...this.state.cliente,
        [name]: newValue
      }
    });
  };

  registrarCliente = async () => {
    try {
      this.setState({ loading: true });
      const response = await axios.post("https://localhost:7284/api/clientes", this.state.cliente);
      const nuevoCliente = response.data;
      this.props.onClienteRegistrado(nuevoCliente);
      this.setState({ registroExitoso: true });
    } catch (error) {
      console.error("Error al registrar el cliente:", error);
      this.setState({ error: "Error al registrar el cliente. Por favor, inténtalo de nuevo." });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const { cliente } = this.state;
      if (!cliente.nombre || !cliente.apellido || !cliente.edad || !cliente.numDocumento || !cliente.correo) {
        this.setState({ error: "Por favor complete todos los campos." });
        return;
      }

      await this.registrarCliente();
    } catch (error) {
      console.error("Error al registrar el cliente:", error);
      this.setState({ error: "Error al registrar el cliente. Por favor, inténtalo de nuevo." });
    }
  };

  render() {
    const { cliente, loading, error, registroExitoso } = this.state;

    return (
      <div>
        {error && <p className="text-danger">{error}</p>}
        {registroExitoso && (
          <p className="text-success" style={{color:'green'}}>Cliente registrado exitosamente.</p>
        )}
        <div>
          <h2>Registro de Cliente</h2>
          <form onSubmit={this.handleFormSubmit}>
            <div className="row mb-3">
              <div className="col" style={{ padding: '-60vh', margin: "0 auto", marginBottom: "10px", display: "inline-block" }}>
                <label htmlFor="nombre" className="form-label"style={{  marginBottom: "-10px" }}>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control form-control-sm"
                  id="nombre"
                  placeholder="Ingrese el Nombre"
                  value={cliente.nombre}
                  onChange={this.handleInputChange}
                  required
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                />
              </div>
              <div className="col"  style={{ padding: '-60vh', margin: "0 auto", marginBottom: "10px", display: "inline-block" }}>
                <label htmlFor="apellido" className="form-label"style={{  marginBottom: "-10px" }}>Apellido:</label>
                <input
                  type="text"
                  name="apellido"
                  className="form-control form-control-sm"
                  id="apellido"
                  placeholder="Ingrese el Apellido"
                  value={cliente.apellido}
                  onChange={this.handleInputChange}
                  required
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col"style={{ padding: '-60vh', margin: "0 auto", marginBottom: "10px", display: "inline-block" }}>
                <label htmlFor="edad" className="form-label"style={{  marginBottom: "-10px" }}>Edad:</label>
                <input
                  type="text"
                  name="edad"
                  className="form-control"
                  id="edad"
                  placeholder="Ingrese la Edad"
                  value={cliente.edad}
                  onChange={this.handleInputChange}
                  required
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                />
              </div>
              <div className="col"style={{ padding: '-60vh', margin: "0 auto", marginBottom: "10px", display: "inline-block" }}>
                <label htmlFor="tipoDocumento" className="form-label"style={{  marginBottom: "-10px" }}>Tipo de Documento:</label>
                <input
                  type="text"
                  name="tipoDocumento"
                  className="form-control"
                  id="tipoDocumento"
                  placeholder="Ingrese el Tipo de documento"
                  value={cliente.tipoDocumento}
                  onChange={this.handleInputChange}
                  disabled
                  required
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col"style={{ padding: '-60vh', margin: "0 auto", marginBottom: "10px", display: "inline-block" }}>
                <label htmlFor="numDocumento" className="form-label"style={{  marginBottom: "-10px" }}>Número de Documento:</label>
                <input
                  type="text"
                  name="numDocumento"
                  className="form-control"
                  id="numDocumento"
                  placeholder="Ingrese el número de documento"
                  value={cliente.numDocumento}
                  onChange={this.handleInputChange}
                  required
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                />
              </div>
              <div className="col"style={{ padding: '-60vh', margin: "0 auto", marginBottom: "10px", display: "inline-block" }}>
                <label htmlFor="correo" className="form-label" style={{  marginBottom: "-10px" }}>Correo Electrónico:</label>
                <input
                  type="email"
                  name="correo"
                  className="form-control"
                  id="correo"
                  placeholder="Ingrese el correo"
                  value={cliente.correo}
                  onChange={this.handleInputChange}
                  required
                  style={{ backgroundColor: "white", borderRadius: "10px", padding: "10px", border: "1px solid black"}}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success mt-2" onClick={this.handleFormSubmit} disabled={loading} style={{backgroundColor: "blue",
                        borderRadius: "50px",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer" }}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default RegistroCliente;
