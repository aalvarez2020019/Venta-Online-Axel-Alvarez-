// RUTAS DEL USUARIO
const express = require('express');

const usuarioController = require('../controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

// 1. Registrar al cliente
api.post('/registrarCliente', usuarioController.RegistrarCliente);
// 2. Login cliente
api.post('/login', usuarioController.Login);
// 3. Editar cliente
api.put('/editarUsuario/:idUsuario',  md_autenticacion.Auth, usuarioController.editarUsuarios);
// 4. Eliminar cliente
api.put('/eliminarUsuario/:idUsuario', md_autenticacion.Auth, usuarioController.eliminarUsuarios);

api.put("/editarRol/:ID",md_autenticacion.Auth,usuarioController.editarRolUsuario)


module.exports = api;

