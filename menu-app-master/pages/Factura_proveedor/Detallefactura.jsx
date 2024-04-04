import React, { useState } from "react";
import axios from "axios";
import { v4 as uuid } from 'uuid'; // Importa la función uuid para generar identificadores únicos
import SearchComponent from '../../pages/Factura_Cliente/SearchComponent'; // Asumiendo que tienes un componente de búsqueda para buscar productos

const CrearFacturaComponent = ({ idFacturaProveedor }) => {
    const [productos, setProductos] = useState([]);
    const [detalleProductos, setDetalleProductos] = useState({ subtotal: 0, iva: 0, total: 0 });
    const iva = 0.19;

    const handleAgregarProducto = (producto) => {
        const updatedProductos = [...productos, producto];
        setProductos(updatedProductos);
        recalcularDetalleProductos(updatedProductos);
    };

    const handleEliminarProducto = (index) => {
        const updatedProductos = [...productos];
        updatedProductos.splice(index, 1);
        setProductos(updatedProductos);
        recalcularDetalleProductos(updatedProductos);
    };

    const handleEditarCantidad = (idProducto, nuevaCantidad) => {
        const updatedProductos = productos.map(producto => {
            if (producto.idProducto === idProducto) {
                return { ...producto, cantidad: nuevaCantidad };
            }
            return producto;
        });
        setProductos(updatedProductos);
        recalcularDetalleProductos(updatedProductos);
    };

    const recalcularDetalleProductos = (productos) => {
        const subtotal = productos.reduce((total, prod) => total + (prod.cantidad * prod.precioProducto), 0);
        const totalIVA = subtotal * iva;
        const total = subtotal + totalIVA;

        setDetalleProductos({
            subtotal: subtotal,
            iva: totalIVA,
            total: total
        });
    };

    const actualizarCantidadProducto = async (idProducto, cantidad) => {
        try {
            // Obtener el producto de la base de datos
            const response = await axios.get(`https://localhost:7284/api/productos/${idProducto}`);
            const producto = response.data;
    
            // Calcular la nueva cantidad restando la cantidad de la factura de la cantidad actual del producto
            const nuevaCantidad = producto.cantidad + cantidad;
    
            // Actualizar la cantidad del producto en la base de datos
            await axios.put(`https://localhost:7284/api/productos/${idProducto}`, {
                cantidad: nuevaCantidad,
                nombreProducto: producto.nombreProducto,
                precioProducto: producto.precioProducto,
                marcaProducto: producto.marcaProducto,
                clasificacionProducto: producto.clasificacionProducto,
                estado: producto.estado
            });
    
            // Devolver la nueva cantidad
            return nuevaCantidad;
        } catch (error) {
            console.error("Error al actualizar la cantidad del producto:", error);
            throw new Error("Ocurrió un error al actualizar la cantidad del producto. Por favor, inténtalo de nuevo.");
        }
    };

    const handleImprimirFactura = async () => {
        try {
            // Obtener los detalles completos de la factura de proveedor
            const response = await axios.get(`https://localhost:7284/api/facturaproveedor/${idFacturaProveedor}`);
            const factura = response.data;
    
            if (!factura) {
                throw new Error("No se encontró la factura de proveedor.");
            }
            await Promise.all(productos.map(async (producto) => {
                const detalleFactura = {
                    valorUnitario: producto.precioProducto,
                    cantidad: producto.cantidad,
                    idFacturaProveedor: idFacturaProveedor,
                    idProducto: producto.idProducto
                };
                await axios.post("https://localhost:7284/api/DetalleFacturaproveedor", detalleFactura);
    
                // Actualizar la cantidad del producto en la base de datos
                await actualizarCantidadProducto(producto.idProducto, producto.cantidad);
            }));
    
    
            // Calcular los totales
            const subtotal = productos.reduce((total, prod) => total + (prod.cantidad * prod.precioProducto), 0);
            const totalIVA = subtotal * iva;
            const total = subtotal + totalIVA;
    
            // Actualizar la factura de proveedores con los nuevos valores
            await axios.put(`https://localhost:7284/api/facturaproveedor/${idFacturaProveedor}`, {
                totalretefuente: totalIVA,
                totalBruto: subtotal,
                totalpago: total,
                estado: 'Activo',
                fechageneracion: factura.fechageneracion,
                fechaexpedicion: factura.fechaexpedicion,
                fechavencimiento: factura.fechavencimiento,
                cantidad: factura.cantidad,
                idProveedor: factura.idProveedor,
                bodegaId: factura.bodegaId
            });
             // Limpiar la lista de productos después de imprimir la factura
             setProductos([]);
             setDetalleProductos([]);
             
            // Mostrar un mensaje de éxito después de imprimir todas las facturas
            alert('Factura creada con éxito. La factura se ha creado correctamente.');
            // Recargar la página después de que el usuario haga clic en "Aceptar"
           
    
            
        } catch (error) {
            console.error("Error al imprimir la factura:", error);
            // Manejar cualquier error que pueda ocurrir durante la impresión de la factura
            alert("Ocurrió un error al imprimir la factura. Por favor, inténtalo de nuevo.");
        }
    };
    

    return (
        <div className="container mt-3 mb-3" style={{ backgroundColor: "white", width: "80%", margin: "-20 auto",padding:'-20px'}}>
            <div style={{ height: "auto", marginLeft: '50%', marginBottom: '80px'}}>
                <SearchComponent
                    productList={productos}
                    handleSuggestionClick={handleAgregarProducto}
                    setResults={setProductos}
                />
            </div>

            
            <div className="card card-body table-responsive mt-3" style={{ backgroundColor: "white", height: "auto", padding:'20px', marginTop:'20px'}}>
                {/* Aquí se muestra la tabla de productos */}
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
                                        onChange={(e) => handleEditarCantidad(producto.idProducto, parseInt(e.target.value))}
                                    />
                                </td>
                                <td>{producto.precioProducto}</td>
                                <td>
                                    <button className="btn btn-danger" onClick={() => handleEliminarProducto(index)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ textAlign: "right" }}>
                {/* Aquí se muestra el resumen de la factura (subtotal, IVA, total) */}
                <div >
                    <p>Total bruto: {detalleProductos.subtotal}</p>
                </div>
                <div>
                    <p>Total: {detalleProductos.iva}</p>
                </div>
                <div >
                    <p>Total: {detalleProductos.total}</p>
                </div>
            </div>
            
            <div> 
                <button onClick={handleImprimirFactura} style={{
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
};

export default CrearFacturaComponent;
