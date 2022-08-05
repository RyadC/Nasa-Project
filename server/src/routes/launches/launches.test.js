// Librairie pour faire des test spécifiquement pour les API (tests requêtes HTTP)
const request = require('supertest');

// Importer notre application
const app = require('../../app');
const mongoService = require('../../services/mongo');

// VARIABLES
const URL_LAUNCHES = '/v1/launches';

describe('Launches tests', () => {
  beforeAll(async () => {
    await mongoService.mongoConnect();
  });

  afterAll(async () => {
    await mongoService.mongoDisconnect();
  });

  // Début des tests avec Jest
  describe('Test GET /launches', () => {
    // Comme il s'agit d'un test d'API je dois attendre la réponse du serveur avant de continuer à lire le code
    test('It should respond with 200 success', async () => {
      // On utilise la librairie supertest pour faire des appels à l'API
      const response = await request(app)
      .get(`${URL_LAUNCHES}`)
      // On vérifie si le retour est bien du json avec une regex
      .expect('Content-Type', /json/)
      // On vérifie si le code de retour est bien 200 
      .expect(200);

      // En dessous correspond à la fonction de jest pour vérifier les résultats mais on peut utiliser la fonction expect de supertest en chainant la valeur de retour (voir au dessus)
      // expect(response.statusCode).toBe(200);
    });
  });

  describe('Test POST /launches', () => {
    // On peut définir des variables dans le bloc describe qu'on peut réutiliser dans les blocs test

    const completeLaunchData = {
      mission: "Exoplants delta test",
      rocket: "Rocket XS",
      launchDate: 'January 4, 2028',
      target: "Kepler-1652 b"
    };

    const launchDataWithoutDate = {
      mission: "Exoplants delta test",
      rocket: "Rocket XS",
      target: "Kepler-1652 b"
    };

    const launchDataWithInvalidDate = {
      mission: "Exoplants delta test",
      rocket: "Rocket XS",
      launchDate: 'hello',
      target: "Kepler-1652 b"
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app)
      .post(`${URL_LAUNCHES}`)
      // On pass un objet JS qui sera traduit en JSON
      .send(completeLaunchData)
      .expect('Content-Type', /json/)
      .expect(201);

      // Formatage de la date envoyée et de la date reçu (voir explication dans le commentaire ci-dessous)
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      // On vérifie aussi que les paramètres espérés sont biens présents. On utilise expect() de Jest qui a une fonction bien faite pour cela
      // Quand on ajoute un launch on a défini dans notre code (controller) que le serveur renvoie le launch créé au format json donc ce qu'on envoie doit correpondre à ce qu'on reçoit du serveur avec quelques propriétés en plus (upcoming, success, company, etc). Si les propriétés envoyées avec post divergent de celles reçu du serveur alors là il y a un problème (toMatchObject compare la présence partielle des propriétés de l'objet en question): et la on voit que 'January 4, 2028' est différent dans la forme de ce que le serveur renvoie donc il faut formater la réponse du serveur de sorte à ce que ce soit identique pour ensuite pouvoir comparer si la date (en dehors de sa forme) est identique. C'est ce qu'on fait juste en haut.

      // On vérifie les propriétés en dehors de la date
      expect(response.body).toMatchObject(launchDataWithoutDate);

      // On vérifie si la date envoyée correspond à la date retournée
      expect(responseDate).toBe(requestDate);

    });


    test('It should catch missing required properties', async () => {
      const response = await request(app)
      .post(`${URL_LAUNCHES}`)
      .send(launchDataWithoutDate)
      .expect('Content-Type', /json/)
      .expect(400);

      // L'objet de retour doit strictement retourner l'objet ci-dessous, ni plus, ni moins (contrairement à toMatchObject)
      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });


    test('It should catch invalid dates', async () => {
      const response = await request(app)
      .post(`${URL_LAUNCHES}`)
      .send(launchDataWithInvalidDate)
      .expect('Content-Type', /json/)
      .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Launch date invalible',
      });
    });

  });

  describe('Test DELETE /launches/:id', () => {

    const completeLaunchData = {
      mission: "Exoplants delta",
      rocket: "Explorer IS1",
      launchDate: 'January 4, 2028',
      target: "Kepler-1652 b"
    };

    let addedLaunchFlightNumber = null;

    beforeAll(async () => {
      const addedLaunch = await request(app)
        .post(`${URL_LAUNCHES}`)
        .send(completeLaunchData);
        // console.log(addedLaunch.body.flightNumber)

        addedLaunchFlightNumber = addedLaunch.body.flightNumber;
    })

    test('It should respond with 200 success and return the aborted launch', async () => {
      const response = await request(app)
        .delete(`${URL_LAUNCHES}/${addedLaunchFlightNumber}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toStrictEqual({
        ok: 'Launch successfully aborted',
      });
    });

    test('It should respond with 404 error and return "Launch not found"', async () => {
      const response = await request(app)
      .delete(`${URL_LAUNCHES}/${(addedLaunchFlightNumber + 1).toString()}`)
      .expect('Content-Type', /json/)
      .expect(404);

      expect(response.body).toStrictEqual({
        error: 'Launch not found',
      });
    });

    test('It should respond with 404 error and return "Launch not aborted"', async () => {
      const response = await request(app)
        .delete(`${URL_LAUNCHES}/${addedLaunchFlightNumber}`)
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).toStrictEqual({
        error: 'Launch not aborted',
      });
    });
  });
})

