const mongoose = require('mongoose');
const { db2 } = require('../database/db');

// Define the schema for a party (seller, buyer, or witness)
const partySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    parentName: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    }
});

// Define the main deed schema
const deedSchema = new mongoose.Schema({
    // Document Info
    deedType: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    year: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    documentNumber: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    volumeNumber: {
        type: String,
        trim: true
    },

    // Property Location
    district: {
        type: String,
        trim: true,
        index: true
    },
    subRegistrar: {
        type: String,
        trim: true,
        index: true
    },
    ward: {
        type: String,
        trim: true
    },
    locality: {
        type: String,
        trim: true
    },

    // Property Details
    landType: {
        type: String,
        trim: true,
        index: true
    },
    khasraNumber: {
        type: String,
        trim: true
    },
    propertyDescription: {
        type: String,
        trim: true
    },
    unitType: {
        type: String,
        trim: true
    },
    area: {
        type: Number,
        default: 0
    },
    ownershipShare: {
        type: Number,
        default: 0
    },
    soldShare: {
        type: Number,
        default: 0
    },

    // Financial Details
    marketValue: {
        type: Number,
        required: true,
        default: 0,
        index: true
    },
    transactionValue: {
        type: Number,
        required: true,
        default: 0,
        index: true
    },
    stampDuty: {
        type: Number,
        default: 0
    },

    // Dates (stored as strings initially as they come in various formats)
    executionDate: {
        type: String,
        trim: true
    },
    registrationDate: {
        type: String,
        trim: true
    },

    // Parsed dates (for querying)
    executionDateParsed: {
        type: Date,
        index: true
    },
    registrationDateParsed: {
        type: Date,
        index: true
    },

    // Parties
    firstParty: [partySchema],
    secondParty: [partySchema],
    witnesses: [partySchema],

    // Form Data Fields from the request
    dcode: {
        type: String,
        trim: true,
        index: true
    },
    regno: {
        type: String,
        trim: true,
        index: true
    },
    regyear: {
        type: String,
        trim: true,
        index: true
    },
    regdate: {
        type: String,
        trim: true
    },
    srocode: {
        type: String,
        trim: true,
        index: true
    },
    recieptNo: {
        type: String,
        trim: true
    },
    pcode: {
        type: String,
        trim: true
    },
    propertyNum: {
        type: String,
        trim: true
    },
    subDeedCode: {
        type: String,
        trim: true
    },
    propertyId: {
        type: String,
        trim: true
    },
    detailUniqueId: {
        type: String,
        trim: true,
        unique: true,
        index: true
    },

    // Meta Information
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add text indexes for search functionality
deedSchema.index({
    'deedType': 'text',
    'district': 'text',
    'subRegistrar': 'text',
    'propertyDescription': 'text',
    'firstParty.name': 'text',
    'secondParty.name': 'text'
});

// Pre-save middleware to parse dates
deedSchema.pre('save', function (next) {
    // Parse execution date
    if (this.executionDate) {
        const executionDate = parseDate(this.executionDate);
        if (executionDate) {
            this.executionDateParsed = executionDate;
        }
    }

    // Parse registration date
    if (this.registrationDate) {
        const registrationDate = parseDate(this.registrationDate);
        if (registrationDate) {
            this.registrationDateParsed = registrationDate;
        }
    }

    // Update the 'updatedAt' field
    this.updatedAt = new Date();

    next();
});

/**
 * Parse a date string in various formats
 * @param {string} dateStr - Date string to parse
 * @returns {Date|null} - Parsed Date object or null
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    // Handle different formats
    if (dateStr.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = dateStr.split('/').map(part => parseInt(part, 10));
        return new Date(year, month - 1, day);
    } else {
        // "22 MAR 2024" format
        const parts = dateStr.split(' ');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = getMonthNumber(parts[1]);
            const year = parseInt(parts[2], 10);

            if (!isNaN(day) && month !== -1 && !isNaN(year)) {
                return new Date(year, month, day);
            }
        }
    }

    return null;
}

/**
 * Convert month abbreviation to month number (0-11)
 * @param {string} monthStr - Month abbreviation (e.g., "JAN")
 * @returns {number} - Month number (0-11) or -1 if invalid
 */
function getMonthNumber(monthStr) {
    const months = {
        'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };

    return months[monthStr.toUpperCase()] ?? -1;
}

// Create and export the model
const Deed = db2.model('Deed', deedSchema);

module.exports = Deed;