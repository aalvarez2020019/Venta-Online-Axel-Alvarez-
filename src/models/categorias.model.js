// MODELO CATEGORIAS AXEL JAVIER GUADALUPE ALVAREZ FELIPE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoriaSchema = Schema({
    nombre: String,
    descripcion: String,

    idAdministrador: { type: Schema.Types.ObjectId, ref: 'Usuarios' }
})

module.exports = mongoose.model('Categorias', CategoriaSchema);