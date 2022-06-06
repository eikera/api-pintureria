const moment = require('moment');
var dateNow = moment().format('YYYY-MM-DD hh:mm:ss');

const lo = require('lodash');

exports.getOne = async function(req, res) {
    var returnData = {
        id : req.params.id,
        descripcion : '',
        manoObra : '',
        total : 0,
        detalle : []
    };
    await getPresupuesto (req).then(async (resp)=>{
        console.log(resp[0]);
        returnData.descripcion = resp[0].det_descri;
        returnData.manoObra = resp[0].det_manobr;
        var detalle = 0;

        for await (element of resp){
            detalle = detalle + (parseFloat(element.det_precio) * element.det_cantid);
            returnData.detalle.push(
                {
                    area : element.det_area,
                    material: element.mat_descri,
                    cantid : element.det_cantid,
                    precio : element.det_precio,
                    totalDetalle: parseFloat(element.det_precio) * element.det_cantid
                }
            );
        }
        returnData.total = detalle;
        res.status(200).json( bodyResponse(true, returnData) );
    }).catch((err)=>{
        console.log("entra error", err);
        return res.status(500).send( bodyResponse(false, err) );
    });
    
};

exports.create = async function(req, res, next) { 
    let reqBody = req.body;
    if( lo.isEmpty(reqBody.descripcion) ) return res.status(500).send( bodyResponse(false, 'Falta el parámetro Descripción') );
    if( lo.isEmpty(reqBody.manoObra) ) return res.status(500).send( bodyResponse(false, 'Falta el parámetro Mano de Obra') );
    if( reqBody.detalle.length == 0 ) return res.status(500).send( bodyResponse(false, 'Falta agregar los materiales y  el área de la casa a pintar') );

    let manoDeObra = reqBody.manoObra;
    let code = makeid(6);
    let detalle = 0;

    var returnData = {
        id : code,
        descripcion : reqBody.descripcion,
        manoObra : reqBody.manoObra,
        total : detalle,
        detalle : []
    };

    for await (const element of reqBody.detalle) {
        await getMaterials (req, element.materialId ).then(async (resp)=>{
            if((lo.isEmpty(resp[0]))) return;

            let data = {
                code : code,
                descri : reqBody.descripcion,
                manObra : reqBody.manoObra,
                area : element.area,
                material : resp[0].mat_id,
                cantid : element.cantidad,
                precio : resp[0].mat_precio
            };
            detalle = detalle + (parseFloat(data.precio) * data.cantid);
            returnData.detalle.push(
                {
                    area : element.area,
                    material: resp[0].mat_descri,
                    cantid : element.cantidad,
                    precio : resp[0].mat_precio,
                    totalDetalle: parseFloat(data.precio) * data.cantid
                }
            );
            await insertDetail(req, data);
        }).catch((err)=>{
            return res.status(500).send( bodyResponse(false, err) );
        });
    }
    returnData.total = parseFloat(detalle) + parseFloat(reqBody.manoObra);
    res.status(200).json( bodyResponse(true, returnData) );
};

function bodyResponse(status, body) {
    return {
        status : status,
        code: (status) ? 200 : 500,
        body: body
    };
}

function getMaterials(req,id) {
    return new Promise((resolve,reject)=> {
        req.getConnection( (err, conn) =>{
            if( err ) reject(err.message);
            conn.query('SELECT * FROM materiales WHERE mat_id = ?', [ id ], (err, rows) =>{
                if( err ) reject(err.message);
                resolve(rows);
            });
        });
    });
}

function insertDetail(req,data) {
    return new Promise((resolve,reject)=> {
        req.getConnection( (err, conn) =>{
            if( err ) reject(err.message);
            conn.query('INSERT INTO presupuesto SET det_perid = ?, det_descri= ?, det_manobr= ?, det_area = ?, det_material = ?, det_cantid = ?, det_precio = ?, created_at = ? ', 
                [ data.code, data.descri , data.manObra,data.area, data.material, data.cantid, data.precio, dateNow ], (err, rows) =>{
                    if( err ) reject(err.message);
                    resolve('');
            });
        });
    });
}

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   return result;
}

function getPresupuesto(req) {
    return new Promise((resolve,reject)=> {
        req.getConnection( (err, conn) =>{
            if( err ) reject(err.message);
            conn.query('SELECT * FROM presupuesto INNER JOIN materiales ON materiales.mat_id = presupuesto.det_material where det_perid = ? ', [req.params.id], (err, rows) =>{
                if( err ) reject(err.message);
                resolve(rows);
            });
        });
    });
}