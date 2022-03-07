// SETTINGS REQUIRE
const express = require('express');
const cors = require('cors');

// SETTINGS
const app = express();

// REQUIRE APP
const planetsRouter = require('./routes/planets/planets.routes');


// Pour mettre l'en tete access-control-allowed-origin à toutes mes réponses qui vont sortir du serveur pour que le navigateur ne bloque pas la réponse au client
app.use(cors({
  origin: 'http://localhost:3000',
}));

// Pour n'accepter que les requetes dont le Content-Type est en json puis le transformer en objet JS
app.use(express.json());

app.use(planetsRouter);

// EXPORT
module.exports = app;
