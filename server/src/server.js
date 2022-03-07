// SETTINGS REQUIRE
const http = require('http');
const app = require('./app');

// SETTINGS
const { loadPlanetsData } = require('./models/planets.model');



// On utilise le PORT mis en place par l'administrateur du serveur si cela a été fait sinon on définit sur 8000 (autre que 3000 car 3000 est utilisé par le côté client)
const PORT = process.env.PORT || 8000;

// On préfère utiliser le module hhtp de Node plutot que d'utiliser directement express, puis on passe comme argument qui est l'écouteur de requête l'app de express qui va écouter les requetes et les gérer. Ainsi on sépare la partie serveur et configuration du serveur et la gestion des requetes (qui sera dans un fichier a part entière: app.js)
const server = http.createServer(app);


// Récupérer toute les données nécessaires avant le lancement du serveur
async function startServer() {
  await loadPlanetsData();
  
  // Il faut mettre le lancement de serveur dans cette fonction pour qu'il soit lancé exclusivement après que les donées soient récupérées
  server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}...`);
  });
};

startServer();



