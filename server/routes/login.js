const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


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


//CONFIGURACION DE GOOGLE

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    // se genera el objeto con la informacion del usuario de google tiene token es correcto
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}




app.post('/google', async(req, res) => {

    let token = req.body.idtoken;


    // llama la funcion verify para verificar el token, en caso que no haya un error
    // se obtiene un objeto con la informacion del usuario
    let googleUser = await verify(token).catch(err => {
        return res.status(403).json({
            ok: false,
            error: err
        });
    });

    // VALIDACIONES

    // verifica si en la base de datos existe un usuario con ese mismo correo
    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

        // 
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        // si existe el usuario
        if (usuarioBD) {

            // pregunta si ese usuario se autentico con google, si es falso, no le permite ya que -
            // significa que se autentico con la autenticacion normal
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        mensaje: 'Debe de utilizar su autenticacion normal'
                    }
                });
                // en caso que exista el usuario y ya se haya autenticado con google entonces se renueva -
                // el token personalizado
            } else {
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token
                });

            }
        } else {
            // en caso que es la primera vez que ese usuario se este autenticando
            // Si el usuario no existe en nuesta base de datos - nuevo usuario

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {

                // se pregunta por el error en caso de que haya un error al tratar de guardar

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        error: err
                    });
                }

                // se genera el token personalizado

                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // retorna la respuesta 
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token
                });

            });


        }

    });


    // res.json({
    //     usuario: googleUser
    // });




});



module.exports = app;