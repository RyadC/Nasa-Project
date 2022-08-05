// Ce fichier ...

const mongoose = require('mongoose');

// Nous créons un schéma qui est ce à quoi devra ressembler chaque donnée stockée. Le schéma permet de définir la forme de ces données en leur donnant des contraintes (ex: tel donnée est une string, etc)
const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    default: 100,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  customers: {
    type: [String],
    required: true,
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

// Après avoir créé le schema, on créé le model mongoose qui va utiliser le schema ci-dessus et faire la liaison avec les collections dans MongoDB
// Pour les schema, toujours donner le nom au pluriel de ce qui est stocké puis pour les models, toujours donner le nom au singulier
module.exports = mongoose.model('Launch', launchesSchema);