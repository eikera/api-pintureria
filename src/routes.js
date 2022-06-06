const express = require('express');
const routes = express.Router();

var materialController = require('./controllers/materialsController');
var presupuestoController = require('./controllers/presupuestoController');


routes.get('/materiales', materialController.getAll);
routes.post('/materiales', materialController.create);
routes.put('/materiales/:id', materialController.update);
routes.delete('/materiales/:id', materialController.delete);

routes.get('/presupuesto/:id', presupuestoController.getOne);
routes.post('/presupuesto', presupuestoController.create);

module.exports = routes;