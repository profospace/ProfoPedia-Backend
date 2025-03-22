const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property-controller');


// Get party name suggestions as user types
router.get('/property-records/party-suggestions', propertyController.getPartyNameSuggestions);

// Get property records by party name
router.get('/property-records/party-records', propertyController.getRecordsByPartyName);


// Get all SRO codes present in the database
router.get('/sro-codes', propertyController.getSroCodes);

// Get total number of property records
router.get('/total-records', propertyController.getTotalRecords);

// Get overall database statistics
router.get('/dashboard', propertyController.getDatabaseStats);
router.get('/gaon-distribution', propertyController.getPropertyRecordsByGaonCode);


// Fetch property data from external API and store in database
router.post('/property-data', propertyController.fetchPropertyData);

// Get property records with optional filtering
router.get('/property-records', propertyController.getPropertyRecords);

// Get individual property record by ID
router.get('/property-records/:id', propertyController.getPropertyRecordById);

// District statistics
router.get('/property-records/stats', propertyController.getDistrictStatistics);

// Advanced search endpoint (new)
router.post('/property-records/search', propertyController.searchPropertyRecords);


module.exports = router;