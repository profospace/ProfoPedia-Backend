// db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to first database (DB1)
const db1 = mongoose.createConnection(process.env.MONGO_URI_DB1);

// Connect to second database (DB2)
const db2 = mongoose.createConnection(process.env.MONGO_URI_DB2);

// Handle connection errors
db1.on('error', console.error.bind(console, 'DB1 connection error:'));
db2.on('error', console.error.bind(console, 'DB2 connection error:'));

db1.once('open', () => {
    console.log('Connected to Database 1');
});

db2.once('open', () => {
    console.log('Connected to Database 2');
});

module.exports = { db1, db2 };
