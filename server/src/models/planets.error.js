function planetNotFound() {
  const planetNotFoundError = new Error(`Planet target not found in the database`);
  // Ajout d'une propriété afin qu'on sache s'il s'agit d'une erreur opérationnel et non de programmation
  planetNotFoundError.isOperational = true;
  throw planetNotFoundError;
};


module.exports = {
  planetNotFound,
}