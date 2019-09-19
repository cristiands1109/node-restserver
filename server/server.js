require('./config/config');
const colors = require('colors');

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// configuracion global de rutas
app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (err, res) => {
        if (err) throw err;

        console.log(colors.bgRed('Base de datos ONLINE'));
    });


app.listen(process.env.PORT, () => {
    console.log(colors.green('Escuchando el puerto:', 3000));
})