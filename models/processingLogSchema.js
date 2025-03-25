// models/processingLogSchema.js
const mongoose = require('mongoose');
const { db2 } = require('../database/db');

const processingLogSchema = new mongoose.Schema({
    processName: {
        type: String,
        required: true,
        index: true
    },
    lastProcessedPage: {
        type: Number,
        default: 0
    },
    totalPages: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['running', 'completed', 'failed', 'stopped'],
        default: 'running'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    error: {
        type: String
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

const ProcessingLog = db2.model('ProcessingLog', processingLogSchema);

module.exports = ProcessingLog;