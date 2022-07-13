// SETTINGS REQUIRE
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

// SETTINGS
const app = express();

// REQUIRE APP
const api = require('./routes/api');


// iddleware de sécurité: Pour mettre l'en tete access-control-allowed-origin à toutes mes réponses qui vont sortir du serveur pour que le navigateur ne bloque pas la réponse au client
app.use(cors({
  origin: 'http://localhost:3000',
  // credentials: 'true',
}));

// Middleware de suivi: Enregistre et log les requetes effectuées à notre serveur. Lors d'une requete on voit en console des détails de la requete
  // Si je veux que le log se fasse dans un fichier et non dans la console (par défaut cest dans la console).Je crée un fichier puis indique à morgan d'écrire dedans
// const logRequestFile = fs.createWriteStream(path.join(__dirname, 'logRequestFile.txt'),{flags: 'a'});
// app.use(morgan('combined', {stream: logRequestFile}));
app.use(morgan('combined'));

// Pour n'accepter que les requetes dont le Content-Type est en json puis le transformer en objet JS
app.use(express.json());

// Regroupe l'ensemble des routes de notre API pour la version 1 (si une autre version alor un second middleware pour gérer les routes de notre api)
app.use('/v1', api);

// Pour servir les actifs de l'application
app.use(express.static(path.join(__dirname, '..', 'public')));

// On ajoute un '*' pour dire que toute correspondance vanant après le '\' qui ne correspond pas au middleware en haut peuvent etre géré ici
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});



// EXPORT
module.exports = app;
