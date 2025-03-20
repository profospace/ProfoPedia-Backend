const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property-controller');

// Fetch property data from external API and store in database
router.post('/property-data', propertyController.fetchPropertyData);

// Get property records with optional filtering
router.get('/property-records', propertyController.getPropertyRecords);

// Get individual property record by ID
router.get('/property-records/:id', propertyController.getPropertyRecordById);

// Search property records
router.post('/property-records/stats', propertyController.getDistrictStatistics);

module.exports = router;