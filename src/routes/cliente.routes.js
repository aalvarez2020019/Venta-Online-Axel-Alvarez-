// RUTAS DE LAS FUNCIONES DEL CLIENTE
const express = require('express');
const clienteController = require('../controllers/cliente.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

// Funciones del perfil
// 1. Ver el perfil del cliente
api.post("/perfilCliente", md_autenticacion.Auth, clienteController.verPerfilCliente)
// 2. Editar el perfil del cliente
api.put('/editarPerfilCliente', md_autenticacion.Auth, clienteController.EditarPerfilCliente)
// 3. Eliminar el perfil del cliente
api.delete('/eliminarPerfilCliente', md_autenticacion.Auth, clienteController.EliminarPerfilCliente);

module.exports = api;