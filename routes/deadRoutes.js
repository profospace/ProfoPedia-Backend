const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const deedParser = require('../utils/deedParser');
const Deed = require('../models/deedSchema');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'deed-' + uniqueSuffix + '.html');
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept only HTML files
        if (file.mimetype === 'text/html' || path.extname(file.originalname).toLowerCase() === '.html') {
            cb(null, true);
        } else {
            cb(new Error('Only HTML files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

/**
 * @route   POST /api/deeds
 * @desc    Save deed data directly to MongoDB
 * @access  Public
 */
router.post('/deeds', async (req, res) => {
    try {
        const deedData = req.body;

        // Validate required fields
        if (!deedData.deedType || !deedData.documentNumber) {
            return res.status(400).json({
                success: false,
                message: 'Required fields missing: deedType and documentNumber are required'
            });
        }

        // Create a new deed document
        const deed = new Deed(deedData);

        // Save to database
        const savedDeed = await deed.save();

        res.status(201).json({
            success: true,
            message: 'Deed saved successfully',
            data: savedDeed
        });
    } catch (error) {
        console.error('Error saving deed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save deed',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/deeds/upload
 * @desc    Upload and parse deed HTML file
 * @access  Public
 */
router.post('/deeds/upload', upload.single('file'), async (req, res) => {
    try {

        console.log(req.file)
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Read the uploaded HTML file
        const filePath = req.file.path;
        const html = await fs.readFile(filePath, 'utf8');

        // Parse the HTML
        const deedData = deedParser.parseDeedHtml(html);

        // Create a new deed document
        const deed = new Deed(deedData);

        // Save to database
        const savedDeed = await deed.save();

        // Delete the temporary file
        await fs.unlink(filePath);

        res.status(201).json({
            success: true,
            message: 'Deed uploaded and saved successfully',
            data: savedDeed
        });
    } catch (error) {
        console.error('Error processing deed upload:', error);

        // Try to clean up the file if it exists
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process deed',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/deeds/upload-batch
 * @desc    Upload and parse multiple deed HTML files
 * @access  Public
 */
router.post('/deeds/upload-batch', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const results = {
            successful: [],
            failed: []
        };

        // Process each file
        for (const file of req.files) {
            try {
                // Read the uploaded HTML file
                const filePath = file.path;
                const html = await fs.readFile(filePath, 'utf8');

                // Parse the HTML
                const deedData = deedParser.parseDeedHtml(html);

                // Create a new deed document
                const deed = new Deed(deedData);

                // Save to database
                const savedDeed = await deed.save();

                // Add to successful results
                results.successful.push({
                    filename: file.originalname,
                    id: savedDeed._id,
                    documentNumber: savedDeed.documentNumber
                });

                // Delete the temporary file
                await fs.unlink(filePath);
            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);

                // Add to failed results
                results.failed.push({
                    filename: file.originalname,
                    error: error.message
                });

                // Try to clean up the file
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temporary file:', unlinkError);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${results.successful.length} files successfully, ${results.failed.length} failed`,
            data: results
        });
    } catch (error) {
        console.error('Error processing batch upload:', error);

        // Try to clean up any files
        if (req.files) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error(`Error deleting temporary file ${file.path}:`, unlinkError);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process batch upload',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/deeds/parse
 * @desc    Parse deed HTML without saving
 * @access  Public
 */
router.post('/deeds/parse', upload.single('file'), async (req, res) => {
    try {
        if (!req.file && !req.body.html) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded or HTML provided'
            });
        }

        let html;

        if (req.file) {
            // Read from uploaded file
            const filePath = req.file.path;
            html = await fs.readFile(filePath, 'utf8');

            // Delete the temporary file
            await fs.unlink(filePath);
        } else {
            // Use HTML from request body
            html = req.body.html;
        }

        // Parse the HTML
        const deedData = deedParser.parseDeedHtml(html);

        res.status(200).json({
            success: true,
            message: 'Deed parsed successfully',
            data: deedData
        });
    } catch (error) {
        console.error('Error parsing deed:', error);

        // Try to clean up the file if it exists
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to parse deed',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/deeds
 * @desc    Get all deeds with filtering and pagination
 * @access  Public
 */
router.get('/deeds', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-registrationDateParsed',
            deedType,
            district,
            documentNumber,
            year,
            minValue,
            maxValue,
            fromDate,
            toDate,
            search
        } = req.query;

        // Build filter object
        const filter = {};

        if (deedType) filter.deedType = deedType;
        if (district) filter.district = district;
        if (documentNumber) filter.documentNumber = documentNumber;
        if (year) filter.year = year;

        // Value range filters
        if (minValue || maxValue) {
            filter.transactionValue = {};
            if (minValue) filter.transactionValue.$gte = parseInt(minValue);
            if (maxValue) filter.transactionValue.$lte = parseInt(maxValue);
        }

        // Date range filters
        if (fromDate || toDate) {
            filter.registrationDateParsed = {};
            if (fromDate) filter.registrationDateParsed.$gte = new Date(fromDate);
            if (toDate) {
                const toDateObj = new Date(toDate);
                toDateObj.setHours(23, 59, 59, 999); // End of day
                filter.registrationDateParsed.$lte = toDateObj;
            }
        }

        // Text search
        if (search) {
            filter.$or = [
                { deedType: { $regex: search, $options: 'i' } },
                { district: { $regex: search, $options: 'i' } },
                { documentNumber: { $regex: search, $options: 'i' } },
                { propertyDescription: { $regex: search, $options: 'i' } },
                { 'firstParty.name': { $regex: search, $options: 'i' } },
                { 'secondParty.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const total = await Deed.countDocuments(filter);

        // Parse pagination params
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get deed data with pagination
        const deeds = await Deed.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            perPage: limitNum,
            data: deeds
        });
    } catch (error) {
        console.error('Error fetching deeds:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch deeds',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/deeds/:id
 * @desc    Get a single deed by ID
 * @access  Public
 */
router.get('/deeds/:id', async (req, res) => {
    try {
        const deed = await Deed.findById(req.params.id);

        if (!deed) {
            return res.status(404).json({
                success: false,
                message: 'Deed not found'
            });
        }

        res.status(200).json({
            success: true,
            data: deed
        });
    } catch (error) {
        console.error('Error fetching deed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch deed',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/deeds/:id
 * @desc    Delete a deed by ID
 * @access  Public
 */
router.delete('/deeds/:id', async (req, res) => {
    try {
        const deed = await Deed.findById(req.params.id);

        if (!deed) {
            return res.status(404).json({
                success: false,
                message: 'Deed not found'
            });
        }

        await deed.remove();

        res.status(200).json({
            success: true,
            message: 'Deed deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting deed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete deed',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/stats
 * @desc    Get deed statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        // Get total count
        const totalDeeds = await Deed.countDocuments();

        // Get financial statistics
        const financialStats = await Deed.aggregate([
            {
                $group: {
                    _id: null,
                    totalMarketValue: { $sum: '$marketValue' },
                    totalTransactionValue: { $sum: '$transactionValue' },
                    totalStampDuty: { $sum: '$stampDuty' },
                    avgMarketValue: { $avg: '$marketValue' },
                    avgTransactionValue: { $avg: '$transactionValue' }
                }
            }
        ]);

        // Get deed type distribution
        const deedTypes = await Deed.aggregate([
            {
                $group: {
                    _id: '$deedType',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$transactionValue' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get district distribution
        const districts = await Deed.aggregate([
            {
                $group: {
                    _id: '$district',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$transactionValue' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get monthly trends (for last 12 months)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const monthlyTrends = await Deed.aggregate([
            {
                $match: {
                    registrationDateParsed: { $gte: oneYearAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$registrationDateParsed' },
                        month: { $month: '$registrationDateParsed' }
                    },
                    count: { $sum: 1 },
                    totalValue: { $sum: '$transactionValue' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalDeeds,
                financialStats: financialStats[0] || {},
                deedTypes,
                districts,
                monthlyTrends
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

module.exports = router;