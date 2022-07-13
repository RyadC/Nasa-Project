const API_URL = `http://localhost:8000/v1`;

// Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`);
  // console.log('ok')
  return await response.json();
  // Le navigateur va bloquer la réponse de fetch car la politique CORS mis en place dans les navigateurs interdisent de dialoguer avec des serveurs différents ou bien un même serveur mais sur des ports différents et cela par mesure de sécurité pour la fuite de nos données. Mais nous pouvons permettre cela en ajoutant au header de notre réponse du serveur l'en tete access-control-allowed-origin: <server-autorisé>. Ainsi le navigateur ne va pas bloquer la réponse car le serveur aura permis de partager les données. On peut aussi utiliser un paquet npm qui se nomme cors et qui est en fait un middleware qui prend en parametre ladresse a qui on autorise de lire nos données.
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches`);
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a, b) => a.flightNumber - b.flightNumber);
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try{
    return await fetch(`${API_URL}/launches`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(launch),
    });  
  }catch(err){
    return {
      ok: false,
    };
  };
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try{
    return await fetch(`${API_URL}/launches/${id}`, {
      method: 'delete',
    });
  }catch(err){
    console.log(err)
    return {
      ok: false,
    };
  };
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};