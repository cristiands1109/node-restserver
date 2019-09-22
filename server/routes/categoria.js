const express = require('express');

const { verificaToken, verificaADMIN_ROLE } = require('../middlewares/autenticacion')

let app = express();

let Categoria = require('../models/categoria');



//===================================================================//
//=================OBTENER TODAS LAS CATEGORIAS======================//
//===================================================================//

app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriaDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                categoria: categoriaDB
            });



        });

});


//===================================================================//
//=============OBTENER LA CATEGORIA POR ID===================//
//===================================================================//


app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;


    Categoria.findById(id)
        .populate('usuario', 'nombre email')
        .exec((err, categoriaDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        mensaje: 'EL ID NO EXISTE'
                    }
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                categoria: categoriaDB
            });


        });



});

//===================================================================//
//=============CREAR NUEVA CATEGORIA===================//
//===================================================================//

app.post('/categoria', verificaToken, (req, res) => {

    // obtener todos los parametros que se ingresan
    let body = req.body;

    // regresar la nueva categoria
    // id del usuario en el token en req.usuario._id


    // se crea una nueva instancia de categoria para poder guardarla
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id // no se usa body porque el token viene del req
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Categoria creada exitosamente',
            categoria: categoriaDB
        });

    });


});


//===================================================================//
//===================ACTUALIZAR UNA CATEGORIA========================//
//===================================================================//

app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body; // se obtiene el body 


    let desCategoria = {
        descripcion: body.descripcion
    };

    // se envia el id, el body (que tiene la descripcion o el paramentro a actualizar)
    // el {new: true} es para que devuelva el registro actualizado
    Categoria.findByIdAndUpdate(id, desCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    mensaje: 'El id no existe'
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Registro actualizado por correctamanete',
            categoria: categoriaDB
        });


    });


});



//===================================================================//
//====================ELIMINA UNA CATEGORIA==========================//
//===================================================================//

app.delete('/categoria/:id', [verificaToken, verificaADMIN_ROLE], (req, res) => {

    //solo puede borrarlo un administrador
    // token
    // categoria.findbyidandremove

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        if (!categoriaBorrada) {
            return res.status(500).json({
                ok: false,
                error: {
                    mensaje: `no existe categoria con el id`
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Categoria borrada correctamente',
            categoria: categoriaBorrada
        });

    });


});


module.exports = app;