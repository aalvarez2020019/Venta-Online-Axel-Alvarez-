// RUTAS DEL CARRITO
const express = require('express');
const carritoController = require('../controllers/carrito.controller')
const md_autenticacion = require('../middlewares/autenticacion');


const api = express.Router();

// FUNCIONES CARRITO
api.put('/agregarProductoCarrito', md_autenticacion.Auth, carritoController.AgregarProductoCarrito);
api.post('/confirmarFactura', md_autenticacion.Auth, carritoController.FacturaCarrito);
api.put('/eliminarCarrito', md_autenticacion.Auth, carritoController.EliminarProductoCarrito);

// MOSTRAR DATOS DE FACTURA ADMIN

// 1. Mostrar las facturas de los usuarios
api.get('/facturasusuarios/:idUsuario', md_autenticacion.Auth, carritoController.facturasUsuarios);

// 2. Mostrar los productos de una factura
api.get('/productosFactura/:idFactura', md_autenticacion.Auth, carritoController.productoFactura);

// 3.Mostrar los productos agotados
api.get('/productosAgotados', md_autenticacion.Auth, carritoController.productosAgotados);

// 4. Mostrar los productos más vendidos
api.get('/productosMasVendidos', md_autenticacion.Auth, carritoController.productosVendidos);

module.exports = api;
