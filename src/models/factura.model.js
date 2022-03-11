// MODELO FACTURA AXEL JAVIER GUADALUPE ALVAREZ FELIPE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacturaSchema = Schema({
    nit: String,
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios' },

    listaProductos: [{
        nombreProducto: String,
        cantidadComprada: Number,
        precioUnitario: Number,
        subTotal: Number
    }],
    
    totalFactura: Number
});

module.exports = mongoose.model('Facturas', FacturaSchema);