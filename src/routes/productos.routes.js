// RUTAS DE LOS PRODUCTOS
const express = require('express');
const productosController = require('../controllers/productos.controller');
const md_roles = require('../middlewares/roles');

const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

/************************************************************************************************************ */
// BUSQUEDA PRODUCTOS ROL_ADMIN

// 1. Obtener todos los productos ingresados
api.get('/productosTodos', [md_autenticacion.Auth, md_roles.varAdmin], productosController.ObtenerTodosProductos);
// 2. Obtener productos por id
api.get('/productosId/:idProducto', [md_autenticacion.Auth, md_roles.varAdmin], productosController.ObtenerProductoId);

/************************************************************************************************************ */
// BUSQUEDA PRODUCTOS ROL_CLIENTE

// 1. Ver el catalogo de todos los productos, producto y su categoria
api.get("/verProductos", [md_autenticacion.Auth, md_roles.varCliente], productosController.verProductos);
// 2. Buscar por el nombre del cliente
api.get('/productosNombre/:nombreProducto', [md_autenticacion.Auth, md_roles.varCliente], productosController.verProductoNombre);
// 3. Producto más vendido y todos los productos, cliente posiblemente
api.get('/productosVentas', [md_autenticacion.Auth, md_roles.varCliente], productosController.ObtenerProductos);
// 4. Obtener productos por categoria
api.get('/productosCategoria', [md_autenticacion.Auth, md_roles.varCliente], productosController.obtenerProductosPorCategoria);

/************************************************************************************************************ */
// FUNCIONES CRUD PRODUCTOS Y STOCK

// 1. Agregar productos
api.post('/agregarProductos', md_autenticacion.Auth, productosController.AgregarProducto);
// 2. Editar productos
api.put('/editarProducto/:idProducto', md_autenticacion.Auth, productosController.EditarProducto);
// 3. Eliminar productos
api.delete('/eliminarProductos/:idProducto', md_autenticacion.Auth, productosController.EliminarProducto);
// 4. Stock cantidad del producto
api.put('/produtoStock/:idProducto', md_autenticacion.Auth, productosController.stockProducto); 



module.exports = api;
