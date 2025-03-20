// const mongoose = require('mongoose');

// const PropertyRecordSchema = new mongoose.Schema({
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
//     // Additional fields for query metadata
//     searchParams: {
//         districtCode: { type: String },
//         sroCode: { type: String },
//         propertyId: { type: String },
//         propNEWAddress: { type: String },
//         gaonCode1: { type: String }
//     },
//     createdAt: { type: Date, default: Date.now }
// }, { timestamps: true });

// // Compound index for efficient searches
// PropertyRecordSchema.index({
//     'details.regno': 1,
//     'details.regyear': 1,
//     'details.propertyNum': 1
// });

// // Create a unique compound index to prevent duplicate records
// PropertyRecordSchema.index({
//     'details.regno': 1,
//     'details.regyear': 1,
//     'details.propertyNum': 1,
//     'details.dcode': 1
// }, { unique: true });

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
        recieptNo: { type: String },
        pcode: { type: String },
        propertyNum: { type: String },
        subDeedCode: { type: String }
    }
}, { _id: true });

// Define the main schema that will hold the search parameters and the array of property records
const PropertyRecordSchema = new mongoose.Schema({
    // Search parameters at the top level
    districtCode: { type: String, required: true },
    sroCode: { type: String, required: true },
    propertyId: { type: String, default: '' },
    propNEWAddress: { type: String, default: '1' },
    gaonCode1: { type: String, required: true },

    // Array of property records
    propertyRecords: [PropertyRecordItemSchema],

    // Metadata
    recordCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
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

module.exports = mongoose.model('PropertyRecord', PropertyRecordSchema);