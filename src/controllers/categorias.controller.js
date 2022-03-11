// CONTROLLER CATEGORIAS AXEL ALVAREZ
const Categoria = require('../models/categorias.model');
const Productos = require('../models/productos.model');

/* **************************************************************************** */
/* BUSQUEDA DATOS, SOLO ADMIN */

// BUSCAR CATEGORIAS
function ObtenerCategorias (req, res) {


    Categoria.find((err, categoriasObtenidas) => {

        if (err) return res.send({ mensaje: "Error: " + err });

        return res.send({ categorias: categoriasObtenidas })
    });
}

// BUSCAR POR ID
function ObtenerCategoriaId (req, res){

    var idCat = req.params.idCateg;

    Categoria.findById(idCat, (err, categoriaEncontrada)=>{

        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!categoriaEncontrada) return res.status(404).send({ mensaje: 'Error al obtener los datos'});
        return res.status(200).send({ categoria: categoriaEncontrada });
    })
}

/* **************************************************************************** */
/* CRUD CATEGORIAS */

// AGREGAR CATEGORIAS
function AgregarCategoria(req, res){

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    var parametros = req.body;
    var categoriaModel = new Categoria();

    if(parametros.nombre&&parametros.descripcion){
        categoriaModel.nombre = parametros.nombre;
        categoriaModel.descripcion = parametros.descripcion;
        categoriaModel.idAdministrador = req.user.sub;

        categoriaModel.save((err, categoriaAlmacenada)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!categoriaAlmacenada) return res.status(404).send( { mensaje: "Error, no se agrego ningun producto"});
            return res.status(200).send({ categoria: categoriaAlmacenada});
        })
    }
}

// EDITAR LAS CATEGORIAS
function EditarCategoria(req, res){
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    var idCategoria = req.params.idCategoria;
    var parametros = req.body;

    Categoria.findOneAndUpdate({_id : idCategoria, idAdministrador : req.user.sub}, parametros, {new: true}, (err, categoriaEditada)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!categoriaEditada) return res.status(404).send({ mensaje: 'No puede editar estas categorias'});
        return res.status(200).send({ categoria: categoriaEditada});
    })
    

}

// ELIMINAR LAS CATEGORIAS
function EliminarCategoria(req, res){

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    const categoriaId = req.params.idCategoria;

    Categoria.findOne({ _id: categoriaId, idAdmin: req.user.sub }, (err, categoriaRolAdmin) =>{

        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!categoriaRolAdmin) return res.status(404).send( { mensaje: 'No puede editar las categorias de otro usuario'});
        Categoria.findOne({nombre: 'Eliminado defecto'}, (err, categoriaEncontrada)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});

            if(!categoriaEncontrada){

                const modeloCategoria = new Categoria();
                modeloCategoria.nombre = 'Eliminado defecto';
                modeloCategoria.idAdmin = null;

                modeloCategoria.save((err, categoriaGuardada)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error al momento de guardar'});
                    if(!categoriaGuardada) return res.status(404).send( { mensaje: 'No se creo la categoria, intentelo de nuevo'});

                    Productos.updateMany({ idCategoria: categoriaId }, { idCategoria: categoriaGuardada._id },(err, productosAlmacenados)=>{
                        if(err) return res.status(500).send({ mensaje: 'Error al momento de actualizar'});

                        Categoria.findByIdAndDelete(categoriaId, (err, categoriaEliminada) =>{
                            if(err) return res.status(500).send({ mensaje: 'Error al momento de eliminar'});
                            if(!categoriaEliminada) return res.status(404).send( { mensaje: 'No se elimino la categoria'});

                            return res.status(200).send({ editado: productosAlmacenados, eliminado: categoriaEliminada });
                        })
                    })
                })
            } else {
                
                Productos.updateMany({idCategoria: categoriaId}, { idCategoria: categoriaEncontrada}, (err, productosAlmacenados)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error al querer actualizar los productos'});

                    Categoria.findByIdAndDelete(categoriaId, (err, categoriaEliminada) =>{
                        if(err) return res.status(500).send({ mensaje: 'Error en la peticion al eliminar categoria'});
                        return res.status(200).send({editado: productosAlmacenados, eliminado: categoriaEliminada});
                    })
                })
            }
        })
    })
}

module.exports ={
    ObtenerCategorias,
    AgregarCategoria,
    EditarCategoria,
    EliminarCategoria,
    ObtenerCategoriaId
}