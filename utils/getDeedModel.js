const mongoose = require('mongoose');
const { db2 } = require('../database/db');
const deedSchema = require('../models/deedSchema'); // export schema only, not model

function getDeedModel(collectionName = 'deeds') {
  // Avoid redefining models
  if (db2.models[collectionName]) {
    return db2.models[collectionName];
  }

  // Dynamically bind schema to the provided collection name
  return db2.model(collectionName, deedSchema, collectionName);
}

module.exports = getDeedModel;
