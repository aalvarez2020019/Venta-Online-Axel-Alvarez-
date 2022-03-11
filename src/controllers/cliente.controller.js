// VER PERFIL, EDITAR PERFIL Y ELIMINAR CLIENTE
const Usuarios = require('../models/usuarios.model');

// Ver la información del cliente
function verPerfilCliente(req, res) {

    if ( req.user.rol == "ROL_ADMIN" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    var idPerfil = req.user.sub;
  
    Usuarios.findById(idPerfil, (error, informacionCliente) => {
        
      if (error) return res.status(500).send({ Error: "Error en la peticion." });
      if (!informacionCliente)

        return res.status(404).send({ Error: "No se puede ver la información de este perfil" });
        return res.status(200).send({ Cliente: informacionCliente });
    });

}

function EditarPerfilCliente(req, res) {
    var datos = req.body;
  
  
    if ( req.user.rol == "ROL_ADMIN" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

    if (datos.nombre && datos.email) {

      Usuarios.findByIdAndUpdate(
        { _id: req.user.sub }, datos, { new: true }, (error, nuevosParametros) => {
          if (error) return res.status(500).send({ error: "Error en la peticion." });
          if (!nuevosParametros)
            return res.status(500).send({ Error: "El perfil no existe." });
          return res.status(200).send({ cliente: nuevosParametros });
        }
      );

    } else {
      return res.status(500).send({Error: "Debe llenar todos los campos. (Nombre y email)"});
    }
  }


  function EliminarPerfilCliente(req, res){

    if ( req.user.rol == "ROL_ADMIN" ) return res.status(500).send({ mensaje: 'Este rol no tiene acceso'});

      var idPerfil = req.user.sub;

      Usuarios.findByIdAndDelete(idPerfil, (error, perfilEliminado) => {

        if (error) return res.status(500).send({ Error: "Error en la peticion." });

        if (!perfilEliminado)

          return res.status(500).send({ Error: "No existe el perfil" });

        return res.status(200).send({ cliente: perfilEliminado });
      });

  }

  module.exports ={
      verPerfilCliente,
      EditarPerfilCliente,
      EliminarPerfilCliente
  }