// REQUIRE FILES
const launches = require('../../models/launches.model');
const queryServices = require('../../services/query');
// const launchesDB = require('../../models/launches.mongo');

async function httpGetAllLaunches(req, res){
  // Pour avoir la liste des lancements sous format json. Json prend en paramètre un tableau ou un objet donc je dois d'abord convertir mes valeur retourner par l'objet map en tableau ou objet pour qu'il soit ensuite tranformé en json car à la base il retourne un iterableIterator.
  const { skip, limit } = queryServices.isPagination(req.query);
  const launchesData = await launches.getAllLaunches(skip, limit);
  return res.status(200).json(launchesData);
}

async function httpAddNewLaunch(req, res){
  const launch = req.body;

  // Si des champs ne sont pas renseignés côté client
  if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  };

  launch.launchDate = new Date(launch.launchDate);
  // Vérifier si la date renseigner côté client est bien une date et non autre chose (avec isNaN node convertie la date en nombre qui est la date Unix, si c'est possible cest que cest une date sinon ce que cest autre chose. Je préfère utiliser launch.launchDate.toString() === 'Invalid Date' pour savoir si cest une date ou non car la méthode toString renvoie 'Invalid Date' si il ne s'agit pas d'une date)
  if(isNaN(launch.launchDate)){
    return res.status(400).json({
      error: 'Launch date invalible',
    });
  };

  await launches.scheduleNewLaunch(launch);


  return res.status(201).json(launch);
}


async function httpAbortLaunch(req, res){
  // Attention de bien covertir en nombre car dans notre objet launch, le paramètre flightNumber est un nombre et non une chaine de caractere. Ici req.params.id renvoie une chaine de caractère
  const launchId = Number(req.params.id);

  // Si l'id n'existe pas
  const existLaunch = await launches.existsLaunchWithId(launchId);
  if(!existLaunch){
    return res.status(404).json({
      error: 'Launch not found',
    });
  }

  // Si l'id existe, changer ses propriétés
  const aborted = await launches.abortLaunchById(launchId);
  
  if(!aborted){
    return res.status(404).json({
      error: 'Launch not aborted',
    });
  }

  return res.status(200).json({
    ok: 'Launch successfully aborted',
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
}