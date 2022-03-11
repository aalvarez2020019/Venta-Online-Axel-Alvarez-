// CONTROLLER CARRITO Y FACTURAS AXEL ALVAREZ
const Usuarios = require('../models/usuarios.model');
const Producto = require('../models/productos.model');
const Factura = require('../models/Factura.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

//AGREGAR PRODUCTO AL CARRITO, SOLO EL CLIENTE TIENE ACCESO
function AgregarProductoCarrito(req, res) {
    const usuarioLogeado = req.user.sub;
    const parametros = req.body;

        if ( req.user.rol == "ROL_ADMIN" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});


        Producto.findOne({ nombre: parametros.nombreProducto }, (err, productoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
            if(!productoEncontrado) return res.status(404).send({ mensaje: 'No existe el producto'});
    
            if(parametros.cantidad > productoEncontrado.cantidad){

                return res.status(500).send({mensaje: 'El stock no es suficiente'})

            } else{
                Usuarios.findOne({_id: req.user.sub, carrito:{$elemMatch: {nombreProducto: parametros.nombreProducto}}}, (err, carritoEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                    
        
                    let cantidadLocal = 0;
                    let subTotalLocal = 0;

                    if(carritoEncontrado){

                        for (let i = 0; i < carritoEncontrado.carrito.length; i++) {

                            if(carritoEncontrado.carrito[i].nombreProducto == parametros.nombreProducto){
                                
                                cantidadLocal = carritoEncontrado.carrito[i].cantidadComprada;
                                subTotalLocal = Number(cantidadLocal) + Number(parametros.cantidad);

                            Usuarios.findOneAndUpdate({ carrito: { $elemMatch : { _id: carritoEncontrado.carrito[i]._id} } },
                                {$inc: { "carrito.$.cantidadComprada":parametros.cantidad}, "carrito.$.subTotal": subTotalLocal  *  productoEncontrado.precio}, 
                                 {new : true}, (err, cantidadAgregada)=>{
                                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                    if(!cantidadAgregada) return res.status(500).send({ mensaje: "No puede editar la respuesta"});
                        
                                        let totalCarritoLocal = 0;
                        
                                        for(let i = 0; i < cantidadAgregada.carrito.length; i++){totalCarritoLocal += cantidadAgregada.carrito[i].subTotal     
                                        }
                                        Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},
                                            (err, totalActualizado)=> {
                                                if(err) return res.status(500).send({ mensaje: "Total Carrito error"});
                                                if(!totalActualizado) return res.status(500).send({ mensaje: "Error al momento de modificar"});
                                                return res.status(200).send({ total: totalActualizado })
                                            })
                            })
                            } else{
        
                            }
                        }
                    } else {
                        Usuarios.findByIdAndUpdate(usuarioLogeado, { $push: { carrito: { nombreProducto: parametros.nombreProducto,
                            cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio, subTotal: parametros.cantidad * productoEncontrado.precio} } }, { new: true}, 
                            (err, usuarioActualizado)=>{
                                if(err) return res.status(500).send({ mensaje: "Usuario error"});
                                if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al agregar al carrito'});
                
                                let totalCarritoLocal = 0;
                
                                for(let i = 0; i < usuarioActualizado.carrito.length; i++){
                                    totalCarritoLocal += usuarioActualizado.carrito[i].subTotal 
                                     
                                }
                
                                Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},

                                    (err, totalActualizado)=> {
                                        if(err) return res.status(500).send({ mensaje: "Error en el total"});
                                        if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
                                        return res.status(200).send({ usuario: totalActualizado })
                                    })
                            })
                    }                
                })
            }
        })
    
    
}

// FACTURA DEL CARRITO, SOLO EL CLIENTE TIENE ACCESO
function FacturaCarrito(req, res){
    var parametros = req.body;

    if ( req.user.rol == "ROL_ADMIN" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

     const facturaModel = new Factura();

        Usuarios.findById(req.user.sub, (err, usuarioEncontrado)=>{

            if(usuarioEncontrado.carrito == ''){

                return res.status(500).send({mensaje: 'No tira ninguna factura porque el carrito esta vacio'})

            } else {
                facturaModel.listaProductos = usuarioEncontrado.carrito;
                facturaModel.idUsuario = req.user.sub;
                facturaModel.totalFactura = usuarioEncontrado.totalCarrito;

                if (parametros.nit){
                    facturaModel.nit = parametros.nit
                } else {
                    facturaModel.nit = 'Sin nit'
                }
                
                facturaModel.save((err, guardarFactura) => {
                    if (err) return res.status(500).send({mensaje : "Error en la peticion"});
                    if(!guardarFactura) return res.status(500).send({mensaje : "Error al intentar guardar las facturas"})
                    
                    for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {

                        Producto.findOneAndUpdate({nombre: usuarioEncontrado.carrito[i].nombreProducto} , 
                            {  $inc : { cantidad: usuarioEncontrado.carrito[i].cantidadComprada * -1, 
                            vendido: usuarioEncontrado.carrito[i].cantidadComprada }}, (err, datosProducto) =>{
                        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!datosProducto) return res.status(500).send({mensaje: 'Error al modificar el stock'})
                    })
                    }
                })

                Usuarios.findByIdAndUpdate(req.user.sub, { $set: { carrito: [] }, totalCarrito: 0 }, { new: true }, 

                    (err, carritoSinNada)=>{

                        return res.status(200).send({ usuario: carritoSinNada})

                    })
            }
        }) 
     
}

