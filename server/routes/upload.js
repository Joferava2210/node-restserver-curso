const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('../models/usuario');

//default options
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se han seleccionado archivos'
                }
            });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'El tipo no es permitido'
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];


    //Extensiones permitidas
    let extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'La extensión no es permitida'
            }
        });
    }

    //Cambiar nombre a archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Aqui, imagen cargada 

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });

});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(usuarioDB.img, 'usuarios');
            return res.status(500).jso({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(usuarioDB.img, 'usuarios');
            return res.status(400).jso({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });

        }

        borraArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
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
            borraArchivo(usuarioDB.img, 'productos');
            return res.status(500).jso({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(usuarioDB.img, 'productos');
            return res.status(400).jso({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });

        }

        borraArchivo(productoDB.img, 'productos');


        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });

}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);

    }

};

module.exports = app;