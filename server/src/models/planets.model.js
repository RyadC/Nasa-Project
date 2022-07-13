const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planetsDB = require('./planets.mongo');


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
    .on('data', async (planet) => {
      if(isPlanet(planet)){
        await savePlanet(planet);
      };
    })
    .on('error', (err) => {
      console.log(err);
      // Si une erreur survient, la promesse est rejetée avec la valeur d'erreur
      reject(err);
    })
    .on('end', async () => {
      const planetsFoundNumber = (await getAllPlanets()).length;
      console.log(`${planetsFoundNumber} planètes trouvées !`);

      // Quand le traitement est finie, la promesse est résolue mais nous ne retournons rien car notre tableau est déjà traité dans l'évènement data
      resolve();
    });
  });
};

  
// f(): Gérer la transmission des données (au lieu de transmettre les données directement via le module.exports)
// Cela est gérer par MongoDB donc asynchrone, il faut attendre le retour
async function getAllPlanets() {
  // On recherche toutes les planètes dans la BDD. On mets un objet vide comme filtre car on ne veut pas filtrer, on veut tout récupérer
  // Model.find() renvoie un objet qui est une instance de la classe mongoose "Query". Cet objet contient les données demandées avec comme propriété la donnée cherchée mais aussi un id et une version. Décommenter le console.log pour voir
  // Le premier argument de find est le filtre qui permet de filtrer quel document on veut dans la collection puis le deuxieme argument permet de filtrer les propriétés du document
  // console.log(await getAllPlanets())
  return await planetsDB.find({}, {
    // Mettre à 0 pour ne pas inclure ces propriétés du document dans la réponse
    __v: 0,
    _id: 0, 
  });
};


// f(): Sauvegarder, mettre à jour, des données dans la BDD MongoDB
// Cela est gérer par MongoDB donc asynchrone, il faut attendre le retour
async function savePlanet(planet){
  // Capturer une éventuelle erreur lors de la sauvegarde/maj dans la bdd
  try {
    // On crée notre document pour sauvegarder la planète dans la BDD Mongo (cette opération est gérée par MongoDB et non JS donc on doit faire un await sinon comme JS s'en débarasse a MongoDB et continue son execution il n'aura pas les donées lorsqu'il va continuer).
    // On utilise la méthode "update" car comme nous avons des instance de node (cluster), le code va être exécuté plusieur fois est donc les éléments peuvent etre injecter en BDD en double donc cette methode permet de l'injecter si elle n'existe pas, de la mettre à jour si un changement a eu lieu et de ne rien faire si elle existe deja
    // "updateOne" permet 3 choses. Le 1er parametre filtre la donnée à mettre à jour parmi les données stockées, le 2eme permet de créer la donnée si elle n'existe pas parmi les données stockées, le 3eme permet de mettre à jour si elle existe déjà 
    await planetsDB.updateOne({
      keplerName: planet.kepler_name,
    }, {
      keplerName: planet.kepler_name,
    }, {
      upsert: true,
    });
  } catch (err) {
    console.error(`Could not save planet in the Database ${err}`);
  };
};

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};