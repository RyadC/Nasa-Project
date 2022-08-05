const express = require('express');

const planetsRouter = require('../routes/planets/planets.routes');
const launchesRouter = require('../routes/launches/launches.routes');

// On regroupe les routes dans ce middleware qui représente notre API. Cela car si on a une version 2, on pourra regrouper les nouvelles routes de notre v2 dans un middleware différent. On regroupe les iddleware par version
const api = express.Router();

// Gérer les routes /planets et /launches
api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;
