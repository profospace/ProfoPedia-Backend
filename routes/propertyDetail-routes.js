const express = require('express');
const router = express.Router();
const propertyDetailController = require('../controllers/propertyDetail-controller');

// Route to fetch and save property detail
router.post('/property-records/fetch-detail', propertyDetailController.fetchPropertyDetail);

// Route to get property detail by ID
router.get('/detail/:id', propertyDetailController.getPropertyDetailById);

// Route for debugging HTML parsing
router.post('/parse-html', propertyDetailController.parseHtmlContent);

// Route to reprocess property detail from stored HTML
router.post('/reprocess/:id', propertyDetailController.reprocessPropertyDetail);

// Route to get records that need manual review
router.get('/needs-review', propertyDetailController.getRecordsNeedingReview);

// Route to delete a property detail record
router.delete('/detail/:id', propertyDetailController.deletePropertyDetail);

module.exports = router;