const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

let Producto = require('../models/producto');


//===================================================================//
//====================CREAR UN PRODUCTO=========================//
//===================================================================//

// GRABAR EL USUARIO
// grabar una categoria del listado


app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'El producto ha sido creado correctamente',
            producto: productoDB
        });
    });

});



//==================================================================//
//=================OBTENER TODOS LOS PRODUCTOS======================//
//==================================================================//

// trae todos los productos
// populate: usuario y categoria
// paginado


app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);


    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Peticion realizada correctamente',
                    producto: productoDB,
                    cantidad: conteo
                });
            });
        });
});



//===================================================================//
//====================OBTENER PRODUCTO POR ID=========================//
//===================================================================//

// populate: usuario y categoria

app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        mensaje: 'No existe producto con ese id'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                producto: productoDB
            });
        });
});

//=============================================================//
//====================BUSCAR PRODUCTOS=========================//
//=============================================================//

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });

});





//===================================================================//
//====================ACTUALIZAR UN PRODUCTO=========================//
//===================================================================//

// GRABAR EL USUARIO
// grabar una categoria del listado

app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let editarProducto = {
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    };

    Producto.findByIdAndUpdate(id, editarProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    mensaje: 'No existe producto con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Producto actualizado correctamente',
            producto: productoDB
        });
    });




});


//===================================================================//
//====================BORRAR UN PRODUCTO=========================//
//===================================================================//

app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let cambioDisponibilidad = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambioDisponibilidad, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Producto dado de baja',
            producto: productoBorrado
        });

    });

});


// NO ELIMINAR DIRECTAMENTE SINO QUE SOLO DARLO DE BAJA



module.exports = app;