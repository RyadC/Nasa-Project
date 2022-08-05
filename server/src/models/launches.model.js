// REQUIRE LIBRARY
const axios = require('axios');

// REQUIRE FILES
const launchesDB = require('./launches.mongo');
const planetsDB = require('./planets.mongo');
const planetsErrors = require('./planets.error');
const launchesErrors = require('./launches.error');

// VARIABLES
// Le numéro de vol par défaut (comme indiqué dans le schéma de launch mongoDB)
const DEFAULT_FLIGHT_NUMBER = 100;
// URL de l'API SPACEX
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';


//----------------------------------------------------------------------------------------------------//

// f(): Récupérer les lancés de l'API SPACEX
async function loadLaunchData(){
  console.log('Downloading data...');

  // Regarder en BDD si on a déjà les lancés provenant de l'API Space X 
  const firstLaunch = await findOneLaunch({
    flightNumber: 1,
    mission: 'FalconSat',
    rocket: 'Falcon 1',
  });

  // Si oui, on arrête l'exécution de la fonction par question de performance car ça ne sert à rien de charger les données de l'API SPACE X et de les enregistrer si on les a déjà en BDD
  if(firstLaunch){
    console.log('Launch data already loaded!')
  }else{
    // Sinon, c'est qu'on ne les a pas, donc on charge les données de l'API Space X et on rempli la base de données avec celles-ci
    await populateDataBase();
  };
};


// f(): Rechercher les données de l'API Space X et les mettre en BDD
async function populateDataBase(){
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        },
      ],
    },
  });

  // Liste des Docs récuperer ci-dessus de l'API Space X
  const launchDocs = response.data.docs;
  // Boucler sur chaque doc pour récupérer les valeurs d'un lancé et les mettre en BDD
  for(let launchDoc of launchDocs){

    // Récupérer les payloads car contient les différent clients sous forme de tableau
    const payloads = launchDoc['payloads'];

    // On utilise flatMap qui est une fon ction permettant de boucler sur un tableau et à partir de chaque valeur contenu dans le tableau, d'exécuter une fonction et de retourner chaque valeur dans un seul et unique tableau. Donc si dans mon tableau j'ai plusieurs sous tableaux, tout ces sous tableaux deviendront un seul et unique tableau. C'est le cas ici pour payloads qui contient plusieurs tableau de customers que je veux regrouper en un seul tableau
    const customers = payloads.flatMap((payload) => {
      // La valeur de chaque payload['customers'] est un tableau
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket.name'],
      launchDate: launchDoc['date_local'],
      // target: 'Kepler-442 b', //not applicable
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      // Je peux écrire: customers: customers ou bien le raccourci ci-dessous
      customers,
    };

    // TODO: Enregistrer les vol de l'API SAPCE X dans la BDD
    await saveLaunch(launch);
  };
};


// f(): Regarder si un lancer existe déjà en BDD par des valeurs passées en paramètres (le filtre doit être un objet)
async function findOneLaunch(filter){
  return await launchesDB.findOne(filter);
};


// f(): Regarder si un lancer existe en BDD par son ID
async function existsLaunchWithId(launchId){
  const launch = await findOneLaunch({
    flightNumber: launchId,
  }, {
    _id: 0,
  });

  try{
    // Si le lancé n'existe pas en BDD
    if(!launch){
      throw new Error('Launch not found'); 
    }else{
      return launch;
    }

  }catch(err){
    return null;
  };
};


// f(): Exporter les données (il est préférable de faire une fonction qui exporte les données plutot que d'exporter les données directements dans le module.exports mais aussi de traiter les données dans le modele plutot que de les traiter dans le controller ou autres)
async function getAllLaunches(skip, limit) {
  // Rechercher tout les lancés dans MongoDB
  return await launchesDB
  .find({}, {
    _id: 0,
    __v: 0,
  })
  .sort({ flightNumber: 1 })
  .skip(skip)
  .limit(limit);
};


