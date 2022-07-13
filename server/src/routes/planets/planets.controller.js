const planets = require('../../models/planets.model');

// Comme la fonction planets.getAllPlanets renvoie est une fonction qui renvoie une promesse il faut mettre en async await pour attendre le retour de MongoDB
async function httpGetAllPlanets(req, res) {
    // On utilise return pour etre sur que la fonction ne va retourner qu'une seule réponse et non plusieurs car si il y en a plusieurs, express se plainds. Sa permet d'être explicite sur la manière dont la fonction fini son exécution puis sa permet d'éviter des bogues
    return await res.status(200).json(await planets.getAllPlanets());
};


module.exports = {
  httpGetAllPlanets,
};