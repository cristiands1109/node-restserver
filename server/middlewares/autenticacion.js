const jwt = require('jsonwebtoken');


//============================================================//
//====================VERIFICAR TOKEN=========================//
//============================================================//


let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                error: {
                    menesaje: 'Token invalido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });


    //**las siguentes lineas eran pruebas */
    // res.json({
    //     token: token
    // });

};

//===================================================================//
//====================VERIFICA ADMIN ROLE=========================//
//===================================================================//

let verificaADMIN_ROLE = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'USER_ROLE') {
        return res.status(401).json({
            ok: false,
            error: {
                menesaje: 'No es un usuario autorizado'
            }
        });
    }

    next();


};


//===================================================================//
//====================VERIFICA TOKEN PARA IMG=========================//
//===================================================================//

let verificaTOKEN_IMG = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                error: {
                    menesaje: 'Token invalido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });


}



module.exports = {
    verificaToken,
    verificaADMIN_ROLE,
    verificaTOKEN_IMG
}