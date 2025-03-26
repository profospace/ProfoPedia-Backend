const mongoose = require('mongoose');
const { db2 } = require('../database/db');

const FailedDeedSchema = new mongoose.Schema({
    receiptNo: { type: String },
    dcode: { type: String },
    regno: { type: String },
    regyear: { type: String },
    srocode: { type: String },
    recordUniqueId: { type: String },
    districtCode: { type: String },
    gaonCode1: { type: String },
    propNEWAddress: { type: String },
    errorMessage: { type: String },
    status: { type: String, default: 'FAILED' },
    failedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create compound index for faster lookups
FailedDeedSchema.index({ recordUniqueId: 1 });

module.exports = db2.model('FailedDeed', FailedDeedSchema);