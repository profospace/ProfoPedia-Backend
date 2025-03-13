// Lead Schema (leadSchema.js)
const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema({
    propertyType: {
        intent: { type: String, enum: ['sell', 'rent', 'pg']},
        category: { type: String, enum: ['residential', 'commercial']},
        subType: { type: String}, // flat, villa, plot, etc.
    },
    contactDetails: {
        phone: { type: String},
        email: { type: String },
        name: { type: String },
    },
    propertyDetails: {
        location: { type: String },
        expectedPrice: { type: Number },
        propertySize: { type: Number },
        unit: { type: String, enum: ['sqft', 'sqm', 'acres'] },
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        furnishing: { type: String, enum: ['unfurnished', 'semi-furnished', 'fully-furnished'] },
        availability: { type: String, enum: ['immediate', 'within-15-days', 'within-30-days', 'after-30-days'] },
    },
    additionalDetails: {
        description: { type: String },
        amenities: [{ type: String }],
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'negotiating', 'closed', 'lost'],
        default: 'new'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Lead =  mongoose.model('Lead', leadSchema);
module.exports = Lead;