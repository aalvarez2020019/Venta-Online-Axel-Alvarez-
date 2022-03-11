// CONTROLLER PRODUCTOS AXEL ALVAREZ
const Productos = require('../models/productos.model');
const Categorias = require('../models/categorias.model');

/* **************************************************************************** */
/* BUSQUEDA PRODUCTOS ROL_ADMIN */

// 1. Obtener todos los productos ingresados
function ObtenerTodosProductos (req, res) {


    Productos.find((err, productosEncontrados) => {

        if (err) return res.send({ mensaje: "Error: " + err });

        return res.send({ productos: productosEncontrados })
    });
}

// 2. Obtener productos por id Admin
function ObtenerProductoId (req, res){

    var idProd = req.params.idProducto;

    Productos.findById(idProd, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!productoEncontrado) return res.status(404).send({ mensaje: 'Error al obtener los datos'});
        return res.status(200).send({ producto: productoEncontrado });

    })
}

/* **************************************************************************** */
/* BUSQUEDA PRODUCTOS ROL_CLIENTE */

// 1. Ver el catalogo de todos los productos, producto y su categoria
function verProductos(req, res) {
    Productos.find((error, listadoProductos) => {
      if (error) return res.status(500).send({ Error: "Error en la peticion." });
      if (!listadoProductos) return res.status({ Error: "No hay productos." });
      return res.status(200).send({
          
        Lista_de_productos: listadoProductos,
        Cantidad_de_productos: listadoProductos.length,
        
      });

    }).populate("idCategoria", "nombre");
    
}

// 2. Buscar por nombre del producto
function verProductoNombre(req, res){
    var nomProd = req.params.nombreProducto;

    Productos.find( { nombre: { $regex: nomProd, $options: 'i'}}, (err, productosEncontrados)=>{

        if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if(!productosEncontrados) return res.status(404).send({ mensaje: "No se encontraron productos"});
        return res.status(200).send({ producto: productosEncontrados})
    })
}

// 3. Productos más vendidos
function ObtenerProductos (req, res){

    Productos.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err });

        Productos.find((err, productosObtenidosTodos) => {
            if (err) return res.send({ mensaje: "Error: " + err });
    
            return res.send({ 'Mas vendidos': productosObtenidos, 'Lista de productos': productosObtenidosTodos})
        })       
    }).sort({
        vendido : -1,
    }).limit(10)
}

// 4. Buscar productos por categoria
function obtenerProductosPorCategoria(req, res) {
  var parametros = req.body;

  Categorias.findOne({nombre: parametros.nombre}, (err, categoriaEncontrada)=>{
      if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
      if(!categoriaEncontrada) return res.status(500).send({ mensaje: 'Esta categoria no existe, verifica el nombre'});

      Productos.find({idCategoria: categoriaEncontrada._id}, (err, productoEcontrado) => {
          if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
          if(!productoEcontrado) return res.status(500).send({ mensaje: 'Este producto no existe'});

          return res.status(200).send({ producto: productoEcontrado});
      })
  })
}



/* **************************************************************************** */
/* CRUD PRODUCTOS Y STOCK */

// AGREGAR PRODUCTOS
/* Ingresar una categoria existente para que funcione  */
function AgregarProducto(req, res) {

  if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

  var datos = req.body;

  if (datos.nombre && datos.cantidad && datos.precio && datos.categoria) {
    Productos.find({ nombre: { $regex: datos.nombre, $options: "i" } }).exec(
      (error, productoEncontrado) => {
        if (productoEncontrado.length != 0)
          return res.status(500).send({ Error: "Ya existe el producto" });

        Categorias.findOne(
          { nombre: { $regex: datos.categoria, $options: "i" } },
          (error, categoriaEncontrada) => {
            if (error)
              return res.status(500).send({ Error: "Error con las categorias" });
            if (!categoriaEncontrada)
              return res.status(500).send({ Error: "No existe la categoria" });

            var modeloProductos = new Productos();

            modeloProductos.nombre = datos.nombre;
            modeloProductos.cantidad = datos.cantidad;
            modeloProductos.precio = datos.precio;
            modeloProductos.idCategoria = categoriaEncontrada._id;
            modeloProductos.ventas = 0;

            modeloProductos.save((error, productoGuardado) => {
              if (error)
                return res.status(500).send({Error: "Error al momento de guardar"});
              if (!productoGuardado)
                return res.status(404).send({ Error: "No se pudo guardar el producto." });
              Productos.find(
                { idCategoria: categoriaEncontrada._id }, (error, cantidad) => {
                  if (error)
                    return res.status(500).send({ Error: "Error en la peticion." });
                  if (!cantidad)
                    return res.status(500).send({ Error: "No se pudo obtener el total de productos."});

                  return res.status(200).send({ producto: productoGuardado, total_productos: cantidad.length });
                }
              );
            });
          }
        );
      }
    );
  } else {
    return res.status(500).send({ Error: "Se deben llenar campos obligatorios" });
  }
}

// EDITAR PRODUCTOS
function EditarProducto(req, res){

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    var idProd = req.params.idProducto;
    var parametros = req.body;    

     Productos.findOneAndUpdate(idProd, parametros, {new : true}, (err, productoActualizado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if(!productoActualizado) return res.status(500).send({ mensaje: 'No puede editar productos de otra categoria'});
            
            return res.status(200).send({ Producto : productoActualizado })
        });
}

// ELIMINAR PRODUCTOS
function EliminarProducto(req, res){

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});
    var idProd = req.params.idProducto;

     Productos.findOneAndDelete(idProd, (err, productoEliminado) => {
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!productoEliminado) return res.status(404).send( { mensaje: "Error al eliminar"});

        return res.status(200).send({ Producto: productoEliminado});
    })
} 
 
// STOCK DE LOS PRODUCTOS
function stockProducto(req, res) {

    const parametros = req.body;
    const productoId = req.params.idProducto;


    if(req.user.rol == 'ROL_CLIENTE'){

        return res.status(500).send({mensaje: 'Este rol no tiene acceso'});

    } else {

        Productos.findByIdAndUpdate(productoId, { $inc : { cantidad: parametros.cantidad } }, { new: true },

            (err, productoModificado) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!productoModificado) return res.status(500).send({ mensaje: "Error al editar la cantidad"});
    
            return res.status(200).send({ producto: productoModificado});
        });
    }
}



module.exports = {
    
    AgregarProducto,
    EditarProducto,
    EliminarProducto,
    stockProducto,
    ObtenerProductos,
    ObtenerProductoId,
    verProductos,
    ObtenerTodosProductos,
    verProductoNombre,
    obtenerProductosPorCategoria
}