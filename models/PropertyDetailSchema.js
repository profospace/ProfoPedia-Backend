const mongoose = require('mongoose');

// Schema for storing detailed property information
const PropertyDetailSchema = new mongoose.Schema({
    // Reference to the original property record
    propertyId: {
        type: String,
        required: true
    },

    // Unique identifier based on registration details
    detailUniqueId: {
        type: String,
        unique: true,
        required: true
    },

    // Registration details
    registrationDetails: {
        dcode: String,
        regno: String,
        regyear: String,
        regdate: String,
        srocode: String,
        recieptNo: String,
        pcode: String,
        propertyNum: String,
        subDeedCode: String
    },

    // Parsed HTML content structured according to the actual HTML format
    parsedData: {
        // Document information
        documentType: String,
        year: String,
        registrationNumber: String,
        bindNumber: String,

        // Location information
        district: String,
        sro: String,
        ward: String,
        mohalla: String,

        // Property details
        landType: String,
        khataNumber: String,
        propertyDescription: String,
        areaUnit: String,
        area: String,
        ownershipShare: String,
        soldShare: String,

        // Financial details
        marketValue: String,
        transactionValue: String,
        stampDuty: String,

        // Dates
        executionDate: String,
        registrationDate: String,

        // Party information
        parties: {
            firstParty: [{
                name: String,
                relation: String,
                relationName: String,
                address: String
            }],
            secondParty: [{
                name: String,
                relation: String,
                relationName: String,
                address: String
            }],
            witnesses: [{
                name: String,
                relation: String,
                relationName: String,
                address: String
            }]
        },

        // Boundaries
        boundaries: {
            north: String,
            south: String,
            east: String,
            west: String
        }
    },

    // Original HTML content (for debugging/reference)
    rawHtml: {
        type: String,
        select: false // Don't include by default in queries
    },

    // Meta information
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create compound index for efficient queries
PropertyDetailSchema.index({
    'registrationDetails.regno': 1,
    'registrationDetails.regyear': 1,
    'registrationDetails.dcode': 1,
    'registrationDetails.srocode': 1
});

module.exports = mongoose.model('PropertyDetail', PropertyDetailSchema);