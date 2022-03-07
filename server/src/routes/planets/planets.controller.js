const { planets } = require('../../models/planets.model');

function getAllPlanets(req, res) {

    // On utilise return pour etre sur que la fonction ne va retourner qu'une seule réponse et non plusieurs car si il y en a plusieurs, express se plainds. Sa permet d'être explicite sur la manière dont la fonction fini son exécution puis sa permet d'éviter des bogues
    return res.status(200).json(planets);
};


module.exports = {
  getAllPlanets,
};