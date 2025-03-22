// const mongoose = require('mongoose');

// // Define the nested property record schema
// const PropertyRecordItemSchema = new mongoose.Schema({
//     serialNo: { type: String },
//     year: { type: String },
//     regNo: { type: String },
//     partyNames: [{ type: String }],
//     partyAddresses: [{ type: String }],
//     propertyDesc: { type: String },
//     khataNo: { type: String },
//     regDate: { type: String },
//     deedType: { type: String },
//     details: {
//         dcode: { type: String },
//         regno: { type: String },
//         regyear: { type: String },
//         regdate: { type: String },
//         srocode: { type: String },
//         recieptNo: { type: String },
//         pcode: { type: String },
//         propertyNum: { type: String },
//         subDeedCode: { type: String }
//     }
// }, { _id: true });

// // Define the main schema that will hold the search parameters and the array of property records
// const PropertyRecordSchema = new mongoose.Schema({
//     // Search parameters at the top level
//     districtCode: { type: String, required: true },
//     sroCode: { type: String, required: true },
//     propertyId: { type: String, default: '' },
//     propNEWAddress: { type: String, default: '1' },
//     gaonCode1: { type: String, required: true },

//     // Array of property records
//     propertyRecords: [PropertyRecordItemSchema],

//     // Metadata
//     recordCount: { type: Number, default: 0 },
//     createdAt: { type: Date, default: Date.now }
// }, { timestamps: true });

// // Compound index for efficient searches
// PropertyRecordSchema.index({
//     districtCode: 1,
//     sroCode: 1,
//     gaonCode1: 1
// });

// // Create a unique compound index for search parameters to prevent duplicate searches
// PropertyRecordSchema.index({
//     districtCode: 1,
//     sroCode: 1,
//     gaonCode1: 1,
//     propertyId: 1,
//     propNEWAddress: 1
// }, { unique: true });

// module.exports = mongoose.model('PropertyRecord', PropertyRecordSchema);


// const mongoose = require('mongoose');

// // Define the nested property record schema
// const PropertyRecordItemSchema = new mongoose.Schema({
//     serialNo: { type: String },
//     year: { type: String },
//     regNo: { type: String },
//     partyNames: [{ type: String }],
//     partyAddresses: [{ type: String }],
//     propertyDesc: { type: String },
//     khataNo: { type: String },
//     regDate: { type: String },
//     deedType: { type: String },
//     details: {
//         dcode: { type: String },
//         regno: { type: String },
//         regyear: { type: String },
//         regdate: { type: String },
//         srocode: { type: String },
//         recieptNo: { type: String },
//         pcode: { type: String },
//         propertyNum: { type: String },
//         subDeedCode: { type: String }
//     },
//     // Add a unique identifier within the property record item
//     recordUniqueId: {
//         type: String,
//         sparse: true
//     }
// }, { _id: true });

// // Define the main schema that will hold the search parameters and the array of property records
// const PropertyRecordSchema = new mongoose.Schema({
//     // Search parameters at the top level
//     districtCode: { type: String, required: true, trim: true },
//     sroCode: { type: String, required: true, trim: true },
//     propertyId: { type: String, default: '', trim: true },
//     propNEWAddress: { type: String, default: '1', trim: true },
//     gaonCode1: { type: String, required: true, trim: true },

//     // Create a compound search key for easier retrieval and uniqueness enforcement
//     searchKey: {
//         type: String,
//         unique: true,
//         sparse: true
//     },

//     // Array of property records
//     propertyRecords: [PropertyRecordItemSchema],

//     // Metadata
//     recordCount: { type: Number, default: 0 },
//     createdAt: { type: Date, default: Date.now },
//     lastFetchedAt: { type: Date, default: Date.now }
// }, { timestamps: true });

// // Compound index for efficient searches
// PropertyRecordSchema.index({
//     districtCode: 1,
//     sroCode: 1,
//     gaonCode1: 1
// });

