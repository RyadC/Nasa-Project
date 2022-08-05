const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_LIMIT = 0;

function isPagination(query) {
  // On utilise Math.abs pour avoir un chiffre positif puis convertir la string en number
  // Si le paramètre n'est pas renseigné par le client alors on prend la valeur defaut qui est 0. Pour Mongo, 0 veut dire ne pas appliquer de filtre est donc tout prendre. Donc si le client ne renseigne rien, on lui transmets toutes les données
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;

  // skip permet de commencer au bout d'une certaine page
  // Ex: Si le client tape 20 document et page 1 alors : 1 - 1 = 0 * 20 = 0 donc on ne saute rien et on commence depuis le début
  // Ex: Si le client tape 20 document et page 2 alors : 2 - 1 = 1 * 20 = 20 alors on saute 20 doc (qui correspond à une page) puis on lui affiche à partir du 21 (qui correspond donc à la 2ème page)
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

module.exports = {
  isPagination,
};