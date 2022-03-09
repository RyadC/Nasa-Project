// SETTINGS REQUIRE
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

// SETTINGS
const app = express();

// REQUIRE APP
const planetsRouter = require('./routes/planets/planets.routes');


// iddleware de sécurité: Pour mettre l'en tete access-control-allowed-origin à toutes mes réponses qui vont sortir du serveur pour que le navigateur ne bloque pas la réponse au client
app.use(cors({
  origin: 'http://localhost:3000',
}));

// Middleware de suivi: Enregistre et log les requetes effectuées à notre serveur
app.use(morgan('combined'));

// Pour n'accepter que les requetes dont le Content-Type est en json puis le transformer en objet JS
app.use(express.json());

// Pour servir les actifs de l'application
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(planetsRouter);

// EXPORT
module.exports = app;
