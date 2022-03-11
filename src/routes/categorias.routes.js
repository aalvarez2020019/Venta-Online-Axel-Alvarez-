// RUTAS DE LAS CATEGORIAS
const express = require('express');
const categoriasController = require('../controllers/categorias.controller');
const md_roles = require('../middlewares/roles');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

/************************************************************************************************************ */
// BUSQUEDA CATEGORIAS ADMIN

/* 1. Buscar las categorias ingresadas */
api.get('/categoriasTodas', [md_autenticacion.Auth, md_roles.varAdmin], categoriasController.ObtenerCategorias);
/* 2. Buscar categorias ID */
api.get('/categoriaId/:idCateg', [md_autenticacion.Auth, md_roles.varAdmin], categoriasController.ObtenerCategoriaId);

/************************************************************************************************************ */
// FUNCIONES CRUD ADMINISTRADOR

// 1. Agregar Categoria
api.post('/agregarCategoria', md_autenticacion.Auth, categoriasController.AgregarCategoria);
// 2. Editar Categoria
api.put('/editarCategoria/:idCategoria', md_autenticacion.Auth, categoriasController.EditarCategoria);
// 3. Eliminar Categoria
api.delete('/eliminarCategoria/:idCategoria', md_autenticacion.Auth, categoriasController.EliminarCategoria);



module.exports = api;