// const mongoose = require('mongoose');
// const { db2 } = require('../database/db');

// // Village Schema
// const villageSchema = new mongoose.Schema({
//     villageCode: { type: String, required: true, unique: true },
//     villageName: { type: String, required: true },
//     districtCode: { type: String, required: true },
//     sroCode: { type: String, required: true },
//     scrapedAt: { type: Date, default: Date.now }
// });

// const Village = db2.model('Village', villageSchema);

// module.exports = Village


const mongoose = require('mongoose');
const { db2 } = require('../database/db');

// Village Schema - Used as a subdocument
const villageSchema = new mongoose.Schema({
    villageCode: { type: String, required: true },
    villageName: { type: String, required: true },
    scrapedAt: { type: Date, default: Date.now }
});

// SRO Office Schema - Contains array of villages
const sroSchema = new mongoose.Schema({
    sroCode: { type: String, required: true },
    sroName: { type: String, required: true },
    villages: [villageSchema],
    lastUpdated: { type: Date, default: Date.now }
});

// District Schema - Contains array of SRO offices
const districtSchema = new mongoose.Schema({
    districtCode: { type: String, required: true, unique: true },
    districtName: { type: String, required: true },
    sroOffices: [sroSchema],
    lastUpdated: { type: Date, default: Date.now }
});

const Village = db2.model('Village', districtSchema);

module.exports = Village ;