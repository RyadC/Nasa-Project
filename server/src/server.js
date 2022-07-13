// SETTING FILE
const dotenv = require('dotenv');

// DOTENV permet de faire la liaison entre notre fichier de configuration .env et notre objet global node process.env. On sépare ainsi la configuration de notre code source (notamment les mot de passe pour se connecter à la BDD). Ainsi, si on partage notre code on peut placer le fichier .env dans le gitignore pour pas qu'il soit sur GitHub
dotenv.config();

// SETTINGS REQUIRE
const http = require('http');

// SETTINGS
const app = require('./app');
const mongoService = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');



// On utilise le PORT mis en place par l'administrateur du serveur si cela a été fait sinon on définit sur 8000 (autre que 3000 car 3000 est utilisé par le côté client)
const PORT = process.env.PORT || 8000;

// On préfère utiliser le module hhtp de Node plutot que d'utiliser directement express, puis on passe comme argument qui est l'écouteur de requête l'app de express qui va écouter les requetes et les gérer. Ainsi on sépare la partie serveur et configuration du serveur et la gestion des requetes (qui sera dans un fichier a part entière: app.js)
const server = http.createServer(app);

startServer();

// f(): Récupérer toute les données nécessaires avant le lancement du serveur
async function startServer() {
  // Configurer l'accès à la BDD
  await mongoService.mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();
  
  // Il faut mettre le lancement de serveur dans cette fonction pour qu'il soit lancé exclusivement après que les donées soient récupérées
  server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}...`);
  });
};
