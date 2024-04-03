import React, { Component } from "react";
import axios from "axios";
import { v4 as uuid } from 'uuid';
import SearchComponent from './SearchComponent';

class CrearFacturaComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            productos: [],
            detalleProductos: { subtotal: 0, iva: 0, total: 0 },
            iva: 0.19
        };
    }

    handleAgregarProducto = (producto) => {
        const { productos } = this.state;
        const updatedProductos = [...productos, producto];
        this.setState({ productos: updatedProductos });
        this.recalcularDetalleProductos(updatedProductos);
    };

    handleEliminarProducto = (index) => {
        const { productos } = this.state;
        const updatedProductos = [...productos];
        updatedProductos.splice(index, 1);
        this.setState({ productos: updatedProductos });
        this.recalcularDetalleProductos(updatedProductos);
    };

    handleEditarCantidad = (idProducto, nuevaCantidad) => {
        const { productos } = this.state;
        const updatedProductos = productos.map(producto => {
            if (producto.idProducto === idProducto) {
                return { ...producto, cantidad: nuevaCantidad };
            }
            return producto;
        });
        this.setState({ productos: updatedProductos });
        this.recalcularDetalleProductos(updatedProductos);
    };

    recalcularDetalleProductos = (productos) => {
        const { iva } = this.state;
        const subtotal = productos.reduce((total, prod) => total + (prod.cantidad * prod.precioProducto), 0);
        const totalIVA = subtotal * iva;
        const total = subtotal + totalIVA;

        this.setState({
            detalleProductos: {
                subtotal: subtotal,
                iva: totalIVA,
                total: total
            }
        });
    };

    actualizarCantidadProducto = async (idProducto, cantidad) => {
        try {
            const response = await axios.get(`https://localhost:7284/api/productos/${idProducto}`);
            const producto = response.data;

            const nuevaCantidad = producto.cantidad - cantidad;

            await axios.put(`https://localhost:7284/api/productos/${idProducto}`, {
                cantidad: nuevaCantidad,
                nombreProducto: producto.nombreProducto,
                precioProducto: producto.precioProducto,
                marcaProducto: producto.marcaProducto,
                clasificacionProducto: producto.clasificacionProducto,
                estado: producto.estado
            });

            return nuevaCantidad;
        } catch (error) {
            console.error("Error al actualizar la cantidad del producto:", error);
            throw new Error("Ocurrió un error al actualizar la cantidad del producto. Por favor, inténtalo de nuevo.");
        }
    };

    handleImprimirFactura = async () => {
        try {
            const { idFactura } = this.props;
            const { productos, iva } = this.state;

            const response = await axios.get(`https://localhost:7284/api/factura/${idFactura}`);
            const factura = response.data;

            if (!factura) {
                throw new Error("No se encontró la factura del cliente.");
            }

            await Promise.all(productos.map(async (producto) => {
                const detalleFactura = {
                    valorUnitario: producto.precioProducto,
                    cantidad: producto.cantidad,
                    idFactura: idFactura,
                    idProducto: producto.idProducto
                };
                await axios.post("https://localhost:7284/api/DetalleFactura", detalleFactura);

                await this.actualizarCantidadProducto(producto.idProducto, producto.cantidad);
            }));

            const subtotal = productos.reduce((total, prod) => total + (prod.cantidad * prod.precioProducto), 0);
            const totalIVA = subtotal * iva;
            const total = subtotal + totalIVA;

            await axios.put(`https://localhost:7284/api/factura/${idFactura}`, {
                idFactura: factura.idFactura,
                fechaCompra: factura.fechaCompra,
                ivaCompra: totalIVA,
                subtotal: subtotal,
                total: total,
                estado: 'Activo',
                clienteId: factura.clienteId,
                empleadoId: factura.empleadoId
            });

            this.setState({ productos: [], detalleProductos: [] });

            window.location.reload(); // Recargar la página
        } catch (error) {
            console.error("Error al imprimir la factura:", error);
            alert("Ocurrió un error al imprimir la factura. Por favor, inténtalo de nuevo.");
        }
    };

    render() {
        const { productos, detalleProductos } = this.state;

        return (
            <div className="container mt-3 mb-3" style={{ backgroundColor: "white", width: "80%", margin: "0 auto" }}>
                <div style={{ height: "auto", marginLeft: '50%', height: "10vh" }}>
                    <SearchComponent
                        productList={productos}
                        handleSuggestionClick={this.handleAgregarProducto}
                        setResults={productos => this.setState({ productos })}
                    />
                </div>

                <div className="card card-body table-responsive mt-3" style={{ backgroundColor: "white", height: "auto" }}>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>ID Producto</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((producto, index) => (
                                <tr key={`${producto.idProducto}-${index}`}>
                                    <td>{producto.idProducto}</td>
                                    <td>{producto.nombreProducto}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={producto.cantidad}
                                            onChange={(e) => this.handleEditarCantidad(producto.idProducto, parseInt(e.target.value))}
                                        />
                                    </td>
                                    <td>{producto.precioProducto}</td>
                                    <td>
                                        <button className="btn btn-danger" onClick={() => this.handleEliminarProducto(index)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div style={{ color: "black", border: "1px solid black", padding: "3px 70px", marginBottom: "10px", display: "inline-block" }}>
                        <p>Subt: {detalleProductos.subtotal}</p>
                    </div>
                    <div style={{ color: "black", border: "1px solid black", padding: "3px 70px", marginBottom: "10px", display: "inline-block" }}>
                        <p>IVA: {detalleProductos.iva}</p>
                    </div>
                    <div style={{ color: "black", border: "1px solid black", padding: "3px 70px", marginBottom: "10px", display: "inline-block" }}>
                        <p>Total: {detalleProductos.total}</p>
                    </div>
                </div>

                <div>
                    <button onClick={this.handleImprimirFactura} style={{
                        backgroundColor: "green",
                        borderRadius: "50px",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer"
                    }}>Imprimir Factura
                    </button>
                </div>
            </div>
        );
    }
}

export default CrearFacturaComponent;
