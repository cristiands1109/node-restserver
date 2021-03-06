const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                mensaje: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    // TIPOS VALIDOS

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                mensaje: 'Los tipos validos son: ' + tiposValidos.join(', ')
            }
        });
    }


    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');

    // console.log(nombreCortado); // PARA PRUEBA

    let extension = nombreCortado[nombreCortado.length - 1];
    // console.log(extension);     // PARA PRUEBA


    // VALIDAR EXTENSIONES
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                mensaje: 'La extensiones validas son: ' + extensionesValidas.join(', ')
            }
        });
    }

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                error: err,
                mensaje: 'Error al subir archivo'
            });

        // AQUI LA IMAGEN YA SE ENCUENTRA EN NUESTRO FILESYSTEM
        // AQUI ES DONDE ACTUALIZAREMOS LA IMAGEN DEL USUARIO / PRODUCTO
        if (tipo === 'usuarios') {

            imagenUsuario(id, res, nombreArchivo);
        } else {

            imagenProducto(id, res, nombreArchivo);
        }



        // res.json({
        //     ok: true,
        //     mensaje: 'Archivo subido correctamente!'
        // });
    });


});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                error: err,
                mensaje: 'El usuario no existe o es invalido'
            });
        }

        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });

        });




    });


}


function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                error: err,
                mensaje: 'El producto no existe o es invalido'
            });

        }

        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: productoGuardado,
                img: nombreArchivo
            });

        });
    });
}


function borrarArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }


}

module.exports = app;