// f(): Récupérer en BDD le numéro du dernier vol enregistré
async function getLatestFlightNumber(){
  // Rechercher le vol avec findOne. On veut rechercher dans toute la liste, projection: on filtre les éléments de retour (on veut seulement la propriété flightNumber mais pas le id. findOne retourne un objet de type Query. Cette objet a des méthodes dont sort() qui filtre par ordre croissant ou décroissant. Ici on filtre par ordre décroissant pour avoir le vol le plus élevé. BIZAREMENT comme j'ai mis findOne il retourne un seul document. Si j'enlève la méthode sort() il me retourne le premier document qu'il trouve sans pour autant que ce soit le numéro le plus élevé mais si je mets sort il me renvoie le numéro le plus élevé alors que normalement sort() agit sur l'élément déjà retourné donc on dirait qu'il agit avant de retourné l'élément. En vérité ce qu'il se fait est qu'on commence d'abort par la méthode sort puis une fois filtré on exécute la fonction findOne)
  const latestLaunch = await launchesDB
  .findOne({}, 
    {
      flightNumber: 1,
      _id: 0,
    })
  .sort({ flightNumber: 'desc' })

  const latestFlightNumber = latestLaunch.flightNumber;

  console.log('Le vol avec le numéro le plus élevé est : ', latestFlightNumber);

  // Si aucun vol n'est enregistré, renvoyé la valeur par défaut
  if(!latestFlightNumber){
    return DEFAULT_FLIGHT_NUMBER;
  };

  return latestFlightNumber;
};


// f(): Ajouter un lancement du client au serveur. Prend en paramètre l'objet provenant du client.
async function scheduleNewLaunch(launch){

  // Si la planete du lancé à sauvegarder se trouve en BDD alors on enregistre le lancé
  if(await planetIsInTheDataBase(launch)){

    // Récupérer le numéro du dernier vol présent en BDD, l'incrémenter de 1 puis l'affecter au nouveau vol à enregistrer
    const incrementedFlightNumber = await getLatestFlightNumber() + 1;
    launch.flightNumber = incrementedFlightNumber;

    // On affecte les propriétés traitées côté back-end (celles non renseignées par le client) à l'objet launch (le lancé renseigné par le client)
    Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: ['Ryad', 'Neila', 'Samy']
    });

    // Sauvegarder le nouveau lancé en BDD
    saveLaunch(launch);

  // Sinon, on lance une erreur
  }else{
    planetsErrors.planetNotFound();
  };
};


async function planetIsInTheDataBase(launch){
  const planet = await planetsDB.findOne({
    keplerName: launch.target,
  });

  //Si la planete renseignée par le client n'est pas trouvée en BDD alors jetée un erreur
  if(planet){
    return true;
  }else{
    return false;
  };
};


// f(): Ajouter le lancé dans MongoDB
async function saveLaunch(launch){
  
  // On encadre notre enregistrement dans un try catch pour gérer le cad d'échec
  try{
    // Avant une certaine MAJ de mongoDB, lorsqu'on utilisait updateOne, il insérait une propriété nommé $setOnInsert et le renvoyé dans la query si le document été mis a jour mais dans les nouvelles versions de mongoDB, il ne le fait plus. Dans le cas où on ne voudrait pas que cette propriété soit renvoyé dans la query (pour les anciennes versions de mongoDB) il faudrait utiliser non pas updateOne mais findOneAndUpdate qui fait pareil mais ne rajoute pas cette propriété dans la query
    await launchesDB.updateOne({
      flightNumber: launch.flightNumber,
    }, 
    launch,
      {
      upsert: true,
    });
  } catch(err) {
    console.error('Le lancé ne peut être ajouté:', err);
  };

};


// f(): Supprimer un envoi (une donnée de la BDD)
async function abortLaunchById(launchId){
  // launchId correspond a launch.flightNumber
  // On préfère changer la propriété de notre objet puis selon sa valeur, l'afficher ou non côté front plutot que de supprimer la donnée de la BDD. Ainsi on garde la donnée en BDD mais ne la considère pas côté front. Le côté front est déjà codé pour aguir selon la valeur des propriété de l'objet launch qui est appelé ici aborted

  // Rechercher en BDD le lancé à annuler et changer ses propriétés
  const abortedLaunch = await launchesDB
  .updateOne({
    flightNumber: launchId,
  }, {
    success: false,
    upcoming: false,
  }, {
    // Ici on ne mets pas upsert sur true car on ne veut pas créer un document si celui n'existe pas en BDD. On veut juste mettre à jour des prpriétés d'un document existant. (Ici j'ai mis upsert: false mais j'aurais pu ne rien mettre du tout car par défaut false)
    upsert: false,
  }); 

  return abortedLaunch.modifiedCount;
};



module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};