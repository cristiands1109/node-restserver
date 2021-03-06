const express = require('express');
const bcrypt = require('bcrypt');

// underscore.js
const _ = require('underscore');

//Usuario con mayusculas al principio hace referencia al modelo Usuario 
const Usuario = require('../models/usuario');
const { verificaToken, verificaADMIN_ROLE } = require('../middlewares/autenticacion');

// express
const app = express();

//===================================================================//
//====================OBTENER USUARIOs DE BD=========================//
//===================================================================//

app.get('/usuario', verificaToken, (req, res) => {

    /**para prueba */
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre role email estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            Usuario.count({ estado: true }, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    mensaje: 'La peticion se realizo correctamente',
                    usuario: usuarios,
                    cantidad: conteo
                });

            });


        });


});

//===================================================================//
//=================CREAR UN USUARIO DE BD=======================//
//===================================================================//

app.post('/usuario', [verificaToken, verificaADMIN_ROLE], (req, res) => {
    let body = req.body;

    // MODELO
    // usuario con minusculas es una variable creada que tiene 
    // todo lo referente al modelo

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // PROCESO DE GUARDADO EN MONGOOSE

    usuario.save((err, usuarioBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err

            });
        }

        res.status(200).json({
            ok: false,
            mensaje: 'El registro ha sido guardado correctamente',
            usuario: usuarioBD
        });
    });

});

//===================================================================//
//=================ACTUALIZAR UN USUARIO DE BD=======================//
//===================================================================//

app.put('/usuario/:id', [verificaToken, verificaADMIN_ROLE], (req, res) => {



    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioBD) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                error: err

            });
        }


        res.status(200).json({
            ok: true,
            mensaje: 'Registro actualizado correctamente',
            usuario: usuarioBD
        });

    });

});

//===================================================================//
//====================ELIMINAR UN USUARIO DE BD======================//
//===================================================================//

app.delete('/usuario/:id', [verificaToken, verificaADMIN_ROLE], (req, res) => {

    let id = req.params.id;
    let cambiarEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiarEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                error: err

            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'Usuario no encontrado'
                }

            });
        }

        res.status(200).json({
            ok: false,
            mensaje: 'Usuario borrado correctamente',
            usuario: usuarioBorrado
        });

    });

});


/*
app.delete('/usuario/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                error: err

            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'Usuario no encontrado'
                }

            });
        }

        res.status(200).json({
            ok: false,
            mensaje: 'Usuario borrado correctamente',
            usuario: usuarioBorrado
        });


    });

});*/

module.exports = app;

//** PRUEBA PARA SABER SI FUNCIONA - verificaADMIN_ROLE */

// if (req.usuario.role === 'USER_ROLE') {
//     return res.json({
//         mensaje: 'es un user role'
//     });
// } else {
//     if (req.usuario.role === 'ADMIN_ROLE') {
//         return res.json({
//             mensaje: 'es un admin role'
//         });
//     }
// }


//** PRUEBA PARA SABER SI FUNCIONA - verificaTOKEN */

// esto unicamente se observa si el toke que viene en los headers es valido
// return res.json({
//     mensaje: 'funciona'
// })