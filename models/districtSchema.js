const mongoose = require('mongoose');
const { db2 } = require('../database/db');


const districtSchema = new mongoose.Schema({
    districtCode: {
        type: String,
        required: true,
        unique: true
    },
    districtName: {
        type: String,
        default: ''
    },
    sroList: [{
        sroCode: String,
        sroName: String
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const District = db2.model('District', districtSchema);
module.exports = District;
