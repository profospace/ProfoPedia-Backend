const mongoose = require('mongoose');
const { db1 } = require('../database/db');

// Schema to store unique receipt numbers
const ReceiptNumberSchema = new mongoose.Schema({
    receiptNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true // Index for faster lookups
    },
    // Optional: Store additional metadata about when this receipt was first encountered
    firstEncounteredAt: {
        type: Date,
        default: Date.now
    },
    // Optional: Reference to the property record where this receipt was found
    associatedRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyRecord'
    }
}, {
    timestamps: true
});

// Create the model
const ReceiptNumber = db1.model('ReceiptNumber', ReceiptNumberSchema);

module.exports = ReceiptNumber;