const API_URL = `http://localhost:8000`;

// Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
  // Le navigateur va bloquer la réponse de fetch car la politique CORS mis en place dans les navigateurs interdisent de dialoguer avec des serveurs différents ou bien un même serveur mais sur des ports différents et cela par mesure de sécurité pour la fuite de nos données. Mais nous pouvons permettre cela en ajoutant au header de notre réponse du serveur l'en tete access-control-allowed-origin: <server-autorisé>. Ainsi le navigateur ne va pas bloquer la réponse car le serveur aura permis de partager les données. On peut aussi utiliser un paquet npm qui se nomme cors et qui est en fait un middleware qui prend en parametre ladresse a qui on autorise de lire nos données.
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  // Load launches, sort by flight number, and return as JSON.
}

async function httpSubmitLaunch(launch) {
  // TODO: Once API is ready.
  // Submit given launch data to launch system.
}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  // Delete launch with given ID.
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};