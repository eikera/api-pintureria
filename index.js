
const express = require('express');
const vCors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const routes = require('./src/routes');

const app = express();

const paramsDB = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'prueba_tecnica'
};
app.set('port', process.env.port || 3001);


//Middlewares
app.use(express.json());
app.use('*', vCors());
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

    if (req.method == 'OPTIONS') {
        res.status(200);
        res.write("Allow: GET,PUT,POST,DELETE,OPTIONS");
        res.end();
    } else {
        next();
    }
});

app.use(myConnection(mysql, paramsDB, 'single'));

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use('/api', routes);
app.use(function(req, res, next) {
        if (!req.route)
            return next ({success:false,code:404,message:"Not found"});  
        next();
    });
    
    app.use(function(err, req, res, next){
        if(err.success == false && err.code == 404)
            res.send({success:false,code:404,message:err.message});
    })


//server start
app.listen(app.get('port'), ()=>{
    console.log(`Server running ${ app.get('port') }`);
});

