const express = require('express');
const router = express.Router();
const propertyDetailController = require('../controllers/propertyDetail-controller');
const Deed = require('../models/deedSchema');
const json2csv = require('json2csv').Parser;
const fs = require('fs');
const path = require('path')

// Route to fetch and save property detail
router.post('/property-records/fetch-detail', propertyDetailController.fetchPropertyDetail);

router.get('/get-all-deeds', async (req, res) => {
    try {
        // Extract pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Parse sort parameter
        let sortOption = {};
        if (req.query.sort) {
            // Handle descending sort with a prefix of '-'
            if (req.query.sort.startsWith('-')) {
                const field = req.query.sort.substring(1);
                sortOption[field] = -1;
            } else {
                sortOption[req.query.sort] = 1;
            }
        } else {
            // Default sort by registration date, descending
            sortOption = { registrationDateParsed: -1 };
        }

        // Build filter query
        const query = {};

        // Search across multiple fields
        if (req.query.search) {
            query.$or = [
                { 'firstParty.name': { $regex: req.query.search, $options: 'i' } },
                { 'secondParty.name': { $regex: req.query.search, $options: 'i' } },
                { documentNumber: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by deed type
        if (req.query.deedType) {
            query.deedType = req.query.deedType;
        }

        // Filter by district
        if (req.query.district) {
            query.district = req.query.district;
        }

        // Filter by year
        if (req.query.year) {
            query.year = req.query.year;
        }

        // Filter by value range
        if (req.query.minValue) {
            query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
        }
        if (req.query.maxValue) {
            query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
        }

        // Filter by date range
        if (req.query.fromDate) {
            const fromDate = new Date(req.query.fromDate);
            query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
        }
        if (req.query.toDate) {
            const toDate = new Date(req.query.toDate);
            // Set to end of day
            toDate.setHours(23, 59, 59, 999);
            query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
        }

        // Execute query with pagination
        const deeds = await Deed.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Deed.countDocuments(query);

        // Calculate total pages
        const pages = Math.ceil(total / limit);

        res.json({
            status: 'success',
            pages,
            total,
            data: deeds
        });
    } catch (error) {
        console.error('Error fetching deeds:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching deeds',
            error: error.message
        });
    }
});

/**
 * GET /deeds/:id
 * Get a single deed by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const deed = await Deed.findById(req.params.id);

        if (!deed) {
            return res.status(404).json({
                status: 'error',
                message: 'Deed not found'
            });
        }

        res.json({
            status: 'success',
            data: deed
        });
    } catch (error) {
        console.error('Error fetching deed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching deed',
            error: error.message
        });
    }
});

/**
 * POST /deeds
 * Create a new deed
 */
router.post('/', async (req, res) => {
    try {
        const deedData = req.body;

        // Create a new deed document
        const newDeed = new Deed(deedData);

        // Save to database
        await newDeed.save();

        res.status(201).json({
            status: 'success',
            data: newDeed
        });
    } catch (error) {
        console.error('Error creating deed:', error);
        res.status(400).json({
            status: 'error',
            message: 'Error creating deed',
            error: error.message
        });
    }
});

/**
 * DELETE /deeds/:id
 * Delete a deed by ID
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = await Deed.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Deed not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Deed deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting deed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while deleting deed',
            error: error.message
        });
    }
});

/**
 * DELETE /deeds
 * Delete multiple deeds by ID
 */
router.delete('/', async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request. Please provide an array of deed IDs.'
            });
        }

        const result = await Deed.deleteMany({ _id: { $in: ids } });

        res.json({
            status: 'success',
            message: `${result.deletedCount} deeds deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting multiple deeds:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while deleting deeds',
            error: error.message
        });
    }
});


/**
 * GET /districts
 * Get all unique districts for filtering
 */
router.get('/get/districts', async (req, res) => {
    try {
        const districts = await Deed.distinct('district');

        // Filter out null or empty values
        const filteredDistricts = districts.filter(district => district && district.trim() !== '');

        // Sort alphabetically
        filteredDistricts.sort();

        res.json({
            status: 'success',
            data: filteredDistricts
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching districts',
            error: error.message
        });
    }
});

/**
 * GET /deed-types
 * Get all unique deed types for filtering
 */
router.get('/get/deed-types', async (req, res) => {
    try {
        const deedTypes = await Deed.distinct('deedType');

        // Filter out null or empty values
        const filteredDeedTypes = deedTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically
        filteredDeedTypes.sort();

        res.json({
            status: 'success',
            data: filteredDeedTypes
        });
    } catch (error) {
        console.error('Error fetching deed types:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching deed types',
            error: error.message
        });
    }
});

/**
 * GET /sub-registrars
 * Get all unique sub-registrars for filtering
 */
router.get('/sub-registrars', async (req, res) => {
    try {
        const subRegistrars = await Deed.distinct('subRegistrar');

        // Filter out null or empty values
        const filteredSubRegistrars = subRegistrars.filter(sr => sr && sr.trim() !== '');

        // Sort alphabetically
        filteredSubRegistrars.sort();

        res.json({
            status: 'success',
            data: filteredSubRegistrars
        });
    } catch (error) {
        console.error('Error fetching sub-registrars:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching sub-registrars',
            error: error.message
        });
    }
});

/**
 * GET /land-types
 * Get all unique land types for filtering
 */
router.get('/land-types', async (req, res) => {
    try {
        const landTypes = await Deed.distinct('landType');

        // Filter out null or empty values
        const filteredLandTypes = landTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically
        filteredLandTypes.sort();

        res.json({
            status: 'success',
            data: filteredLandTypes
        });
    } catch (error) {
        console.error('Error fetching land types:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching land types',
            error: error.message
        });
    }
});

/**
 * GET /stats
 * Get summary statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalDeeds = await Deed.countDocuments();

        // Total transaction value
        const valueStats = await Deed.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$transactionValue' },
                    avgValue: { $avg: '$transactionValue' },
                    maxValue: { $max: '$transactionValue' }
                }
            }
        ]);

        // Deeds by type
        const deedsByType = await Deed.aggregate([
            {
                $group: {
                    _id: '$deedType',
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Deeds by month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const deedsByMonth = await Deed.aggregate([
            {
                $match: {
                    registrationDateParsed: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$registrationDateParsed' },
                        month: { $month: '$registrationDateParsed' }
                    },
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            status: 'success',
            data: {
                totalDeeds,
                valueStats: valueStats[0] || { totalValue: 0, avgValue: 0, maxValue: 0 },
                deedsByType,
                deedsByMonth
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching stats',
            error: error.message
        });
    }
});


/**
 * GET /districts
 * Get all unique districts for filtering
 */
router.get('/districts', async (req, res) => {
    try {
        const districts = await Deed.distinct('district');

        // Filter out null or empty values
        const filteredDistricts = districts.filter(district => district && district.trim() !== '');

        // Sort alphabetically
        filteredDistricts.sort();

        res.json({
            status: 'success',
            data: filteredDistricts
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching districts',
            error: error.message
        });
    }
});

/**
 * GET /deed-types
 * Get all unique deed types for filtering
 */
router.get('/deed-types', async (req, res) => {
    try {
        const deedTypes = await Deed.distinct('deedType');

        // Filter out null or empty values
        const filteredDeedTypes = deedTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically
        filteredDeedTypes.sort();

        res.json({
            status: 'success',
            data: filteredDeedTypes
        });
    } catch (error) {
        console.error('Error fetching deed types:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching deed types',
            error: error.message
        });
    }
});

/**
 * GET /sub-registrars
 * Get all unique sub-registrars for filtering
 */
router.get('/sub-registrars', async (req, res) => {
    try {
        const subRegistrars = await Deed.distinct('subRegistrar');

        // Filter out null or empty values
        const filteredSubRegistrars = subRegistrars.filter(sr => sr && sr.trim() !== '');

        // Sort alphabetically
        filteredSubRegistrars.sort();

        res.json({
            status: 'success',
            data: filteredSubRegistrars
        });
    } catch (error) {
        console.error('Error fetching sub-registrars:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching sub-registrars',
            error: error.message
        });
    }
});

/**
 * GET /land-types
 * Get all unique land types for filtering
 */
router.get('/land-types', async (req, res) => {
    try {
        const landTypes = await Deed.distinct('landType');

        // Filter out null or empty values
        const filteredLandTypes = landTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically
        filteredLandTypes.sort();

        res.json({
            status: 'success',
            data: filteredLandTypes
        });
    } catch (error) {
        console.error('Error fetching land types:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching land types',
            error: error.message
        });
    }
});

/**
 * GET /stats
 * Get summary statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalDeeds = await Deed.countDocuments();

        // Total transaction value
        const valueStats = await Deed.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$transactionValue' },
                    avgValue: { $avg: '$transactionValue' },
                    maxValue: { $max: '$transactionValue' }
                }
            }
        ]);

        // Deeds by type
        const deedsByType = await Deed.aggregate([
            {
                $group: {
                    _id: '$deedType',
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Deeds by month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const deedsByMonth = await Deed.aggregate([
            {
                $match: {
                    registrationDateParsed: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$registrationDateParsed' },
                        month: { $month: '$registrationDateParsed' }
                    },
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            status: 'success',
            data: {
                totalDeeds,
                valueStats: valueStats[0] || { totalValue: 0, avgValue: 0, maxValue: 0 },
                deedsByType,
                deedsByMonth
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching stats',
            error: error.message
        });
    }
});



/**
 * GET /export/csv
 * Export deeds as CSV
 */
router.get('/csv', async (req, res) => {
    try {
        // Build query from parameters
        const query = {};

        // Handle IDs parameter (for exporting selected deeds)
        if (req.query.ids) {
            const ids = req.query.ids.split(',');
            query._id = { $in: ids };
        }

        // Apply same filters as the main deeds API
        if (req.query.search) {
            query.$or = [
                { 'firstParty.name': { $regex: req.query.search, $options: 'i' } },
                { 'secondParty.name': { $regex: req.query.search, $options: 'i' } },
                { documentNumber: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.deedType) query.deedType = req.query.deedType;
        if (req.query.district) query.district = req.query.district;
        if (req.query.year) query.year = req.query.year;

        if (req.query.minValue) {
            query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
        }
        if (req.query.maxValue) {
            query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
        }

        if (req.query.fromDate) {
            const fromDate = new Date(req.query.fromDate);
            query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
        }
        if (req.query.toDate) {
            const toDate = new Date(req.query.toDate);
            toDate.setHours(23, 59, 59, 999);
            query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
        }

        // Fetch data with appropriate sort
        let sortOption = {};
        if (req.query.sort) {
            if (req.query.sort.startsWith('-')) {
                const field = req.query.sort.substring(1);
                sortOption[field] = -1;
            } else {
                sortOption[req.query.sort] = 1;
            }
        } else {
            sortOption = { registrationDateParsed: -1 };
        }

        const deeds = await Deed.find(query).sort(sortOption);

        if (deeds.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No deeds found to export'
            });
        }

        // Process data for export
        const exportData = deeds.map(deed => {
            // Format dates
            const formatDate = (date) => {
                if (!date) return '';
                return new Date(date).toLocaleDateString('en-IN');
            };

            // Process parties into strings
            const firstPartyNames = deed.firstParty ? deed.firstParty.map(p => p.name).join(', ') : '';
            const secondPartyNames = deed.secondParty ? deed.secondParty.map(p => p.name).join(', ') : '';
            const witnessNames = deed.witnesses ? deed.witnesses.map(p => p.name).join(', ') : '';

            return {
                'Document Number': `${deed.documentNumber}/${deed.year}`,
                'Type': deed.deedType,
                'Registration Date': formatDate(deed.registrationDateParsed),
                'Execution Date': formatDate(deed.executionDateParsed),
                'District': deed.district,
                'Sub-Registrar': deed.subRegistrar,
                'First Party': firstPartyNames,
                'Second Party': secondPartyNames,
                'Witnesses': witnessNames,
                'Transaction Value': deed.transactionValue,
                'Market Value': deed.marketValue,
                'Stamp Duty': deed.stampDuty,
                'Property Description': deed.propertyDescription,
                'Area': deed.area,
                'Land Type': deed.landType,
                'Ward': deed.ward,
                'Locality': deed.locality,
                'Created': formatDate(deed.createdAt)
            };
        });

        // Convert to CSV
        const fields = Object.keys(exportData[0]);
        const json2csvParser = new json2csv({ fields });
        const csv = json2csvParser.parse(exportData);

        // Set headers for CSV download
        res.setHeader('Content-Disposition', 'attachment; filename=deeds_export.csv');
        res.setHeader('Content-Type', 'text/csv');

        // Send CSV data
        res.send(csv);
    } catch (error) {
        console.error('Error exporting deeds:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while exporting deeds',
            error: error.message
        });
    }
});

/**
 * GET /export/excel
 * Export deeds as Excel
 */
router.get('/excel', async (req, res) => {
    try {
        // Use the same query building logic as CSV endpoint
        const query = {};

        if (req.query.ids) {
            const ids = req.query.ids.split(',');
            query._id = { $in: ids };
        }

        // Apply filters (same as CSV endpoint)
        // ... (same filtering logic as CSV route)

        // Fetch data
        const deeds = await Deed.find(query);

        if (deeds.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No deeds found to export'
            });
        }

        // Process data for export
        // ... (same processing logic as CSV route)

        // Generate Excel file using a library like exceljs
        // For this example, we'd use the Excel library to create a workbook

        // Send Excel file as download
        // Here we would normally create and save the Excel file, then send it

        // For this example, let's just return a simple JSON confirmation
        res.json({
            status: 'success',
            message: 'Excel export functionality would be implemented here with a library like exceljs'
        });
    } catch (error) {
        console.error('Error exporting deeds as Excel:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while exporting deeds as Excel',
            error: error.message
        });
    }
});





module.exports = router;