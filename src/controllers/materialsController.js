const moment = require('moment');
var dateNow = moment().format('YYYY-MM-DD hh:mm:ss');

const lo = require('lodash');

exports.getAll = function(req, res) {
    req.getConnection((err, conn) =>{
        if(err) return  res.status(500).send( bodyResponse(false, err.message) ); 

        conn.query('SELECT * FROM materiales', (err, rows) =>{
            if(err) res.status(500).send( bodyResponse(false, err.message) ); 
            res.status(200).json( bodyResponse(true, rows) );
        });

    });
};

exports.create = function(req, res, next) { 

    if( lo.isEmpty(req.body.codigo) ) return res.status(500).send( bodyResponse(false, 'Falta el parámetro Código') );
    if( lo.isEmpty(req.body.material) ) return res.status(500).send( bodyResponse(false, 'Falta el parámetro Material') );

    req.getConnection( (err, conn) =>{
        if( err ) return res.status(500).send( bodyResponse(false, err.message) );

        conn.query('SELECT * FROM materiales WHERE LOWER(mat_codigo) = ? OR LOWER(mat_descri) = ? ', [ lo.lowerCase(req.body.codigo), lo.lowerCase(req.body.material)], (err, rows) =>{
            if( err ) return res.status(500).send( bodyResponse(false, err.message) );

            if( lo.filter(rows, function(o) { return o.mat_codigo == req.body.codigo  }).length != 0 ){
                return res.status(500).send( bodyResponse(false, 'El código ya se encuentra registrado, Por favor intente nuevamente.' ) );
            }
            if( lo.filter(rows, function(o) { return o.mat_descri == req.body.material  }).length != 0 ){
                return res.status(500).send( bodyResponse(false, 'El material ya se encuentra registrado, Por favor intente nuevamente.') );
            }

            conn.query('INSERT INTO materiales SET mat_codigo = ?, mat_descri = ?, mat_precio = ?, created_at = ?',[ req.body.codigo, req.body.material,req.body.precio, dateNow ], (err, rows) =>{
                if(err) return res.status(500).send( bodyResponse(false, err.message) );
                res.status(200).json( bodyResponse(true, 'Registro creado con Éxito!') );
            });

        });
    });
};

exports.update = function(req, res) {
    console.log( lo.parseInt(req.body.precio) );
    if( lo.isEmpty(req.body.codigo) ) return res.status(500).send( bodyResponse(false, 'Falta el parámetro Código') );
    if( lo.isEmpty(req.body.material) ) return res.status(500).send( bodyResponse(false, 'Falta el parámetro Material') );
    if( lo.isEmpty(req.params.id) ) return res.status(500).send( bodyResponse(false, 'Falta el parámetro Id') );

    req.getConnection((err, conn) =>{
        if(err) return res.status(500).send( bodyResponse(false, err.message) );

        conn.query('SELECT * FROM materiales WHERE mat_id <> ? AND  (LOWER(mat_codigo) = ? OR LOWER(mat_descri) = ?) LIMIT 1', [ req.params.id, lo.lowerCase(req.body.codigo), lo.lowerCase(req.body.material) ], (err, rows) =>{
            if( err ) return res.status(500).send( bodyResponse(false, err.message) );

            if( lo.filter(rows, function(o) { return o.mat_codigo == req.body.codigo  }).length != 0 ){
                return res.status(500).send( bodyResponse(false, 'El código ya se encuentra registrado, Por favor intente nuevamente.' ) );
            }
            if( lo.filter(rows, function(o) { return o.mat_descri == req.body.material  }).length != 0 ){
                return res.status(500).send( bodyResponse(false, 'El material ya se encuentra registrado, Por favor intente nuevamente.') );
            }

            conn.query('UPDATE  materiales SET mat_codigo = ?, mat_descri = ?, mat_precio = ? WHERE mat_id = ?', [ req.body.codigo, req.body.material, req.body.precio, req.params.id ], (err, rows) =>{
                if(err) return res.status(500).send( bodyResponse(false, err.message) );
                res.status(200).json( bodyResponse(true, 'Registro actualizado con Éxito!') );
            });
        });
    });
};

exports.delete = function(req, res) {
    req.getConnection((err, conn) =>{
        if(err) return res.status(500).send( bodyResponse(false, err.message) );

        conn.query(' DELETE FROM materiales WHERE mat_id = ?', [ req.params.id ], (err, rows) =>{
            if(err) return res.status(500).send( bodyResponse(false, err.message) );
            res.status(200).json( bodyResponse(true, 'Registro eliminado con Éxito!') );
        });
    });
};

function bodyResponse(status, body) {
    return {
        status : status,
        code: (status) ? 200 : 500,
        body: body
    };
}