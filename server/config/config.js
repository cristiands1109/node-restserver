// =========================================== 
// =============PUERTO========================
// =========================================== 


process.env.PORT = process.env.PORT || 3000;

// =========================================== 
// ============VENCIMIENTO DEL TOKE===========
// =========================================== 

process.env.CADUCIDAD_TOKEN = '48h';

// =========================================== 
// ============SEED DE AUTENTICACION==========
// =========================================== 

process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';

//====================================================//
//====================ENTORNO=========================//
//====================================================//


process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==========================================================//
//====================BASE DE DATOS=========================//
//==========================================================//

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URL;
}
process.env.URLDB = urlDB;


//==========================================================//
//====================GOOGLE CLIENT ID======================//
//==========================================================//

process.env.CLIENT_ID = process.env.CLIENT_ID || '901510387268-q08beg1sbpfpc93lq32138vvuo2fshtv.apps.googleusercontent.com';