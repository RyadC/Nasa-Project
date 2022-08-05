// SETTINGS REQUIRE
const mongoose = require('mongoose');

// SETTINGS FILE
const dotenv = require('dotenv');
dotenv.config();


// Notre URL pour accéder à la BDD en cloud. Cette URL contient notre mot de passe
const MONGO_URL =  process.env.MONGO_URL;;

// EventEmetteur pour écouter lorsqu'on se connecte à la BDD. On met l'écouteur provenant de node 'once' pour n'écouter qu'une fois et non les fois suivantes
mongoose.connection.once('open', () => {
  console.log('Mongo Database open!');
});

mongoose.connection.on('error', (err) => {
  console.error(err)
});

async function mongoConnect(){
  await mongoose.connect(MONGO_URL);
};

async function mongoDisconnect(){
  await mongoose.disconnect();
};

module.exports = {
  mongoConnect,
  mongoDisconnect,
};