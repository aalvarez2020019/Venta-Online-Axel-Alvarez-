// CONTROLLER USUARIOS AXEL ALVAREZ
const Usuarios = require('../models/usuarios.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

function RegistrarCliente(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if(parametros.nombre && parametros.apellido && 
        parametros.email && parametros.password) {
            usuarioModel.nombre = parametros.nombre;
            usuarioModel.apellido = parametros.apellido;
            usuarioModel.email = parametros.email;
            usuarioModel.rol = 'ROL_CLIENTE';
            usuarioModel.imagen = null;
            usuarioModel.totalCarrito = 0;

            Usuarios.find({ email : parametros.email }, (err, usuarioEncontrado) => {
                if ( usuarioEncontrado.length == 0 ) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500).send({ mensaje: 'Error al momento de agregar al cliente'});
                            
                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
                    });    

                } else {
                    return res.status(500).send({ mensaje: 'Verifique el correo, ya se encuentra utilizado' });
                }
            })
    }
}

function Login(req, res) {

    var parametros = req.body;

    Usuarios.findOne({ email : parametros.email }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{
                    if ( verificacionPassword ) {

                        if(parametros.obtenerToken === 'true'){

                            return res.status(200).send({ token: jwt.crearToken(usuarioEncontrado) })

                        } else {
                            usuarioEncontrado.password = undefined;
                            return res.status(200).send({ usuario: usuarioEncontrado })
                        }     
                    } else {
                        return res.status(500).send({ mensaje: 'La contraseña es incorrecta'});
                    }
                })
        } else {
            return res.status(500).send({ mensaje: 'El correo no esta asignado'})
        }
    })
}

function editarRolUsuario(req, res) {

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    var datos = req.body;
    var idCliente = req.params.ID;
  
    Usuarios.findById(idCliente, (error, clienteEncontrado) => {
      if (clienteEncontrado == null) {
        return res.status(500).send({ Error: "Este cliente no existe." });
      } else if (clienteEncontrado.rol == "ROL_ADMIN") {
        return res.status(500).send({ Error: "No se puede editar el rol de otro Administrador" });
      } else {
        if (datos.rol) {
          Usuarios.findByIdAndUpdate(idCliente, datos, { new: true }, (error, rolCambiado) => {
              if (error)
                return res.status(500).send({ Error: "Error en la peticion." });
              if (!rolCambiado)
                return res.status(404).send({Error: "Revisar si esta registrado e intentar de nuevo"});

              return res.status(200).send({ Rol_actualizado: rolCambiado });
            }
          );
        } else {
          return res.status(500).send({ Error: "Ingrese el rol que desea establecer al cliente." });
        }
      }
    });
  }

  function editarUsuarios(req,res) {

    // NO PUEDE EDITAR EL CLIENTE
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    var idUser = req.params.idUsuario;
    var parametros = req.body;    

    Usuarios.findOne({_id:idUser},(err,usuarioEncontrado)=>{
            if(err) return res.status(500).send({mensaje: "No existe el usuario"});
            if(!usuarioEncontrado) return res.status(404).send({mensaje: "No existe el usuario"})    
   
            if(usuarioEncontrado.rol == 'ROL_CLIENTE'){
                
            Usuarios.findByIdAndUpdate(idUser, parametros, {new : true},
              (err, usuarioActualizado)=>{
              if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
              if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al momento de editar'});
            
             return res.status(200).send({usuario : usuarioActualizado})
        })
    } else{
        return res.status(500).send({ mensaje: "No cuentas con los permisos para editar" });
      }
    })
}

function eliminarUsuarios(req, res){

    // NO PUEDE ELIMINAR CLIENTE
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

     var idUser = req.params.idUsuario;

     Usuarios.findOne({_id:idUser},(err,usuarioEncontrado)=>{
        if(err) return res.status(500).send({mensaje: "No existe el usuario"});
        if(!usuarioEncontrado) return res.status(404).send({mensaje: "No existe el usuario"})
        if(usuarioEncontrado.rol == "ROL_CLIENTE"){

            Usuarios.findByIdAndDelete(idUser,(err,usuarioEliminado)=>{
                   if(err) return res.status(500).send({mensaje: "Error, el usuario no existe"});
                   if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existe"})
                   return  res.status(200).send({usuario:usuarioEliminado});

               })
     } else {
         
          return res.status(500).send({ mensaje: 'No cuentas con los permisos para editar'});

     }

    })
}


module.exports = {
    RegistrarCliente,
    Login,
    editarRolUsuario,
    editarUsuarios,
    eliminarUsuarios
}



