// IMPORTACIONES
const express = require('express');
const cors = require('cors');
var app = express();


// RUTAS
const UsuarioRutas = require('./src/routes/usuarios.routes');
const CategoriasRutas = require('./src/routes/categorias.routes');
const ProductosRutas = require('./src/routes/productos.routes');
const CarritoRutas = require('./src/routes/carrito.routes');
const ClienteRutas = require('./src/routes/cliente.routes');

// MIDDLEWARE INTERMEDIARIO
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CABECERA
app.use(cors());

// CARGA DE RUTAS 
app.use('/api', UsuarioRutas, CategoriasRutas, ProductosRutas, CarritoRutas, ClienteRutas);

module.exports = app;
