const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Get all tehsils
router.get('/tehsils', locationController.getTehsils);

// Get villages by tehsil code
router.get('/villages/:tehsilCode', locationController.getVillagesByTehsil);

module.exports = router;