// // Create a unique compound index for search parameters to prevent duplicate searches
// PropertyRecordSchema.index({
//     districtCode: 1,
//     sroCode: 1,
//     gaonCode1: 1,
//     propertyId: 1,
//     propNEWAddress: 1
// }, { unique: true });

// // Pre-save middleware to generate the searchKey
// PropertyRecordSchema.pre('save', function (next) {
//     // Create a unique searchKey based on the search parameters
//     this.searchKey = `${this.districtCode}-${this.sroCode}-${this.propertyId || ''}-${this.propNEWAddress || '1'}-${this.gaonCode1}`;

//     // If propertyRecords exist, generate unique IDs for each record
//     if (this.propertyRecords && this.propertyRecords.length > 0) {
//         this.propertyRecords.forEach(record => {
//             if (record.details && record.details.regno && record.details.regyear) {
//                 record.recordUniqueId = `${record.details.dcode || this.districtCode}-${record.details.srocode || this.sroCode}-${record.details.regno}-${record.details.regyear}`;
//             }
//         });
//     }

//     next();
// });

// module.exports = mongoose.model('PropertyRecord', PropertyRecordSchema);


const mongoose = require('mongoose');

// Define the nested property record schema
const PropertyRecordItemSchema = new mongoose.Schema({
    serialNo: { type: String },
    year: { type: String },
    regNo: { type: String },
    partyNames: [{ type: String }],
    partyAddresses: [{ type: String }],
    propertyDesc: { type: String },
    khataNo: { type: String },
    regDate: { type: String },
    deedType: { type: String },
    details: {
        dcode: { type: String },
        regno: { type: String },
        regyear: { type: String },
        regdate: { type: String },
        srocode: { type: String },
        recieptNo: { type: String }, // Ensuring this is defined
        pcode: { type: String },     // Ensuring this is defined
        propertyNum: { type: String },
        subDeedCode: { type: String } // Ensuring this is defined
    },
    recordUniqueId: {
        type: String,
        sparse: true
    }
}, { _id: true });

// Define the main schema that will hold the search parameters and the array of property records
const PropertyRecordSchema = new mongoose.Schema({
    // Search parameters at the top level
    districtCode: { type: String, required: true, trim: true },
    sroCode: { type: String, required: true, trim: true },
    propertyId: { type: String, default: '', trim: true },
    propNEWAddress: { type: String, default: '1', trim: true },
    gaonCode1: { type: String, required: true, trim: true },

    // Create a compound search key for easier retrieval and uniqueness enforcement
    searchKey: {
        type: String,
        unique: true,
        sparse: true
    },

    // Array of property records
    propertyRecords: [PropertyRecordItemSchema],

    // Metadata
    recordCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    lastFetchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for efficient searches
PropertyRecordSchema.index({
    districtCode: 1,
    sroCode: 1,
    gaonCode1: 1
});

// Create a unique compound index for search parameters to prevent duplicate searches
PropertyRecordSchema.index({
    districtCode: 1,
    sroCode: 1,
    gaonCode1: 1,
    propertyId: 1,
    propNEWAddress: 1
}, { unique: true });

// Pre-save middleware to generate the searchKey
PropertyRecordSchema.pre('save', function (next) {
    // Create a unique searchKey based on the search parameters
    this.searchKey = `${this.districtCode}-${this.sroCode}-${this.propertyId || ''}-${this.propNEWAddress || '1'}-${this.gaonCode1}`;

    // If propertyRecords exist, generate unique IDs for each record
    if (this.propertyRecords && this.propertyRecords.length > 0) {
        this.propertyRecords.forEach(record => {
            if (record.details && record.details.regno && record.details.regyear) {
                record.recordUniqueId = `${record.details.dcode || this.districtCode}-${record.details.srocode || this.sroCode}-${record.details.regno}-${record.details.regyear}`;
            }
        });
    }

    next();
});

module.exports = mongoose.model('PropertyRecord', PropertyRecordSchema);