// ELIMINAR CARRITO
function EliminarProductoCarrito(req, res) {
    var parametros = req.body;
    
    let totalCarritoLocal = 0;

    if ( req.user.rol == "ROL_ADMIN" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

        Producto.findOne({nombre: parametros.nombreProducto}, (err, productoEncontrado) => {
            if (err) return res.status(500).send({mensaje: 'Error en la peticion'})
            if(!productoEncontrado) return res.status(500).send({mensaje: 'Verifique el nombre'});
    
            Usuarios.updateOne({_id: req.user.sub},{ $pull: { carrito: { nombreProducto: 
                parametros.nombreProducto} } }, (err, carritoEliminado)=>{

                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!carritoEliminado) return res.status(500).send({mensaje: 'No existe el producto'});

                Usuarios.findOne({_id: req.user.sub}, (err, usuarioEncontrado) =>{
                    if(err) return res.status(500).send({ mensaje: "Total Carrito error"});
                    if(!usuarioEncontrado) return res.status(500).send({ mensaje: 'No se puede modificar el total del carrito'});
        
                    for (let i = 0; i < usuarioEncontrado.carrito.length; i++){
                        totalCarritoLocal += usuarioEncontrado.carrito[i].subTotal 
                        console.log(totalCarritoLocal)   
                    }
        
                    Usuarios.findByIdAndUpdate({_id: req.user.sub},  { totalCarrito: totalCarritoLocal }, {new: true},
                        (err, totalAlmacenado)=> {
                            if(err) return res.status(500).send({ mensaje: "Error en el total del carrito"});
                            if(!totalAlmacenado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
                            return res.status(200)
                            .send({ usuario: totalAlmacenado })
                        });
                });
                
            });
        });
    
}

/* Informacion sobre facturas, solo los administradores tienen permiso */

// 1. Ver las facturas de los usuarios, ingresar el id de un usuario
function facturasUsuarios(req, res){

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});
    
    var idUsuar = req.params.idUsuario;

    Factura.find({idUsuario: idUsuar},(err, facturaEncontrada)=>{

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(facturaEncontrada==0)
        return res.status(404).send({mensaje: 'No tiene facturas el usuario'});

        if(!facturaEncontrada) return res.status(404).send({mensaje: 'No se encontraron las facturas'});
            
        return res.status(200).send({facturas: facturaEncontrada});
    })
}

// 2. Mostrar los productos de una factura 
function productoFactura(req, res){

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    var idFac = req.params.idFactura;

    Factura.find({_id: idFac},{"_id":0,"nit":0, "idUsuario":0, "totalFactura":0},(err, facturaEncontrada)=>{

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(facturaEncontrada == 0)
        return res.status(404).send({mensaje: 'El usuario no cuenta con facturas'});

        if(!facturaEncontrada) return res.status(404).send({mensaje: 'Error al encontrar facturas'});
            
        return res.status(200).send({facturas: facturaEncontrada});
    })
}

// 3. Productos agotados
function productosAgotados(req, res){
    
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    Producto.find({cantidad: 0}, (err, productoEncontrado)=>{

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(productoEncontrado == 0)

        return res.status(404).send({mensaje: 'No existen productos agotados'});

        if(!productoEncontrado) return res.status(404).send({mensaje: 'No hay productos agotados'});
            
        return res.status(200).send({productos: productoEncontrado});

    }).sort( { cantidadVendida: -1 }).limit(3)
}

// 4. Productos más vendidos
function productosVendidos(req, res){
    
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    Producto.find((err, productoEncontrado)=>{
    
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(productoEncontrado == 0)
        return res.status(404).send({mensaje: 'No hay mas productos'});

        if(!productoEncontrado) return res.status(404).send({mensaje: 'No se encontraron los productos vendidos'});
            
        return res.status(200).send({productos: productoEncontrado});

    }).sort( { cantidadVendida: -1 }).limit(3)

}

module.exports={
    AgregarProductoCarrito,
    FacturaCarrito,
    EliminarProductoCarrito,

    facturasUsuarios,
    productoFactura,
    productosAgotados,
    productosVendidos
    
}