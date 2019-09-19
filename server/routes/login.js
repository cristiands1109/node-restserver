const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();


app.post('/login', (req, res) => {


    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        // error
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }


        // validacion de la existencia del usuario
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                error: {
                    mensaje: 'El (usuario) o contrasena incorrecta'
                }
            });
        }

        // validacion de la contrasena
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {

            return res.status(400).json({
                ok: false,
                error: {
                    mensaje: 'El usuario o (contrasena) incorrecta'
                }
            });

        }

        // generar token

        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        // respuesta correcta
        res.status(200).json({
            mensaje: 'Login exitoso',
            ok: true,
            usuario: usuarioBD,
            llave: token
        });

    });
});



module.exports = app;