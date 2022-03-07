const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

let planets = [];

/* ATTENTION !! 

Il faut, avant de lancer le serveur, récupérer la totalité de la liste de planètes à partir du csv. Comme Node fonctionne en asynchrone, si je ne gère pas cette facette là, lorsque le fichier controller sera lu il va exécuté le code du model (code de ce fichier) et vu que j'utilise un stream qui fonctionne en asynchrone, il va renvoyer mon tableau sans pour autant avoir attendu la réponse entière de mon stream. Ainsi je dois lui dire qu'il faut attendre la réception totale des données puis ensuite retourner la valeur.

Ce qu'on fait généralement c'est qu'on récupère toute les données qu'on a besoin AVANT le lancement du serveur.

Pour se faire, il faut créer une promise qui lorsqu'elle sera résolu on pourra lancer le serveur. Cette promise sera précédé du mot clé await pour dire a node qu'il faut attendre le retour de la promise avant de continuer à poursuivre le code. Await ne peut fonctionner que dans une fonction précédé du mot clé async.

*/

function loadPlanetsData () {

  // Création de notre Promise
  return new Promise((resolve, reject) => {

    // Ouverture d'un flux lisible du fichier
    const streamRead = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'));
      
    // Configuration du parser
    const parser = parse({
      comment: '#',
      columns: true,
    });

    // Fonction de filtrage des planètes
    function isPlanet(planet){
      return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6;
    };

    // Transmission du fichier lu au parser
    streamRead.pipe(parser)
    // Retourne un flux qu'on peut gérer via des évènements. Ici, à chaque fois qu'un morceau de flux est transmis et traité, il déclenche l'évènement data et exécute le code associé
    .on('data', (planet) => {
      if(isPlanet(planet)){
        planets.push(planet);
      };
    })
    .on('error', (err) => {
      console.log(err);
      // Si une erreur survient, la promesse est rejetée avec la valeur d'erreur
      reject(err);
    })
    .on('end', () => {
      console.log(`${planets.length} planètes trouvées !`);
      // Quand le traitement est finie, la promesse est résolue mais nous ne retournons rien car notre tableau est déjà traité dans l'évènement data
      resolve();
    });
  });
};

  




module.exports = {
  loadPlanetsData,
  planets,
};